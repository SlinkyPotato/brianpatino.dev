import { NextRequest, NextResponse } from 'next/server';
import RedisUtil from '@/util/redis';

export async function POST(req: NextRequest): Promise<NextResponse> {
  await RedisUtil.connect();
  if (!RedisUtil.client ) {
    return new NextResponse('Redis not connected', { status: 500 });
  }

  if (req.headers.get('Content-Type') !== 'application/json') {
    return new NextResponse('must be json', { status: 400 });
  }

  const body = await req.json();
  let slug: string | undefined = undefined;
  if ('slug' in body) {
    slug = body.slug;
  }
  if (!slug) {
    return new NextResponse('Slug not found', { status: 400 });
  }
  const ip = req.ip;
  if (ip) {
    // Hash the IP in order to not store it directly in your db.
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(ip),
    );
    const hash = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // deduplicate the ip for each slug
    const isNew = await RedisUtil.client.set(`deduplicate:${hash}:${slug}`, 'true', {
      NX: true,
      EX: 24 * 60 * 60,
    });

    if (!isNew) {
      new NextResponse(null, { status: 202 });
    }
  }
  await RedisUtil.client.incr(`pageviews:projects:${slug}`);
  console.log('incremented pageview for slug', slug);
  return new NextResponse(null, { status: 202 });
}

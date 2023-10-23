import { notFound } from 'next/navigation';
import { allExperiences } from 'contentlayer/generated';
import { Mdx } from '@/app/components/mdx';
import { Header } from './header';
import './mdx.css';
import { ReportView } from './view';
import RedisUtil from '@/util/redis';

export const revalidate = 60;

type Props = {
	params: {
		slug: string;
	};
};

export async function generateStaticParams(): Promise<Props['params'][]> {
  return allExperiences
    .map((experience) => ({
      slug: experience.slug,
    }));
}

export default async function PostPage({ params }: Props) {
  await RedisUtil.connect();
  const slug = params?.slug;
  const experience = allExperiences.find((experience) => experience.slug === slug);

  if (!experience) {
    notFound();
  }

  const views = Number(RedisUtil.client ? await RedisUtil.client.get(`pageviews:projects:${slug}`) : 0) ?? 0;

  return (
    <div className="bg-zinc-50 min-h-screen">
      <Header experience={experience} views={views} />
      <ReportView slug={experience.slug} />

      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless">
        <Mdx code={experience.body.code} />
      </article>
    </div>
  );
}

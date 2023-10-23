import { RedisClientType, createClient } from 'redis';

export default class RedisUtil {
  static client: RedisClientType;

  private constructor() {}

  static async connect(): Promise<void> {
    if (!RedisUtil.client || !RedisUtil.client.isReady) {
      const client: RedisClientType = createClient({
        socket: {
          host: process.env.REDIS_HOST ?? 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379'),
        },
        username: process.env.REDIS_USERNAME ?? undefined,
        password: process.env.REDIS_PASSWORD ?? undefined,
      });

      try {
        RedisUtil.client = await client.connect();
      } catch (error) {
        console.error('failed to connect redis');
      }
    }
  };

  async disconnect() {
    await RedisUtil.client.disconnect();
  }
}

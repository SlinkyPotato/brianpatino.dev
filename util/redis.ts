import { RedisClientType, createClient } from 'redis';

const connectRedis = async () => {
  const client = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
    },
  });

  client.on('error', (error) => {
    console.error(error);
  });

  client.on('connect', () => {
    console.log('Redis connected');
  });

  client.on('end', () => {
    console.log('Redis disconnected');
  });

  return await client.connect();
};

export {
  connectRedis,
};

import { Runtime, InMemoryAdapter } from '@agent-runtime/core';
import { RedisPlugin } from '@agent-runtime/plugin-redis';
import { RabbitMQPlugin } from '@agent-runtime/plugin-rabbitmq';
import { performance } from 'perf_hooks';

const ITERATIONS = 10000;

async function runFrameworkBenchmarks() {
  console.log('--- Framework Benchmarks ---');
  
  const runtime = new Runtime();
  runtime.registerAdapter('EventBusAdapter', new InMemoryAdapter());
  
  // 1. Event Publish (No subscribers)
  let start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await runtime.publish({ name: 'benchmark.event', payload: { i } });
  }
  let end = performance.now();
  console.log(`Event Publish (No Subscribers): ${(end - start).toFixed(2)} ms for ${ITERATIONS} ops`);

  // 2. Event Dispatch (1 subscriber)
  let count = 0;
  runtime.subscribe('benchmark.dispatch', async (event) => {
    count++;
  });

  start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await runtime.publish({ name: 'benchmark.dispatch', payload: { i } });
  }
  
  // Tunggu sejenak agar janji-janji async di-resolve
  await new Promise(res => setTimeout(res, 50));
  
  end = performance.now();
  console.log(`Event Dispatch (1 Subscriber): ${(end - start).toFixed(2)} ms for ${ITERATIONS} ops. Received: ${count}`);
}

async function runAdapterBenchmarks() {
  console.log('\n--- Adapter Benchmarks ---');

  // InMemory
  const memRuntime = new Runtime();
  memRuntime.registerAdapter('EventBusAdapter', new InMemoryAdapter());
  
  let memCount = 0;
  memRuntime.subscribe('adapter.benchmark', async () => { memCount++; });
  
  let start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await memRuntime.publish({ name: 'adapter.benchmark', payload: { i } });
  }
  await new Promise(res => setTimeout(res, 50));
  let end = performance.now();
  console.log(`InMemory Adapter: ${(end - start).toFixed(2)} ms. Received: ${memCount}`);

  // Redis (Opsional, asumsikan berjalan di localhost)
  try {
    const redisRuntime = new Runtime();
    redisRuntime.use(new RedisPlugin({
      host: 'localhost',
      port: 6379,
      password: '' // Atur jika perlu
    }));
    await redisRuntime.start();

    let redisCount = 0;
    redisRuntime.subscribe('adapter.benchmark.redis', async () => { redisCount++; });

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await redisRuntime.publish({ name: 'adapter.benchmark.redis', payload: { i } });
    }
    await new Promise(res => setTimeout(res, 1000));
    end = performance.now();
    console.log(`Redis Adapter: ${(end - start).toFixed(2)} ms. Received: ${redisCount}`);
  } catch (err) {
    console.log(`Redis Adapter Benchmark skipped. Is Redis running locally?`);
  }

  // RabbitMQ (Opsional, asumsikan berjalan di localhost)
  try {
    const rabbitRuntime = new Runtime();
    rabbitRuntime.use(new RabbitMQPlugin({
      url: 'amqp://guest:guest@localhost:5672',
      exchangeName: 'benchmark-events'
    }));
    await rabbitRuntime.start();

    let rabbitCount = 0;
    rabbitRuntime.subscribe('adapter.benchmark.rabbit', async () => { rabbitCount++; });

    start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      await rabbitRuntime.publish({ name: 'adapter.benchmark.rabbit', payload: { i } });
    }
    await new Promise(res => setTimeout(res, 2000));
    end = performance.now();
    console.log(`RabbitMQ Adapter: ${(end - start).toFixed(2)} ms. Received: ${rabbitCount}`);
  } catch (err) {
    console.log(`RabbitMQ Adapter Benchmark skipped. Is RabbitMQ running locally?`);
  }
}

async function bootstrap() {
  await runFrameworkBenchmarks();
  await runAdapterBenchmarks();
  process.exit(0);
}

bootstrap();

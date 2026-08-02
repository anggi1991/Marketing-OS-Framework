import { Runtime, Agent, ExponentialBackoffRetryPolicy } from '@agent-runtime/core';
import { RabbitMQPlugin } from '@agent-runtime/plugin-rabbitmq';

class FlakyAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe('task.flaky', async (event) => {
      console.log(`[FlakyAgent] Menerima event: ${event.id}`);
      
      const { fail } = event.payload;

      if (fail) {
        console.log(`[FlakyAgent] Mensimulasikan error untuk event: ${event.id}`);
        throw new Error('Simulated failure');
      }

      console.log(`[FlakyAgent] Berhasil memproses event: ${event.id}`);
    });
  }
}

async function bootstrap() {
  const runtime = new Runtime();

  // Konfigurasi Retry Policy & RabbitMQ DLQ
  const retryPolicy = new ExponentialBackoffRetryPolicy({
    maxRetries: 2, // Akan dicoba total 3 kali (1 asli + 2 retry)
    initialDelayMs: 1000,
    multiplier: 2
  });

  runtime.use(new RabbitMQPlugin({
    url: 'amqp://guest:guest@localhost:5672',
    exchangeName: 'agent-events',
    deadLetter: true, // Mengaktifkan pengiriman DLQ via NACK
    retryPolicy
  }));

  runtime.register(new FlakyAgent());
  await runtime.start();

  console.log('Runtime RabbitMQ siap. Mempublikasikan 2 event...');
  
  // 1. Event yang akan SUKSES
  await runtime.publish({
    name: 'task.flaky',
    payload: { fail: false, desc: 'Ini akan sukses' }
  });

  // 2. Event yang akan GAGAL, di-RETRY, lalu masuk ke DLQ
  await runtime.publish({
    name: 'task.flaky',
    payload: { fail: true, desc: 'Ini akan gagal dan masuk DLQ' }
  });

  console.log('Event telah dipublikasikan. Amati log di atas!');
}

bootstrap();

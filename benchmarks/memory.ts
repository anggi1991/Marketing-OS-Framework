import { Runtime, InMemoryAdapter } from '@agent-runtime/core';
import * as v8 from 'v8';

const ITERATIONS = 1000000; // 1 Juta Event

function printMemoryUsage(label: string) {
  // Paksa Garbage Collection sebelum mengambil ukuran (perlu jalankan node dengan --expose-gc)
  if (global.gc) {
    global.gc();
  }
  const memory = process.memoryUsage();
  console.log(`${label}: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
}

async function runZeroSubscribers() {
  console.log('--- Skenario A: 1 Juta Event, 0 Subscriber ---');
  const runtime = new Runtime();
  runtime.registerAdapter('EventBusAdapter', new InMemoryAdapter());
  
  printMemoryUsage('Sebelum publikasi');
  
  for (let i = 0; i < ITERATIONS; i++) {
    await runtime.publish({ name: 'mem.zero', payload: { index: i, data: "Beberapa data teks acak untuk menambah ukuran payload di memori." } });
  }

  printMemoryUsage('Setelah publikasi');
}

async function runHundredSubscribers() {
  console.log('\n--- Skenario B: 1 Juta Event, 100 Subscriber ---');
  const runtime = new Runtime();
  runtime.registerAdapter('EventBusAdapter', new InMemoryAdapter());

  // Daftarkan 100 subscriber
  let receiveCount = 0;
  for (let s = 0; s < 100; s++) {
    runtime.subscribe('mem.hundred', async (event) => {
      receiveCount++;
    });
  }

  printMemoryUsage('Sebelum publikasi (termasuk 100 subscriber)');

  for (let i = 0; i < ITERATIONS; i++) {
    // Di sini kita bisa gunakan await jika kita ingin menunggu semua diproses
    // Tapi untuk memori kita bisa fire-and-forget atau menunggu per batch.
    // Kita tunggu agar V8 dapat membebaskan memori.
    await runtime.publish({ name: 'mem.hundred', payload: { index: i, data: "Payload." } });
  }

  printMemoryUsage('Setelah publikasi');
  console.log(`Total event dikonsumsi: ${receiveCount}`);
}

async function bootstrap() {
  await runZeroSubscribers();
  await runHundredSubscribers();
}

bootstrap();

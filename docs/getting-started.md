# Getting Started

Selamat datang di `@agent-runtime/core`! Framework ini membantu Anda membangun arsitektur AI yang tangguh menggunakan pola *Event-Driven* dan sekumpulan Agen (*Multi-Agent System*).

## Instalasi

Install paket inti (*core*) menggunakan package manager pilihan Anda:

```bash
npm install @agent-runtime/core
```

Jika Anda ingin menggunakan Redis sebagai *EventBus* terdistribusi (untuk multi-server), install plugin resminya:

```bash
npm install @agent-runtime/plugin-redis
```

## Konsep Dasar (Mental Model)

1. **EventBus**: Jalur komunikasi pusat. Semua kejadian (*Event*) dilempar ke sini.
2. **Runtime**: Mesin utama yang mengatur siklus hidup Agen dan EventBus.
3. **Agent**: Entitas pekerja yang mendengarkan event tertentu dari EventBus, melakukan logika bisnis, dan mempublikasikan hasil pekerjaannya sebagai event baru.
4. **Provider**: Alat pihak ketiga (seperti LLM OpenAI, Database, dsb) yang dapat dipanggil oleh Agen.

## Contoh Sederhana

Berikut adalah contoh aplikasi dengan satu agen yang bereaksi terhadap *event* pembuatan pengguna baru (`user.created`).

```typescript
import { Runtime, Agent } from '@agent-runtime/core';

// 1. Buat Agen Anda
class WelcomeEmailAgent extends Agent {
  protected onStart(): void {
    // Mendengarkan event 'user.created'
    this.bus.subscribe('user.created', async (event) => {
      const email = event.payload.email;
      console.log(`Mengirim email selamat datang ke: ${email}`);
      
      // Publikasikan event baru setelah selesai
      await this.bus.publish({
        name: 'email.sent',
        payload: { email, status: 'success' }
      });
    });
  }
}

// 2. Inisialisasi Runtime
async function bootstrap() {
  const runtime = new Runtime();
  
  // Daftarkan agen
  runtime.register(new WelcomeEmailAgent());
  
  // Jalankan framework
  await runtime.start();

  // Simulasikan event dari API atau sistem eksternal
  await runtime.publish({
    name: 'user.created',
    payload: { email: 'hello@example.com' }
  });
}

bootstrap();
```

## Apa Selanjutnya?
- Pelajari lebih lanjut tentang [Arsitektur Core](./architecture.md).
- Tambahkan kecerdasan buatan melalui [Providers](./providers.md).
- Pelajari cara membangun plugin khusus di [Plugins SDK](./plugins.md).

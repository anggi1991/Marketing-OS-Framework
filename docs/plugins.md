# Build Your First Plugin

Plugin adalah satu-satunya cara resmi untuk memperluas kemampuan `@agent-runtime/core` secara horizontal tanpa memodifikasi kode inti (core).

## Kapan Anda harus membuat Plugin?
- Jika Anda ingin mendaftarkan **Provider** baru (contoh: OpenAI, AWS S3).
- Jika Anda ingin mendaftarkan **Adapter** baru (contoh: Kafka EventBus, Winston Logger).
- Jika Anda perlu melakukan inisialisasi koneksi asinkron (koneksi DB, WebSockets) sebelum agen mulai bekerja.

## Anatomi `RuntimePlugin`

Antarmuka plugin mendefinisikan *lifecycle hooks*. Hanya `name` yang wajib, sisanya opsional.

```typescript
import { Runtime, RuntimePlugin } from '@agent-runtime/core';

export class MyCustomPlugin implements RuntimePlugin {
  name = 'MyCustomPlugin';

  onRegister(runtime: Runtime): void {
    // 1. Fase Registrasi (Synchronous)
    // Tempat terbaik untuk mendaftarkan Provider atau Adapter.
  }

  async onBoot(runtime: Runtime): Promise<void> {
    // 2. Fase Boot (Asynchronous)
    // Dipanggil saat runtime.start() dimulai.
    // Lakukan koneksi I/O yang berat di sini.
  }

  async onReady(runtime: Runtime): Promise<void> {
    // 3. Fase Ready (Asynchronous)
    // Dipanggil setelah EventBus terkoneksi dan agen diinisialisasi.
  }

  async onShutdown(runtime: Runtime): Promise<void> {
    // 4. Fase Shutdown (Asynchronous)
    // Dipanggil saat runtime.stop().
    // Bersihkan resource (tutup koneksi database, dll).
  }
}
```

## Tutorial: Membuat `MathPlugin`

Mari kita buat plugin sederhana yang mendaftarkan kapabilitas berhitung (`MathProvider`).

### 1. Buat Provider-nya

Pertama, buat implementasi `RuntimeProvider`.

```typescript
import { RuntimeProvider } from '@agent-runtime/core';

export class MathProvider implements RuntimeProvider {
  name = 'MathProvider';

  add(a: number, b: number): number {
    return a + b;
  }
}
```

### 2. Buat Plugin-nya

Selanjutnya, buat plugin yang akan mendaftarkan Provider tersebut ke dalam Runtime saat fase `onRegister`.

```typescript
import { Runtime, RuntimePlugin } from '@agent-runtime/core';

export class MathPlugin implements RuntimePlugin {
  name = 'MathPlugin';

  onRegister(runtime: Runtime): void {
    const provider = new MathProvider();
    
    // Daftarkan dengan token 'Math'
    runtime.registerProvider('Math', provider);
    console.log('[MathPlugin] Registered MathProvider!');
  }
}
```

### 3. Gunakan Plugin di Aplikasi

Pengguna framework Anda hanya perlu mengaktifkan plugin ini menggunakan metode `runtime.use()`.

```typescript
const runtime = new Runtime();

// Gunakan plugin
runtime.use(new MathPlugin());

// Mulai runtime
await runtime.start();

// Sekarang agen mana pun bisa mengambil provider ini
const math = runtime.getProvider<MathProvider>('Math');
console.log(math.add(5, 10)); // Output: 15
```

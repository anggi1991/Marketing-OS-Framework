# Build Your First Adapter

**Adapter** adalah abstraksi untuk komponen infrastruktur internal `@agent-runtime/core`. Jika Provider memberikan kapabilitas *bisnis* (AI, Email), maka Adapter memberikan kapabilitas *sistem* (EventBus, Logger, Metrics).

## Anatomi `EventBusAdapter`

Saat ini, *extension point* adapter utama yang didukung secara *native* oleh `Runtime` adalah `EventBusAdapter`.

Sebuah `EventBusAdapter` harus mengimplementasikan empat metode:
1. `connect()`: Membuat koneksi jaringan.
2. `disconnect()`: Menutup koneksi jaringan.
3. `subscribe(eventName, handler)`: Mendaftarkan fungsi untuk mendengarkan pesan dari jaringan.
4. `publish(event)`: Mengirimkan pesan ke jaringan.

```typescript
import { RuntimeEvent, EventHandler } from '@agent-runtime/core';

export interface EventBusAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
  publish(event: RuntimeEvent): Promise<void>;
}
```

## Tutorial: Membuat `FileSystemAdapter`

Sebagai eksperimen, kita akan membuat adapter konyol yang memublikasikan event dengan menuliskannya ke dalam file `.txt`, bukan melalui memori atau jaringan.

### 1. Buat Implementasi Adapter

```typescript
import fs from 'fs/promises';
import { RuntimeEvent, EventHandler, RuntimeAdapter } from '@agent-runtime/core';

// Ingat: Adapter framework juga merupakan RuntimeAdapter di mata Registry
export class FileSystemAdapter implements RuntimeAdapter {
  name = 'EventBusAdapter'; // Token khusus yang akan dikenali oleh Runtime
  
  private handlers: Map<string, EventHandler[]> = new Map();
  private filePath = './events.log';

  async connect(): Promise<void> {
    console.log('[FileSystemAdapter] Siap menulis ke file.');
  }

  async disconnect(): Promise<void> {
    console.log('[FileSystemAdapter] Selesai.');
  }

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  async publish(event: RuntimeEvent): Promise<void> {
    // Tulis ke file log
    const logLine = `[${new Date(event.timestamp).toISOString()}] ${event.name}: ${JSON.stringify(event.payload)}\n`;
    await fs.appendFile(this.filePath, logLine);

    // Tetap panggil local subscriber agar agen tetap berjalan
    const typeHandlers = this.handlers.get(event.name) || [];
    const wildcardHandlers = this.handlers.get('*') || [];
    const allHandlers = [...typeHandlers, ...wildcardHandlers];

    await Promise.all(allHandlers.map(handler => handler(event)));
  }
}
```

### 2. Registrasi via Plugin

Adapter infrastruktur **harus** didaftarkan melalui `RuntimePlugin` di fase `onRegister`. Mengapa? Karena `Runtime` perlu menghubungkan *EventBus* secara internal sebelum memanggil metode `connect()`.

```typescript
import { Runtime, RuntimePlugin } from '@agent-runtime/core';

export class FileSystemPlugin implements RuntimePlugin {
  name = 'FileSystemPlugin';

  onRegister(runtime: Runtime): void {
    // Daftarkan adapter dengan token 'EventBusAdapter'.
    // Runtime akan mengenalinya dan melakukan auto-wiring ke internal EventBus!
    runtime.registerAdapter('EventBusAdapter', new FileSystemAdapter());
  }
}
```

### 3. Eksekusi
```typescript
const runtime = new Runtime();
runtime.use(new FileSystemPlugin());

await runtime.start(); 
// Runtime secara otomatis memanggil FileSystemAdapter.connect() di balik layar!
```

# Runtime Event

Dalam `@agent-runtime/core`, setiap paket data yang dikirim antar-agen dibungkus (wrapped) di dalam objek `RuntimeEvent`. Ini memastikan konsistensi pesan, baik saat Anda menggunakan *In-Memory Bus*, *Redis*, atau *Kafka*.

## Spesifikasi Interface

```typescript
export interface RuntimeEvent<T = any> {
  /**
   * Unique Identifier untuk event.
   * Dihasilkan otomatis secara internal jika tidak disediakan (UUID/Nanoid).
   */
  id: string;

  /**
   * Nama event. Kami menyarankan menggunakan format 'noun.past_verb'.
   * Contoh: 'order.created', 'lead.scored', 'payment.failed'.
   */
  name: string;

  /**
   * Data spesifik domain (Bebas tipe T).
   */
  payload: T;

  /**
   * Unix epoch (ms) kapan event dibuat.
   * Dihasilkan otomatis secara internal jika tidak disediakan.
   */
  timestamp: number;
}
```

## Cara Mempublikasikan Event

Saat mempublikasikan event, Anda tidak perlu mengisi `id` dan `timestamp` secara manual. `EventBus` akan menambahkannya untuk Anda sebelum pesan disebar (dispatched).

### Di dalam Agen
Cara paling umum mempublikasikan event adalah dari dalam metode *Agent*.

```typescript
class OrderAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe('checkout.completed', async (event) => {
      
      // Lakukan sesuatu... lalu publikasikan event baru
      await this.bus.publish({
        name: 'order.created', // Wajib
        payload: {             // Wajib
          orderId: 1234,
          amount: 50000
        }
      });
      
    });
  }
}
```

### Dari Luar Runtime
Anda juga bisa mempublikasikan event dari titik masuk aplikasi Anda (misal: Controller API, Webhook, Cron Job).

```typescript
import { Runtime } from '@agent-runtime/core';

const runtime = new Runtime();
await runtime.start();

// Menerima webhook dari eksternal
app.post('/webhook', async (req, res) => {
  await runtime.publish({
    name: 'webhook.received',
    payload: req.body
  });
  
  res.send('OK');
});
```

## Rekomendasi Payload
Hindari mengirim *domain models* atau objek kelas utuh (instance class) di dalam payload. Payload harus bersifat **Serializable (JSON)**. Hal ini menjamin bahwa jika aplikasi Anda mendadak bertumbuh dan Anda mengganti *InMemoryAdapter* menjadi *RedisAdapter*, payload tersebut dapat ditransmisikan melintasi jaringan (*network boundary*) tanpa menyebabkan _Serialization Error_ (seperti fungsi yang tidak dapat diubah menjadi JSON).

# Build Your First Provider

**Provider** adalah abstraksi untuk semua alat (tools) eksternal atau logika khusus yang ingin Anda suntikkan (inject) agar dapat dikonsumsi oleh `Agent` dan `Pipeline`.

Berbeda dengan Adapter yang menggantikan sistem internal (seperti EventBus), **Provider menambahkan kapabilitas bisnis** (seperti AI, Email, Database, Analytics, dsb).

## Mengapa menggunakan Provider?
1. **Dependency Injection**: Agen Anda tidak boleh membuat koneksi ke OpenAI secara manual menggunakan `new OpenAI()`. Ini akan menyulitkan *Mocking* saat unit testing.
2. **Reusability**: Sebuah Provider `EmailProvider` dapat digunakan oleh 10 agen yang berbeda.

## Anatomi `RuntimeProvider`

Setiap kelas provider hanya diwajibkan memiliki properti `name` (string) yang mengimplementasikan interface `RuntimeProvider`. 
Sisanya adalah metode bisnis Anda sendiri.

```typescript
import { RuntimeProvider } from '@agent-runtime/core';

export interface AIProvider extends RuntimeProvider {
  analyze(text: string): Promise<number>;
}
```

## Tutorial: Membuat `SentimentProvider`

Kita akan membuat provider AI bodong (Mock) yang mengevaluasi sentimen teks.

### 1. Deklarasikan Class

```typescript
import { RuntimeProvider } from '@agent-runtime/core';

export class SentimentProvider implements RuntimeProvider {
  name = 'SentimentProvider';

  /**
   * Logika bisnis: Mengembalikan nilai sentimen dari teks.
   */
  async analyze(text: string): Promise<number> {
    if (text.includes("marah") || text.includes("buruk")) {
      return 10; // Sentimen negatif / butuh eskalasi
    }
    return 90; // Sentimen positif
  }
}
```

### 2. Daftarkan di Runtime

Cara terbaik mendaftarkan provider adalah melalui Plugin (seperti di [Panduan Plugin](./plugins.md)). Namun, untuk pengujian cepat, Anda bisa mendaftarkannya langsung di `Runtime` menggunakan `.registerProvider()`.

```typescript
import { Runtime } from '@agent-runtime/core';

const runtime = new Runtime();

// Daftarkan provider dengan Token unik 'AI'
runtime.registerProvider('AI', new SentimentProvider());
```

### 3. Konsumsi di Agen

Di dalam Agen, Anda dapat memanggil `this.runtime.getProvider<Type>('Token')` untuk menggunakan Provider tersebut.

```typescript
import { Agent } from '@agent-runtime/core';

class FeedbackAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe('feedback.submitted', async (event) => {
      
      // 1. Ambil Provider
      const ai = this.runtime.getProvider<SentimentProvider>('AI');
      
      // 2. Gunakan Provider
      const score = await ai.analyze(event.payload.message);

      // 3. Bertindak berdasarkan hasil
      if (score < 50) {
        await this.bus.publish({
          name: 'feedback.escalated',
          payload: { originalMessage: event.payload.message }
        });
      }
    });
  }
}
```

## Best Practices
- Selalu pisahkan antarmuka (Interface) dan implementasi (Class). Misalnya, buat `EmailProvider` (Interface), lalu buat `SendgridProvider` (Implementasi). Daftarkan implementasi dengan token `'EmailProvider'`. Dengan cara ini, Anda bisa mengganti Sendgrid dengan Mailgun di masa depan tanpa mengubah kode Agen sedikit pun!

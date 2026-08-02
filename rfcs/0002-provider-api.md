# RFC: 0002 - Provider API

- **Status:** Proposed
- **Author:** anggi1991 (Ecosystem Maintainer)
- **Date:** 2026-08-02

## 1. Ringkasan (Summary)
Mendefinisikan kontrak publik untuk `RuntimeProvider`. Framework tidak boleh secara spesifik merujuk pada `AIProvider`, melainkan menganggap LLM, Analytics, Database, atau API eksternal lainnya sebagai entitas `Provider` yang bisa didaftarkan dan dikonsumsi secara dinamis oleh *Agent* dan *Pipeline*.

## 2. Motivasi (Motivation)
Sebelum v0.3.0, `Runtime` memiliki field khusus `aiProvider: AIProvider | null`. Ini adalah bentuk *hard-coupling* yang membatasi framework. Dalam arsitektur yang domain-agnostic, LLM (OpenAI, Anthropic) hanyalah satu dari sekian banyak tipe kapabilitas. Agent juga mungkin membutuhkan `EmailProvider`, `CRMProvider`, atau `AnalyticsProvider`.

## 3. Desain Teknis (Detailed Design)

Setiap provider harus mengikuti antarmuka dasar ini:

```typescript
/**
 * Kontrak dasar dari setiap kapabilitas eksternal (Provider).
 */
export interface RuntimeProvider {
  name: string;
}

/**
 * Contoh Provider Spesifik yang meng-extend RuntimeProvider
 */
export interface AIProvider extends RuntimeProvider {
  generate(prompt: string, options?: any): Promise<string>;
  analyze<T = any>(payload: any, options?: any): Promise<T>;
}
```

Mekanisme konsumsi di dalam `Agent`:

```typescript
class LeadAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe('lead.created', async (event) => {
      // Konsumsi Provider
      const llm = this.runtime.getProvider<AIProvider>('AIProvider');
      const email = this.runtime.getProvider<EmailProvider>('EmailProvider');
      
      const analysis = await llm.analyze(event.payload);
      if (analysis.score > 80) {
        await email.send(event.payload.email, "Welcome!");
      }
    });
  }
}
```

## 4. Kelemahan (Drawbacks)
- Proses pemanggilan `this.runtime.getProvider<T>('Token')` kehilangan _type-safety_ bawaan pada parameter token string-nya. (Kita harus melakukan type casting ke `<T>`).
- Risiko *Runtime Error* jika Agent mencoba memanggil provider yang belum di-register oleh `Runtime`.

## 5. Alternatif (Alternatives)
- **Symbol Injection**: Menggunakan ES6 `Symbol` untuk injeksi. (Bagus secara teori, tetapi string tokens lebih mudah untuk serialisasi / dokumentasi bagi pengguna pemula).
- **Constructor Injection di Agent**: Mengoper provider ke dalam `new Agent(provider1, provider2)`. Ini lebih *type-safe*, tetapi tidak ramah ekosistem karena memaksa dev untuk *hard-code* instansiasi dependensi, padahal Provider bisa di-register oleh plugin pihak ketiga secara abstrak.

## 6. Pertanyaan Terbuka (Unresolved Questions)
- Bagaimana menangani "Provider Explosion"? Jika suatu aplikasi membutuhkan 20 jenis provider, apakah `this.runtime.getProvider('Token')` akan terasa melelahkan? (Solusi masa depan: Membuat utilitas *proxy* atau *decorators*).

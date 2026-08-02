# RFC: 0004 - Runtime Context (Exploratory)

- **Status:** Draft / Experimental
- **Author:** anggi1991 (Ecosystem Maintainer)
- **Date:** 2026-08-02

## 1. Ringkasan (Summary)
Mendefinisikan mekanisme *context propagation* yang generik untuk framework. Ini memungkinkan metadata (seperti `traceId`, `correlationId`, atau `userId`) dibawa bersamaan dengan eksekusi event tanpa harus mengotori `payload` event itu sendiri.

## 2. Motivasi (Motivation)
Agen dan Pipeline di dalam `@agent-runtime/core` sering kali tidak menyadari dari mana event itu berasal. Jika sebuah event memicu serangkaian event baru (A -> B -> C), kita membutuhkan cara untuk melacak seluruh jejak eksekusi ini.
Menyuntikkan metadata semacam ini langsung ke `payload` akan mencampuradukkan logika bisnis (domain) dengan data infrastruktur (metadata), sehingga menyalahi prinsip *Separation of Concerns*.

## 3. Desain Teknis (Detailed Design)
Event standar akan diperbarui dengan field `context` opsional.

```typescript
export interface RuntimeEvent<T = any> {
  id: string;
  name: string;
  payload: T;
  timestamp: number;
  
  /** Metadata kontekstual untuk tracing dan korelasi (Experimental) */
  context?: RuntimeContext;
}

export interface RuntimeContext {
  traceId?: string;
  correlationId?: string;
  [key: string]: any; // Extensibility generik
}
```

Saat agen mempublikasikan event lanjutan, ia didorong (melalui best practices) untuk menyertakan kembali `traceId` atau memperbarui `context`.

## 4. Kelemahan (Drawbacks)
- Harus diteruskan secara manual oleh developer di dalam Agen. Jika seorang developer membuat event baru tanpa melempar (pass-through) context dari event sebelumnya, rantai *tracing* akan terputus.
- Jika menggunakan `AsyncLocalStorage` (Node.js) untuk propagasi otomatis, ini akan mengunci framework ke lingkungan Node.js dan merusak kompatibilitas Edge (Cloudflare Workers, Deno, dll). Oleh karena itu, kita memilih *explicit passing* (melewatkan secara manual).

## 5. Alternatif (Alternatives)
- **AsyncLocalStorage (ALS)**: Propagasi *magic* tanpa developer harus mengoper objek context secara eksplisit.
  - Kelemahan: Kurang *environment-agnostic* (Edge runtimes sering membatasi ALS) dan bisa terjadi *context leakage* dalam arsitektur event-driven yang tinggi konkurensi.
- **Memaksa Metadata di Payload**: `event.payload.metadata.traceId`.
  - Kelemahan: Mencemari tipe data domain dan menyulitkan validasi skema (Zod/Joi).

## 6. Pertanyaan Terbuka (Unresolved Questions)
- Apakah `RuntimeContext` perlu distandardisasi menjadi *class* tersendiri dengan metode `.getChildContext()` untuk otomatis mewariskan `traceId`?
- (Target v0.4+) Haruskah `Pipeline` secara otomatis menyalin *context* antar langkah eksekusi?

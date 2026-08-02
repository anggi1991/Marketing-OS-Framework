# Compatibility Matrix

Proyek `@agent-runtime/core` dirancang menggunakan standar ECMAScript modern namun mendukung kompilasi ke CommonJS (CJS) secara *out-of-the-box* demi kompatibilitas maksimal ke berbagai ekosistem (khususnya legacy Node.js enterprise).

## Versi Node.js yang Didukung

| Lingkungan       | Versi      | Dukungan   | Keterangan                                       |
| ---------------- | ---------- | ---------- | ------------------------------------------------ |
| **Node.js LTS**  | `v20.x`    | ✅ Penuh  | Target utama produksi (Current LTS)              |
| **Node.js**      | `v22.x`    | ✅ Penuh  | Fully supported untuk rilis terbaru              |
| **Node.js Old**  | `v18.x`    | ⚠️ Deprecated| Berjalan, tapi dukungan akan dicabut di v1.0   |

## TypeScript dan Target Kompilasi

Library ini ditulis dalam **TypeScript `v5.5+`**. 
- Target Output: `ES2022`
- Module System: `CommonJS` (dengan `esModuleInterop: true`)

| Fitur | Status | Keterangan |
| --- | --- | --- |
| **Strict Type-Checking** | Didukung Penuh | Kode dibangun dengan bendera `--strict` |
| **CommonJS (CJS)** | Didukung Penuh | *Default output* saat paket NPM di-install |
| **ECMAScript Modules (ESM)** | Eksperimental | Mendukung `import` dalam lingkungan ESM via wrapper Node.js |

## Kompatibilitas Sistem Operasi

| OS (Operating System) | Dukungan  |
| --------------------- | --------- |
| Linux (Ubuntu, dll)   | ✅ Penuh  |
| macOS (Intel / ARM)   | ✅ Penuh  |
| Windows (WSL2)        | ✅ Penuh  |
| Windows (Native)      | ✅ Penuh  |

> **Catatan Edge Runtimes:** Meskipun `@agent-runtime/core` sangat ringan (zero external dependencies), kompatibilitas untuk *Edge Runtimes* (seperti Cloudflare Workers atau Vercel Edge) saat ini masih berstatus eksperimental (dapat diuji di v0.4 ke atas). Jangan gunakan adapter seperti `plugin-redis` di Edge Runtime kecuali Anda menggunakan varian Redis berbasis HTTP.

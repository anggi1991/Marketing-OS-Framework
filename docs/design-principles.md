# Design Principles

Dokumen ini menjelaskan prinsip inti (core philosophy) di balik desain `@agent-runtime/core`. Setiap fitur baru atau RFC harus dievaluasi berdasarkan prinsip-prinsip ini.

## 1. Event-driven First
Runtime agen bukanlah API berbasis Request-Response konvensional. Setiap aksi (Action) agen dipicu oleh sebuah `RuntimeEvent` (misalnya `lead.created`), dan setiap keputusan agen diwujudkan dengan mempublikasikan (publish) event baru (misalnya `lead.scored`). Hal ini membuat sistem sangat asinkron, *scalable*, dan mudah dide-couple (dilepas pasang).

## 2. Plugin over Inheritance
Alih-alih membuat _subclass_ dari `Runtime` (seperti `MarketingRuntime`, `HRISRuntime`), framework ini memanfaatkan sistem **Plugin** (`runtime.use(plugin)`). Ekstensi fitur ditambahkan secara horizontal.

## 3. Composition over Configuration
Framework menyediakan *building blocks* (EventBus, Agent, Pipeline) tanpa memaksakan struktur aplikasi *monolithic*. Pengguna dibebaskan untuk merakit blok-blok ini dengan komposisi yang mereka tentukan sendiri di dalam file *bootstrap* mereka (seperti `index.ts`), alih-alih mengandalkan file `.yaml` besar sebagai konfigurasi utama.

## 4. Stateless Agents
**Agen tidak boleh menyimpan state lokal** yang krusial di memori internalnya (seperti array *leads* yang diproses atau menyimpan perhitungan variabel di properti class yang terus berlanjut). Setiap Agen harus memperlakukan setiap Event secara terisolasi. Jika state dibutuhkan, gunakan `RuntimeProvider` (misal: Redis atau Database Provider) untuk menyimpan dan mengambil data persisten.

## 5. Runtime Owns Lifecycle
Setelah `runtime.start()` dipanggil, *Runtime* secara penuh bertanggung jawab atas siklus hidup semua Plugin, Agen, dan Koneksi EventBus. Dilarang keras menginisialisasi atau mematikan koneksi secara langsung di dalam Agen, biarkan Runtime mengaturnya melalui fase `onBoot` dan `onShutdown`.

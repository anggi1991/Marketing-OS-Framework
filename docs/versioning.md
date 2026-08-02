# Versioning Policy

Framework `@agent-runtime` mengadopsi standar [Semantic Versioning (SemVer)](https://semver.org/) secara disiplin.
Format: `MAJOR.MINOR.PATCH` (contoh: `v0.3.0`).

## 1. Fase Eksperimental (0.x.x)
Saat ini, proyek berada dalam tahap Alpha/Beta (`0.x.x`). Selama fase ini:
- API publik **sebagian besar stabil**, tetapi **MINOR** version update (contoh `0.3` ke `0.4`) **dapat berisi Breaking Changes** jika ada penemuan kelemahan arsitektur kritis berdasarkan fase *Dogfooding*.
- Update **PATCH** (contoh `0.3.0` ke `0.3.1`) **dijamin 100% aman** (hanya berisi perbaikan bug, masalah keamanan, atau perbaikan dokumen).

## 2. Definisi "Breaking Change"
Sebuah pembaruan dianggap sebagai *Breaking Change* (membutuhkan kenaikan Major atau Minor saat fase `0.x`) jika:
1. Menghapus sebuah metode atau properti publik dari `Runtime`, `Agent`, `EventBus`, atau tipe antarmuka (interface) inti.
2. Menambah parameter wajib (required) baru pada metode atau konstruktor publik.
3. Mengubah nama atau struktur `RuntimeEvent` (kecuali penambahan field opsional).
4. Menghapus atau membatasi *Extension Points* yang sudah ada.

## 3. Proses Deprecation
Jika kami berencana menghapus sebuah fitur, kami akan:
1. Mempertahankan fungsi lama dengan memberikan anotasi JSDoc `@deprecated` minimal selama satu versi MINOR (jika di atas 1.0) atau beberapa rilis PATCH (di fase 0.x).
2. Menampilkan peringatan `console.warn` yang tidak menghentikan runtime.
3. Mengkomunikasikan RFC untuk penghapusan tersebut secara publik.

## 4. Rilis Produksi (v1.0.0+)
Ketika framework secara resmi menyentuh versi `v1.0.0`, kontrak API akan dikunci permanen. Segala *Breaking Changes* HANYA boleh terjadi pada rilis versi Major berikutnya (contoh: `v2.0.0`).

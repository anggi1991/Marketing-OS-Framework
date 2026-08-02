# RFC: 0005 - Workflow DSL (Exploratory)

- **Status:** Draft / Experimental
- **Author:** anggi1991 (Ecosystem Maintainer)
- **Date:** 2026-08-02

## 1. Ringkasan (Summary)
Eksplorasi pembuatan Domain Specific Language (DSL) berbasis konfigurasi (JSON/YAML) untuk membangun *Pipeline* secara dinamis, tanpa harus menuliskannya di dalam kode TypeScript. (Rencana implementasi: **v0.5+**).

## 2. Motivasi (Motivation)
Framework saat ini menggunakan metode programatik (`runtime.registerPipeline(...)`). Jika aplikasi yang menggunakan framework (seperti ERP, CRM, atau Marketing OS) ingin membiarkan penggunanya (non-developer) mendesain alur kerja multi-agen secara visual, konfigurasi tersebut harus disimpan di *Database* (misal: JSON).
Kita membutuhkan cara agar `Runtime` bisa mengubah konfigurasi JSON menjadi serangkaian *Pipeline Steps* dan pendaftaran event.

## 3. Desain Teknis (Detailed Design)
Sebagai tahap eksplorasi, bentuk dari DSL ini diproyeksikan sebagai array blok logika.

```json
{
  "workflow": "lead-qualification",
  "trigger": "lead.created",
  "steps": [
    {
      "action": "ai.analyze",
      "provider": "AIProvider",
      "outputKey": "analysis"
    },
    {
      "action": "condition",
      "if": "analysis.score > 80",
      "then": {
        "publish": "lead.qualified"
      },
      "else": {
        "publish": "lead.rejected"
      }
    }
  ]
}
```

Sebuah parser di dalam `@agent-runtime/core` (atau module plugin mandiri seperti `@agent-runtime/plugin-dsl`) akan menerjemahkan bentuk JSON ini ke dalam kelas `Pipeline` internal.

## 4. Kelemahan (Drawbacks)
- Meningkatkan kerumitan *core* secara drastis jika ditanam di `@agent-runtime/core`.
- Evaluasi kondisional (`if: "analysis.score > 80"`) akan memaksa framework untuk menulis atau memasukkan sebuah interpreter ekspresi kecil, berpotensi membuka kerentanan keamanan (injection) jika menggunakan `eval()`.

## 5. Alternatif (Alternatives)
- **Tidak Memiliki DSL Bawaan**: Membiarkan consumer aplikasi (seperti Marketing OS) mengimplementasikan parsing DSL mereka sendiri, sementara framework murni hanya menyediakan antarmuka `Pipeline`. Ini menjaga core tetap ultra-ringan, tetapi mengurangi *selling point* framework bagi developer lain yang ingin sistem serupa.
- **State Machine Library**: Membungkus XState di dalam framework daripada menciptakan DSL spesifik.

## 6. Pertanyaan Terbuka (Unresolved Questions)
- Haruskah parser DSL ini menjadi *plugin* tersendiri (`plugin-workflow-parser`) agar `core` tetap terbebas dari overhead interpreter?
- Seberapa dalam kemampuan evaluasi logika yang kita butuhkan? (Apakah sesederhana operator boolean, atau membutuhkan _loops_ dan _map/reduce_?).

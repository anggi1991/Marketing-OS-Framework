# Prototype Failure Log & Notes

Tujuan dokumen ini adalah mendokumentasikan kelemahan, asumsi yang gagal, dan area di mana desain RFC 0006 atau AD-0001 terasa kurang tepat selama implementasi prototype.

## Log Eksperimen & Temuan

1. **Pembuatan Workflow Context Awal (Kelemahan API)**
   Saat ini *Workflow Definition* tidak mendefinisikan *schema* untuk `WorkflowContext`. Akibatnya, pembuat *Instance* harus memasukkan data secara *ad-hoc* (seperti `{ customer: { id: 1, tier: 'Premium' } }`). 
   *Rekomendasi*: Di v0.4, kita mungkin perlu menambahkan semacam `contextSchema` di dalam definisi agar ada validasi *payload* sebelum *Instance* diizinkan mulai berjalan.

2. **Transition Priority & Default Path**
   Evaluasi `Transition` dengan properti `priority` berfungsi sangat baik untuk mengevaluasi syarat (*conditions*) secara sekuensial. Fitur `isDefaultPath: true` sangat penting sebagai jaring pengaman (*fallback*) saat tidak ada `condition` yang terpenuhi.
   *Temuan*: Harus dipastikan dalam implementasi v0.4 bahwa setiap *Step* setidaknya memiliki satu transisi dengan `isDefaultPath: true` (kecuali ia adalah status terminal / akhir), jika tidak eksekusi bisa *stuck* atau secara ambigu beralih ke `Completed` tanpa kejelasan.

3. **Penanganan Error (*Error Path* vs *Retry*)**
   Abstraksi *Retry* di level Runtime (`engine.ts`) berfungsi sempurna (AD-0001 divalidasi). *Step* murni hanya melempar eksepsi (`throw new Error()`), dan Runtime yang menghitung jumlah percobaan dan memicu _backoff_.
   *Kelemahan*: Saat Runtime mengalihkan rute melalui `isErrorPath: true`, *step* tujuan (seperti `CompensationStep`) saat ini **tidak menerima detail error** yang dilemparkan oleh step sebelumnya. 
   *Rekomendasi*: Runtime perlu menyuntikkan data error tersebut ke dalam `ExecutionContext` atau menyimpannya di suatu tempat di `WorkflowContext` (misalnya `context.workflow.lastError`) agar step kompensasi tahu apa yang salah.

4. **Sifat Ephemeral Execution Context**
   Terbukti berguna. Informasi seperti `attempt` counter dan `startTime` masuk ke `ExecutionContext`, mencegah polusi di `StepContext` atau `WorkflowContext`.

## Kesimpulan

Semua **Exit Criteria** telah terpenuhi. Model arsitektur ini sudah terbukti dapat menangani orkestrasi kompleks (percabangan dan retry terpusat) tanpa memaksa *Step* memahami _lifecycle_ eksekusi. Konsep dari RFC 0006 sangat layak dipromosikan ke `packages/core` di fase selanjutnya (v0.4), dengan beberapa penyempurnaan implementasi berdasarkan catatan kelemahan di atas.

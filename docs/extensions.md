# Extension Points

Dokumen ini menjelaskan batasan-batasan teknis tentang apa yang boleh dan tidak boleh dimodifikasi (di-extend) di dalam `@agent-runtime/core`.

## Apa yang BOLEH di-extend?

1. **`Agent`**: Anda sangat dianjurkan untuk mewariskan (inherit) kelas `Agent` untuk mendefinisikan logika domain Anda (contoh: `class LeadScoringAgent extends Agent`). Anda hanya perlu melakukan _override_ pada metode `protected onStart()`.
2. **`RuntimePlugin`**: Implementasikan interface ini untuk membungkus pustaka pihak ketiga dan mendaftarkannya ke dalam Runtime (contoh: `RedisPlugin`, `OpenAIPlugin`).
3. **`RuntimeProvider`**: Implementasikan kapabilitas tambahan untuk agen Anda (contoh: LLM, Email, CRM).
4. **`RuntimeAdapter`**: Mengganti implementasi infrastruktur internal (contoh: `EventBusAdapter`).

## Apa yang TIDAK BOLEH di-override?

1. **`Runtime` Class**: Dilarang mewariskan atau melakukan modifikasi (*monkey-patching*) pada kelas `Runtime` itu sendiri. API registrasi (`register`, `registerProvider`, `use`) telah dikunci (*frozen* secara konsep) untuk menjaga keamanan ekosistem.
2. **Internal Map State**: Memodifikasi atau menghapus *map* yang menyimpan daftar agen atau pipeline secara langsung sangat dilarang.
3. **`EventBus` Class Core**: Anda boleh mengganti *Adapter*-nya, tetapi dilarang mengganti *Class EventBus* milik framework karena logika propagasi _id_ dan _timestamp_ ada di sana.

## Konvensi Naming untuk Extension
- Nama kelas Provider diakhiri dengan `Provider` (contoh: `OpenAIProvider`).
- Nama kelas Adapter diakhiri dengan `Adapter` (contoh: `KafkaEventBusAdapter`).
- Event disarankan menggunakan penamaan pola *noun.past_verb* (contoh: `order.created`, bukan `createOrder`).

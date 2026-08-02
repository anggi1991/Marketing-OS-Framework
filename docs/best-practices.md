# Best Practices

Panduan ini berisi rekomendasi desain (design patterns) untuk membangun sistem berbasis agen yang dapat diskalakan (*scalable*) menggunakan `@agent-runtime/core`.

## 1. Agen Harus Tanpa Status (Stateless)

Agen tidak boleh bergantung pada properti internal (kelas) untuk menyimpan data yang berumur lebih lama dari penanganan *satu* event.

**❌ BURUK:**
```typescript
class SupportAgent extends Agent {
  private activeTickets: string[] = []; // BERBAHAYA!

  protected onStart(): void {
    this.bus.subscribe('ticket.created', async (event) => {
      this.activeTickets.push(event.payload.id); // Akan hilang jika server restart!
    });
  }
}
```

**✅ BAIK:**
```typescript
class SupportAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe('ticket.created', async (event) => {
      // Simpan ke Persistent Storage melalui Provider (misal: Redis, PostgreSQL)
      const db = this.runtime.getProvider<DatabaseProvider>('Database');
      await db.saveTicket(event.payload.id);
    });
  }
}
```

## 2. Format Event "Noun.Verb"

Selalu beri nama event menggunakan objek kata benda (noun) dan tindakan masa lalu (past verb). Ini mengikuti standar industri (seperti Stripe atau GitHub Webhooks).
- **✅ BENAR:** `order.created`, `invoice.paid`, `lead.scored`
- **❌ SALAH:** `createOrder`, `ProcessLead`, `NewInvoice`

## 3. Hindari Komunikasi Langsung Antar-Agen (RPC)

Jika `Agent A` membutuhkan data yang dihasilkan oleh `Agent B`, `Agent A` tidak boleh memanggil fungsi atau menyimpan referensi dari `Agent B`. Kedua agen tersebut HANYA boleh berkomunikasi melalui perantara *EventBus*. 

**❌ BURUK:** `AgentA` menginisiasi kelas `AgentB`.
**✅ BAIK:** `AgentA` mempublikasikan event `task.requested`. `AgentB` mendengarkan `task.requested`, memprosesnya, dan mempublikasikan `task.completed`. `AgentA` (atau Agen lain) mendengarkan `task.completed`.

## 4. Pastikan Payload Serializable (Hanya JSON)

Framework dirancang agar bisa bergeser ke lingkungan terdistribusi (Redis / Kafka). Jika Anda menyuntikkan kelas instance (misalnya `new Date()`, `Buffer`, atau referensi _function_) ke dalam `payload`, data tersebut akan rusak saat diserialisasi melintasi jaringan. Gunakan selalu tipe primitif JSON.

**❌ BURUK:**
```typescript
await runtime.publish({
  name: 'file.uploaded',
  payload: { fileStream: fs.createReadStream('...') } // Akan gagal jika memakai Redis
});
```

**✅ BAIK:**
```typescript
await runtime.publish({
  name: 'file.uploaded',
  payload: { fileUrl: 'https://s3.aws.com/file.txt' } // Aman untuk semua jaringan
});
```

## 5. Tangani Error di Level Agen

Framework tidak menghentikan runtime jika suatu Agen gagal memproses event, tetapi agen tersebut juga tidak boleh diam jika terjadi error kritis (silence failure). Selalu publikasikan event `.failed` jika agen Anda membatalkan eksekusinya.

```typescript
try {
  // Lakukan perhitungan LLM...
} catch (error) {
  await this.bus.publish({
    name: 'lead.processing.failed',
    payload: { originalLeadId: id, reason: error.message }
  });
}
```

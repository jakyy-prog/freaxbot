## Freaxbot

Freaxbot adalah Discord bot berbasis **Node.js** menggunakan  
**discord.js v14** dan **@sapphire/framework**.

Project ini dikembangkan secara kolaboratif untuk membantu komunitas,
khususnya seputar **Monster Hunter**.  
Saat ini bot masih berjalan di **localhost** dan akan di-deploy ke server Discord
**Freax Squad** jika sudah siap.

---

## 🚀 Fitur Saat Ini
- `/ping` — Mengecek latency bot
- `/createlobby` — Membuat lobby Monster Hunter (auto close setelah 7 jam)
- `/closelobby` — Menutup lobby yang sedang aktif
- Konfigurasi berbasis environment (`.env`)
- Template konfigurasi (`.env.example`)
- Siap dikembangkan secara kolaboratif

---

## 📦 Tech Stack
- Node.js (disarankan v18+)
- discord.js v14
- @sapphire/framework
- dotenv
- SQLite (better-sqlite3)
- (opsional) Prisma

---

## 📁 Struktur Project
```txt
src/
 ├─ commands/      # Slash commands
 ├─ listeners/     # Event listeners
 ├─ database/      # Database & query
 ├─ client.js      # Custom Sapphire client
 └─ index.js       # Entry point

# SpeakEasy Microservices Blueprint

Dokumen ini merapikan blueprint arsitektur SpeakEasy AI agar implementasi bisa dilakukan satu per satu, tanpa langsung meloncat ke microservices murni.

## 1) Core AI Conversation Module

Ini adalah jantung produk untuk interaksi belajar berbasis suara dan teks.

### Submodule dan fungsi utama

| Submodule | Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- | --- |
| STT (client-side) | `startListening()`, `stopListening()`, `setTranscript()` | Kontrol lifecycle mikrofon harus eksplisit agar UX stabil | Mengubah suara user menjadi teks draft realtime |
| TTS (client-side, opsional tahap lanjut) | `speak(text)` / Web Speech Synthesis | Respons AI terasa seperti percakapan nyata | Membacakan respons AI dengan suara alami |
| Conversation Orchestrator (server/API) | `generateRealtimeConversation()` | Orkestrasi context, prompt, dan call model lebih aman di server | Menghasilkan respons AI sesuai topik dan mode |
| Silence Detection | `onSpeechPause(timeoutMs)` | Trigger koreksi setelah user selesai bicara, bukan tiap kata | Memicu submit otomatis saat hening > 1.5 detik |

## 2) Intelligence & Education Module

Modul ini memberi nilai edukasi (bukan sekadar chatbot).

### Service dan fungsi utama

| Service | Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- | --- |
| Grammar Correction Engine | `generateGrammarCorrection()` | Koreksi grammar harus paralel agar tidak menghambat respons conversation | Memberi versi kalimat benar + penjelasan Indonesia |
| Adaptive Leveling Service | `detectEstimatedLevel()` | Perlu scoring konsisten dari data sesi, error rate, dan kompleksitas kalimat | Menentukan level user (beginner, elementary, dst) |
| Daily Topic Generator | `getDailyTopic(userId, date)` | Topik harian perlu cache supaya hemat token model | Membuat topik personal berdasarkan histori belajar |

## 3) User Engagement & Persistence Module

Modul ini menjaga retensi, progres, dan gamifikasi.

### Service dan fungsi utama

| Service | Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- | --- |
| Auth & Profile Service | `getCurrentUser()`, `upsertUserProfile()` | Identity harus konsisten agar histori dan leaderboard valid | Login OAuth/Email + profil dasar |
| Guest Mode Controller | `resolveUserContext()` | Guest tetap bisa latihan tanpa memaksa signup | Batasi fitur persisten jika belum login |
| Gamification Engine | `updateStreakAndScore()` | Perhitungan streak/score wajib terpusat agar adil | Update streak harian dan leaderboard mingguan |
| Progress Tracking Service | `recordSessionMetrics()` | Metrik sesi harus tercatat per sesi, bukan agregat manual | Simpan total menit, jumlah sesi, vocabulary log |

## 4) Future Map (Jika Dipecah Menjadi Microservices Murni)

### Ringkasan layanan

| Service Name | Tanggung Jawab Utama | Database / Store |
| --- | --- | --- |
| User Service | Auth, profile, streak | `profiles`, `streaks` |
| AI Gateway Service | Proxy ke Groq, rate limiting, fallback | Redis (rate limit) |
| Content Service | Topic generation, topic history, cache | `user_topic_history`, `daily_topic_cache` |
| Analytics Service | Grammar error log, level detection, vocabulary growth | `user_grammar_errors`, `session_analytics` |
| Gamification Service | Leaderboard mingguan/global | `leaderboard` |

### Rincian per microservice (fungsi + alasan)

#### User Service

| Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- |
| `getCurrentUser()` | Identitas user harus konsisten sebelum menyimpan histori | Validasi login/session aktif |
| `upsertUserProfile()` | Profil perlu idempotent agar update aman | Simpan nama, avatar, dan preferensi |
| `resolveUserContext()` | Guest tetap bisa latihan tanpa signup | Menentukan mode guest vs member |

Database / Store: `profiles`, `streaks`.

#### AI Gateway Service

| Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- |
| `getGroqRuntimeConfig()` | Konfigurasi API harus dipusatkan | Validasi apiKey dan model aktif |
| `requestGroqChatCompletion()` | Satu pintu akses ke Groq memudahkan rate limit | Kirim prompt conversation/grammar |
| `generateRealtimeConversation()` | Orkestrasi chat + grammar harus konsisten | Satukan respons AI dan koreksi |

Database / Store: Redis (rate limit).

#### Content Service

| Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- |
| `getDailyTopic(userId, date)` | Topik harian butuh cache agar hemat token | Ambil topik sesuai tanggal dan user |
| `fetchTopicFromCache()` | Cache mempercepat load landing/conversation | Reuse topik terakhir jika ada |
| `fetchUserTopicHistory()` | Histori topik wajib konsisten per user | Tampilkan riwayat belajar terakhir |

Database / Store: `user_topic_history`, `daily_topic_cache`.

#### Analytics Service

| Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- |
| `recordSessionMetrics()` | Metrik sesi harus tercatat per sesi | Simpan durasi, error rate, vocab |
| `detectEstimatedLevel()` | Level harus dihitung konsisten lintas UI | Estimasi level belajar terbaru |
| `buildProgressFromRows()` | Agregasi perlu logika terpusat | Hitung total sesi, menit, streak |

Database / Store: `user_grammar_errors`, `session_analytics`.

#### Gamification Service

| Fungsi yang dipakai | Kenapa fungsi ini dipakai | Untuk apa |
| --- | --- | --- |
| `updateStreakAndScore()` | Skor dan streak harus terpusat agar adil | Update streak harian dan poin |
| `calculateCurrentStreak()` | Perhitungan streak harus konsisten | Deteksi streak aktif saat ini |
| `mapLeaderboard()` | Format leaderboard perlu seragam | Susun leaderboard mingguan |

Database / Store: `leaderboard`.

## 5) Implementasi Bertahap (One by One)

Tahapan ini disusun agar migration dari mock ke production tetap aman.

### Tahap 1 - Content + Persistence dasar

1. Sambungkan repository ke Supabase tabel:
	- `user_topic_history`
	- `daily_topic_cache`
	- `leaderboard`
2. Fallback ke in-memory jika env Supabase belum terpasang.

### Tahap 2 - Real-time AI route

1. Aktifkan route handler API untuk:
	- respons conversation (Groq conversation model)
	- grammar correction (Groq grammar model, paralel)
2. Client conversation melakukan `POST` ke route ini per kalimat.

### Tahap 3 - Dashboard PRD

1. Buat halaman dashboard berisi:
	- current streak
	- total sesi
	- total menit belajar
	- vocabulary log
2. Semua data diambil dari repository (bukan hardcoded).

### Tahap 4 - Visual Safety

1. Jalankan `npm run visual:guard` sebelum/sesudah refactor UI.
2. Jalankan `npm run visual:test:update` jika baseline screenshot berubah.
3. Jalankan `npm run visual:test` untuk mendeteksi visual regression.
4. CI `.github/workflows/visual-regression.yml` menjalankan `visual:guard` + `visual:test` di PR.

## 6) Supabase Table Minimum Contract

Minimal kolom agar modul berjalan mulus:

### `daily_topic_cache`

- `id` (uuid/text)
- `topic_date` (date)
- `title` (text)
- `category` (text)
- `starter_questions` (text[] atau jsonb)
- `created_at` (timestamp)

### `user_topic_history`

- `id` (uuid/text)
- `user_id` (uuid/text)
- `title` (text)
- `label` (text, optional)
- `is_today` (boolean, optional)
- `session_minutes` (int, optional)
- `vocabulary_log` (jsonb/text[], optional)
- `created_at` (timestamp)

### `leaderboard`

- `id` (uuid/text)
- `user_id` (uuid/text)
- `display_name` (text)
- `initials` (text, optional)
- `score` (int)
- `updated_at` (timestamp)

Dokumen ini dipakai sebagai acuan implementasi kode tahap berikutnya.

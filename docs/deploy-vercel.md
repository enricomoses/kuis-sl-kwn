# Panduan Deploy ke Vercel (Hobby Plan — Import dari GitHub)

Project ini sudah dikonfigurasi siap deploy ke Vercel:

- `vercel.json`: memakai region **Singapore (`sin1`)** agar satu region dengan Supabase Southeast Asia (Singapore).
- `package.json`: mengunci runtime Node.js **`24.x`** via `engines.node`.
- `.vercelignore`: mengecualikan folder lokal/tes (`supabase`, `coverage`, laporan Playwright) agar upload build ringan.
- Cookie pemain otomatis menggunakan flag `Secure` pada seluruh deployment HTTPS Vercel (Production & Preview).

## Langkah Import & Deploy Manual di Vercel

1. Buka [Vercel Dashboard](https://vercel.com/new) → pilih **Import Git Repository** → pilih repo `enricomoses/kuis-sl-kwn`.
2. Pastikan pengaturan proyek:
   - **Framework Preset:** `Next.js` (otomatis terdeteksi)
   - **Root Directory:** `./`
   - **Build Command:** default (`next build`)
   - **Install Command:** default (`npm install`)
3. Isi **Environment Variables** sebelum klik **Deploy**:

| Variabel                               | Nilai (Production)                  | Catatan                                                                                                     |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | `https://<domain-anda>.vercel.app`  | Setelah deploy pertama, update jika domain berubah                                                          |
| `NEXT_PUBLIC_SUPABASE_URL`             | `https://<project-ref>.supabase.co` | Dari Supabase → Project Settings → Data API                                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...`                | Kunci publik Supabase                                                                                       |
| `SUPABASE_SECRET_KEY`                  | `sb_secret_...`                     | Kunci secret/service role Supabase (server-only)                                                            |
| `PLAYER_TOKEN_PEPPER`                  | 64 karakter hex acak (≥ 32 byte)    | Buat nilai baru khusus produksi: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `APP_ENV`                              | `production`                        | Untuk environment Preview dapat diisi `staging`                                                             |

4. Klik **Deploy** dan tunggu proses build Turbopack selesai.
5. Setelah mendapatkan URL produksi (`https://<domain-anda>.vercel.app`):
   - Perbarui `NEXT_PUBLIC_SITE_URL` di Vercel (jika tadi masih placeholder) lalu **Redeploy**.
   - Buka **Supabase Dashboard → Authentication → URL Configuration** → isi **Site URL** dengan `https://<domain-anda>.vercel.app`.

## Smoke Test Pasca-Deploy

1. Cek `https://<domain-anda>.vercel.app/api/health` → harus mengembalikan `{"ok":true,"data":{"status":"ok",...}}`.
2. Buka `/admin/login` → login dengan akun admin Supabase → pastikan masuk ke Ruang Kontrol `/admin`.
3. Buka `/admin/questions` → pastikan 5 soal seeder tampil.
4. Buat sesi di `/admin`, lalu buka `/` dari HP/browser lain untuk menguji join & realtime end-to-end.

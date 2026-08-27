# Konfigurasi Hosting & Header Keamanan

Hosting resmi aplikasi ini adalah **Vercel**. GitHub hanya menyimpan repo
dan menjalankan CI (test + verifikasi build); GitHub Pages sudah tidak
dipakai lagi.

## Mengapa Vercel, bukan GitHub Pages

GitHub Pages **tidak dapat mengirim header respons HTTP**. Untuk aplikasi
yang mengolah data kesehatan, itu berarti `Content-Security-Policy`,
`X-Frame-Options`, dan `X-Content-Type-Options` mustahil dipasang —
clickjacking terbuka dan tidak ada pembatasan asal skrip.

## Header yang dipasang (`vercel.json`)

| Header | Tujuan |
|---|---|
| `Content-Security-Policy` | Batasi asal skrip, gaya, font, dan koneksi |
| `X-Frame-Options: DENY` | Tutup clickjacking |
| `X-Content-Type-Options: nosniff` | Cegah MIME sniffing |
| `Referrer-Policy: no-referrer` | Jangan bocorkan URL ke pihak ketiga |
| `Permissions-Policy` | Matikan kamera, mikrofon, lokasi, pembayaran, USB |
| `Strict-Transport-Security` | Paksa HTTPS |
| `X-Robots-Tag: noindex` | Alat pengolah data kesehatan tidak boleh terindeks |

### Catatan tentang isi CSP

- **`font-src 'self'`** — font di-host sendiri di `public/fonts/`. Asal
  `fonts.googleapis.com` dan `fonts.gstatic.com` sudah dicabut. Lihat
  komentar di `src/style.css` dan skrip `scripts/unduh_font.js`.
- **`style-src` memuat `'unsafe-inline'`** — masih diperlukan karena Vue
  mengikat gaya lewat atribut `style`. Menghapusnya akan merusak animasi
  dan bilah progres.
- **`connect-src`** dibatasi hanya ke origin Supabase proyek ini. Bila
  proyek Supabase berpindah, nilai ini WAJIB diperbarui atau aplikasi
  tidak dapat menyimpan data.
- **`frame-ancestors 'none'`** — hanya berlaku sebagai header, tidak bisa
  lewat `<meta>`. Ini salah satu alasan hosting harus dapat mengirim
  header.

## Jebakan yang pernah menggagalkan build

`vercel.json` divalidasi terhadap skema yang **ketat**. Properti tambahan
akan menggagalkan build, termasuk properti komentar. Kesalahan nyata yang
pernah terjadi:

```
The `vercel.json` schema validation failed with the following message:
`headers[0].headers[0]` should NOT have additional property `_catatan`
```

JSON tidak mengenal komentar, dan Vercel menolak kunci yang tidak ada di
skemanya. **Tulis penjelasan di berkas ini, jangan di dalam
`vercel.json`.**

Periksa keabsahan sebelum push:

```bash
node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))"
```

Perlu diketahui: perintah di atas hanya memastikan JSON-nya sah, **bukan**
memastikan skema Vercel terpenuhi. Skema hanya diuji saat build di Vercel.

## Variabel lingkungan

Diatur di Vercel Dashboard → Settings → Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON`

Keduanya berawalan `VITE_`, sehingga **di-inline ke dalam bundle
JavaScript** dan dapat dibaca siapa pun dari browser. Itu memang
rancangan Supabase: keamanan bergantung pada RLS dan hak akses di
basis data, bukan pada kerahasiaan anon key.

**JANGAN pernah menaruh `service_role` key atau kredensial sensitif di
belakang prefix `VITE_`.**

## Setelah mengubah `vercel.json`

Header hanya berlaku setelah deployment baru berhasil. CDN Vercel juga
menyimpan cache; periksa dengan:

```bash
curl -sI https://pijarpkmsekadau.vercel.app/ | grep -i "content-security-policy\|x-frame-options"
```

Bila header lama masih muncul sementara deployment sudah sukses, tunggu
cache kedaluwarsa atau lakukan Redeploy dari dashboard.

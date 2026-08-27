/**
 * unduh_font.js — Mengunduh ulang font lokal ke public/fonts/.
 *
 * Aplikasi tidak lagi memuat font dari fonts.googleapis.com (lihat
 * komentar di src/style.css). Skrip ini yang menyiapkan berkasnya.
 *
 * JALANKAN ULANG bila:
 *   - menambah ikon Material baru di komponen, atau
 *   - menambah ketebalan (font-weight) baru.
 *
 * Cara pakai:
 *   node scripts/unduh_font.js
 *
 * Skrip memindai src/ untuk mengumpulkan nama ikon yang benar-benar
 * dipakai, lalu meminta Google Fonts mengirim font ikon yang sudah
 * di-subset ke glyph tersebut. Tanpa subsetting, berkasnya 1102 KB;
 * dengan subsetting sekitar 257 KB.
 *
 * Setelah dijalankan, periksa keluaran daftar @font-face dan pastikan
 * masih cocok dengan blok @font-face di src/style.css.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

const AKAR = fileURLToPath(new URL('..', import.meta.url))
const DIR_FONT = `${AKAR}public/fonts`
const DIR_SRC = `${AKAR}src`

// User-Agent modern diperlukan agar Google Fonts mengirim woff2,
// bukan format lama yang jauh lebih besar.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const FONT_TEKS =
  'https://fonts.googleapis.com/css2' +
  '?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800' +
  '&family=DM+Sans:wght@300;400;500;600;700&display=swap'

/** Hanya subset latin yang diperlukan untuk bahasa Indonesia. */
const SUBSET_DIPAKAI = 'latin'

async function ambilCss(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Gagal mengambil CSS (${res.status}): ${url}`)
  return res.text()
}

function uraiFontFace(css) {
  return [...css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*\{([^}]+)\}/g)].map(
    (m) => {
      const isi = m[2]
      return {
        subset: m[1],
        family: isi.match(/font-family:\s*'([^']+)'/)?.[1],
        weight: isi.match(/font-weight:\s*([^;]+);/)?.[1].trim(),
        style: isi.match(/font-style:\s*([^;]+);/)?.[1].trim(),
        url: isi.match(/url\(([^)]+)\)/)?.[1],
        range: isi.match(/unicode-range:\s*([^;]+);/)?.[1].trim(),
      }
    },
  )
}

/** Kumpulkan nama ikon Material yang benar-benar dipakai di src/. */
async function kumpulkanIkon() {
  const berkas = []
  async function jelajah(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`
      if (e.isDirectory()) await jelajah(p)
      else if (/\.(vue|js)$/.test(e.name)) berkas.push(p)
    }
  }
  await jelajah(DIR_SRC)

  const ikon = new Set()
  for (const f of berkas) {
    const teks = await readFile(f, 'utf8')
    // <span class="material-symbols-outlined">nama_ikon</span>
    for (const m of teks.matchAll(
      /material-symbols-outlined[^>]*>\s*([a-z_0-9]+)\s*</g,
    )) {
      ikon.add(m[1])
    }
    // Pemetaan ikon di dalam objek: icon: 'nama_ikon'
    for (const m of teks.matchAll(/icon:\s*['"]([a-z_0-9]+)['"]/g)) {
      ikon.add(m[1])
    }
  }
  return [...ikon].sort()
}

const namaBerkas = (family, weight) =>
  family === 'Material Symbols Outlined'
    ? 'material-symbols-outlined.woff2'
    : `${family.toLowerCase().replace(/\s+/g, '-')}-${weight}.woff2`

async function unduh(url, tujuan) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`Gagal mengunduh font (${res.status}): ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(tujuan, buf)
  return buf.byteLength
}

async function main() {
  await mkdir(DIR_FONT, { recursive: true })

  // ── Font teks ──
  const cssTeks = await ambilCss(FONT_TEKS)
  const blok = uraiFontFace(cssTeks).filter((b) => b.subset === SUBSET_DIPAKAI)
  if (blok.length === 0) throw new Error('Tidak ada blok subset latin ditemukan.')

  const deklarasi = []
  let totalByte = 0

  for (const b of blok) {
    const nama = namaBerkas(b.family, b.weight)
    const byte = await unduh(b.url, `${DIR_FONT}/${nama}`)
    totalByte += byte
    console.log(`  ${nama.padEnd(34)} ${String(Math.round(byte / 1024)).padStart(5)} KB`)
    deklarasi.push(
      `@font-face {\n` +
        `  font-family: "${b.family}";\n` +
        `  font-style: ${b.style};\n` +
        `  font-weight: ${b.weight};\n` +
        `  font-display: swap;\n` +
        `  src: url("/fonts/${nama}") format("woff2");\n` +
        `  unicode-range: ${b.range};\n` +
        `}`,
    )
  }

  // ── Font ikon, di-subset ke glyph yang dipakai ──
  const ikon = await kumpulkanIkon()
  console.log(`\n  ${ikon.length} nama ikon terdeteksi di src/`)

  // Instance statis (wght 400) jauh lebih kecil daripada variable font,
  // dan aplikasi hanya memakai satu tampilan ikon.
  const urlIkonCss =
    'https://fonts.googleapis.com/css2' +
    '?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0' +
    `&text=${encodeURIComponent(ikon.join(''))}&display=swap`

  const cssIkon = await ambilCss(urlIkonCss)
  const urlIkon = cssIkon.match(/url\(([^)]+)\)/)?.[1]
  const rangeIkon = cssIkon.match(/unicode-range:\s*([^;]+);/)?.[1].trim()
  if (!urlIkon) throw new Error('URL font ikon tidak ditemukan di CSS.')

  const byteIkon = await unduh(urlIkon, `${DIR_FONT}/material-symbols-outlined.woff2`)
  totalByte += byteIkon
  console.log(
    `  material-symbols-outlined.woff2    ${String(Math.round(byteIkon / 1024)).padStart(5)} KB`,
  )

  // font-display: block disengaja — lebih baik ikon kosong sesaat
  // daripada tampil sebagai teks nama ikon.
  deklarasi.push(
    `@font-face {\n` +
      `  font-family: "Material Symbols Outlined";\n` +
      `  font-style: normal;\n` +
      `  font-weight: 400;\n` +
      `  font-display: block;\n` +
      `  src: url("/fonts/material-symbols-outlined.woff2") format("woff2");\n` +
      `  unicode-range: ${rangeIkon};\n` +
      `}`,
  )

  console.log(`\n  Total: ${Math.round(totalByte / 1024)} KB\n`)
  console.log('Bandingkan blok @font-face berikut dengan src/style.css:\n')
  console.log(deklarasi.join('\n\n'))
}

main().catch((err) => {
  console.error(`\nGAGAL: ${err.message}`)
  process.exit(1)
})

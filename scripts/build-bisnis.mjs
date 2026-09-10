// Cetak dokumen bisnis (markdown) menjadi PDF siap kirim.
// Jalankan: node scripts/build-bisnis.mjs  ->  bisnis/*.pdf + public/bisnis/*.pdf
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { marked } from 'marked'

const DOKUMEN = [
  { file: 'bisnis/1-PENAWARAN.md', out: '1-PENAWARAN' },
  { file: 'bisnis/2-KATALOG-HARGA.md', out: '2-KATALOG-HARGA' },
  { file: 'bisnis/3-STUDI-KASUS-ROI.md', out: '3-STUDI-KASUS-ROI' },
]

const css = `
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #2c1a1e; font-size: 10.5pt; line-height: 1.6; margin: 0; }
  .kop { border-bottom: 3px solid #4a0012; padding-bottom: 10px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-end; }
  .kop .brand { font-family: Georgia, serif; font-size: 20pt; font-weight: 700; color: #4a0012; }
  .kop .sub { font-size: 9pt; color: #7d6269; letter-spacing: 1px; text-transform: uppercase; }
  h1 { font-family: Georgia, serif; font-size: 20pt; color: #4a0012; margin: 6px 0 14px; }
  h2 { font-family: Georgia, serif; font-size: 14pt; color: #610018; margin: 22px 0 8px; border-bottom: 1px solid #eedcd1; padding-bottom: 4px; }
  h3 { font-size: 11.5pt; color: #7b0a24; margin: 16px 0 6px; }
  p { margin: 6px 0; }
  strong { color: #4a0012; }
  a { color: #941b36; text-decoration: none; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; font-size: 9.5pt; page-break-inside: avoid; }
  th { background: #4a0012; color: #fff9f4; text-align: left; }
  th, td { border: 1px solid #eedcd1; padding: 6px 9px; vertical-align: top; }
  tr:nth-child(even) td { background: #fff9f4; }
  code { background: #f9eee6; border-radius: 4px; padding: 1px 5px; font-size: 9pt; }
  blockquote { margin: 10px 0; padding: 8px 14px; background: #f5d8c5; border-left: 4px solid #941b36; border-radius: 0 8px 8px 0; }
  blockquote p { margin: 2px 0; }
  ul, ol { margin: 6px 0; padding-left: 22px; }
  li { margin: 3px 0; }
  hr { border: 0; border-top: 1px solid #eedcd1; margin: 18px 0; }
  h1 + hr, h2 + hr { display: none; }
`

const edgePath = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
].find((c) => existsSync(c))
if (!edgePath) {
  console.error('Edge tidak ditemukan — PDF tidak dicetak.')
  process.exit(1)
}

mkdirSync('public/bisnis', { recursive: true })

for (const d of DOKUMEN) {
  const md = readFileSync(d.file, 'utf8')
  const body = marked.parse(md)
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div class="kop"><div><div class="brand">Sawiji</div><div class="sub">Studio Pilates</div></div><div class="sub">Dokumen Penawaran</div></div>
    ${body}
    </body></html>`
  const tmpHtml = `public/bisnis/_${d.out}.html`
  writeFileSync(tmpHtml, html)
  const url = `file:///${process.cwd().replaceAll('\\', '/')}/${tmpHtml}`
  execFileSync(edgePath, ['--headless', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${process.cwd()}\\bisnis\\${d.out}.pdf`, url])
  copyFileSync(`bisnis/${d.out}.pdf`, `public/bisnis/${d.out}.pdf`)
  rmSync(tmpHtml, { force: true })
  console.log(`OK -> bisnis/${d.out}.pdf (+ public/bisnis/${d.out}.pdf)`)
}

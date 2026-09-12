// Basit, Türkçe karakter destekli yazdırma / PDF çıktısı üretici.
// Tarayıcının yazdırma penceresi üzerinden "PDF olarak kaydet" akışını başlatır.

export type PdfSutun = {
  baslik: string;
  genislik?: string;
  hiza?: "left" | "center" | "right";
};

export type PdfSatir = {
  hucreler: (string | number)[];
  className?: string;
};

export type PdfTablo = {
  altBaslik: string;
  bilgi?: string[];
  sutunlar: PdfSutun[];
  satirlar: (PdfSatir | (string | number)[])[];
  dosyaAdi?: string;
  tekSayfa?: boolean;
};

function kacis(s: string | number) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function listeYazdir({
  altBaslik,
  bilgi = [],
  sutunlar,
  satirlar,
  dosyaAdi,
  tekSayfa = false,
}: PdfTablo) {
  const tarih = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const html = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8" />
<title>${kacis(dosyaAdi ?? `SIEC JIGJIGA KURSU - ${altBaslik}`)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: #17211c;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body.tek-sayfa { font-size: 9px; }
  body.tek-sayfa .ust { padding-bottom: 6px; margin-bottom: 8px; }
  body.tek-sayfa h1 { font-size: 14px; }
  body.tek-sayfa h2 { font-size: 11px; }
  body.tek-sayfa .meta { font-size: 8px; gap: 8px; }
  body.tek-sayfa table { font-size: 8px; }
  body.tek-sayfa thead th { padding: 3px 4px; }
  body.tek-sayfa tbody td { padding: 2px 4px; }
  body.tek-sayfa tfoot { display: none; }
  body.tek-sayfa tr { page-break-inside: auto; }
  body.tek-sayfa @page { size: A4; margin: 8mm 6mm; }
  .ust { border-bottom: 2px solid #1f6f4a; padding-bottom: 10px; margin-bottom: 14px; }
  h1 { margin: 0; font-size: 20px; letter-spacing: .5px; color: #1f6f4a; }
  h2 { margin: 4px 0 0; font-size: 13px; font-weight: 600; color: #3d4a43; }
  .meta { margin-top: 6px; font-size: 10.5px; color: #6b7770; display: flex; flex-wrap: wrap; gap: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead th {
    background: #eef5f1; color: #1f6f4a; font-weight: 700;
    border: 1px solid #cfe0d6; padding: 6px 6px; text-align: left;
  }
  tbody td { border: 1px solid #dfe7e2; padding: 5px 6px; }
  tbody tr:nth-child(even) td { background: #f8fbf9; }
  tbody tr.kirmizi td { background: #fff0f0; color: #b91c1c; font-weight: 600; }
  tbody tr.kirmizi td:first-child { border-left: 3px solid #dc2626; }
  tfoot td { font-size: 10px; color: #6b7770; border: none; padding-top: 10px; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
</style>
</head>
<body class="${tekSayfa ? "tek-sayfa" : ""}">
  <div class="ust">
    <h1>SİEC JİGJİGA KURSU</h1>
    <h2>${kacis(altBaslik)}</h2>
    <div class="meta">
      <span>Tarih: ${kacis(tarih)}</span>
      ${bilgi.map((b) => `<span>${kacis(b)}</span>`).join("")}
      <span>Toplam kayıt: ${satirlar.length}</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>${sutunlar
        .map(
          (s) =>
            `<th style="text-align:${s.hiza ?? "left"};${s.genislik ? `width:${s.genislik};` : ""}">${kacis(s.baslik)}</th>`,
        )
        .join("")}</tr>
    </thead>
    <tbody>
      ${satirlar
        .map((r) => {
          const hucreler = Array.isArray(r) ? r : r.hucreler;
          const cls = !Array.isArray(r) && r.className ? ` ${r.className}` : "";
          return `<tr class="${cls.trim()}">${hucreler
            .map(
              (c, i) =>
                `<td style="text-align:${sutunlar[i]?.hiza ?? "left"}">${kacis(c)}</td>`,
            )
            .join("")}</tr>`;
        })
        .join("")}
    </tbody>
    <tfoot>
      <tr><td colspan="${sutunlar.length}">SİEC JİGJİGA KURSU · ${kacis(altBaslik)} · ${kacis(tarih)}</td></tr>
    </tfoot>
  </table>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  <\/script>
</body>
</html>`;

  const pencere = window.open("", "_blank", "width=900,height=700");
  if (!pencere) {
    alert("Yazdırma penceresi açılamadı. Lütfen açılır pencere iznini verin.");
    return;
  }
  pencere.document.open();
  pencere.document.write(html);
  pencere.document.close();
}

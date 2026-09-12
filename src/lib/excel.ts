import * as XLSX from "xlsx";

export type ExcelSutun = { baslik: string; genislik?: number };

export function excelIndir(
  dosyaAdi: string,
  sayfaAdi: string,
  sutunlar: ExcelSutun[],
  satirlar: (string | number)[][],
) {
  const veri = [sutunlar.map((s) => s.baslik), ...satirlar];
  const ws = XLSX.utils.aoa_to_sheet(veri);
  ws["!cols"] = sutunlar.map((s) => ({ wch: s.genislik ?? 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sayfaAdi.slice(0, 31));
  XLSX.writeFile(wb, `${dosyaAdi}.xlsx`);
}

export async function excelOku(
  dosya: File,
): Promise<Record<string, string>[]> {
  const buf = await dosya.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  const satirlar = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: false,
  });
  return satirlar.map((r) => {
    const o: Record<string, string> = {};
    Object.entries(r).forEach(([k, v]) => {
      o[String(k).trim()] = String(v ?? "").trim();
    });
    return o;
  });
}

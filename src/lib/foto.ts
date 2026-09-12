// Dosyayı tarayıcıda 256px kareye küçültüp JPEG dataURL döner.
export async function dosyaFotoDataUrl(
  file: File,
  hedefBoyut = 320,
  kalite = 0.85,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Lütfen bir görsel dosya seçin.");
  }
  const bitmap = await createImageBitmap(file);
  const k = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - k) / 2;
  const sy = (bitmap.height - k) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = hedefBoyut;
  canvas.height = hedefBoyut;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas oluşturulamadı");
  ctx.drawImage(bitmap, sx, sy, k, k, 0, 0, hedefBoyut, hedefBoyut);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", kalite);
}

export function bashHarfler(isim: string): string {
  const parcalar = isim.trim().split(/\s+/).slice(0, 2);
  return parcalar.map((p) => p[0]?.toUpperCase() ?? "").join("") || "T";
}

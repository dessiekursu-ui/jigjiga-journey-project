import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

export type AidatMailGirdi = {
  eposta: string;
  hocaAdi: string;
  grupAdi: string;
  ayEtiket: string;
  tutar: number;
  odeyen: number;
  toplam: number;
  odemeyenler: string[];
};

function gecerliEposta(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function temiz(v: unknown, uzunluk = 120) {
  return String(v ?? "")
    .replace(/[\r\n]+/g, " ")
    .slice(0, uzunluk);
}

const b64 = (s: string) =>
  btoa(
    Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join(
      "",
    ),
  );

const header = (v: string) =>
  /^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`;

function rawMail(to: string, subject: string, body: string) {
  const mesaj = [
    `To: ${to}`,
    `Subject: ${header(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "",
    body,
  ].join("\r\n");
  return b64(mesaj).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const aidatHatirlatmaGonder = createServerFn({ method: "POST" })
  .inputValidator((input: AidatMailGirdi) => {
    if (!input || !gecerliEposta(String(input.eposta ?? "").trim())) {
      throw new Error("Geçerli bir e-posta adresi gerekli.");
    }
    return {
      eposta: String(input.eposta).trim(),
      hocaAdi: temiz(input.hocaAdi, 60) || "Hocam",
      grupAdi: temiz(input.grupAdi, 60),
      ayEtiket: temiz(input.ayEtiket, 30),
      tutar: Number(input.tutar) || 0,
      odeyen: Number(input.odeyen) || 0,
      toplam: Number(input.toplam) || 0,
      odemeyenler: (Array.isArray(input.odemeyenler) ? input.odemeyenler : [])
        .slice(0, 200)
        .map((n) => temiz(n, 60)),
    };
  })
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const gmailKey = process.env["GOOGLE_MAIL_API_KEY"];
    if (!lovableKey || !gmailKey) {
      throw new Error("Gmail bağlantısı bulunamadı.");
    }

    const konu = `Aidat Hatırlatması — ${data.ayEtiket}${
      data.grupAdi ? ` (${data.grupAdi})` : ""
    }`;

    const satirlar = [
      `Esselâmü aleyküm ${data.hocaAdi},`,
      "",
      `${data.ayEtiket} ayı aidat durumu${data.grupAdi ? ` — ${data.grupAdi}` : ""}:`,
      `• Aylık aidat: ${data.tutar.toLocaleString("tr-TR")} Birr`,
      `• Ödeyen: ${data.odeyen} / ${data.toplam}`,
      `• Ödemeyen: ${Math.max(data.toplam - data.odeyen, 0)}`,
      "",
    ];

    if (data.odemeyenler.length) {
      satirlar.push("Aidatı henüz ödemeyen talebeler:");
      data.odemeyenler.forEach((ad, i) => satirlar.push(`${i + 1}. ${ad}`));
      satirlar.push("");
    } else {
      satirlar.push("Bu ay tüm talebeler aidatını ödemiş. Allah razı olsun.");
      satirlar.push("");
    }

    satirlar.push("Lütfen talebelerin aidatlarını hatırlatınız.");
    satirlar.push("");
    satirlar.push("SİEC Jigjiga Kursu — Talebe Takip Paneli");

    const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": gmailKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: rawMail(data.eposta, konu, satirlar.join("\n")),
      }),
    });

    if (!res.ok) {
      const hata = await res.text();
      console.error(`Gmail gönderim hatası [${res.status}]: ${hata}`);
      throw new Error(`E-posta gönderilemedi [${res.status}]: ${hata}`);
    }

    return { ok: true as const };
  });

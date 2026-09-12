import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Send, Check, UserPlus, Trash2 } from "lucide-react";
import {
  GRUPLAR,
  hocaMailAyarDinle,
  hocaMailleriKaydet,
  aidatMailGonderimIsaretle,
  aidatTutariniOku,
  ekstraHocalariKaydet,
  type EkstraHoca,
  type Grup,
  type HocaMailAyar,
  type Talebe,
} from "@/lib/talebeler";
import { aidatHatirlatmaGonder } from "@/lib/aidatMail.functions";

const AY_ADLARI = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

type Alici = {
  anahtar: string; // gönderim takibi için benzersiz anahtar
  ad: string;
  grupEtiket: string;
  eposta: string;
  odeyen: number;
  toplam: number;
  odemeyenler: string[];
  ekstraId?: string; // ekstra hoca ise silme için
};

export default function AidatHatirlatma({ talebeler }: { talebeler: Talebe[] }) {
  const simdi = new Date();
  const ayKey = `${simdi.getFullYear()}-${String(simdi.getMonth() + 1).padStart(2, "0")}`;
  const ayEtiket = `${AY_ADLARI[simdi.getMonth()]} ${simdi.getFullYear()}`;

  const [ayar, setAyar] = useState<HocaMailAyar>({
    mailler: {},
    gonderilen: {},
    ekstraHocalar: [],
  });
  const [taslak, setTaslak] = useState<Record<string, string>>({});
  const [tutar, setTutar] = useState(0);
  const [gonderiliyor, setGonderiliyor] = useState<string | null>(null);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniEposta, setYeniEposta] = useState("");
  const [yeniGrup, setYeniGrup] = useState<string>("genel");

  useEffect(() => {
    const unsub = hocaMailAyarDinle((a) => {
      setAyar(a);
      setTaslak((t) => ({ ...a.mailler, ...t }));
    });
    void aidatTutariniOku().then(setTutar);
    return () => unsub();
  }, []);

  const gonderilenler = ayar.gonderilen[ayKey] ?? [];

  const grupOzet = (grupId: Grup) => {
    const g = GRUPLAR.find((x) => x.id === grupId)!;
    const liste = talebeler.filter((t) => t.grup === grupId);
    const odeyen = liste.filter((t) => t.aidat?.[ayKey]).length;
    return {
      grupEtiket: `${g.ad} · ${odeyen}/${liste.length} ödedi`,
      odeyen,
      toplam: liste.length,
      odemeyenler: liste.filter((t) => !t.aidat?.[ayKey]).map((t) => t.isim),
      grupAdi: g.ad,
    };
  };

  const genelOzet = () => {
    const odeyen = talebeler.filter((t) => t.aidat?.[ayKey]).length;
    return {
      grupEtiket: `Genel · ${odeyen}/${talebeler.length} ödedi`,
      odeyen,
      toplam: talebeler.length,
      odemeyenler: talebeler
        .filter((t) => !t.aidat?.[ayKey])
        .map((t) => t.isim),
      grupAdi: "",
    };
  };

  const alicilar: Alici[] = useMemo(() => {
    const sabit: Alici[] = GRUPLAR.map((g) => {
      const o = grupOzet(g.id);
      return {
        anahtar: g.id,
        ad: g.hoca,
        grupEtiket: o.grupEtiket,
        eposta: taslak[g.id] ?? "",
        odeyen: o.odeyen,
        toplam: o.toplam,
        odemeyenler: o.odemeyenler,
      };
    });
    const ekstra: Alici[] = ayar.ekstraHocalar.map((h) => {
      const o = h.grup ? grupOzet(h.grup) : genelOzet();
      return {
        anahtar: `ekstra-${h.id}`,
        ad: h.ad,
        grupEtiket: o.grupEtiket,
        eposta: h.eposta,
        odeyen: o.odeyen,
        toplam: o.toplam,
        odemeyenler: o.odemeyenler,
        ekstraId: h.id,
      };
    });
    return [...sabit, ...ekstra];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [talebeler, ayKey, taslak, ayar.ekstraHocalar]);

  const gonder = async (a: Alici) => {
    const eposta = a.eposta.trim();
    if (!eposta) {
      toast.error("Önce hocanın e-posta adresini yazın.");
      return;
    }
    setGonderiliyor(a.anahtar);
    try {
      if (!a.ekstraId) {
        await hocaMailleriKaydet({ ...ayar.mailler, ...taslak });
      }
      const grupAdi = a.ekstraId
        ? (ayar.ekstraHocalar.find((h) => h.id === a.ekstraId)?.grup
            ? GRUPLAR.find(
                (g) =>
                  g.id ===
                  ayar.ekstraHocalar.find((h) => h.id === a.ekstraId)?.grup,
              )?.ad
            : undefined) ?? ""
        : (GRUPLAR.find((g) => g.id === a.anahtar)?.ad ?? "");
      await aidatHatirlatmaGonder({
        data: {
          eposta,
          hocaAdi: a.ad,
          grupAdi,
          ayEtiket,
          tutar,
          odeyen: a.odeyen,
          toplam: a.toplam,
          odemeyenler: a.odemeyenler,
        },
      });
      await aidatMailGonderimIsaretle(ayKey, a.anahtar, ayar.gonderilen);
      toast.success(`${a.ad} adresine hatırlatma gönderildi.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "E-posta gönderilemedi.");
    } finally {
      setGonderiliyor(null);
    }
  };

  const gonderilmeyen = alicilar.filter(
    (a) => !gonderilenler.includes(a.anahtar) && a.eposta.trim(),
  );

  const hepsineGonder = async () => {
    for (const a of gonderilmeyen) {
      // eslint-disable-next-line no-await-in-loop
      await gonder(a);
    }
  };

  const hocaEkle = async () => {
    const ad = yeniAd.trim();
    const eposta = yeniEposta.trim();
    if (!ad) {
      toast.error("Hocanın adını yazın.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta)) {
      toast.error("Geçerli bir e-posta adresi yazın.");
      return;
    }
    const yeni: EkstraHoca = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      ad,
      eposta,
      grup: yeniGrup === "genel" ? undefined : (yeniGrup as Grup),
    };
    try {
      await ekstraHocalariKaydet([...ayar.ekstraHocalar, yeni]);
      setYeniAd("");
      setYeniEposta("");
      setYeniGrup("genel");
      toast.success(`${ad} eklendi.`);
    } catch {
      toast.error("Hoca eklenemedi.");
    }
  };

  const hocaSil = async (id: string, ad: string) => {
    try {
      await ekstraHocalariKaydet(ayar.ekstraHocalar.filter((h) => h.id !== id));
      toast.success(`${ad} kaldırıldı.`);
    } catch {
      toast.error("Hoca kaldırılamadı.");
    }
  };

  return (
    <div className="rounded-md border border-border/60 px-3 py-3">
      <div className="mb-2 flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Aidat Hatırlatma E-postası</span>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        {ayEtiket} ayı için hocalara aidat hatırlatması gönderin. E-postalar
        kalıcı olarak kaydedilir.
        {gonderilmeyen.length > 0 && (
          <span className="ml-1 font-medium text-destructive">
            Bu ay {gonderilmeyen.length} hocaya henüz gönderilmedi.
          </span>
        )}
      </p>

      <div className="space-y-3">
        {alicilar.map((a) => {
          const gonderildi = gonderilenler.includes(a.anahtar);
          return (
            <div key={a.anahtar} className="rounded-md bg-muted/30 px-2 py-2">
              <Label className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  {a.ad}{" "}
                  <span className="font-normal text-muted-foreground">
                    · {a.grupEtiket}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  {gonderildi && (
                    <span className="flex items-center gap-1 text-primary">
                      <Check className="h-3 w-3" /> gönderildi
                    </span>
                  )}
                  {a.ekstraId && (
                    <button
                      type="button"
                      aria-label={`${a.ad} kaldır`}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() => void hocaSil(a.ekstraId!, a.ad)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  inputMode="email"
                  placeholder="hoca@gmail.com"
                  className="h-9"
                  value={a.eposta}
                  disabled={!!a.ekstraId}
                  onChange={(e) =>
                    setTaslak((t) => ({ ...t, [a.anahtar]: e.target.value }))
                  }
                  onBlur={() =>
                    void hocaMailleriKaydet({ ...ayar.mailler, ...taslak })
                  }
                />
                <Button
                  size="sm"
                  disabled={gonderiliyor === a.anahtar}
                  onClick={() => void gonder(a)}
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  {gonderiliyor === a.anahtar ? "..." : "Gönder"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="mt-3 w-full"
        disabled={!!gonderiliyor || gonderilmeyen.length === 0}
        onClick={() => void hepsineGonder()}
      >
        <Mail className="mr-2 h-4 w-4" />
        Tüm hocalara gönder ({gonderilmeyen.length})
      </Button>

      <div className="mt-4 rounded-md border border-dashed border-border/60 px-3 py-3">
        <div className="mb-2 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Yeni Hoca Ekle</span>
        </div>
        <div className="space-y-2">
          <Input
            placeholder="Hocanın adı"
            className="h-9"
            value={yeniAd}
            onChange={(e) => setYeniAd(e.target.value)}
          />
          <Input
            type="email"
            inputMode="email"
            placeholder="hoca@gmail.com"
            className="h-9"
            value={yeniEposta}
            onChange={(e) => setYeniEposta(e.target.value)}
          />
          <Select value={yeniGrup} onValueChange={setYeniGrup}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Grup seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="genel">Genel (tüm kurs özeti)</SelectItem>
              {GRUPLAR.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.ad}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="secondary" className="w-full" onClick={() => void hocaEkle()}>
            <UserPlus className="mr-2 h-4 w-4" />
            Hocayı kaydet
          </Button>
        </div>
      </div>
    </div>
  );
}

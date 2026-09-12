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
import { Mail, Send, Check, UserPlus, Trash2, Menu, X } from "lucide-react";
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
  anahtar: string;
  ad: string;
  grupEtiket: string;
  eposta: string;
  odeyen: number;
  toplam: number;
  odemeyenler: string[];
  ekstraId?: string;
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
  const [menuAcik, setMenuAcik] = useState(false);
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
      odemeyenler: talebeler.filter((t) => !t.aidat?.[ayKey]).map((t) => t.isim),
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

  const mailSil = async (anahtar: string, ad: string) => {
    const yeni = { ...ayar.mailler, ...taslak, [anahtar]: "" };
    setTaslak((t) => ({ ...t, [anahtar]: "" }));
    try {
      await hocaMailleriKaydet(yeni);
      toast.success(`${ad} e-postası silindi.`);
    } catch {
      toast.error("E-posta silinemedi.");
    }
  };

  const tumMailleriSil = async () => {
    const bos: Record<string, string> = {};
    GRUPLAR.forEach((g) => {
      bos[g.id] = "";
    });
    setTaslak(bos);
    try {
      await hocaMailleriKaydet(bos);
      toast.success("Tüm hoca e-postaları silindi.");
    } catch {
      toast.error("E-postalar silinemedi.");
    }
  };

  return (
    <div className="rounded-md border border-border/60 px-3 py-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Aidat Hatırlatma E-postası</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Hoca yönetimi menüsü"
          onClick={() => setMenuAcik((v) => !v)}
        >
          {menuAcik ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {menuAcik ? (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Hoca e-postalarını buradan düzenleyin, silin veya yeni hoca ekleyin.
          </p>

          <div className="space-y-2">
            {alicilar.map((a) => (
              <div key={a.anahtar} className="rounded-md bg-muted/30 px-2 py-2">
                <Label className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{a.ad}</span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`${a.ad} e-postasını sil`}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      onClick={() =>
                        a.ekstraId
                          ? void hocaSil(a.ekstraId, a.ad)
                          : void mailSil(a.anahtar, a.ad)
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </Label>
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
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full text-destructive"
            onClick={() => void tumMailleriSil()}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Tüm hoca e-postalarını sil
          </Button>

          <div className="rounded-md border border-dashed border-border/60 px-3 py-3">
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
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => void hocaEkle()}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Hocayı kaydet
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-muted-foreground">
            {ayEtiket} ayı hatırlatması.
            {gonderilmeyen.length > 0 && (
              <span className="ml-1 font-medium text-destructive">
                {gonderilmeyen.length} hocaya henüz gönderilmedi.
              </span>
            )}
          </p>

          <div className="space-y-2">
            {alicilar.map((a) => {
              const gonderildi = gonderilenler.includes(a.anahtar);
              return (
                <div
                  key={a.anahtar}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.ad}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {a.eposta.trim() || "e-posta yok"} · {a.grupEtiket}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {gonderildi && (
                      <Check className="h-4 w-4 text-primary" aria-label="gönderildi" />
                    )}
                    <Button
                      size="sm"
                      disabled={gonderiliyor === a.anahtar || !a.eposta.trim()}
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
        </>
      )}
    </div>
  );
}

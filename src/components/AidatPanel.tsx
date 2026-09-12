import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wallet,
  Pencil,
} from "lucide-react";
import {
  aidatTutariniDinle,
  aidatTutariKaydet,
  aidatOdemeAyarla,
  GRUPLAR,
  type Grup,
  type Talebe,
} from "@/lib/talebeler";
import { bashHarfler } from "@/lib/foto";

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

function ayKeyOlustur(y: number, a: number) {
  return `${y}-${String(a + 1).padStart(2, "0")}`;
}

function paraFmt(n: number) {
  return `${n.toLocaleString("tr-TR")} Birr`;
}

export default function AidatPanel({
  talebeler,
  hocaModu,
  onTalebe,
  grupFiltre,
}: {
  talebeler: Talebe[];
  hocaModu: boolean;
  onTalebe?: (t: Talebe) => void;
  grupFiltre: Grup | "hepsi";
}) {
  const simdi = new Date();
  const [yil, setYil] = useState(simdi.getFullYear());
  const [ay, setAy] = useState(simdi.getMonth());
  const [tutar, setTutar] = useState(0);
  const [tutarDuzenle, setTutarDuzenle] = useState(false);
  const [tutarTaslak, setTutarTaslak] = useState("0");
  const [filtre, setFiltre] = useState<"tumu" | "odeyen" | "odemeyen">("tumu");


  useEffect(() => {
    const unsub = aidatTutariniDinle((t) => {
      setTutar(t);
      setTutarTaslak(String(t));
    });
    return () => unsub();
  }, []);

  const ayKey = ayKeyOlustur(yil, ay);

  const grupTalebeler = useMemo(() => {
    if (grupFiltre === "hepsi") return talebeler;
    return talebeler.filter((t) => t.grup === grupFiltre);
  }, [talebeler, grupFiltre]);

  const aktifGrup = GRUPLAR.find((g) => g.id === grupFiltre);

  const ozet = useMemo(() => {
    const odeyen = grupTalebeler.filter((t) => t.aidat?.[ayKey]).length;
    const toplam = grupTalebeler.length;
    return {
      toplam,
      odeyen,
      odemeyen: toplam - odeyen,
      tahsil: odeyen * tutar,
      beklenen: toplam * tutar,
      kalan: (toplam - odeyen) * tutar,
    };
  }, [grupTalebeler, ayKey, tutar]);

  const gorunenTalebeler = useMemo(() => {
    if (filtre === "odeyen") {
      return grupTalebeler.filter((t) => t.aidat?.[ayKey]);
    }
    if (filtre === "odemeyen") {
      return grupTalebeler.filter((t) => !t.aidat?.[ayKey]);
    }
    return grupTalebeler;
  }, [grupTalebeler, ayKey, filtre]);

  const ayDegistir = (fark: number) => {
    const d = new Date(yil, ay + fark, 1);
    setYil(d.getFullYear());
    setAy(d.getMonth());
    setFiltre("tumu");
  };

  const buAy =
    yil === simdi.getFullYear() && ay === simdi.getMonth();

  const ayEtiket = `${AY_ADLARI[ay]} ${yil}`;
  const grupAdi = aktifGrup?.ad ?? "Tüm gruplar";

  return (
    <div>
      {/* Aidat tutarı */}
      <Card className="mb-3 border-accent/40 bg-secondary/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Aylık aidat</span>
            {tutarDuzenle ? (
              <>
                <Input
                  autoFocus
                  inputMode="numeric"
                  value={tutarTaslak}
                  onChange={(e) =>
                    setTutarTaslak(e.target.value.replace(/[^0-9]/g, "").slice(0, 7))
                  }
                  className="h-9 w-28"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    void aidatTutariKaydet(Number(tutarTaslak) || 0);
                    setTutarDuzenle(false);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTutarTaslak(String(tutar));
                    setTutarDuzenle(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <span className="text-base font-semibold text-foreground tabular-nums">
                  {paraFmt(tutar)}
                </span>
                {hocaModu && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setTutarDuzenle(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => ayDegistir(-1)}
              aria-label="Önceki ay"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[110px] text-center text-sm font-medium">
              {AY_ADLARI[ay]} {yil}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => ayDegistir(1)}
              aria-label="Sonraki ay"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!buAy && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setYil(simdi.getFullYear());
                  setAy(simdi.getMonth());
                  setFiltre("tumu");
                }}
              >
                Bu ay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {aktifGrup && (
        <p className="mb-3 text-xs text-muted-foreground">
          Mesul hoca:{" "}
          <span className="font-medium text-foreground">{aktifGrup.hoca}</span>
        </p>
      )}

      {/* Özet */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Ozet
          etiket="Ödeyen"
          deger={`${ozet.odeyen}/${ozet.toplam}`}
          vurgu="iyi"
          aktif={filtre === "odeyen"}
          onClick={() =>
            setFiltre((f) => (f === "odeyen" ? "tumu" : "odeyen"))
          }
        />
        <Ozet
          etiket="Ödemeyen"
          deger={String(ozet.odemeyen)}
          vurgu="uyari"
          aktif={filtre === "odemeyen"}
          onClick={() =>
            setFiltre((f) => (f === "odemeyen" ? "tumu" : "odemeyen"))
          }
        />
        <Ozet
          etiket="Toplanan"
          deger={paraFmt(ozet.tahsil)}
          vurgu="iyi"
          onClick={() => setFiltre("tumu")}
        />
        <Ozet
          etiket="Kalan"
          deger={paraFmt(ozet.kalan)}
          onClick={() => setFiltre("tumu")}
        />
      </div>

      <Card className="overflow-hidden">
          <Table className="table-fixed">
          <colgroup>
            <col className="w-[6%]" />
            <col className="w-[44%]" />
            <col className="w-[15%]" />
            <col className="w-[35%]" />
          </colgroup>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-8 px-1 text-center text-xs sm:w-12 sm:px-4">
                  #
                </TableHead>
                <TableHead className="px-1 text-xs sm:px-4 sm:text-sm">Talebe</TableHead>
                <TableHead className="px-0.5 text-center text-[10px] sm:px-4 sm:text-sm">
                  Tutar
                </TableHead>
                <TableHead className="px-0.5 text-center text-[10px] sm:px-4 sm:text-sm">
                  Durum
                </TableHead>
              </TableRow>

            </TableHeader>
            <TableBody>
              {gorunenTalebeler.map((t, i) => {
                const odendi = !!t.aidat?.[ayKey];
                return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="px-1 py-2 text-center text-xs text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="min-w-0 px-1 py-2 font-medium sm:px-4 sm:py-3">
                      <button
                        type="button"
                        onClick={() => onTalebe?.(t)}
                        className="group flex w-full min-w-0 items-center gap-1.5 text-left text-xs hover:text-primary sm:gap-3 sm:text-sm"
                      >
                        <span className="shrink-0 scale-90 sm:scale-100">
                          <TalebeAvatar talebe={t} boyut={36} />
                        </span>
                        <span className="min-w-0 truncate group-hover:underline">
                          {t.isim}
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="px-0.5 py-2 text-center text-[10px] tabular-nums text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                      <span className="sm:hidden">{tutar.toLocaleString("tr-TR")}</span>
                      <span className="hidden sm:inline">{paraFmt(tutar)}</span>
                    </TableCell>
                    <TableCell className="px-0.5 py-2 text-center sm:px-4 sm:py-3">
                      <button
                        type="button"
                        disabled={!hocaModu}
                        onClick={() =>
                          void aidatOdemeAyarla(t, ayKey, !odendi)
                        }
                        className={`inline-flex max-w-full items-center gap-0.5 rounded-full px-1.5 py-1 text-[10px] font-medium transition sm:gap-1 sm:px-2.5 sm:text-sm ${
                          odendi
                            ? "bg-primary/15 text-primary"
                            : "bg-destructive/10 text-destructive"
                        } ${hocaModu ? "hover:opacity-80" : "cursor-default"}`}
                      >
                        {odendi ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        {odendi ? "Ödedi" : "Ödemedi"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {gorunenTalebeler.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}

                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {grupTalebeler.length === 0
                      ? "Henüz talebe yok."
                      : filtre === "odeyen"
                        ? "Bu ay ödeyen talebe yok."
                        : filtre === "odemeyen"
                          ? "Bu ay ödemeyen talebe yok."
                          : "Henüz talebe yok."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </Card>
    </div>
  );
}

function Ozet({
  etiket,
  deger,
  vurgu,
  aktif,
  onClick,
}: {
  etiket: string;
  deger: string;
  vurgu?: "iyi" | "uyari";
  aktif?: boolean;
  onClick?: () => void;
}) {
  const icerik = (
    <CardContent className="px-3 py-3">
      <p className="text-xs text-muted-foreground">{etiket}</p>
      <p
        className={`mt-1 text-lg font-semibold tabular-nums sm:text-xl ${
          vurgu === "iyi"
            ? "text-primary"
            : vurgu === "uyari"
              ? "text-destructive"
              : "text-foreground"
        }`}
      >
        {deger}
      </p>
    </CardContent>
  );

  if (onClick) {
    return (
      <Card
        onClick={onClick}
        className={`cursor-pointer transition-colors ${
          aktif
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:bg-muted/40 hover:border-primary/40"
        }`}
      >
        {icerik}
      </Card>
    );
  }

  return <Card className="border-border/60">{icerik}</Card>;
}

function TalebeAvatar({
  talebe,
  boyut = 40,
}: {
  talebe: Talebe;
  boyut?: number;
}) {
  const stil = { width: boyut, height: boyut } as const;
  if (talebe.fotoUrl) {
    return (
      <img
        src={talebe.fotoUrl}
        alt={talebe.isim}
        style={stil}
        className="rounded-full object-cover ring-1 ring-border"
      />
    );
  }
  return (
    <div
      style={stil}
      className="inline-flex items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/20"
    >
      {bashHarfler(talebe.isim)}
    </div>
  );
}

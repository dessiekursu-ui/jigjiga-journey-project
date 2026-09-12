import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import AidatPanel from "@/components/AidatPanel";
import AidatHatirlatma from "@/components/AidatHatirlatma";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, Menu } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  GraduationCap,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Check,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
  Camera,
  Phone,
  StickyNote,
  User as UserIcon,
  Eye,
  EyeOff,
  Settings,
  Wallet,
  Users,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  talebeleriDinle,
  talebeEkle,
  talebeGuncelle,
  talebeSil,
  GRUPLAR,
  type Grup,
  type Talebe,
  type SayfaKaydi,
  type KiraatYonu,
  type Ders,
} from "@/lib/talebeler";
import { dosyaFotoDataUrl, bashHarfler } from "@/lib/foto";
import { aidatTutariniOku, hocaMailAyarDinle } from "@/lib/talebeler";
import { listeYazdir } from "@/lib/pdf";
import { excelIndir, excelOku } from "@/lib/excel";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SİEC JİGJİGA KURSU — Talebe ve Aidat Takip Paneli" },
      {
        name: "description",
        content:
          "Talebe hafızlık ilerlemesi, günlük ders takibi ve aylık aidat kayıtları tek panelde.",
      },
      { property: "og:title", content: "SİEC JİGJİGA KURSU — Talebe ve Aidat Takip Paneli" },
      {
        property: "og:description",
        content:
          "Talebe hafızlık ilerlemesi, günlük ders takibi ve aylık aidat kayıtları tek panelde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// (Talebe / SayfaKaydi tipleri ve veri katmanı '@/lib/talebeler' içindedir)

const SAYFA_BASINA_CUZ = 20;
const HOCA_OTURUM_KEY = "talebe-takip-hoca-oturum";
const HOCA_AD_KEY = "talebe-takip-hoca-ad";
const TALEBE_CACHE_KEY = "talebe-takip-cache-v1";
const HOCA_PAROLA_KEY = "talebe-takip-hoca-parola";
const VARSAYILAN_PAROLA = "siec099852";

type Dil = "tr";

const SOZLUK = {
  tr: {
    baslik: "SİEC JİGJİGA KURSU",
    altBaslikHafizlik: "Hafızlık takip paneli",
    altBaslikAidat: "Aidat Listesi",
    girisYap: "Giriş Yap",
    girisYapKisa: "Giriş yap",
    hocaefendiGirisi: "Hocaefendi Girişi",
    cikisYap: "Çıkış",
    duzenleme: "Düzenleme modu",
    duzenle: "Düzenle",
    parola: "Parola",
    ayarlar: "Ayarlar",
    ayarlarAciklama: "Uygulama ayarlarını buradan yönetebilirsiniz.",
    parolaDegistir: "Parola Değiştir",
    yeniParolaBelirle: "Yeni parolanızı belirleyin.",
    mevcutParolaLbl: "Mevcut parola",
    yeniParolaLbl: "Yeni parola",
    yeniParolaTekrarLbl: "Yeni parola (tekrar)",
    degistir: "Değiştir",
    iptal: "İptal et",
    kaydet: "Kaydet",
    kapat: "Kapat",
    sil: "Sil",
    eminMisiniz: "Emin misiniz?",
    silmeOnay: "Bu talebe kalıcı olarak silinecek. İşlem geri alınamaz.",
    evetSil: "Evet, sil",
    talebeEkle: "Talebe Ekle",
    haftaRaporu: "Haftanın Raporu",
    haftaninRaporu: "Haftanın Raporu",
    vermedi: "Vermedi",
    verdi: "Verdi",
    hocaefendi: "Hocaefendi",
    duzenlemeModu: "Düzenleme modu",
    topluHedef: "Toplu hedef",
    sfHafta: "sf / hafta",
    tumuneUygula: "Tümüne uygula",
    buHafta: "Bu hafta",
    gecenHafta: "Geçen hafta",
    gelecekHafta: "Gelecek hafta",
    haftaOnce: "hafta önce",
    haftaSonra: "hafta sonra",
    oncekiHafta: "Önceki hafta",
    sonrakiHafta: "Sonraki hafta",
    toplamTalebe: "Toplam Talebe",
    ders: "Ders",
    talebe: "Talebe",
    sf: "Sf",
    cuz: "Cüz",
    hedef: "Hedef",
    islem: "İşlem",
    verilerYukleniyor: "Veriler yükleniyor…",
    baglantiHatasi: "Bağlantı hatası",
    henuzTalebeYok: "Henüz talebe yok.",
    parolaGiriniz: "Düzenleme yapabilmek için parola giriniz.",
    parolaHatali: "Parola hatalı",
    mevcutParolaHatali: "Mevcut parola hatalı",
    yeniParolaKisa: "Yeni parola en az 3 karakter olmalı",
    yeniParolaUyumsuz: "Yeni parolalar eşleşmiyor",
    talebeProfili: "Talebe Profili",
    fotoVeKisisel: "Fotoğraf ve kişisel bilgiler.",
    fotoBuyut: "Fotoğrafı büyüt",
    fotoYukle: "Fotoğraf yükle",
    fotoKaldir: "Fotoğrafı kaldır",
    yuklemeBasarisiz: "Yükleme başarısız",
    sayfa: "Sayfa",
    sayfaKisa: "sf",
    cuzKisa: "cüz",
    cuzTam: ". cüz",
    hedefSf: "Hedef",
    sfPerHafta: "sf/hafta",
    telefon: "Telefon",
    notlar: "Notlar",
    ara: "Ara",
    isimVeIlerleme: "İsim & ilerleme",
    fotoBuyutGorunum: "Büyütülmüş fotoğraf görünümü.",
    fotoBaslik: "fotoğrafı",
    talebeyiDuzenle: "Talebeyi Düzenle",
    isimDersIlerleme: "İsim, ders ve Kur'an-ı Kerim ilerlemesi.",
    isim: "İsim",
    kiraatYonu: "Kıraat yönü",
    alttan: "Alttan (Sayfa 1 → 604)",
    ustten: "Üstten (Sayfa 604 → 1)",
    hedefHesabiYon: "Hedef hesabı bu yöne göre yapılır.",
    kiraatGunIpucu: "Kıraat günlerini ana tablodaki gün rozetlerinden işaretleyebilirsiniz.",
    sayfaAralik: "Sayfa (1-604)",
    cuzOtomatik: "Cüz (otomatik)",
    haftalikHedefSayfa: "Haftalık hedef (sayfa)",
    hedefSifirIpucu: "0 yazarsanız hedef takibi devre dışı kalır.",
    sayfaBosOlamaz: "Sayfa boş olamaz",
    yalnizcaRakam: "Yalnızca rakam giriniz",
    sayfaAralikHata: "Sayfa 1 ile 604 arasında olmalı",
    hedefBosOlamaz: "Hedef boş olamaz",
    hedefAralikHata: "Hedef 0 ile 200 arasında olmalı",
    aralikHata: "0 ile 200 arasında olmalı",
    parolayiGoster: "Parolayı göster",
    parolayiGizle: "Parolayı gizle",
    dersVermeyenler: "Ders Vermeyenler",
    talebeIsaretliDegil: "talebe bu gün için işaretli değil.",
    hepsiVerdi: "Bu gün tüm talebeler ders verdi. 🎉",
    geride: "Geride",
    hedefte: "Hedefte",
    yolda: "Yolda",
    hedefSayfaEtiket: "hedef sayfa",
    enIyiler: "🌟 En çok ders verenler (4+ gün)",
    ortalar: "⚖️ Orta seviye (2-3 gün)",
    zayiflar: "⚠️ Zayıf (0-1 gün)",
    gun7: "/7 gün",
    sayfayiDuzenle: "Sayfayı düzenle",
    digerDil: "አማርኛ",
    dersKuran: "Kur'an-ı Kerim",
    dersFikih: "Fıkıh (Sefînetü'n-Necâh)",
    dersHadis: "Hadis (Erbaîn-i Nevevî)",
    dersKuranKisa: "Kur'an",
    dersFikihKisa: "Fıkıh",
    dersHadisKisa: "Hadis",
    konu: "Konu",
    hadisNo: "Hadis No",
    dersSecimi: "Ders",
    haftaGun: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Pzr"],
    haftaGunUzun: [
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
      "Pazar",
    ],
  },
} as const;

type SozlukAnahtar = keyof typeof SOZLUK.tr;

const DilContext = createContext<Dil>("tr");
function useDil(): Dil {
  return useContext(DilContext);
}
function useT() {
  const d = useDil();
  return <K extends SozlukAnahtar>(k: K): (typeof SOZLUK)["tr"][K] => {
    const v = (SOZLUK[d] as typeof SOZLUK.tr)[k];
    return (v ?? SOZLUK.tr[k]) as (typeof SOZLUK)["tr"][K];
  };
}

function mevcutParola(): string {
  try {
    const kayitli = localStorage.getItem(HOCA_PAROLA_KEY);
    return kayitli && kayitli.length > 0 ? kayitli : VARSAYILAN_PAROLA;
  } catch {
    return VARSAYILAN_PAROLA;
  }
}

function cuzHesapla(sayfa: number) {
  if (sayfa < 1) return 1;
  if (sayfa > 604) return 30;
  return Math.min(30, Math.floor((sayfa - 1) / SAYFA_BASINA_CUZ) + 1);
}

function yasHesapla(dogum?: string): number | null {
  if (!dogum) return null;
  const d = new Date(dogum);
  if (isNaN(d.getTime())) return null;
  const simdi = new Date();
  let yas = simdi.getFullYear() - d.getFullYear();
  const ayFark = simdi.getMonth() - d.getMonth();
  if (ayFark < 0 || (ayFark === 0 && simdi.getDate() < d.getDate())) yas--;
  return yas >= 0 && yas < 130 ? yas : null;
}

function gunBaslangici(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

// Pazartesi başlangıçlı hafta
function haftaBaslangici(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const gun = (x.getDay() + 6) % 7; // Pzt=0
  x.setDate(x.getDate() - gun);
  return x.getTime();
}

function sayfaOnceFn(t: Talebe, esik: number) {
  const oncekiler = t.gecmis.filter((g) => g.t < esik);
  return oncekiler.length > 0
    ? oncekiler[oncekiler.length - 1].sayfa
    : t.gecmis[0]?.sayfa ?? t.sayfa;
}

function ilerleme(t: Talebe, baslangic: number, bitis: number) {
  const baz = sayfaOnceFn(t, baslangic);
  const son = sayfaOnceFn(t, bitis);
  return t.yon === "ustten"
    ? Math.max(0, baz - son)
    : Math.max(0, son - baz);
}

function haftaEtiket(baslangic: number) {
  const b = new Date(baslangic);
  const s = new Date(baslangic + 6 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    d.toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
  return `${fmt(b)} – ${fmt(s)}`;
}

const GUN_KISA = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Pzr"] as const;
const GUN_UZUN = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
] as const;

function bugununGunu(): number {
  const gun = (new Date().getDay() + 6) % 7; // Pzt=0
  // Cumartesi (5) ve Pazar (6) ders günü değildir; Pazartesi'ye döndür.
  return gun >= 5 ? 0 : gun;
}

function getKiraatGunler(t: Talebe, haftaBas: number): number[] {
  const k = t.kiraatGunler?.[String(haftaBas)];
  return Array.isArray(k) ? [...k].sort((a, b) => a - b) : [];
}

function getDersGunlerMap(t: Talebe, ders: Ders): Record<string, number[]> | undefined {
  return ders === "kuran" ? t.kiraatGunler : ders === "fikih" ? t.fikihGunler : t.hadisGunler;
}

function getDersGunler(t: Talebe, ders: Ders, haftaBas: number): number[] {
  const k = getDersGunlerMap(t, ders)?.[String(haftaBas)];
  return Array.isArray(k) ? [...k].sort((a, b) => a - b) : [];
}

function toggleGun(mevcut: number[], gun: number): number[] {
  return mevcut.includes(gun)
    ? mevcut.filter((g) => g !== gun)
    : [...mevcut, gun].sort((a, b) => a - b);
}

function Index() {
  const [hoca, setHoca] = useState("Hocaefendi");
  const [talebeler, setTalebeler] = useState<Talebe[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TALEBE_CACHE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setTalebeler(parsed as Talebe[]);
      }
    } catch {
      /* yoksay */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [yuklendi, setYuklendi] = useState(false);
  const [yuklemeHata, setYuklemeHata] = useState<string | null>(null);

  const [hocaModu, setHocaModu] = useState(false);
  const [girisAcik, setGirisAcik] = useState(false);
  const [gruplarAcik, setGruplarAcik] = useState(false);
  const [parolaTaslak, setParolaTaslak] = useState("");
  const [parolaHata, setParolaHata] = useState<string | null>(null);

  const [duzenlenen, setDuzenlenen] = useState<Talebe | null>(null);
  const [profilGoster, setProfilGoster] = useState<Talebe | null>(null);
  const [profilAidattan, setProfilAidattan] = useState(false);
  const [duzenleAidattan, setDuzenleAidattan] = useState(false);
  const [duzenleSayfaOdakli, setDuzenleSayfaOdakli] = useState(false);
  const [hocaDuzenle, setHocaDuzenle] = useState(false);
  const [hocaTaslak, setHocaTaslak] = useState(hoca);
  const [seciliHafta, setSeciliHafta] = useState<number>(() => haftaBaslastik());
  const [seciliGun, setSeciliGun] = useState<number>(() => bugununGunu());
  const seciliDers: Ders = "kuran";

  const [ayarlarAcik, setAyarlarAcik] = useState(false);
  const [aidatIndirAy, setAidatIndirAy] = useState<string>("buAy");
  const [parolaDegistirAcik, setParolaDegistirAcik] = useState(false);
  const [eskiParola, setEskiParola] = useState("");
  const [yeniParola, setYeniParola] = useState("");
  const [yeniParolaTekrar, setYeniParolaTekrar] = useState("");
  const [parolaDegistirHata, setParolaDegistirHata] = useState<string | null>(null);

  const [sekme, setSekme] = useState<"hafizlik" | "aidat">("hafizlik");
  const [grupFiltre, setGrupFiltre] = useState<Grup | "hepsi">("hepsi");
  const [aidatListeAcik, setAidatListeAcik] = useState(false);

  const [vermediAcik, setVermediAcik] = useState(false);

  const [raporAcik, setRaporAcik] = useState(false);

  const dil: Dil = "tr";
  const tr = <K extends SozlukAnahtar>(k: K): (typeof SOZLUK)["tr"][K] => {
    const v = (SOZLUK[dil] as typeof SOZLUK.tr)[k];
    return (v ?? SOZLUK.tr[k]) as (typeof SOZLUK)["tr"][K];
  };

  function haftaBaslastik() {
    return haftaBaslangici();
  }

  const HAFTA_MS = 7 * 24 * 60 * 60 * 1000;
  const buHafta = haftaBaslangici();
  const haftaSonu = seciliHafta + HAFTA_MS;
  const haftaFarki = Math.round((seciliHafta - buHafta) / HAFTA_MS);
  const haftaBasligi =
    haftaFarki === 0
      ? tr("buHafta")
      : haftaFarki === -1
        ? tr("gecenHafta")
        : haftaFarki === 1
          ? tr("gelecekHafta")
          : haftaFarki < 0
            ? `${-haftaFarki} ${tr("haftaOnce")}`
            : `${haftaFarki} ${tr("haftaSonra")}`;

  // Yerel UI tercihleri (hoca adı + oturum) localStorage'da kalır
  useEffect(() => {
    try {
      const ad = localStorage.getItem(HOCA_AD_KEY);
      if (ad) setHoca(ad);
      if (sessionStorage.getItem(HOCA_OTURUM_KEY) === "1") setHocaModu(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HOCA_AD_KEY, hoca);
    } catch {}
  }, [hoca]);

  // Yeni ay geldiğinde aidat hatırlatma e-postası uyarısı
  useEffect(() => {
    if (!hocaModu) return;
    const d = new Date();
    const ayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const unsub = hocaMailAyarDinle((a) => {
      const gonderilen = a.gonderilen[ayKey] ?? [];
      const bekleyen = GRUPLAR.filter(
        (g) => (a.mailler[g.id] ?? "").trim() && !gonderilen.includes(g.id),
      );
      if (bekleyen.length === 0) return;
      toast.info(
        `Bu ay ${bekleyen.length} hocaya aidat hatırlatması gönderilmedi.`,
        {
          id: "aidat-hatirlatma",
          duration: 8000,
          action: {
            label: "Ayarları aç",
            onClick: () => setAyarlarAcik(true),
          },
        },
      );
    });
    return () => unsub();
  }, [hocaModu]);


  // Firestore canlı veri
  useEffect(() => {
    const unsub = talebeleriDinle(
      (liste) => {
        setTalebeler(liste);
        setYuklendi(true);
        try {
          localStorage.setItem(TALEBE_CACHE_KEY, JSON.stringify(liste));
        } catch {}
      },
      (e) => {
        setYuklemeHata(e.message);
        setYuklendi(true);
      },
    );
    return () => unsub();
  }, []);

  const guncelle = (id: string, alan: Partial<Talebe>) => {
    const mevcut = talebeler.find((t) => t.id === id);
    if (!mevcut) return;
    const patch: Partial<Talebe> = { ...alan };
    if (alan.sayfa !== undefined && alan.sayfa !== mevcut.sayfa) {
      patch.gecmis = [
        ...mevcut.gecmis,
        { t: Date.now(), sayfa: alan.sayfa },
      ];
    }
    void talebeGuncelle(id, patch);
  };

  const sil = (id: string) => {
    const mevcut = talebeler.find((t) => t.id === id);
    // Hafızlık listesinden çıkar; aidat listesinde kalmaya devam etsin.
    if (mevcut && !mevcut.aidatHaric) {
      void talebeGuncelle(id, { aidatSadece: true });
      return;
    }
    void talebeSil(id);
  };


  const kiraatGunToggle = (t: Talebe, gun: number) => {
    const key = String(seciliHafta);
    const mevcut = getKiraatGunler(t, seciliHafta);
    const yeni = toggleGun(mevcut, gun);
    const harita = { ...(t.kiraatGunler ?? {}), [key]: yeni };
    void talebeGuncelle(t.id, {
      kiraatGunler: harita,
      kiraat: yeni.length > 0,
    });
  };

  const dersGunToggle = (t: Talebe, ders: Ders, gun: number) => {
    if (ders === "kuran") {
      kiraatGunToggle(t, gun);
      return;
    }
    const key = String(seciliHafta);
    const map = getDersGunlerMap(t, ders) ?? {};
    const mevcut = Array.isArray(map[key]) ? map[key] : [];
    const yeni = toggleGun(mevcut, gun);
    const harita = { ...map, [key]: yeni };
    const patch: Partial<Talebe> =
      ders === "fikih" ? { fikihGunler: harita } : { hadisGunler: harita };
    void talebeGuncelle(t.id, patch);
  };

  const ekle = (sadeceAidat = false) => {
    const yeniNo = talebeler.length + 1;
    const enBuyukSira = talebeler.reduce(
      (m, t) => Math.max(m, t.sira ?? 0),
      0,
    );
    void talebeEkle({
      isim: `Talebe ${yeniNo}`,
      kiraat: false,
      sayfa: 1,
      gecmis: [{ t: Date.now(), sayfa: 1 }],
      sira: enBuyukSira + 1,
      yon: "alttan",
      fikihKonu: 1,
      hadisNo: 1,
      aidatSadece: sadeceAidat,
      aidatHaric: false,
    });
  };

  const hafizTalebeler = useMemo(
    () => talebeler.filter((t) => !t.aidatSadece),
    [talebeler],
  );
  const aidatTalebeler = useMemo(
    () => talebeler.filter((t) => !t.aidatHaric),
    [talebeler],
  );

  const haftalikToplam = useMemo(
    () =>
      hafizTalebeler.reduce(
        (acc, t) => acc + ilerleme(t, seciliHafta, haftaSonu),
        0,
      ),
    [hafizTalebeler, seciliHafta, haftaSonu],
  );

  const ozet = useMemo(() => {
    const toplam = hafizTalebeler.length;
    const kiraatSayi = hafizTalebeler.filter(
      (t) => getDersGunler(t, seciliDers, seciliHafta).includes(seciliGun),
    ).length;
    return { toplam, kiraatSayi };
  }, [hafizTalebeler, seciliHafta, seciliGun, seciliDers]);


  const girisYap = () => {
    if (parolaTaslak === mevcutParola()) {
      setHocaModu(true);
      sessionStorage.setItem(HOCA_OTURUM_KEY, "1");
      setGirisAcik(false);
      setParolaTaslak("");
      setParolaHata(null);
    } else {
      setParolaHata(tr("parolaHatali"));
    }
  };

  const cikisYap = () => {
    setHocaModu(false);
    sessionStorage.removeItem(HOCA_OTURUM_KEY);
  };

  const parolaDegistir = () => {
    if (eskiParola !== mevcutParola()) {
      setParolaDegistirHata(tr("mevcutParolaHatali"));
      return;
    }
    if (yeniParola.length < 3) {
      setParolaDegistirHata(tr("yeniParolaKisa"));
      return;
    }
    if (yeniParola !== yeniParolaTekrar) {
      setParolaDegistirHata(tr("yeniParolaUyumsuz"));
      return;
    }
    try {
      localStorage.setItem(HOCA_PAROLA_KEY, yeniParola);
    } catch {
      setParolaDegistirHata("Parola kaydedilemedi.");
      return;
    }
    toast.success("Parola başarıyla değiştirildi");
    setParolaDegistirAcik(false);
    setEskiParola("");
    setYeniParola("");
    setYeniParolaTekrar("");
    setParolaDegistirHata(null);
  };

  const hafizlikPdf = () => {
    const gunler = tr("haftaGun").slice(0, 5);
    listeYazdir({
      altBaslik: "Hafızlık Takip Listesi",
      bilgi: [`Hafta: ${haftaEtiket(seciliHafta)}`, `Hocaefendi: ${hoca}`],
      sutunlar: [
        { baslik: "#", genislik: "6%", hiza: "center" },
        { baslik: "Talebe", genislik: "34%" },
        ...gunler.map((g) => ({
          baslik: g.slice(0, 3),
          genislik: "8%",
          hiza: "center" as const,
        })),
        { baslik: "Sayfa", genislik: "10%", hiza: "center" },
        { baslik: "Cüz", genislik: "10%", hiza: "center" },
      ],
      satirlar: hafizTalebeler.map((t, i) => {
        const verilen = getDersGunler(t, seciliDers, seciliHafta);
        return [
          i + 1,
          t.isim,
          ...gunler.map((_, gi) => (verilen.includes(gi) ? "✓" : "–")),
          t.sayfa,
          cuzHesapla(t.sayfa),
        ];
      }),
    });
  };

  const aidatAySecenekleri = () => {
    const simdi = new Date();
    const yil = simdi.getFullYear();
    const ay = simdi.getMonth();

    // Sadece en az bir ödeme kaydı bulunan ayları dikkate al
    const kullanilanAylar = new Set<number>();
    for (const t of talebeler) {
      if (!t.aidat) continue;
      for (const [key, val] of Object.entries(t.aidat)) {
        if (!val) continue;
        const [y, m] = key.split("-").map(Number);
        if (y === yil && m >= 1 && m <= 12) {
          kullanilanAylar.add(m - 1);
        }
      }
    }

    const enEski =
      kullanilanAylar.size > 0 ? Math.min(...kullanilanAylar) : ay;

    const aylar: { key: string; ad: string }[] = [];
    for (let i = ay; i >= enEski; i--) {
      aylar.push({
        key: `${yil}-${String(i + 1).padStart(2, "0")}`,
        ad: new Date(yil, i, 1).toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    return aylar;
  };

  const aidatPdf = async (secim: string = "buAy") => {
    const tutar = await aidatTutariniOku();
    const simdi = new Date();
    const liste =
      grupFiltre === "hepsi"
        ? aidatTalebeler
        : aidatTalebeler.filter((t) => t.grup === grupFiltre);
    const grupAdi =
      grupFiltre === "hepsi"
        ? "Tüm gruplar"
        : (GRUPLAR.find((g) => g.id === grupFiltre)?.ad ?? "Grup");
    if (secim === "tumu") {
      const aylar = aidatAySecenekleri().slice().reverse();
      listeYazdir({
        altBaslik: "Aidat Takip Listesi · Tüm Aylar",
        bilgi: [
          `Grup: ${grupAdi}`,
          `Aylık aidat: ${tutar.toLocaleString("tr-TR")} Birr`,
        ],
        sutunlar: [
          { baslik: "#", genislik: "6%", hiza: "center" },
          { baslik: "Talebe", genislik: "28%" },
          ...aylar.map((a) => ({
            baslik: a.ad.split(" ")[0],
            genislik: `${66 / aylar.length}%`,
            hiza: "center" as const,
          })),
        ],
        satirlar: liste.map((t, i) => [
          i + 1,
          t.isim,
          ...aylar.map((a) => (t.aidat?.[a.key] ? "✓" : "–")),
        ]),
      });
      return;
    }
    const ayKey =
      secim === "buAy"
        ? `${simdi.getFullYear()}-${String(simdi.getMonth() + 1).padStart(2, "0")}`
        : secim;
    const [yil, ayNo] = ayKey.split("-").map(Number);
    const ayAdi = new Date(yil, ayNo - 1, 1).toLocaleDateString("tr-TR", {
      month: "long",
      year: "numeric",
    });
    const odeyen = liste.filter((t) => t.aidat?.[ayKey]).length;
    listeYazdir({
      altBaslik: `Aidat Takip Listesi · ${ayAdi}`,
      bilgi: [
        `Grup: ${grupAdi}`,
        `Aylık aidat: ${tutar.toLocaleString("tr-TR")} Birr`,
        `Ödeyen: ${odeyen}/${liste.length}`,
        `Toplanan: ${(odeyen * tutar).toLocaleString("tr-TR")} Birr`,
      ],
      sutunlar: [
        { baslik: "#", genislik: "8%", hiza: "center" },
        { baslik: "Talebe", genislik: "46%" },
        { baslik: "Tutar", genislik: "23%", hiza: "center" },
        { baslik: "Durum", genislik: "23%", hiza: "center" },
      ],
      satirlar: liste.map((t, i) => {
        const odendi = !!t.aidat?.[ayKey];
        const satir = [
          i + 1,
          t.isim,
          `${tutar.toLocaleString("tr-TR")} Birr`,
          odendi ? "Ödedi" : "Ödemedi",
        ];
        return odendi ? satir : { hucreler: satir, className: "kirmizi" };
      }),
    });
  };

  const aidatListePdf = () => {
    listeYazdir({
      altBaslik: "Talebe Listesi",
      bilgi: [`Toplam talebe: ${aidatTalebeler.length}`],
      sutunlar: [
        { baslik: "Sıra No", genislik: "10%", hiza: "center" },
        { baslik: "Talebe İsmi", genislik: "30%" },
        { baslik: "Yaş", genislik: "10%", hiza: "center" },
        { baslik: "Sınıf", genislik: "14%" },
        { baslik: "Grup", genislik: "16%" },
        { baslik: "Telefon", genislik: "20%" },
      ],
      satirlar: aidatTalebeler.map((t, i) => [
        i + 1,
        t.isim,
        yasHesapla(t.dogum) ?? "—",
        t.sinif || "—",
        t.grup ? (GRUPLAR.find((g) => g.id === t.grup)?.ad ?? "—") : "—",
        t.telefon || "—",
      ]),
    });
  };

  const aidatListeExcel = () => {
    excelIndir(
      "aidat-talebe-listesi",
      "Talebe Listesi",
      [
        { baslik: "Sıra No", genislik: 8 },
        { baslik: "Talebe İsmi", genislik: 28 },
        { baslik: "Yaş", genislik: 8 },
        { baslik: "Sınıf", genislik: 14 },
        { baslik: "Grup", genislik: 16 },
        { baslik: "Telefon", genislik: 18 },
      ],
      aidatTalebeler.map((t, i) => [
        i + 1,
        t.isim,
        yasHesapla(t.dogum) ?? "—",
        t.sinif || "—",
        t.grup ? (GRUPLAR.find((g) => g.id === t.grup)?.ad ?? "—") : "—",
        t.telefon || "—",
      ]),
    );
  };

  const aidatListeSadeceIsimPdf = () => {
    listeYazdir({
      altBaslik: "Talebe İsim Listesi",
      bilgi: [`Toplam talebe: ${aidatTalebeler.length}`],
      sutunlar: [
        { baslik: "Sıra No", genislik: "15%", hiza: "center" },
        { baslik: "Talebe İsmi", genislik: "85%" },
      ],
      satirlar: aidatTalebeler.map((t, i) => [i + 1, t.isim]),
      tekSayfa: true,
    });
  };

  const aidatListeSadeceIsimExcel = () => {
    excelIndir(
      "aidat-talebe-listesi-sadece-isimler",
      "Talebe İsim Listesi",
      [
        { baslik: "Sıra No", genislik: 12 },
        { baslik: "Talebe İsmi", genislik: 40 },
      ],
      aidatTalebeler.map((t, i) => [i + 1, t.isim]),
    );
  };

  const aidatExcel = async (secim: string = "buAy") => {
    const tutar = await aidatTutariniOku();
    const simdi = new Date();
    const liste =
      grupFiltre === "hepsi"
        ? aidatTalebeler
        : aidatTalebeler.filter((t) => t.grup === grupFiltre);
    if (secim === "tumu") {
      const aylar = aidatAySecenekleri().slice().reverse();
      excelIndir(
        "aidat-takip-tum-aylar",
        "Aidat Takip",
        [
          { baslik: "#", genislik: 6 },
          { baslik: "Talebe", genislik: 28 },
          ...aylar.map((a) => ({ baslik: a.ad, genislik: 14 })),
        ],
        liste.map((t, i) => [
          i + 1,
          t.isim,
          ...aylar.map((a) => (t.aidat?.[a.key] ? "Ödedi" : "Ödemedi")),
        ]),
      );
      return;
    }
    const ayKey =
      secim === "buAy"
        ? `${simdi.getFullYear()}-${String(simdi.getMonth() + 1).padStart(2, "0")}`
        : secim;
    excelIndir(
      `aidat-takip-${ayKey}`,
      "Aidat Takip",
      [
        { baslik: "#", genislik: 6 },
        { baslik: "Talebe", genislik: 28 },
        { baslik: "Tutar (Birr)", genislik: 14 },
        { baslik: "Durum", genislik: 12 },
      ],
      liste.map((t, i) => [
        i + 1,
        t.isim,
        tutar,
        t.aidat?.[ayKey] ? "Ödedi" : "Ödemedi",
      ]),
    );
  };

  const aidatListeIceAktar = async (dosya: File) => {
    try {
      const satirlar = await excelOku(dosya);
      if (satirlar.length === 0) {
        toast.error("Excel dosyasında satır bulunamadı.");
        return;
      }
      const al = (r: Record<string, string>, ...adlar: string[]) => {
        for (const a of adlar) {
          const k = Object.keys(r).find(
            (x) => x.toLocaleLowerCase("tr") === a.toLocaleLowerCase("tr"),
          );
          if (k && r[k] !== "" && r[k] !== "—") return r[k];
        }
        return "";
      };
      let guncellenen = 0;
      let eklenen = 0;
      let enBuyukSira = talebeler.reduce((m, t) => Math.max(m, t.sira ?? 0), 0);

      for (const r of satirlar) {
        const isim = al(r, "Talebe İsmi", "Talebe", "İsim", "Isim");
        if (!isim) continue;
        const sinif = al(r, "Sınıf", "Sinif");
        const telefon = al(r, "Telefon");
        const grupAd = al(r, "Grup");
        const grup = GRUPLAR.find(
          (g) =>
            g.ad.toLocaleLowerCase("tr") === grupAd.toLocaleLowerCase("tr") ||
            g.id === grupAd,
        )?.id;

        const mevcut = talebeler.find(
          (t) =>
            t.isim.trim().toLocaleLowerCase("tr") ===
            isim.toLocaleLowerCase("tr"),
        );

        const patch: Record<string, unknown> = {};
        if (sinif) patch.sinif = sinif;
        if (telefon) patch.telefon = telefon;
        if (grup) patch.grup = grup;

        if (mevcut) {
          if (Object.keys(patch).length > 0) {
            await talebeGuncelle(mevcut.id, patch);
            guncellenen++;
          }
        } else {
          enBuyukSira++;
          await talebeEkle({
            isim,
            kiraat: false,
            sayfa: 1,
            gecmis: [{ t: Date.now(), sayfa: 1 }],
            sira: enBuyukSira,
            yon: "alttan",
            fikihKonu: 1,
            hadisNo: 1,
            aidatSadece: true,
            aidatHaric: false,
            ...patch,
          });
          eklenen++;
        }
      }
      toast.success(
        `Excel içe aktarıldı · ${guncellenen} güncellendi, ${eklenen} yeni talebe`,
      );
    } catch (e) {
      console.error(e);
      toast.error("Excel dosyası okunamadı.");
    }
  };

  return (
    <DilContext.Provider value={dil}>
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-2 py-4 sm:px-6 sm:py-12">
        <header className="relative mb-6 flex flex-col items-center gap-3 text-center sm:mb-12 sm:gap-5">
          <div className="absolute left-0 top-0 flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Menü"
                  className="h-10 w-10 rounded-full"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Bölümler</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {([
                  ["hafizlik", "Hafızlık takip paneli"],
                  ["aidat", "Aidat Listesi"],
                ] as const).map(([k, etiket]) => (
                  <DropdownMenuItem
                    key={k}
                    onSelect={() => {
                      setSekme(k);
                      setAidatListeAcik(false);
                      if (k === "aidat") setGrupFiltre("hepsi");
                    }}
                    className={!aidatListeAcik && sekme === k ? "font-semibold text-primary" : ""}
                  >
                    {etiket}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                  onSelect={() => {
                    setSekme("aidat");
                    setAidatListeAcik(true);
                  }}
                  className={aidatListeAcik ? "font-semibold text-primary" : ""}
                >
                  Talebe Listesi
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Gruplar</DropdownMenuLabel>
                {([
                  ["seviye1", "1. Seviye"],
                  ["seviye2", "2. Seviye"],
                  ["hazirlik", "Hazırlık"],
                ] as const).map(([k, etiket]) => (
                  <DropdownMenuItem
                    key={k}
                    onSelect={() => {
                      setSekme("aidat");
                      setAidatListeAcik(false);
                      setGrupFiltre(k as Grup | "hepsi");
                    }}
                    className={
                      !aidatListeAcik && sekme === "aidat" && grupFiltre === k
                        ? "font-semibold text-primary"
                        : ""
                    }
                  >
                    {etiket}
                  </DropdownMenuItem>
                ))}
                {hocaModu && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Yönetim</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setAyarlarAcik(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      {tr("ayarlar")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>

            </DropdownMenu>
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              {aidatListeAcik
                ? "Talebe Listesi"
                : sekme === "aidat"
                  ? tr("altBaslikAidat")
                  : tr("altBaslikHafizlik")}
            </span>
          </div>
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:h-20 sm:w-20">
            <GraduationCap className="h-7 w-7 sm:h-10 sm:w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-6xl">
              {tr("baslik")}
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-xl">
              {aidatListeAcik
                ? "Talebe Listesi"
                : sekme === "aidat"
                  ? tr("altBaslikAidat")
                  : tr("altBaslikHafizlik")}
            </p>
          </div>
        </header>


        <Card className="mb-6 border-accent/40 bg-secondary/40">
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {tr("hocaefendi")}
              </span>
              {hocaModu && hocaDuzenle ? (
                <>
                  <Input
                    autoFocus
                    value={hocaTaslak}
                    onChange={(e) => setHocaTaslak(e.target.value.slice(0, 60))}
                    className="h-9 w-48"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      setHoca(hocaTaslak.trim() || "Hocaefendi");
                      setHocaDuzenle(false);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setHocaDuzenle(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-base font-medium text-foreground">
                    {hoca}
                  </span>
                  {hocaModu && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setHocaTaslak(hoca);
                        setHocaDuzenle(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hocaModu ? (
                <>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tr("duzenlemeModu")}
                  </span>
                  <Button size="sm" variant="outline" onClick={cikisYap}>
                    <LogOut className="h-4 w-4" /> {tr("cikisYap")}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setGirisAcik(true)}
                >
                  <Lock className="h-4 w-4" /> {tr("hocaefendiGirisi")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {sekme === "aidat" ? (
          aidatListeAcik ? (
            <>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                Talebe Listesi
              </h2>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
              <Table className="table-fixed min-w-[540px]">
                <colgroup>
                  <col className="w-[6%]" />
                  <col className="w-[9%]" />
                  <col className="w-[23%]" />
                  <col className="w-[15%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[17%]" />
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="px-1 py-2 text-center text-[11px] sm:px-3 sm:text-sm">
                      #
                    </TableHead>
                    <TableHead className="px-1 py-2 text-center text-[11px] sm:px-3 sm:text-sm">
                      Profil
                    </TableHead>
                    <TableHead className="px-1 py-2 text-left text-[11px] sm:px-3 sm:text-sm">
                      İsim
                    </TableHead>
                    <TableHead className="px-1 py-2 text-center text-[11px] sm:px-3 sm:text-sm">
                      Yaş
                    </TableHead>
                    <TableHead className="px-1 py-2 text-left text-[11px] sm:px-3 sm:text-sm">
                      Sınıf
                    </TableHead>
                    <TableHead className="px-1 py-2 text-left text-[11px] sm:px-3 sm:text-sm">
                      Grup
                    </TableHead>
                    <TableHead className="px-1 py-2 text-left text-[11px] sm:px-3 sm:text-sm">
                      Telefon
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aidatTalebeler.map((t, i) => (
                    <TableRow key={t.id} className="hover:bg-muted/30">
                      <TableCell className="px-1 py-2 text-center text-[11px] text-muted-foreground sm:px-3 sm:py-3 sm:text-sm">
                        {i + 1}
                      </TableCell>
                      <TableCell className="px-1 py-2 text-center sm:px-3 sm:py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setProfilAidattan(true);
                            setProfilGoster(t);
                          }}
                          className="inline-flex items-center justify-center"
                        >
                          <span className="shrink-0 scale-90 sm:scale-100">
                            <TalebeAvatar talebe={t} boyut={36} />
                          </span>
                        </button>
                      </TableCell>
                      <TableCell className="min-w-0 px-1 py-2 text-left font-medium sm:px-3 sm:py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setProfilAidattan(true);
                            setProfilGoster(t);
                          }}
                          className="block w-full min-w-0 truncate text-left text-[11px] hover:text-primary hover:underline sm:text-sm"
                        >
                          {t.isim}
                        </button>
                      </TableCell>
                      <TableCell className="px-1 py-2 text-center text-[11px] tabular-nums text-muted-foreground sm:px-3 sm:py-3 sm:text-sm">
                        {yasHesapla(t.dogum) ?? "—"}
                      </TableCell>
                      <TableCell className="min-w-0 px-1 py-2 text-left text-[11px] text-muted-foreground sm:px-3 sm:py-3 sm:text-sm">
                        <span className="block truncate">{t.sinif || "—"}</span>
                      </TableCell>
                      <TableCell className="min-w-0 px-1 py-2 text-left text-[11px] text-muted-foreground sm:px-3 sm:py-3 sm:text-sm">
                        <span className="block truncate">
                          {t.grup
                            ? (GRUPLAR.find((g) => g.id === t.grup)?.ad ?? "—")
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="min-w-0 px-1 py-2 text-left text-[11px] tabular-nums text-muted-foreground sm:px-3 sm:py-3 sm:text-sm">
                        {t.telefon ? (
                          <a
                            href={`tel:${t.telefon.replace(/\s+/g, "")}`}
                            className="block truncate hover:text-primary hover:underline"
                          >
                            {t.telefon}
                          </a>
                        ) : (
                          <span className="block truncate">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {aidatTalebeler.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-sm text-muted-foreground"
                      >
                        Henüz aidat kaydı olan talebe yok.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </div>
            </Card>
            </>
          ) : (
            <AidatPanel
              talebeler={aidatTalebeler}
              hocaModu={hocaModu}
              onTalebe={(t) => {
                setProfilAidattan(true);
                setProfilGoster(t);
              }}
              grupFiltre={grupFiltre}
            />
          )
        ) : (

        <>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <OzetKart etiket={tr("toplamTalebe")} deger={ozet.toplam} />
          <OzetKart
            etiket={`${tr(seciliDers === "kuran" ? "dersKuranKisa" : seciliDers === "fikih" ? "dersFikihKisa" : "dersHadisKisa")} (${tr("haftaGun")[seciliGun]})`}
            deger={`${ozet.kiraatSayi}/${ozet.toplam}`}
            onClick={() => setVermediAcik(true)}
          />
        </div>

        <div className="mb-6 flex justify-end">
          <Button size="sm" variant="outline" onClick={() => setRaporAcik(true)}>
            <CalendarDays className="h-4 w-4" /> {tr("haftaninRaporu")}
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-secondary/30 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{haftaBasligi}</span>
            <span className="text-muted-foreground">·</span>
            <span className="tabular-nums text-muted-foreground">
              {haftaEtiket(seciliHafta)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setSeciliHafta((h) => h - HAFTA_MS)}
              aria-label={tr("oncekiHafta")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSeciliHafta(haftaBaslangici())}
              disabled={haftaFarki === 0}
            >
              {tr("buHafta")}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setSeciliHafta((h) => h + HAFTA_MS)}
              aria-label={tr("sonrakiHafta")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-[6%]" />
                <col className={hocaModu ? "w-[44%]" : "w-[50%]"} />
                <col className={hocaModu ? "w-[20%]" : "w-[22%]"} />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                {hocaModu && <col className="w-[10%]" />}
              </colgroup>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-8 px-1 text-center text-xs sm:w-12 sm:px-4">#</TableHead>
                  <TableHead className="px-1 text-xs sm:px-4 sm:text-sm">{tr("talebe")}</TableHead>
                  <TableHead className="px-1 text-center sm:px-4">
                    <Select
                      value={String(seciliGun)}
                      onValueChange={(v) => setSeciliGun(Number(v))}
                    >
                      <SelectTrigger className="mx-auto h-7 w-full min-w-0 px-1 text-[10px] sm:h-8 sm:w-[130px] sm:px-2 sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {tr("haftaGun")
                          .map((isim, i) => ({ isim, i }))
                          .filter(({ i }) => i < 5)
                          .map(({ isim, i }) => (
                            <SelectItem key={i} value={String(i)} className="text-sm">
                              {tr("ders")} · {isim}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead className="px-0.5 text-center text-[11px] font-semibold sm:px-4 sm:text-base">{tr("sf")}</TableHead>
                  <TableHead className="px-0.5 text-center text-[11px] font-semibold sm:px-4 sm:text-base">{tr("cuz")}</TableHead>
                  {hocaModu && (
                    <TableHead className="px-0.5 text-right text-[10px] sm:px-4 sm:text-sm">{tr("islem")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {hafizTalebeler.map((t, i) => {
                  const hafta = ilerleme(t, seciliHafta, haftaSonu);
                  return (
                  <TableRow key={t.id} className="hover:bg-muted/30">
                    <TableCell className="px-1 py-2 text-center text-xs text-muted-foreground sm:px-4 sm:py-3 sm:text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="min-w-0 px-1 py-2 font-medium sm:px-4 sm:py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setProfilAidattan(false);
                          setProfilGoster(t);
                        }}
                        className="group flex w-full min-w-0 items-center gap-1 text-left text-xs hover:text-primary sm:gap-2 sm:text-sm"
                      >
                        <span className="shrink-0 scale-90 sm:scale-100">
                          <TalebeAvatar talebe={t} boyut={38} />
                        </span>
                        <span className="min-w-0 truncate group-hover:underline">{t.isim}</span>
                      </button>
                    </TableCell>
                    <TableCell className="px-0.5 py-2 text-center sm:px-4 sm:py-3">
                      <GunDurum
                        verdi={getDersGunler(t, seciliDers, seciliHafta).includes(seciliGun)}
                        duzenlenebilir={hocaModu}
                        onToggle={() => dersGunToggle(t, seciliDers, seciliGun)}
                      />
                    </TableCell>
                    <TableCell className="px-0.5 py-2 text-center text-[11px] font-medium tabular-nums sm:px-4 sm:py-3 sm:text-base">
                      <SayfaEditor
                        talebe={t}
                        duzenlenebilir={false}
                        onKaydet={(yeni) => guncelle(t.id, { sayfa: yeni })}
                      />
                    </TableCell>
                    <TableCell className="px-0.5 py-2 text-center text-[11px] font-medium tabular-nums text-foreground sm:px-4 sm:py-3 sm:text-base">
                      {cuzHesapla(t.sayfa)}
                    </TableCell>
                    {hocaModu && (
                      <TableCell className="px-0.5 py-2 text-right sm:px-4 sm:py-3">
                        <div className="flex justify-end gap-0 sm:gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 sm:h-8 sm:w-8"
                            onClick={() => {
                              setDuzenleAidattan(false);
                              setDuzenleSayfaOdakli(true);
                              setDuzenlenen(t);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                  );
                })}
                {!yuklendi && hafizTalebeler.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5 + (hocaModu ? 1 : 0)}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {tr("verilerYukleniyor")}
                      </span>
                    </TableCell>
                  </TableRow>
                )}
                {yuklendi && yuklemeHata && (
                  <TableRow>
                    <TableCell
                      colSpan={5 + (hocaModu ? 1 : 0)}
                      className="py-10 text-center text-sm text-destructive"
                    >
                      {tr("baglantiHatasi")}: {yuklemeHata}
                    </TableCell>
                  </TableRow>
                )}
                {yuklendi && !yuklemeHata && hafizTalebeler.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5 + (hocaModu ? 1 : 0)}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      {tr("henuzTalebeYok")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </Card>
        </>
        )}
      </div>

      <VermediDiyalog
        acik={vermediAcik}
        onClose={() => setVermediAcik(false)}
        gunAdi={tr("haftaGun")[seciliGun]}
        talebeler={hafizTalebeler.filter(
          (t) => !getDersGunler(t, seciliDers, seciliHafta).includes(seciliGun),
        )}
        onTalebe={(t) => {
          setVermediAcik(false);
          setProfilAidattan(false);
          setProfilGoster(t);
        }}
      />

      <RaporDiyalog
        acik={raporAcik}
        onClose={() => setRaporAcik(false)}
        talebeler={hafizTalebeler}
        haftaBas={seciliHafta}
        haftaEtiketi={haftaEtiket(seciliHafta)}
        onTalebe={(t) => {
          setRaporAcik(false);
          setProfilAidattan(false);
          setProfilGoster(t);
        }}
      />


      <Dialog
        open={girisAcik}
        onOpenChange={(o) => {
          setGirisAcik(o);
          if (!o) {
            setParolaTaslak("");
            setParolaHata(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{tr("hocaefendiGirisi")}</DialogTitle>
            <DialogDescription>
              {tr("parolaGiriniz")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{tr("parola")}</Label>
            <ParolaInput
              value={parolaTaslak}
              onChange={(v) => {
                setParolaTaslak(v.slice(0, 50));
                setParolaHata(null);
              }}
              onEnter={girisYap}
              hata={!!parolaHata}
              autoFocus
            />
            {parolaHata && (
              <p className="text-xs text-destructive">{parolaHata}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGirisAcik(false)}>
              {tr("iptal")}
            </Button>
            <Button onClick={girisYap}>{tr("girisYap")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={ayarlarAcik} onOpenChange={setAyarlarAcik}>
        <DialogContent className="flex h-dvh max-h-none w-full max-w-full flex-col gap-3 rounded-none border-0 p-4 sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle>{tr("ayarlar")}</DialogTitle>
            <DialogDescription>{tr("ayarlarAciklama")}</DialogDescription>
          </DialogHeader>
          <div className="-mx-1 min-h-0 flex-1 space-y-2 overflow-y-auto px-1 py-1">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => {
                setAyarlarAcik(false);
                setEskiParola("");
                setYeniParola("");
                setYeniParolaTekrar("");
                setParolaDegistirHata(null);
                setParolaDegistirAcik(true);
              }}
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{tr("parolaDegistir")}</span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => {
                setAyarlarAcik(false);
                setTimeout(() => hafizlikPdf(), 150);
              }}
            >
              <FileDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Hafızlık Listesini PDF İndir
              </span>
            </button>
            <div className="rounded-md border border-border/60 px-3 py-2">
              <Label className="mb-1 block text-xs text-muted-foreground">
                Aidat listesi için ay seç
              </Label>
              <Select value={aidatIndirAy} onValueChange={setAidatIndirAy}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buAy">Bu ay</SelectItem>
                  <SelectItem value="tumu">Tüm aylar</SelectItem>
                  {aidatAySecenekleri().map((a) => (
                    <SelectItem key={a.key} value={a.key}>
                      {a.ad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                className="flex h-full flex-col items-center justify-center gap-1 rounded-md border border-border/60 px-1 py-2 text-center transition-colors hover:bg-accent"
                onClick={() => {
                  const secim = aidatIndirAy;
                  setAyarlarAcik(false);
                  setTimeout(() => void aidatPdf(secim), 150);
                }}
              >
                <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">
                  Aidat Listesi PDF
                </span>
              </button>
              <button
                type="button"
                className="flex h-full flex-col items-center justify-center gap-1 rounded-md border border-border/60 px-1 py-2 text-center transition-colors hover:bg-accent"
                onClick={() => {
                  const secim = aidatIndirAy;
                  setAyarlarAcik(false);
                  setTimeout(() => void aidatExcel(secim), 150);
                }}
              >
                <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">
                  Aidat Listesi Excel
                </span>
              </button>
              <button
                type="button"
                className="flex h-full flex-col items-center justify-center gap-1 rounded-md border border-border/60 px-1 py-2 text-center transition-colors hover:bg-accent"
                onClick={() => {
                  setAyarlarAcik(false);
                  setTimeout(() => aidatListePdf(), 150);
                }}
              >
                <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">
                  Talebe Listesi PDF
                </span>
              </button>
              <button
                type="button"
                className="flex h-full flex-col items-center justify-center gap-1 rounded-md border border-border/60 px-1 py-2 text-center transition-colors hover:bg-accent"
                onClick={() => {
                  setAyarlarAcik(false);
                  setTimeout(() => aidatListeExcel(), 150);
                }}
              >
                <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-[10px] font-medium leading-tight">
                  Talebe Listesi Excel
                </span>
              </button>
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => {
                setAyarlarAcik(false);
                setTimeout(() => aidatListeSadeceIsimPdf(), 150);
              }}
            >
              <FileDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Talebe İsim Listesi PDF İndir
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => {
                setAyarlarAcik(false);
                setTimeout(() => aidatListeSadeceIsimExcel(), 150);
              }}
            >
              <FileDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Talebe İsim Listesi Excel İndir
              </span>
            </button>
            {hocaModu && (
              <>
                <AidatHatirlatma talebeler={talebeler} />

                <label className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent">
                  <FileDown className="h-4 w-4 rotate-180 text-muted-foreground" />
                  <span className="text-sm font-medium">Talebe Listesi Excel Yükle</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) {
                        setAyarlarAcik(false);
                        void aidatListeIceAktar(f);
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
                  onClick={() => {
                    setAyarlarAcik(false);
                    ekle(false);
                  }}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{tr("talebeEkle")}</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
                  onClick={() => {
                    setAyarlarAcik(false);
                    ekle(true);
                  }}
                >
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Aidata talebe ekle</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-left transition-colors hover:bg-accent"
                  onClick={() => {
                    setAyarlarAcik(false);
                    setGruplarAcik(true);
                  }}
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Gruplar oluştur</span>
                </button>
              </>
            )}
          </div>
          <DialogFooter className="shrink-0 sm:justify-between">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setAyarlarAcik(false)}
            >
              <ArrowLeft className="h-4 w-4" />
              Geri dön
            </Button>
            <Button variant="ghost" onClick={() => setAyarlarAcik(false)}>
              {tr("kapat")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={parolaDegistirAcik}
        onOpenChange={(o) => {
          setParolaDegistirAcik(o);
          if (!o) {
            setEskiParola("");
            setYeniParola("");
            setYeniParolaTekrar("");
            setParolaDegistirHata(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{tr("parolaDegistir")}</DialogTitle>
            <DialogDescription>
              {tr("yeniParolaBelirle")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>{tr("mevcutParolaLbl")}</Label>
              <ParolaInput
                value={eskiParola}
                onChange={(v) => {
                  setEskiParola(v.slice(0, 50));
                  setParolaDegistirHata(null);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>{tr("yeniParolaLbl")}</Label>
              <ParolaInput
                value={yeniParola}
                onChange={(v) => {
                  setYeniParola(v.slice(0, 50));
                  setParolaDegistirHata(null);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>{tr("yeniParolaTekrarLbl")}</Label>
              <ParolaInput
                value={yeniParolaTekrar}
                onChange={(v) => {
                  setYeniParolaTekrar(v.slice(0, 50));
                  setParolaDegistirHata(null);
                }}
                onEnter={parolaDegistir}
              />
            </div>
            {parolaDegistirHata && (
              <p className="text-xs text-destructive">{parolaDegistirHata}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setParolaDegistirAcik(false)}>
              {tr("iptal")}
            </Button>
            <Button onClick={parolaDegistir}>{tr("degistir")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={gruplarAcik} onOpenChange={setGruplarAcik}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Gruplar oluştur</DialogTitle>
            <DialogDescription>Talebeleri gruplara atayın.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {talebeler
              .filter((t) => !t.aidatHaric)
              .map((t) => (
                <div
                  key={t.id}
                  className="rounded-md border border-border/60 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium">{t.isim}</span>
                    <select
                      value={t.grup ?? ""}
                      onChange={(e) => {
                        const yeni = e.target.value as Grup | "";
                        void talebeGuncelle(t.id, {
                          grup: yeni === "" ? undefined : yeni,
                        });
                      }}
                      className="h-9 shrink-0 rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
                    >
                      <option value="">Grup yok</option>
                      {GRUPLAR.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.ad}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            {talebeler.filter((t) => !t.aidatHaric).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Henüz talebe yok.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setGruplarAcik(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <DuzenleDiyalog
        talebe={duzenlenen}
        kiraatGizli={duzenleAidattan}
        sayfaOdakli={duzenleSayfaOdakli}
        onClose={() => {
          setDuzenlenen(null);
          setDuzenleSayfaOdakli(false);
        }}
        onKaydet={(p) => {
          if (duzenlenen) guncelle(duzenlenen.id, p);
          setDuzenlenen(null);
          setDuzenleSayfaOdakli(false);
        }}
      />

      <ProfilDiyalog
        talebe={
          profilGoster
            ? (talebeler.find((x) => x.id === profilGoster.id) ?? profilGoster)
            : null
        }
        hocaModu={hocaModu}
        kiraatGizli={profilAidattan}
        onClose={() => setProfilGoster(null)}
        onDuzenle={(t) => {
          setProfilGoster(null);
          setDuzenleAidattan(profilAidattan);
          setDuzenlenen(t);
        }}
        onFotoDegistir={(t, fotoUrl) => {
          void talebeGuncelle(t.id, { fotoUrl });
        }}
        onNotKaydet={(t, patch) => {
          void talebeGuncelle(t.id, patch);
        }}
        onSil={() => {
          const id = profilGoster?.id;
          setProfilGoster(null);
          if (id) sil(id);
        }}
      />
    </div>
    </DilContext.Provider>
  );
}

function TalebeAvatar({
  talebe,
  boyut = 40,
}: {
  talebe: Talebe;
  boyut?: number;
}) {
  const stil = {
    width: boyut,
    height: boyut,
    minWidth: boyut,
    minHeight: boyut,
  } as const;
  if (talebe.fotoUrl) {
    return (
      <img
        src={talebe.fotoUrl}
        alt={talebe.isim}
        style={stil}
        className="shrink-0 rounded-full bg-muted object-cover ring-1 ring-border"
      />
    );
  }
  return (
    <div
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-1 ring-border"
      style={{ ...stil, fontSize: Math.max(11, boyut / 3.2) }}
    >
      {bashHarfler(talebe.isim)}
    </div>
  );
}

function ProfilDiyalog({
  talebe,
  hocaModu,
  kiraatGizli = false,
  onClose,
  onDuzenle,
  onFotoDegistir,
  onNotKaydet,
  onSil,
}: {
  talebe: Talebe | null;
  hocaModu: boolean;
  kiraatGizli?: boolean;
  onClose: () => void;
  onDuzenle: (t: Talebe) => void;
  onFotoDegistir: (t: Talebe, fotoUrl: string) => void;
  onNotKaydet: (
    t: Talebe,
    patch: Partial<Pick<Talebe, "telefon" | "notlar" | "isim" | "sinif" | "dogum">>,
  ) => void;
  onSil: () => void;
}) {
  const t = useT();
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [telefon, setTelefon] = useState("");
  const [sinif, setSinif] = useState("");
  const [dogum, setDogum] = useState("");
  const [notlar, setNotlar] = useState("");
  const [fotoBuyuk, setFotoBuyuk] = useState(false);
  const [isimDuzenle, setIsimDuzenle] = useState(false);
  const [isimTaslak, setIsimTaslak] = useState("");
  const [silOnayAcik, setSilOnayAcik] = useState(false);

  useEffect(() => {
    if (talebe) {
      setTelefon(talebe.telefon ?? "");
      setSinif(talebe.sinif ?? "");
      setDogum(talebe.dogum ?? "");
      setNotlar(talebe.notlar ?? "");
      setHata(null);
      setIsimDuzenle(false);
      setIsimTaslak(talebe.isim);
    }
  }, [talebe?.id]);

  if (!talebe) return null;

  const fotoSec = async (file: File | undefined) => {
    if (!file) return;
    setHata(null);
    setYukleniyor(true);
    try {
      const url = await dosyaFotoDataUrl(file);
      onFotoDegistir(talebe, url);
    } catch (e) {
      setHata(e instanceof Error ? e.message : t("yuklemeBasarisiz"));
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <>
      <Dialog open={!!talebe} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="fixed flex max-h-[94dvh] w-[95vw] max-w-[95vw] flex-col overflow-hidden p-0 sm:max-w-md">
        {hocaModu && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute left-2 top-2 z-10"
            title={t("sil")}
            onClick={() => setSilOnayAcik(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:p-6">
          <DialogHeader className="text-center">
            <DialogTitle>{t("talebeProfili")}</DialogTitle>
            <DialogDescription className="sr-only">{t("fotoVeKisisel")}</DialogDescription>
          </DialogHeader>

        <div className="flex flex-col items-center gap-2">
          <div className="relative h-[92px] w-[92px] sm:h-[120px] sm:w-[120px]">
            <button
              type="button"
              onClick={() => talebe.fotoUrl && setFotoBuyuk(true)}
              className={`block rounded-full ${talebe.fotoUrl ? "cursor-zoom-in" : "cursor-default"}`}
              title={talebe.fotoUrl ? t("fotoBuyut") : undefined}
            >
              <span className="sm:hidden"><TalebeAvatar talebe={talebe} boyut={92} /></span>
              <span className="hidden sm:block"><TalebeAvatar talebe={talebe} boyut={120} /></span>
            </button>
            {hocaModu && (
              <label
                className="absolute -bottom-1 -right-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-background hover:opacity-90"
                title={t("fotoYukle")}
              >
                {yukleniyor ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void fotoSec(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <div className="text-center">
            {isimDuzenle && hocaModu ? (
              <div className="flex items-center justify-center gap-1.5">
                <Input
                  value={isimTaslak}
                  onChange={(e) => setIsimTaslak(e.target.value.slice(0, 60))}
                  className="h-9 w-48 text-center text-base font-semibold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const yeni = isimTaslak.trim();
                      if (yeni && yeni !== talebe.isim) {
                        onNotKaydet(talebe, { isim: yeni });
                      }
                      setIsimDuzenle(false);
                    }
                    if (e.key === "Escape") {
                      setIsimTaslak(talebe.isim);
                      setIsimDuzenle(false);
                    }
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-primary"
                  disabled={!isimTaslak.trim()}
                  onClick={() => {
                    const yeni = isimTaslak.trim();
                    if (yeni && yeni !== talebe.isim) {
                      onNotKaydet(talebe, { isim: yeni });
                    }
                    setIsimDuzenle(false);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => {
                    setIsimTaslak(talebe.isim);
                    setIsimDuzenle(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <div className="text-lg font-semibold">{talebe.isim}</div>
                {hocaModu && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title={t("duzenle")}
                    onClick={() => {
                      setIsimTaslak(talebe.isim);
                      setIsimDuzenle(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
            <div className="min-h-4 text-xs text-muted-foreground">
              {!kiraatGizli && (
                <>
                  {t("sayfa")} {talebe.sayfa} · {cuzHesapla(talebe.sayfa)}
                  {t("cuzTam")}
                </>
              )}
            </div>
          </div>
          {hocaModu && talebe.fotoUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="-my-1 text-xs text-muted-foreground"
              onClick={() => onFotoDegistir(talebe, "")}
            >
              {t("fotoKaldir")}
            </Button>
          )}
          {hata && <p className="text-xs text-destructive">{hata}</p>}
        </div>


        <div className="mt-1 space-y-2">
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              Sınıf
            </Label>
            <Input
              value={sinif}
              onChange={(e) => setSinif(e.target.value.slice(0, 40))}
              disabled={!hocaModu}
              placeholder="—"
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              Doğum tarihi
            </Label>
            <Input
              type="date"
              value={dogum}
              onChange={(e) => setDogum(e.target.value)}
              disabled={!hocaModu}
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <Phone className="h-3.5 w-3.5" /> {t("telefon")}
            </Label>
            <div className="flex gap-2">
              <Input
                value={telefon}
                onChange={(e) => setTelefon(e.target.value.slice(0, 30))}
                disabled={!hocaModu}
                placeholder="—"
                inputMode="tel"
                type="tel"
                className="text-base"
              />
              {telefon.trim() && (
                <Button asChild size="icon" variant="outline" title={t("ara")}>
                  <a href={`tel:${telefon.replace(/\s+/g, "")}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm">
              <StickyNote className="h-3.5 w-3.5" /> {t("notlar")}
            </Label>
            <Textarea
              value={notlar}
              onChange={(e) => setNotlar(e.target.value.slice(0, 600))}
              disabled={!hocaModu}
              rows={2}
              placeholder="—"
              className="text-base sm:min-h-[84px]"
            />
          </div>
        </div>
      </div>

      <div className="border-t bg-background px-4 py-3 sm:p-6">
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("iptal")}
          </Button>
          {hocaModu && (
            <Button
              onClick={() => {
                onNotKaydet(talebe, {
                  telefon: telefon.trim(),
                  sinif: sinif.trim(),
                  dogum: dogum || "",
                  notlar: notlar.trim(),
                });
                onClose();
              }}
            >
              {t("kaydet")}
            </Button>
          )}
        </DialogFooter>
      </div>
    </DialogContent>

      {talebe.fotoUrl && (
        <Dialog open={fotoBuyuk} onOpenChange={(o) => !o && setFotoBuyuk(false)}>
          <DialogContent className="max-w-[95vw] border-0 bg-transparent p-0 shadow-none sm:max-w-[90vw]">
            <DialogHeader className="sr-only">
              <DialogTitle>{talebe.isim} {t("fotoBaslik")}</DialogTitle>
              <DialogDescription>{t("fotoBuyutGorunum")}</DialogDescription>
            </DialogHeader>
            <img
              src={talebe.fotoUrl}
              alt={talebe.isim}
              className="mx-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>

    <AlertDialog open={silOnayAcik} onOpenChange={setSilOnayAcik}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("eminMisiniz")}</AlertDialogTitle>
          <AlertDialogDescription>{t("silmeOnay")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSilOnayAcik(false)}>
            {t("iptal")}
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              onSil();
              onClose();
              setSilOnayAcik(false);
            }}
          >
            {t("evetSil")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}

function OzetKart({
  etiket,
  deger,
  onClick,
}: {
  etiket: string;
  deger: number | string;
  onClick?: () => void;
}) {
  const icerik = (
    <CardContent className="px-3 py-3 text-center sm:px-4 sm:py-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">
        {etiket}
      </div>
      <div className="mt-1 text-xl font-semibold text-foreground sm:text-2xl">
        {deger}
      </div>
    </CardContent>
  );
  if (onClick) {
    return (
      <Card
        className="border-border/60 cursor-pointer transition-colors hover:bg-muted/40 hover:border-primary/40"
        onClick={onClick}
      >
        {icerik}
      </Card>
    );
  }
  return <Card className="border-border/60">{icerik}</Card>;
}

function KiraatGunler({
  gunler,
  duzenlenebilir,
  onToggle,
}: {
  gunler: number[];
  duzenlenebilir: boolean;
  onToggle: (g: number) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {GUN_KISA.map((isim, i) => {
        if (i >= 5) return null;
        const aktif = gunler.includes(i);
        const sinif = aktif
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-muted/40 text-muted-foreground border-border";
        if (duzenlenebilir) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-primary/80 hover:text-primary-foreground ${sinif}`}
              title={isim}
            >
              {isim[0]}
            </button>
          );
        }
        return (
          <span
            key={i}
            className={`rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${sinif}`}
            title={isim}
          >
            {isim[0]}
          </span>
        );
      })}
    </div>
  );
}

function GunDurum({
  verdi,
  duzenlenebilir,
  onToggle,
}: {
  verdi: boolean;
  duzenlenebilir: boolean;
  onToggle: () => void;
}) {
  const t = useT();
  const sinif = verdi
    ? "bg-primary text-primary-foreground border-primary"
    : "bg-muted/40 text-muted-foreground border-border";
  const kisa = verdi ? "✓" : "—";
  const uzun = verdi ? t("verdi") : t("vermedi");
  const icerik = <span>{uzun}</span>;
  if (duzenlenebilir) {
    return (
      <button
        type="button"
        onClick={onToggle}
        title={uzun}
        className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:opacity-90 sm:px-2 sm:py-1 sm:text-xs ${sinif}`}
      >
        {icerik}
      </button>
    );
  }
  return (
    <span
      title={uzun}
      className={`inline-flex rounded-md border px-1.5 py-0.5 text-[11px] font-semibold sm:px-2 sm:py-1 sm:text-xs ${sinif}`}
    >
      {icerik}
    </span>
  );
}

function IlerlemeRozet({ sayfa }: { sayfa: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums ${
        sayfa > 0
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {sayfa} sf
    </span>
  );
}

function DuzenleDiyalog({
  talebe,
  kiraatGizli = false,
  sayfaOdakli = false,
  onClose,
  onKaydet,
}: {
  talebe: Talebe | null;
  kiraatGizli?: boolean;
  sayfaOdakli?: boolean;
  onClose: () => void;
  onKaydet: (p: Partial<Talebe>) => void;
}) {
  const t = useT();
  const [isim, setIsim] = useState("");
  const [yon, setYon] = useState<KiraatYonu>("alttan");
  const [sayfaTaslak, setSayfaTaslak] = useState("1");
  const [sayfaHata, setSayfaHata] = useState<string | null>(null);
  const sayfaInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (talebe) {
      setIsim(talebe.isim);
      setYon(talebe.yon ?? "alttan");
      setSayfaTaslak(String(talebe.sayfa));
      setSayfaHata(null);
    }
  }, [talebe]);

  useEffect(() => {
    if (talebe && sayfaOdakli && sayfaInputRef.current) {
      // Radix Dialog'un kendi odağını tamamlaması için kısa gecikme
      const id = window.setTimeout(() => {
        sayfaInputRef.current?.focus();
        sayfaInputRef.current?.select();
      }, 180);
      return () => window.clearTimeout(id);
    }
  }, [talebe, sayfaOdakli]);

  const sayfaDogrula = (deger: string): number | null => {
    if (deger.trim() === "") {
      setSayfaHata(t("sayfaBosOlamaz"));
      return null;
    }
    if (!/^\d+$/.test(deger)) {
      setSayfaHata(t("yalnizcaRakam"));
      return null;
    }
    const n = Number(deger);
    if (n < 1 || n > 604) {
      setSayfaHata(t("sayfaAralikHata"));
      return null;
    }
    setSayfaHata(null);
    return n;
  };

  const kaydet = () => {
    const temizIsim = isim.trim().slice(0, 60);
    if (!temizIsim) return;
    if (kiraatGizli) {
      onKaydet({ isim: temizIsim });
      return;
    }
    const sayfa = sayfaDogrula(sayfaTaslak);
    if (sayfa === null) return;
    onKaydet({ isim: temizIsim, sayfa, yon });
  };

  const cuz = /^\d+$/.test(sayfaTaslak)
    ? cuzHesapla(Math.max(1, Math.min(604, Number(sayfaTaslak))))
    : "—";

  return (
    <Dialog open={!!talebe} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => {
          if (sayfaOdakli) {
            e.preventDefault();
            sayfaInputRef.current?.focus();
            sayfaInputRef.current?.select();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("talebeyiDuzenle")}</DialogTitle>
          <DialogDescription>
            {t("isimDersIlerleme")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("isim")}</Label>
            <Input
              value={isim}
              onChange={(e) => setIsim(e.target.value.slice(0, 60))}
              maxLength={60}
            />
          </div>

          {!kiraatGizli && (
          <div className="space-y-1.5">
            <Label>{t("kiraatYonu")}</Label>
            <Select
              value={yon}
              onValueChange={(v) => {
                const yeniYon = v as KiraatYonu;
                setYon(yeniYon);
                // Yön değişince sayfa varsayılanını mantıklı uca getir
                const mevcutSayfa = Number(sayfaTaslak);
                if (yeniYon === "ustten" && (mevcutSayfa === 1 || !Number.isFinite(mevcutSayfa))) {
                  setSayfaTaslak("604");
                  setSayfaHata(null);
                } else if (yeniYon === "alttan" && mevcutSayfa === 604) {
                  setSayfaTaslak("1");
                  setSayfaHata(null);
                }
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alttan">{t("alttan")}</SelectItem>
                <SelectItem value="ustten">{t("ustten")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          )}

          {!kiraatGizli && (
          <p className="text-xs text-muted-foreground">
            {t("kiraatGunIpucu")}
          </p>
          )}

          {!kiraatGizli && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> {t("sayfaAralik")}
              </Label>
              <Input
                ref={sayfaInputRef}
                type="number"
                inputMode="numeric"
                min={1}
                max={604}
                value={sayfaTaslak}
                onChange={(e) => {
                  setSayfaTaslak(e.target.value);
                  sayfaDogrula(e.target.value);
                }}
                aria-invalid={sayfaHata ? true : undefined}
                className={
                  sayfaHata
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("cuzOtomatik")}</Label>
              <div className="flex h-9 items-center rounded-md border border-input bg-secondary/40 px-3 text-sm font-medium text-secondary-foreground">
                {cuz}{typeof cuz === "number" ? t("cuzTam") : ""}
              </div>
            </div>
          </div>
          )}
          {sayfaHata && !kiraatGizli && <p className="text-xs text-destructive">{sayfaHata}</p>}

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t("iptal")}
          </Button>
          <Button
            onClick={kaydet}
            disabled={!!sayfaHata || !isim.trim()}
          >
            {t("kaydet")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DersKutu({
  etiket,
  verildi,
  onChange,
}: {
  etiket: string;
  verildi: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 transition-colors ${
        verildi
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:bg-muted/50"
      }`}
    >
      <span className="text-sm font-medium text-foreground">{etiket}</span>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs ${verildi ? "text-primary" : "text-muted-foreground"}`}
        >
          {verildi ? "Verdi" : "Vermedi"}
        </span>
        <Checkbox
          checked={verildi}
          onCheckedChange={(v) => onChange(Boolean(v))}
        />
      </div>
    </label>
  );
}

function ParolaInput({
  value,
  onChange,
  onEnter,
  hata,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  hata?: boolean;
  autoFocus?: boolean;
}) {
  const [goster, setGoster] = useState(false);
  return (
    <div className="relative">
      <Input
        type={goster ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) onEnter();
        }}
        autoFocus={autoFocus}
        aria-invalid={hata ? true : undefined}
        className={`pr-10 text-base ${hata ? "border-destructive focus-visible:ring-destructive" : ""}`}
      />
      <button
        type="button"
        onClick={() => setGoster((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        tabIndex={-1}
        aria-label={goster ? "Parolayı gizle / የይለፍ ቃል ደብቅ" : "Parolayı göster / የይለፍ ቃል አሳይ"}
      >
        {goster ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}


function VermediDiyalog({
  acik,
  onClose,
  gunAdi,
  talebeler,
  onTalebe,
}: {
  acik: boolean;
  onClose: () => void;
  gunAdi: string;
  talebeler: Talebe[];
  onTalebe: (t: Talebe) => void;
}) {
  const tr = useT();
  return (
    <Dialog open={acik} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tr("dersVermeyenler")} · {gunAdi}</DialogTitle>
          <DialogDescription>
            {talebeler.length} {tr("talebeIsaretliDegil")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {talebeler.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {tr("hepsiVerdi")}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {talebeler.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => onTalebe(t)}
                    className="flex w-full items-center gap-3 py-2 text-left hover:bg-muted/40"
                  >
                    <TalebeAvatar talebe={t} boyut={36} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.isim}</div>
                      <div className="text-xs text-muted-foreground">
                        {tr("sayfa")} {t.sayfa} · {cuzHesapla(t.sayfa)}{tr("cuzTam")}
                      </div>
                    </div>
                    <span className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive">
                      {tr("vermedi")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{tr("kapat")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RaporDiyalog({
  acik,
  onClose,
  talebeler,
  haftaBas,
  haftaEtiketi,
  onTalebe,
}: {
  acik: boolean;
  onClose: () => void;
  talebeler: Talebe[];
  haftaBas: number;
  haftaEtiketi: string;
  onTalebe: (t: Talebe) => void;
}) {
  const tr = useT();
  const siralanmis = [...talebeler]
    .map((t) => ({ t, gun: getKiraatGunler(t, haftaBas).length }))
    .sort((a, b) => b.gun - a.gun);
  const enIyiler = siralanmis.filter((x) => x.gun >= 4);
  const ortalar = siralanmis.filter((x) => x.gun === 2 || x.gun === 3);
  const zayiflar = siralanmis.filter((x) => x.gun <= 1);

  const grup = (
    baslik: string,
    renk: string,
    liste: { t: Talebe; gun: number }[],
  ) => (
    <div>
      <h3 className={`mb-2 text-sm font-semibold ${renk}`}>
        {baslik} <span className="text-muted-foreground">({liste.length})</span>
      </h3>
      {liste.length === 0 ? (
        <p className="text-xs text-muted-foreground">—</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border/60">
          {liste.map(({ t, gun }) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onTalebe(t)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted/40"
              >
                <TalebeAvatar talebe={t} boyut={32} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {t.isim}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-primary">
                  {gun}{tr("gun7")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Dialog open={acik} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{tr("haftaninRaporu")}</DialogTitle>
          <DialogDescription>{haftaEtiketi}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[65vh] space-y-4 overflow-y-auto">
          {grup(tr("enIyiler"), "text-primary", enIyiler)}
          {grup(tr("ortalar"), "text-amber-600 dark:text-amber-400", ortalar)}
          {grup(tr("zayiflar"), "text-destructive", zayiflar)}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>{tr("kapat")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SayfaEditor({
  talebe,
  duzenlenebilir,
  onKaydet,
}: {
  talebe: Talebe;
  duzenlenebilir: boolean;
  onKaydet: (sayfa: number) => void;
}) {
  const tr = useT();
  const [acik, setAcik] = useState(false);
  const [taslak, setTaslak] = useState<number>(talebe.sayfa);

  useEffect(() => {
    if (acik) setTaslak(talebe.sayfa);
  }, [acik, talebe.sayfa]);

  if (!duzenlenebilir) {
    return <span>{talebe.sayfa}</span>;
  }

  return (
    <Popover open={acik} onOpenChange={setAcik}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md px-2 py-1 font-medium hover:bg-muted/60"
          title={tr("sayfayiDuzenle")}
        >
          {talebe.sayfa}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] overflow-hidden rounded-2xl border-border/60 bg-gradient-to-b from-card to-secondary/40 p-0 shadow-2xl"
        align="center"
      >
        <div className="border-b border-border/40 px-4 py-2.5 text-center">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {talebe.isim}
          </div>
          <div className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
            {taslak}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {cuzHesapla(taslak)}
            {tr("cuzTam")}
          </div>
        </div>

        <SayfaCarki value={taslak} onChange={setTaslak} />

        <div className="flex items-center justify-between gap-2 border-t border-border/40 px-3 py-2">
          <Button size="sm" variant="ghost" onClick={() => setAcik(false)}>
            {tr("iptal")}
          </Button>
          <Button
            size="sm"
            className="px-5"
            onClick={() => {
              onKaydet(Math.max(1, Math.min(604, Math.round(taslak))));
              setAcik(false);
            }}
          >
            {tr("kaydet")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SayfaCarki({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const ITEM_H = 40;
  const VISIBLE = 7; // odd: center + 3 on each side
  const PAD = Math.floor(VISIBLE / 2);
  const MIN = 1;
  const MAX = 604;
  const sayilar = useMemo(
    () => Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i),
    [],
  );
  const ref = useRef<HTMLDivElement | null>(null);
  const programatik = useRef(false);
  const zaman = useRef<number | null>(null);

  // Sync external value -> scroll
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const top = (value - MIN) * ITEM_H;
    if (Math.abs(el.scrollTop - top) > 1) {
      programatik.current = true;
      el.scrollTo({ top, behavior: "auto" });
      window.setTimeout(() => {
        programatik.current = false;
      }, 30);
    }
  }, [value]);

  const onScroll = () => {
    const el = ref.current;
    if (!el || programatik.current) return;
    if (zaman.current) window.clearTimeout(zaman.current);
    const idx = Math.round(el.scrollTop / ITEM_H);
    const n = Math.max(MIN, Math.min(MAX, MIN + idx));
    if (n !== value) onChange(n);
    // settle / snap if needed
    zaman.current = window.setTimeout(() => {
      const hedef = (n - MIN) * ITEM_H;
      if (Math.abs(el.scrollTop - hedef) > 0.5) {
        programatik.current = true;
        el.scrollTo({ top: hedef, behavior: "smooth" });
        window.setTimeout(() => {
          programatik.current = false;
        }, 200);
      }
    }, 120);
  };

  return (
    <div className="relative h-[280px] select-none">
      {/* center highlight band */}
      <div
        className="pointer-events-none absolute inset-x-3 top-1/2 -translate-y-1/2 rounded-xl bg-primary/10 ring-1 ring-primary/30"
        style={{ height: ITEM_H }}
      />
      {/* fade gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-card to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-card to-transparent" />

      <div
        ref={ref}
        onScroll={onScroll}
        className="h-full overflow-y-scroll scrollbar-none"
        style={{
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div style={{ paddingTop: PAD * ITEM_H, paddingBottom: PAD * ITEM_H }}>
          {sayilar.map((n) => {
            const aktif = n === value;
            const fark = Math.abs(n - value);
            const opak = aktif ? 1 : Math.max(0.18, 1 - fark * 0.22);
            const olc = aktif ? 1.15 : Math.max(0.85, 1 - fark * 0.06);
            return (
              <div
                key={n}
                onClick={() => onChange(n)}
                className={`flex cursor-pointer items-center justify-center font-semibold tabular-nums transition-[opacity,transform] ${
                  aktif ? "text-primary" : "text-foreground"
                }`}
                style={{
                  height: ITEM_H,
                  scrollSnapAlign: "center",
                  opacity: opak,
                  transform: `scale(${olc})`,
                  fontSize: aktif ? 26 : 20,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SayiEditor({
  deger,
  max,
  ekKisa,
  duzenlenebilir,
  onKaydet,
}: {
  deger: number;
  max: number;
  ekKisa?: string;
  duzenlenebilir: boolean;
  onKaydet: (n: number) => void;
}) {
  const [acik, setAcik] = useState(false);
  const [taslak, setTaslak] = useState<string>(String(deger));

  useEffect(() => {
    if (acik) setTaslak(String(deger));
  }, [acik, deger]);

  if (!duzenlenebilir) {
    return (
      <span>
        {deger}
        {ekKisa ? <span className="text-muted-foreground">{ekKisa}</span> : null}
      </span>
    );
  }

  const kaydet = () => {
    const n = Number(taslak);
    if (!Number.isFinite(n)) return;
    const sinirli = Math.max(1, Math.min(max, Math.round(n)));
    onKaydet(sinirli);
    setAcik(false);
  };

  return (
    <Popover open={acik} onOpenChange={setAcik}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md px-2 py-1 font-medium hover:bg-muted/60"
        >
          {deger}
          {ekKisa ? <span className="text-muted-foreground">{ekKisa}</span> : null}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3" align="center">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={taslak}
            onChange={(e) => setTaslak(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") kaydet();
            }}
            autoFocus
            className="h-9 text-center text-base"
          />
          <Button size="sm" onClick={kaydet}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-center text-[11px] text-muted-foreground">
          1 - {max}
        </p>
      </PopoverContent>
    </Popover>
  );
}

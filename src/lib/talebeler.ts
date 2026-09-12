import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc,
  setDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export type SayfaKaydi = { t: number; sayfa: number };

export type KiraatYonu = "alttan" | "ustten";

export type Ders = "kuran" | "fikih" | "hadis";

export type Grup = "seviye1" | "seviye2" | "hazirlik";

export const GRUPLAR: { id: Grup; ad: string; hoca: string }[] = [
  { id: "seviye1", ad: "1. Seviye", hoca: "Abdurehim Hoca" },
  { id: "seviye2", ad: "2. Seviye", hoca: "Selahaddin Hoca" },
  { id: "hazirlik", ad: "Hazırlık", hoca: "Abdurrahman Hoca" },
];

export type Talebe = {
  id: string;
  isim: string;
  kiraat: boolean;
  kiraatGunler?: Record<string, number[]>;
  sayfa: number;
  hedefHaftalik?: number;
  gecmis: SayfaKaydi[];
  sira?: number;
  fotoUrl?: string;
  telefon?: string;
  dogum?: string;
  notlar?: string;
  yon?: KiraatYonu;
  fikihKonu?: number;
  fikihGunler?: Record<string, number[]>;
  hadisNo?: number;
  hadisGunler?: Record<string, number[]>;
  aidat?: Record<string, boolean>;
  grup?: Grup;
  sinif?: string;
  aidatSadece?: boolean;
  aidatHaric?: boolean;
};

const COL = "talebeler";

export function talebeleriDinle(
  cb: (t: Talebe[]) => void,
  onError?: (e: Error) => void,
) {
  const q = query(collection(db, COL), orderBy("sira", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const liste: Talebe[] = snap.docs.map((d) => {
        const v = d.data() as Partial<Talebe>;
        return {
          id: d.id,
          isim: v.isim ?? "Talebe",
          kiraat: !!v.kiraat,
          kiraatGunler:
            v.kiraatGunler && typeof v.kiraatGunler === "object"
              ? (v.kiraatGunler as Record<string, number[]>)
              : {},
          sayfa: typeof v.sayfa === "number" ? v.sayfa : 1,
          hedefHaftalik:
            typeof v.hedefHaftalik === "number" ? v.hedefHaftalik : 5,
          gecmis: Array.isArray(v.gecmis) ? v.gecmis : [],
          sira: typeof v.sira === "number" ? v.sira : 0,
          fotoUrl: typeof v.fotoUrl === "string" ? v.fotoUrl : undefined,
          telefon: typeof v.telefon === "string" ? v.telefon : undefined,
          dogum: typeof v.dogum === "string" ? v.dogum : undefined,
          notlar: typeof v.notlar === "string" ? v.notlar : undefined,
          yon: v.yon === "ustten" ? "ustten" : "alttan",
          fikihKonu: typeof v.fikihKonu === "number" ? v.fikihKonu : 1,
          fikihGunler:
            v.fikihGunler && typeof v.fikihGunler === "object"
              ? (v.fikihGunler as Record<string, number[]>)
              : {},
          hadisNo: typeof v.hadisNo === "number" ? v.hadisNo : 1,
          hadisGunler:
            v.hadisGunler && typeof v.hadisGunler === "object"
              ? (v.hadisGunler as Record<string, number[]>)
              : {},
          aidat:
            v.aidat && typeof v.aidat === "object"
              ? (v.aidat as Record<string, boolean>)
              : {},
          grup:
            v.grup === "seviye1" || v.grup === "seviye2" || v.grup === "hazirlik"
              ? v.grup
              : undefined,
          sinif: typeof v.sinif === "string" ? v.sinif : undefined,
          aidatSadece: v.aidatSadece === true,
          aidatHaric: v.aidatHaric === true,
        };
      });
      cb(liste);
    },
    (err) => {
      console.error("Firestore dinleme hatası", err);
      onError?.(err);
    },
  );
}

export async function talebeEkle(t: Omit<Talebe, "id">) {
  const ref = await addDoc(collection(db, COL), t);
  return ref.id;
}

export async function talebeGuncelle(
  id: string,
  patch: Partial<Omit<Talebe, "id">>,
) {
  await updateDoc(doc(db, COL, id), patch as Record<string, unknown>);
}

export async function talebeSil(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export async function topluHedefGuncelle(ids: string[], hedef: number) {
  const batch = writeBatch(db);
  ids.forEach((id) =>
    batch.update(doc(db, COL, id), { hedefHaftalik: hedef }),
  );
  await batch.commit();
}

// ---- Aidat (aylık ödeme) ----

const AYAR_COL = "ayarlar";
const AYAR_DOC = "genel";

export async function aidatTutariniOku(): Promise<number> {
  try {
    const snap = await getDoc(doc(db, AYAR_COL, AYAR_DOC));
    const v = snap.data()?.aidatTutar;
    return typeof v === "number" ? v : 0;
  } catch {
    return 0;
  }
}

export function aidatTutariniDinle(cb: (tutar: number) => void) {
  return onSnapshot(doc(db, AYAR_COL, AYAR_DOC), (snap) => {
    const v = snap.data()?.aidatTutar;
    cb(typeof v === "number" ? v : 0);
  });
}

export async function aidatTutariKaydet(tutar: number) {
  await setDoc(doc(db, AYAR_COL, AYAR_DOC), { aidatTutar: tutar }, { merge: true });
}

export async function aidatOdemeAyarla(
  t: Talebe,
  ayKey: string,
  odendi: boolean,
) {
  const harita = { ...(t.aidat ?? {}), [ayKey]: odendi };
  await talebeGuncelle(t.id, { aidat: harita });
}

// ---- Hoca e-postaları ve aidat hatırlatma kaydı ----

export type EkstraHoca = {
  id: string;
  ad: string;
  eposta: string;
  grup?: Grup; // boşsa genel özet gönderilir
};

export type HocaMailAyar = {
  mailler: Record<string, string>;
  gonderilen: Record<string, string[]>; // ayKey -> gönderilen grup id'leri
  ekstraHocalar: EkstraHoca[];
};

export function hocaMailAyarDinle(cb: (a: HocaMailAyar) => void) {
  return onSnapshot(doc(db, AYAR_COL, AYAR_DOC), (snap) => {
    const v = snap.data() ?? {};
    const ham = Array.isArray(v.ekstraHocalar) ? v.ekstraHocalar : [];
    cb({
      mailler:
        v.hocaMailler && typeof v.hocaMailler === "object"
          ? (v.hocaMailler as Record<string, string>)
          : {},
      gonderilen:
        v.aidatMailGonderim && typeof v.aidatMailGonderim === "object"
          ? (v.aidatMailGonderim as Record<string, string[]>)
          : {},
      ekstraHocalar: ham
        .filter(
          (h: unknown): h is Partial<EkstraHoca> =>
            !!h && typeof h === "object",
        )
        .map((h) => ({
          id: typeof h.id === "string" ? h.id : String(Math.random()),
          ad: typeof h.ad === "string" ? h.ad : "",
          eposta: typeof h.eposta === "string" ? h.eposta : "",
          grup:
            h.grup === "seviye1" || h.grup === "seviye2" || h.grup === "hazirlik"
              ? h.grup
              : undefined,
        }))
        .filter((h) => h.ad || h.eposta),
    });
  });
}

export async function ekstraHocalariKaydet(hocalar: EkstraHoca[]) {
  await setDoc(
    doc(db, AYAR_COL, AYAR_DOC),
    { ekstraHocalar: hocalar },
    { merge: true },
  );
}

export async function hocaMailleriKaydet(mailler: Record<string, string>) {
  await setDoc(
    doc(db, AYAR_COL, AYAR_DOC),
    { hocaMailler: mailler },
    { merge: true },
  );
}

export async function aidatMailGonderimIsaretle(
  ayKey: string,
  grupId: string,
  mevcut: Record<string, string[]>,
) {
  const liste = Array.from(new Set([...(mevcut[ayKey] ?? []), grupId]));
  await setDoc(
    doc(db, AYAR_COL, AYAR_DOC),
    { aidatMailGonderim: { ...mevcut, [ayKey]: liste } },
    { merge: true },
  );
}


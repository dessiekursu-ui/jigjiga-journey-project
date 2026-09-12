import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvJEa6olx2JX7YrsVbR0ZIwX7eJ90-T8E",
  authDomain: "dessie-talabe-takibi-verileri.firebaseapp.com",
  projectId: "dessie-talabe-takibi-verileri",
  storageBucket: "dessie-talabe-takibi-verileri.firebasestorage.app",
  messagingSenderId: "607580070031",
  appId: "1:607580070031:web:1d6299c0aa025629d010fa",
  measurementId: "G-EBMKCK0SSY",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics yalnızca tarayıcıda ve destekleniyorsa başlatılır.
if (typeof window !== "undefined") {
  void import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      try {
        if (await isSupported()) getAnalytics(app);
      } catch {
        /* yoksay */
      }
    })
    .catch(() => {
      /* yoksay */
    });
}

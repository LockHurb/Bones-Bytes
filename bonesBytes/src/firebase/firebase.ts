// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Función para probar la conexión a Firebase
export async function testFirebaseConnection() {
  try {
    // Escribir un valor de prueba
    await set(ref(db, "test/conexion"), { ok: true });

    // Leer el valor de prueba
    const snapshot = await get(ref(db, "test/conexion"));
    if (snapshot.exists()) {
      console.log("Conexión exitosa a Firebase:", snapshot.val());
      return true;
    } else {
      console.log("No se encontró el dato de prueba en Firebase.");
      return false;
    }
  } catch (error) {
    console.error("Error al conectar con Firebase:", error);
    return false;
  }
}
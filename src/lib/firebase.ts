import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAEJ4Ylh71Kl924ZReZU_Ugq0MyMxUyB90",
  authDomain: "rasoi-setu-3a173.firebaseapp.com",
  projectId: "rasoi-setu-3a173",
  storageBucket: "rasoi-setu-3a173.firebasestorage.app",
  messagingSenderId: "403647100613",
  appId: "1:403647100613:web:de964e95f40983c5f2e2ac",
  measurementId: "G-2S6GD80Y5Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
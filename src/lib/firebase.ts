import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ ATENÇÃO: Substitua "SUA_API_KEY" pela sua chave real do Firebase Console
// https://console.firebase.google.com -> Configurações do projeto -> Configuração do SDK
const firebaseConfig = {
  apiKey: "AIzaSyBV6UiMXY5EE8cArast3lZ8rwZ3tZyPy6M",
  authDomain: "lapcit-site.firebaseapp.com",
  projectId: "lapcit-site",
  storageBucket: "lapcit-site.firebasestorage.app",
  messagingSenderId: "656737620014",
  appId: "1:656737620014:web:32f72d06a29e3bf6034fbf"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export { firebaseConfig };

// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "lapcit-site.firebaseapp.com",
    projectId: "lapcit-site",
    storageBucket: "lapcit-site.firebasestorage.app",
    messagingSenderId: "656737620014",
    appId: "1:656737620014:web:32f72d06a29e3bf6034fbf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
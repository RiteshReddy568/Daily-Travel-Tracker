import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCEGLhHbwCuVxPP2BljkG2Xd_DaUif8fLg",
    authDomain: "travel-tracker-50441.firebaseapp.com",
    projectId: "travel-tracker-50441",
    storageBucket: "travel-tracker-50441.firebasestorage.app",
    messagingSenderId: "23630990565",
    appId: "1:23630990565:web:9b480f69da8b1f088cd80c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
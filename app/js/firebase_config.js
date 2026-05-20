import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, setPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- FIREBASE CONFIG ---
export const firebaseConfig = {
    apiKey: "AIzaSyDKuFUJyHUl5AIFSFHCg-4S_wadsha6Et4",
    authDomain: "recruitment-suite-hr.firebaseapp.com",
    projectId: "recruitment-suite-hr",
    storageBucket: "recruitment-suite-hr.firebasestorage.app",
    messagingSenderId: "1049067446272",
    appId: "1:1049067446272:web:a0eb4e5a9fac1589a8f8e5",
    measurementId: "G-87FVXXYEP7"
};

/** Configuration for the central Access Portal / Billing Hub */
export const hubConfig = {
    apiKey: "AIzaSyDhsrCX281ohlvo8Z3MKak0wYzISCND8x8",
    authDomain: "recruit-a.firebaseapp.com",
    projectId: "recruit-a",
    storageBucket: "recruit-a.firebasestorage.app",
    messagingSenderId: "564795783977",
    appId: "1:564795783977:web:47278f0aa8116192abd538",
    measurementId: "G-3RQJ52TLKW"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/** Hub App for central authorization */
export const hubApp = initializeApp(hubConfig, "Hub-Auth");
export const hubDb = initializeFirestore(hubApp, {});

// Set session persistence - login required when all browser tabs are closed
setPersistence(auth, browserSessionPersistence);

// --- INITIALIZE FIRESTORE ---
export const db = initializeFirestore(app, {});

/** Secondary Firebase app for admin user creation or hub sync without signing out the primary session. */
export function createSecondaryApp(name, config = firebaseConfig) {
    return initializeApp(config, name);
}

export { deleteApp };

export * from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
export * from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
export * from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";



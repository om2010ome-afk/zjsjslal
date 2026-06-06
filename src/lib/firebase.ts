// ============================================================
// Firebase Configuration
// ============================================================
// خطوات الإعداد:
// 1. اذهب إلى https://console.firebase.google.com
// 2. أنشئ مشروعاً جديداً أو اختر مشروعاً موجوداً
// 3. اذهب إلى Project Settings > General > Your apps > Add app > Web (</>)
// 4. انسخ الـ config وضعه هنا
// 5. اذهب إلى Authentication > Sign-in method وفعّل المزودين المطلوبين
// 6. أضف domain موقعك في Authentication > Settings > Authorized domains

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// ⚠️ ضع إعدادات مشروعك هنا من Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export const microsoftProvider = new OAuthProvider('microsoft.com');
microsoftProvider.addScope('User.Read');

export async function signInWithProvider(providerId: 'google' | 'facebook' | 'apple' | 'microsoft') {
  const providerMap = {
    google: googleProvider,
    facebook: facebookProvider,
    apple: appleProvider,
    microsoft: microsoftProvider,
  };
  const result = await signInWithPopup(auth, providerMap[providerId]);
  return result.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };

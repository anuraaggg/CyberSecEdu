import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBON6A8l0iCgb_HwLG65WeFt_HzbfNWvRk",
  authDomain: "cyber-app-f8bc8.firebaseapp.com",
  projectId: "cyber-app-f8bc8",
  storageBucket: "cyber-app-f8bc8.firebasestorage.app",
  messagingSenderId: "688122547388",
  appId: "1:688122547388:web:a3d59dd6a2545aabdb94b9",
  measurementId: "G-Z9KN69WQ3L",
  databaseURL: "https://cyber-app-f8bc8-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const analytics = getAnalytics(app); 
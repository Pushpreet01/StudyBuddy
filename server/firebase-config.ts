import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_O2hEsSUIi3zqDHW7ci9VTpMw1Djjyjw",
  authDomain: "studybuddy-8fca2.firebaseapp.com",
  projectId: "studybuddy-8fca2",
  storageBucket: "studybuddy-8fca2.firebasestorage.app",
  messagingSenderId: "612311461024",
  appId: "1:612311461024:web:c27828f38fea03a1e42dc5",
  measurementId: "G-E46SKY6LM7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
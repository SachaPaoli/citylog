import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCLtWBl2bnrmFlfFyob1yYr1o7RrxWo930",
  authDomain: "citylog-7e98e.firebaseapp.com",
  projectId: "citylog-7e98e",
  storageBucket: "citylog-7e98e.appspot.com",
  messagingSenderId: "974671653745",
  appId: "1:974671653745:web:7d9d2f3a90946bddf1a4d0"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);

// Initialisation Auth
const auth = getAuth(app);

// Initialisation Firestore
const db = getFirestore(app);

// Initialisation Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;

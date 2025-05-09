import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDfdUYnztw8s1qmuXcuh_jbne-VHgBa6yI',
  authDomain: 'test-proj-f15dc.firebaseapp.com',
  projectId: 'test-proj-f15dc',
  storageBucket: 'test-proj-f15dc.firebasestorage.app',
  messagingSenderId: '226343406917',
  appId: '1:226343406917:web:bf26afaedf5d903e09822c',
  measurementId: 'G-L0ND9JBLZF',
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app);
setPersistence(auth, browserLocalPersistence);
export const db = getFirestore(app);

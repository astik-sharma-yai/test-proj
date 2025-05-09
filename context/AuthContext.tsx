import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  applyActionCode,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types';

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          username: userData?.username || '',
          userId: userData?.userId || '',
          emailVerified: firebaseUser.emailVerified,
          createdAt: userData?.createdAt || new Date().toISOString(),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendVerificationEmail = async () => {
    const user = auth.currentUser;
    if (user) {
      await sendEmailVerification(user);
    }
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    await applyActionCode(auth, code);
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
      });
      return true;
    }
    return false;
  };

  const signup = async (
    email: string,
    password: string,
    username: string,
    userId: string
  ): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      username,
      userId,
      email,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    });

    await sendVerificationEmail();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      username,
      userId,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
  };

  const login = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    if (!firebaseUser.emailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    const userData = userDoc.data();

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      username: userData?.username || '',
      userId: userData?.userId || '',
      emailVerified: firebaseUser.emailVerified,
      createdAt: userData?.createdAt || new Date().toISOString(),
    };
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
    await AsyncStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        sendVerificationEmail,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

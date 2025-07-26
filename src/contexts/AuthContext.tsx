import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
// Import Timestamp from firestore
import { doc, getDoc, Timestamp } from 'firebase/firestore'; 
import { auth, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  role: 'retailer' | 'supplier';
  language: 'en' | 'hi';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log('User document found:', userDoc.data());
            const data = userDoc.data();
            const formattedUserData = {
              ...data,
              createdAt: (data.createdAt as Timestamp).toDate(),
            } as UserData;
            setUserData(formattedUserData);
          } else {
            // This can happen if the user is created but the Firestore doc isn't yet.
            // Let's add a small delay and retry once.
            console.warn("User document not found on first try for UID:", user.uid, "Retrying in 2 seconds...");
            setTimeout(async () => {
              const userDocRetry = await getDoc(doc(db, 'users', user.uid));
              if (userDocRetry.exists()) {
                console.log('User document found on retry:', userDocRetry.data());
                const data = userDocRetry.data();
                const formattedUserData = {
                  ...data,
                  createdAt: (data.createdAt as Timestamp).toDate(),
                } as UserData;
                setUserData(formattedUserData);
              } else {
                console.error("User document still not found after retry. User will not be logged in properly.");
                setUserData(null);
              }
            }, 2000);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);


  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    userData,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
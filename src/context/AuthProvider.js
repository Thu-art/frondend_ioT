import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, signup as apiSignup } from '../api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unregisterFcmToken } from '../services/fcmService';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getCurrentUser();
      setUser(u);
      setLoading(false);
    })();
  }, []);

  async function signIn(credentials) {
    const data = await apiLogin(credentials);
    setUser(data.user);
    // Push notifications disabled in Expo Go; skip FCM registration
    return data;
  }

  async function signUp(payload) {
    const data = await apiSignup(payload);
    setUser(data.user);
    // Push notifications disabled; skip FCM registration
    return data;
  }

  async function signOut() {
    try {
      const token = await AsyncStorage.getItem('fcmToken');
      if (token) {
        await unregisterFcmToken(token);
        await AsyncStorage.removeItem('fcmToken');
      }
    } catch (e) {}
    // Clean per-user local alerts cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const toRemove = keys.filter((k) => k.startsWith('localAlerts:'));
      if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
    } catch (e) {}
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

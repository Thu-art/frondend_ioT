import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, getCurrentUser, signup as apiSignup } from '../api/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerFcmToken, unregisterFcmToken } from '../services/fcmService';
import * as Notifications from 'expo-notifications';

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
    // Try to obtain and register FCM token (Expo EAS builds)
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const devPush = await Notifications.getDevicePushTokenAsync({ provider: 'fcm' });
        const token = devPush?.data;
        if (token) {
          await AsyncStorage.setItem('fcmToken', token);
          const platform = 'android'; // simple default; adjust if needed
          await registerFcmToken(token, platform);
        }
      }
    } catch (e) {
      // Ignore if not configured for FCM in dev
    }
    return data;
  }

  async function signUp(payload) {
    const data = await apiSignup(payload);
    setUser(data.user);
    // Same as signIn – register token after signup
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const devPush = await Notifications.getDevicePushTokenAsync({ provider: 'fcm' });
        const token = devPush?.data;
        if (token) {
          await AsyncStorage.setItem('fcmToken', token);
          const platform = 'android';
          await registerFcmToken(token, platform);
        }
      }
    } catch (e) {}
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

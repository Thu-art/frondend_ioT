import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { connectAlertsStream } from "../src/utils/sse";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import FireAlertScreen from "../screens/FireAlertScreen";
import NotificationScreen from "../screens/NotificationScreen";
import DeviceListScreen from "../screens/DeviceListScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useRef();
  const tokenRef = useRef(null);
  const alertsKeyRef = useRef(null);
  const seenIdsRef = useRef(new Set());

  useEffect(() => {
    let disconnect = null;
    let unsubscribeNav = null;

    (async () => {
      // Seed storage key and seen IDs for dedup
      try {
        const uStr = await AsyncStorage.getItem('user');
        const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
        alertsKeyRef.current = `localAlerts:${uid}`;
        const existingRaw = await AsyncStorage.getItem(alertsKeyRef.current);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const seed = new Set();
        for (const it of existingList) if (it?.id) seed.add(String(it.id));
        seenIdsRef.current = seed;
      } catch {}

      const token = await AsyncStorage.getItem('token');
      tokenRef.current = token;
      if (!token) return; // don't connect until user logged in

      const persistAlerts = async (items) => {
        try {
          const key = alertsKeyRef.current;
          if (!key || !items?.length) return;
          const raw = await AsyncStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          const merged = [...items, ...list];
          const seen = new Set();
          const dedup = [];
          for (const it of merged) {
            const k = it?.id ? `id:${it.id}` : (it?.syncKey ? `sk:${it.syncKey}` : `ts:${it?.time || ''}::${it?.deviceName || ''}`);
            if (!seen.has(k)) { seen.add(k); dedup.push(it); }
          }
          await AsyncStorage.setItem(key, JSON.stringify(dedup));
        } catch {}
      };

      const onEvt = async (evt) => {
        try {
          if (evt.type === 'snapshot') {
            const mapped = (evt.data || []).map(a => ({
              id: a.id,
              deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị',
              deviceId: a.device_id || (a.device && a.device.id) || null,
              time: new Date(a.created_at || a.createdAt || Date.now()).toISOString(),
              message: a.message || ''
            }));
            await persistAlerts(mapped);
          } else if (evt.type === 'alert') {
            const a = evt.data;
            const norm = {
              id: a.id,
              deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị',
              deviceId: a.device_id || (a.device && a.device.id) || null,
              time: new Date(a.created_at || a.createdAt || Date.now()).toISOString(),
              message: a.message || ''
            };
            const isNew = norm.id ? !seenIdsRef.current.has(String(norm.id)) : true;
            await persistAlerts([norm]);
            if (isNew && norm.id) {
              seenIdsRef.current.add(String(norm.id));
              Vibration.vibrate([500, 500]);
              try {
                navigationRef.current?.navigate('FireAlertScreen', { deviceName: norm.deviceName, deviceId: norm.deviceId, alertId: norm.id });
              } catch {}
            }
          }
        } catch {}
      };

      const connect = () => {
        if (!disconnect) disconnect = connectAlertsStream(tokenRef.current, onEvt);
      };
      const disconnectNow = () => { if (disconnect) { disconnect(); disconnect = null; } };

      // Initial connect
      connect();

      // Pause/resume when route changes
      const handleStateChange = () => {
        try {
          const route = navigationRef.current?.getCurrentRoute?.();
          const onFire = route?.name === 'FireAlertScreen';
          if (onFire) disconnectNow(); else connect();
        } catch {}
      };
      unsubscribeNav = navigationRef.current?.addListener?.('state', handleStateChange);
    })();

    return () => {
      try { if (unsubscribeNav) unsubscribeNav(); } catch {}
      try { if (disconnect) disconnect(); } catch {}
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="DeviceListScreen" component={DeviceListScreen} />
        <Stack.Screen name="AddDeviceScreen" component={AddDeviceScreen} />
        <Stack.Screen name="FireAlertScreen" component={FireAlertScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectAlertsStream } from "../src/utils/sse";
import { createAlert } from "../src/services/alertService";

export default function NotificationScreen({ route, navigation }) {
  const [notifications, setNotifications] = useState([]);

  // Nhận cảnh báo mới từ FireAlertScreen
  useEffect(() => {
    if (route.params?.newAlert) {
      const raw = route.params.newAlert;
      // Normalize shape
      const norm = {
        id: raw.id || Date.now(),
        deviceName: raw.deviceName || raw.device_name || raw.device || 'Thiết bị',
        time: raw.time || raw.created_at || new Date().toISOString(),
        message: raw.message || ''
      };
      // persist manual alert to AsyncStorage so it remains across navigations
      (async () => {
        try {
          const key = 'localAlerts';
          const rawList = await AsyncStorage.getItem(key);
          const list = rawList ? JSON.parse(rawList) : [];
          // ensure syncKey for matching with server alerts
          const withSync = { ...norm, syncKey: raw.syncKey || `${norm.deviceName}::${norm.time}` };
          // avoid duplicate by syncKey
          if (!list.some(a => a.syncKey === withSync.syncKey)) {
            const newList = [withSync, ...list];
            await AsyncStorage.setItem(key, JSON.stringify(newList));

            // try to POST to server if logged in
            try {
              // createAlert accepts device code or id; here we only have deviceName so prefer sending device name as code
              const created = await createAlert({ code: withSync.deviceName, type: 'smoke', level: 0, message: withSync.message, syncKey: withSync.syncKey });
              // on success, remove local entry matching syncKey
              const remaining = newList.filter(l => l.syncKey !== withSync.syncKey);
              await AsyncStorage.setItem(key, JSON.stringify(remaining));
            } catch (e) {
              // if network/auth fails, keep local alert for later sync
            }
          }
        } catch (e) {
          // ignore storage errors
        }
      })();
      setNotifications(prev => [norm, ...prev]);
    }
  }, [route.params?.newAlert]);

  // Connect to SSE stream for realtime alerts
  useEffect(() => {
    let disconnect = null;
    (async () => {
      // Load persisted local alerts first
      const key = 'localAlerts';
      try {
        const rawList = await AsyncStorage.getItem(key);
        const list = rawList ? JSON.parse(rawList) : [];
        if (list.length) setNotifications(prev => [...list, ...prev]);
      } catch (e) {
        // ignore
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) return; // do not connect if not authenticated
      disconnect = connectAlertsStream(token,
        (evt) => {
          if (evt.type === 'snapshot') {
            // initial snapshot is an array of alerts
            // map server alert shape to UI shape
            const mapped = (evt.data || []).map(a => ({
              id: a.id,
              deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị',
              time: a.created_at || a.createdAt || new Date().toLocaleString(),
              message: a.message || ''
            }));
            // merge mapped server alerts with existing notifications (avoid dupes by id)
            setNotifications(prev => {
              const ids = new Set(prev.map(p => p.id));
              const toAdd = mapped.filter(m => !ids.has(m.id));
              const merged = [...toAdd, ...prev];
              // Also remove localAlerts that match any server alert (by syncKey or by device+time)
              (async () => {
                try {
                  const key = 'localAlerts';
                  const rawList = await AsyncStorage.getItem(key);
                  if (!rawList) return;
                  const list = JSON.parse(rawList);
                  const serverSyncKeys = new Set((mapped || []).map(a => a.syncKey || `${a.deviceName}::${a.time}`));
                  const serverIds = new Set((mapped || []).map(a => a.id).filter(Boolean));
                  const filtered = list.filter(l => !(serverSyncKeys.has(l.syncKey) || (l.id && serverIds.has(l.id))));
                  if (filtered.length !== list.length) await AsyncStorage.setItem(key, JSON.stringify(filtered));
                } catch (e) {
                  // ignore
                }
              })();
              return merged;
            });
          } else if (evt.type === 'alert') {
            const a = evt.data;
            const norm = { id: a.id, deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị', time: a.created_at || a.createdAt || new Date().toLocaleString(), message: a.message || '' };
            setNotifications(prev => [norm, ...prev]);
          } else if (evt.type === 'message') {
            // ignore generic messages
          }
        },
        () => console.log('SSE open'),
        (err) => console.warn('SSE error', err)
      );
    })();

    return () => {
      if (disconnect) disconnect();
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.alertItem}>
      <Text style={styles.alertText}>🔥 {item.deviceName}</Text>
      <Text style={styles.alertTime}>{item.time}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📢 Thông báo</Text>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#ff4444", 
    marginBottom: 15, 
    marginTop:50,
    textAlign: "center" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 16 },
  alertItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  alertText: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  alertTime: { fontSize: 14, color: "#555", marginTop: 4 },
  backButton: { marginTop: 20, padding: 15, backgroundColor: "#ff4444", borderRadius: 12, alignItems: "center" },
  backButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

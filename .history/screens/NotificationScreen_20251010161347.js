import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { connectAlertsStream } from "../src/utils/sse";
import { createAlert } from "../src/services/alertService";

export default function NotificationScreen({ route, navigation }) {
  const [notifications, setNotifications] = useState([]);

  // Nhận cảnh báo mới từ FireAlertScreen
  useEffect(() => {
    if (route.params?.newAlert) {
      const raw = route.params.newAlert;
      const norm = {
        id: raw.id || Date.now(),
        deviceName: raw.deviceName || raw.device_name || raw.device || 'Thiết bị',
        time: raw.time || raw.created_at || new Date().toISOString(),
        message: raw.message || ''
      };
      (async () => {
        try {
          const key = 'localAlerts';
          const rawList = await AsyncStorage.getItem(key);
          const list = rawList ? JSON.parse(rawList) : [];
          const withSync = { ...norm, syncKey: raw.syncKey || `${norm.deviceName}::${norm.time}` };
          if (!list.some(a => a.syncKey === withSync.syncKey)) {
            const newList = [withSync, ...list];
            await AsyncStorage.setItem(key, JSON.stringify(newList));
            try {
              await createAlert({ code: withSync.deviceName, type: 'smoke', level: 0, message: withSync.message, syncKey: withSync.syncKey });
              const remaining = newList.filter(l => l.syncKey !== withSync.syncKey);
              await AsyncStorage.setItem(key, JSON.stringify(remaining));
            } catch (e) {}
          }
        } catch (e) {}
      })();
      setNotifications(prev => [norm, ...prev]);
    }
  }, [route.params?.newAlert]);

  // Connect SSE stream
  useEffect(() => {
    let disconnect = null;
    (async () => {
      const key = 'localAlerts';
      try {
        const rawList = await AsyncStorage.getItem(key);
        const list = rawList ? JSON.parse(rawList) : [];
        if (list.length) setNotifications(prev => [...list, ...prev]);
      } catch (e) {}

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      disconnect = connectAlertsStream(token,
        (evt) => {
          if (evt.type === 'snapshot') {
            const mapped = (evt.data || []).map(a => ({
              id: a.id,
              deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị',
              time: a.created_at || a.createdAt || new Date().toLocaleString(),
              message: a.message || ''
            }));
            setNotifications(prev => {
              const ids = new Set(prev.map(p => p.id));
              const toAdd = mapped.filter(m => !ids.has(m.id));
              const merged = [...toAdd, ...prev];
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
                } catch (e) {}
              })();
              return merged;
            });
          } else if (evt.type === 'alert') {
            const a = evt.data;
            const norm = { id: a.id, deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị', time: a.created_at || a.createdAt || new Date().toLocaleString(), message: a.message || '' };
            setNotifications(prev => [norm, ...prev]);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#ff4444" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>📢 Thông báo</Text>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Đăng xuất",
              "Bạn có chắc muốn đăng xuất?",
              [
                { text: "Huỷ", style: "cancel" },
                { text: "Đăng xuất", style: "destructive", onPress: () => navigation.navigate("LoginScreen") }
              ]
            )
          }
        >
          <Ionicons name="home-outline" size={28} color="#ff4444" />
        </TouchableOpacity>
      </View>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 50,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff4444",
  },
  emptyText: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 16 },
  alertItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  alertText: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  alertTime: { fontSize: 14, color: "#555", marginTop: 4 },
});

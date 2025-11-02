import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { connectAlertsStream } from "../src/utils/sse";
import { ackAlert } from "../src/services/alertService";

export default function NotificationScreen({ route, navigation }) {
  const [notifications, setNotifications] = useState([]);

  function fmt(ts) {
    try {
      if (!ts) return new Date().toLocaleString('vi-VN');
      const s = typeof ts === 'string' ? ts.replace(' ', 'T') : ts;
      const d = new Date(s);
      return isNaN(d) ? new Date().toLocaleString('vi-VN') : d.toLocaleString('vi-VN');
    } catch {
      return new Date().toLocaleString('vi-VN');
    }
  }

  useEffect(() => {
    if (route.params?.newAlert) {
      const raw = route.params.newAlert;
        const norm = {
        id: raw.id || Date.now(),
        deviceName: raw.deviceName || raw.device_name || raw.device || 'Thi���t b��<',
        deviceId: raw.deviceId || raw.device_id || (raw.device && raw.device.id) || null,
        time: fmt(raw.time || raw.created_at),
        message: raw.message || ''
      };
      (async () => {
        try {
          const uStr = await AsyncStorage.getItem('user');
          const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
          const key = `localAlerts:${uid}`;
          const rawList = await AsyncStorage.getItem(key);
          const list = rawList ? JSON.parse(rawList) : [];
          const withSync = { ...norm, syncKey: raw.syncKey || `${norm.deviceName}::${norm.time}` };
          if (!list.some(a => a.syncKey === withSync.syncKey)) {
            const newList = [withSync, ...list];
            await AsyncStorage.setItem(key, JSON.stringify(newList));
            const remaining = newList.filter(l => l.syncKey !== withSync.syncKey);
            await AsyncStorage.setItem(key, JSON.stringify(remaining));
          }
        } catch (e) {}
      })();
      setNotifications(prev => [norm, ...prev]);
    }
  }, [route.params?.newAlert]);

  useEffect(() => {
    let disconnect = null;
    (async () => {
      const uStr = await AsyncStorage.getItem('user');
      const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
      const key = `localAlerts:${uid}`;
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
              deviceId: a.device_id || (a.device && a.device.id) || null,
              time: fmt(a.created_at || a.createdAt),
              message: a.message || ''
            }));
            setNotifications(prev => {
              const ids = new Set(prev.map(p => p.id));
              const toAdd = mapped.filter(m => !ids.has(m.id));
              return [...toAdd, ...prev];
            });
          } else if (evt.type === 'alert') {
            const a = evt.data;
            const norm = { id: a.id, deviceName: a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị', deviceId: a.device_id || (a.device && a.device.id) || null, time: fmt(a.created_at || a.createdAt), message: a.message || '' };
            setNotifications(prev => [norm, ...prev]);
          }
        },
        () => console.log('SSE open'),
        (err) => console.warn('SSE error', err)
      );
    })();

    return () => { if (disconnect) disconnect(); };
  }, []);

  const handleAck = async (item) => {
    if (!item?.id) return;
    try {
      await ackAlert(item.id);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
    } catch (e) {}
  };

  const renderItem = ({ item }) => (
    <View style={styles.alertItem}>
      <Text style={styles.alertText}>🔥 {item.deviceName}</Text>
      <Text style={styles.alertTime}>{item.time}</Text>
      {item.id ? (
        <TouchableOpacity style={styles.ackButton} onPress={() => handleAck(item)}>
          <Text style={styles.ackButtonText}>Đã xử lý</Text>
        </TouchableOpacity>
      ) : null}
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

        <TouchableOpacity onPress={() => navigation.reset({ index: 0, routes: [{ name: "DeviceListScreen" }] })}>
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
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 50,
    marginBottom: 15,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff4444",
  },
  emptyText: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 16 },
  alertItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  alertText: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  alertTime: { fontSize: 14, color: "#555", marginTop: 4 },
  ackButton: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ackButtonText: { color: '#fff', fontWeight: 'bold' },
});

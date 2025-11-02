import React, { useState, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ackAlert } from "../src/services/alertService";

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  function fmt(ts) {
    try {
      const d = ts ? new Date(ts) : new Date();
      return isNaN(d) ? new Date().toLocaleString('vi-VN') : d.toLocaleString('vi-VN');
    } catch {
      return new Date().toLocaleString('vi-VN');
    }
  }

  const loadFromStorage = useCallback(async () => {
    try {
      const uStr = await AsyncStorage.getItem('user');
      const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
      const key = `localAlerts:${uid}`;
      const rawList = await AsyncStorage.getItem(key);
      const list = rawList ? JSON.parse(rawList) : [];
      const normalized = list.map(it => ({ ...it, time: fmt(it.time || it.created_at || it.createdAt) }));
      const seen = new Set();
      const dedup = [];
      for (const it of normalized) {
        const k = it?.id ? `id:${it.id}` : (it?.syncKey ? `sk:${it.syncKey}` : `ts:${it?.time || ''}::${it?.deviceName || ''}`);
        if (!seen.has(k)) { seen.add(k); dedup.push(it); }
      }
      setNotifications(dedup);
    } catch {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFromStorage();
      return undefined;
    }, [loadFromStorage])
  );

  const handleAck = async (item) => {
    if (!item?.id) return;
    try {
      await ackAlert(item.id);
      setNotifications(prev => prev.filter(n => n.id !== item.id));
      try {
        const uStr = await AsyncStorage.getItem('user');
        const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
        const key = `localAlerts:${uid}`;
        const rawList = await AsyncStorage.getItem(key);
        const list = rawList ? JSON.parse(rawList) : [];
        const filtered = list.filter(a => (a.id && item.id) ? a.id !== item.id : (a.syncKey && item.syncKey) ? a.syncKey !== item.syncKey : true);
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
      } catch {}
    } catch {}
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#ff4444" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📣 Thông báo</Text>
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
          keyExtractor={(item, index) => (item.id ? `id:${item.id}` : (item.syncKey ? `sk:${item.syncKey}` : `idx:${index}`))}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 50, marginBottom: 15 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 28, fontWeight: "bold", color: "#ff4444" },
  emptyText: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 16 },
  alertItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  alertText: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  alertTime: { fontSize: 14, color: "#555", marginTop: 4 },
  ackButton: { marginTop: 8, alignSelf: 'flex-start', backgroundColor: '#28a745', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ackButtonText: { color: '#fff', fontWeight: 'bold' },
});


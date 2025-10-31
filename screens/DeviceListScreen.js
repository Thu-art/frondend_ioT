import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listDevices } from "../src/services/deviceService";

export default function DeviceListScreen({ navigation, route }) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const serverDevices = await listDevices();
        if (!mounted) return;
        const mapped = serverDevices.map(d => ({
          deviceId: d.code,
          deviceName: d.name,
          location: d.location,
          id: d.id
        }));
        setDevices(mapped);
      } catch (err) {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const newDev = route.params?.newDevice;
    if (newDev) {
      setDevices(prev => {
        if (prev.some(d => d.deviceId === newDev.deviceId)) return prev;
        return [newDev, ...prev];
      });
    }
  }, [route.params?.newDevice]);

  const handleDeleteDevice = () => {
    if (!selectedDeviceId) return;
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xoá thiết bị này?",
      [
        { text: "Huỷ", style: "cancel" },
        { text: "Xoá", style: "destructive", onPress: () => {
          setDevices(prev => prev.filter(d => d.deviceId !== selectedDeviceId));
          setSelectedDeviceId(null);
        }}
      ]
    );
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedDeviceId === item.deviceId;
    return (
      <TouchableOpacity
        style={[styles.deviceItem, isSelected && styles.selectedDevice]}
        onPress={() => setSelectedDeviceId(item.deviceId === selectedDeviceId ? null : item.deviceId)}
      >
        <Text style={styles.deviceName}>{item.deviceName}</Text>
        <Text style={styles.deviceId}>Mã: {item.deviceId}</Text>
        <Text style={styles.deviceLocation}>Vị trí: {item.location}</Text>
        <TouchableOpacity
          style={styles.alertButton}
          onPress={() => navigation.navigate("FireAlertScreen", { deviceName: item.deviceName, deviceId: item.id })}
        >
          <Text style={styles.alertButtonText}>🚨 Cảnh báo</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#ff4444" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Đăng xuất",
              "Bạn có chắc muốn đăng xuất?",
              [
                { text: "Huỷ", style: "cancel" },
                { text: "Đăng xuất", style: "destructive", onPress: () => { navigation.navigate("LoginScreen"); }}
              ]
            )
          }
        >
          <Ionicons name="home-outline" size={28} color="#ff4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>📋 Danh sách thiết bị</Text>

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có thiết bị nào</Text>}
      />

      {/* Hàng nút 1: Thêm + Xoá */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddDeviceScreen")}>
          <Text style={styles.buttonText}>➕ Thêm thiết bị</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, !selectedDeviceId && styles.disabledButton]}
          onPress={handleDeleteDevice}
          disabled={!selectedDeviceId}
        >
          <Text style={styles.buttonText}>❌ Xoá thiết bị</Text>
        </TouchableOpacity>
      </View>

      {/* Hàng nút 2: Thông báo + Cảnh báo */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate("NotificationScreen")}>
          <Text style={styles.buttonText}>📢 Thông báo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.alertButtonRow} onPress={() => navigation.navigate("FireAlertScreen")}>
          <Text style={styles.buttonText}>🚨 Cảnh báo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop:30, marginBottom:10 },
  title: { fontSize: 28, fontWeight: "bold", color: "#ff4444", marginBottom: 15, textAlign: "center" },

  deviceItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  selectedDevice: { backgroundColor: "#ffe6e6" },
  deviceName: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  deviceId: { fontSize: 14, color: "#555", marginTop: 4 },
  deviceLocation: { fontSize: 14, color: "#555", marginTop: 2 },
  alertButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 12, marginTop: 10, alignItems: "center" },
  alertButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },

  // Hàng nút
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  addButton: { flex: 1, backgroundColor: "#00cc44", padding: 15, borderRadius: 12, alignItems: "center", marginRight: 10 },
  deleteButton: { flex: 1, backgroundColor: "#ff4444", padding: 15, borderRadius: 12, alignItems: "center", marginLeft: 10 },
  notificationButton: { flex: 1, backgroundColor: "#ff8800", padding: 15, borderRadius: 12, alignItems: "center", marginRight: 10 },
  alertButtonRow: { flex: 1, backgroundColor: "#ff4444", padding: 15, borderRadius: 12, alignItems: "center", marginLeft: 10 },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disabledButton: { opacity: 0.5 }
});

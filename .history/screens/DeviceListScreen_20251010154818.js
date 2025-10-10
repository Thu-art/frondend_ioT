import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { listDevices } from "../src/services/deviceService";

export default function DeviceListScreen({ navigation, route }) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Nhận thiết bị mới từ AddDeviceScreen
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
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // handle optimistic navigation param (after creating a device)
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
          onPress={() => navigation.navigate("FireAlertScreen", { deviceName: item.deviceName })}
        >
          <Text style={styles.alertButtonText}>🚨 Cảnh báo</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅ Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Alert.alert("Đăng xuất", "Bạn đã đăng xuất")}>
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

      <TouchableOpacity
  style={[styles.deleteButton, !selectedDeviceId && styles.disabledButton]}
  onPress={handleDeleteDevice}
  disabled={!selectedDeviceId} // disable khi chưa chọn
>
  <Text style={styles.deleteButtonText}>❌ Xoá thiết bị</Text>
  {/* Nút xoá thiết bị luôn hiển thị nhưng disable nếu chưa chọn */}
<TouchableOpacity
  style={[styles.deleteButton, !selectedDeviceId && styles.disabledButton]}
  onPress={handleDeleteDevice}
  disabled={!selectedDeviceId}
>
  <Text style={styles.deleteButtonText}>❌ Xoá thiết bị</Text>
</TouchableOpacity>

</TouchableOpacity>


      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddDeviceScreen")}
      >
        <Text style={styles.addButtonText}>➕ Thêm thiết bị mới</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate("NotificationScreen")}
      >
        <Text style={styles.notificationButtonText}>📢 Xem thông báo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  backText: { fontSize: 18, color: "#ff4444", fontWeight: "bold" },

  title: { fontSize: 28, fontWeight: "bold", color: "#ff4444", marginBottom: 15, marginTop: 10, textAlign: "center" },
  
  deviceItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedDevice: { backgroundColor: "#ffe6e6" },

  deviceName: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  deviceId: { fontSize: 14, color: "#555", marginTop: 4 },
  deviceLocation: { fontSize: 14, color: "#555", marginTop: 2 },

  alertButton: { backgroundColor: "#ff4444", padding: 10, borderRadius: 12, marginTop: 10, alignItems: "center" },
  alertButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },

  addButton: { backgroundColor: "#00cc44", padding: 15, borderRadius: 15, alignItems: "center", marginTop: 10 },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  notificationButton: { backgroundColor: "#ff8800", padding: 15, borderRadius: 15, alignItems: "center", marginTop: 10 },
  notificationButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  deleteButton: { backgroundColor: "#ff4444", padding: 15, borderRadius: 15, alignItems: "center", marginTop: 10 },
  deleteButtonText: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  disabledButton: { 
    opacity: 0.5 
  },

});

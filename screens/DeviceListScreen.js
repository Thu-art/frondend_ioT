import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

export default function DeviceListScreen({ navigation, route }) {
  const [devices, setDevices] = useState([]);

  // Nhận thiết bị mới từ AddDeviceScreen
  useEffect(() => {
    if (route.params?.newDevice) {
      setDevices(prev => [route.params.newDevice, ...prev]);
    }
  }, [route.params?.newDevice]);

  const renderItem = ({ item }) => (
    <View style={styles.deviceItem}>
      <Text style={styles.deviceName}>{item.deviceName}</Text>
      <Text style={styles.deviceId}>Mã: {item.deviceId}</Text>
      <Text style={styles.deviceLocation}>Vị trí: {item.location}</Text>

      <TouchableOpacity
        style={styles.alertButton}
        onPress={() =>
          navigation.navigate("FireAlertScreen", { deviceName: item.deviceName })
        }
      >
        <Text style={styles.alertButtonText}>🚨 Cảnh báo</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Danh sách thiết bị</Text>

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Chưa có thiết bị nào</Text>}
      />

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
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff0f0" },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#ff4444", 
    marginBottom: 15,
    marginTop: 50,
     textAlign: "center" },
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
  deviceName: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  deviceId: { fontSize: 14, color: "#555", marginTop: 4 },
  deviceLocation: { fontSize: 14, color: "#555", marginTop: 2 },
  alertButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  alertButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  emptyText: { textAlign: "center", marginTop: 50, fontSize: 16, color: "#999" },
  addButton: {
    backgroundColor: "#ff4444",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  notificationButton: {
    backgroundColor: "#ff8800",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  notificationButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

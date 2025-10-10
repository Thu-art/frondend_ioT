import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 dùng icon ngôi nhà

export default function DeviceListScreen({ navigation, route }) {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (route.params?.newDevice) {
      setDevices((prev) => [route.params.newDevice, ...prev]);
    }
  }, [route.params?.newDevice]);

  const handleSelect = (id) => {
    if (isDisabled) return;
    setSelectedDeviceId((prev) => (prev === id ? null : id));
  };

  const handleDelete = () => {
    if (!selectedDeviceId) {
      alert("Vui lòng chọn thiết bị để xoá!");
      return;
    }
    setDevices((prev) => prev.filter((d) => d.deviceId !== selectedDeviceId));
    setSelectedDeviceId(null);
    alert("Đã xoá thiết bị!");
  };

  const handleAddDevice = () => {
    setIsDisabled(true);
    navigation.navigate("AddDeviceScreen");
    setTimeout(() => setIsDisabled(false), 3000);
  };

  const handleViewNotification = () => {
    setIsDisabled(true);
    navigation.navigate("NotificationScreen");
    setTimeout(() => setIsDisabled(false), 3000);
  };

  // 👉 Hàm đăng xuất
  const handleLogout = () => {
    alert("Đăng xuất thành công!");
    navigation.navigate("LoginScreen"); // đổi sang màn hình bạn muốn
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleSelect(item.deviceId)}
      disabled={isDisabled}
      style={[
        styles.deviceItem,
        selectedDeviceId === item.deviceId && styles.selectedDevice,
      ]}
    >
      <Text
        style={[
          styles.deviceName,
          selectedDeviceId === item.deviceId && styles.boldText,
        ]}
      >
        {item.deviceName}
      </Text>
      <Text style={styles.deviceId}>Mã: {item.deviceId}</Text>
      <Text style={styles.deviceLocation}>Vị trí: {item.location}</Text>

      <TouchableOpacity
        style={[styles.alertButton, isDisabled && styles.disabledButton]}
        disabled={isDisabled}
        onPress={() =>
          navigation.navigate("FireAlertScreen", { deviceName: item.deviceName })
        }
      >
        <Text style={styles.alertButtonText}>🚨 Cảnh báo</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 🔝 Nút đăng xuất ở góc phải */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="home" size={15} color="#ff4444" />
        <Text style={styles.logoutText}></Text>
      </TouchableOpacity>

      <Text style={styles.title}>📋 Danh sách thiết bị</Text>

      <FlatList
        data={devices}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Chưa có thiết bị nào</Text>
        }
      />

      {/* 🔴 Nút xoá thiết bị */}
      <TouchableOpacity
        style={[styles.deleteButton, isDisabled && styles.disabledButton]}
        onPress={handleDelete}
        disabled={isDisabled}
      >
        <Text style={styles.deleteButtonText}>🗑️ Xoá thiết bị</Text>
      </TouchableOpacity>

      {/* 🟢 Nút thêm thiết bị */}
      <TouchableOpacity
        style={[styles.addButton, isDisabled && styles.disabledButton]}
        onPress={handleAddDevice}
        disabled={isDisabled}
      >
        <Text style={styles.addButtonText}>➕ Thêm thiết bị mới</Text>
      </TouchableOpacity>

      {/* 🟠 Nút xem thông báo */}
      <TouchableOpacity
        style={[styles.notificationButton, isDisabled && styles.disabledButton]}
        onPress={handleViewNotification}
        disabled={isDisabled}
      >
        <Text style={styles.notificationButtonText}>📢 Xem thông báo</Text>
      </TouchableOpacity>

      {/* ⬅ Quay lại */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff0f0" },

  // 🔝 style cho nút đăng xuất
  logoutButton: {
    position: "absolute",
    top: 10,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  logoutText: {
    color: "#ff4444",
    fontWeight: "bold",
    marginLeft: 5,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff4444",
    marginBottom: 15,
    marginTop: 80, // chừa chỗ cho nút đăng xuất
    textAlign: "center",
  },

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
  selectedDevice: {
    backgroundColor: "#ffe6e6",
    borderColor: "#ff4444",
    borderWidth: 2,
  },
  deviceName: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  boldText: { color: "#d90000", fontWeight: "900" },
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
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#999",
  },
  // 🟢 nút thêm (xanh lá)
  addButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // 🔴 nút xoá
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  // 🟠 nút xem thông báo
  notificationButton: {
    backgroundColor: "#ff8800",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  notificationButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backText: {
    marginTop: 20,
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
  },
  disabledButton: { opacity: 0.5 },
});

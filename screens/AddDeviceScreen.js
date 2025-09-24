import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddDeviceScreen({ navigation }) {
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");

  const handleSave = () => {
    if (!deviceId || !deviceName || !location) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newDevice = { deviceId, deviceName, location };
    // Trả dữ liệu về DeviceListScreen
    navigation.navigate("DeviceListScreen", { newDevice });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Thêm thiết bị báo cháy</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="barcode-outline" size={22} color="#ff4444" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mã thiết bị"
          value={deviceId}
          onChangeText={setDeviceId}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="hardware-chip-outline" size={22} color="#ff4444" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Tên thiết bị"
          value={deviceName}
          onChangeText={setDeviceName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={22} color="#ff4444" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Vị trí lắp đặt"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <LinearGradient colors={["#ff4444", "#ff8800"]} style={styles.gradient}>
          <Text style={styles.buttonText}>💾 Lưu Thiết Bị</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff0f0",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ff4444",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  button: {
    width: "100%",
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#ff4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  gradient: { padding: 15, alignItems: "center", borderRadius: 15 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  backText: { marginTop: 20, color: "#ff4444", fontSize: 16, textAlign: "center" },
});

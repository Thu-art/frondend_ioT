import { Ionicons } from "@expo/vector-icons"; 
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { addDevice } from "../src/services/deviceService";

export default function AddDeviceScreen({ navigation, route }) {
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [location, setLocation] = useState("");

  const handleSave = async () => {
    if (!deviceId || !deviceName || !location) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const created = await addDevice({ code: deviceId.trim(), name: deviceName.trim(), location: location.trim() });
      const newDevice = { 
        deviceId: created.code || deviceId, 
        deviceName: created.name || deviceName, 
        location: created.location || location, 
        id: created.id 
      };

      // Gọi callback onSave nếu có
      if (route.params?.onSave) {
        route.params.onSave(newDevice);
      }

      navigation.goBack();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Lưu thiết bị thất bại';
      alert(msg);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#ff4444" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Thêm thiết bị báo cháy</Text>

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

      <ScrollView contentContainerStyle={styles.form}>
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
          <LinearGradient colors={["#00cc44", "#00ff66"]} style={styles.gradient}>
            <Text style={styles.buttonText}>💾 Lưu Thiết Bị</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ff4444",
  },
  form: {
    padding: 20,
    alignItems: "center",
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
    shadowColor: "#00cc44",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  gradient: { padding: 15, alignItems: "center", borderRadius: 15 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});

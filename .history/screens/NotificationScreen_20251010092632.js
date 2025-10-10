import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

export default function NotificationScreen({ route, navigation }) {
  const [notifications, setNotifications] = useState([]);

  // Nhận cảnh báo mới từ FireAlertScreen
  useEffect(() => {
    if (route.params?.newAlert) {
      setNotifications(prev => [route.params.newAlert, ...prev]);
    }
  }, [route.params?.newAlert]);

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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff0f0"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ff4444",
    marginBottom: 15,
    marginTop: 50,
    textAlign: "center"
  },
  emptyText: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 16 },
  alertItem: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  alertText: { fontSize: 18, fontWeight: "bold", color: "#ff4444" },
  alertTime: { fontSize: 14, color: "#555", marginTop: 4 },
  backButton: { marginTop: 20, padding: 15, backgroundColor: "#ff4444", borderRadius: 12, alignItems: "center" },
  backButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  backText: { 
    marginTop: 20, 
    color: "#ff4444", 
    fontSize: 16, 
    textAlign: "center" 
  },
});

import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration } from "react-native";

export default function FireAlertScreen({ navigation, route }) {
  const deviceName = route?.params?.deviceName || "Thiết bị không xác định";
  const [flashAnim] = useState(new Animated.Value(0));
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    ).start();

    Vibration.vibrate([500, 500], true);

    return () => Vibration.cancel();
  }, []);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ff0000", "#ffffff"],
  });

  const handleSafe = () => {
    Vibration.cancel();
    const alert = { deviceName, time: new Date().toLocaleString() };
    navigation.navigate("NotificationScreen", { newAlert: alert });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Ionicons name="alert-circle-outline" size={80} color="#fff" />
      <Text style={styles.alertText}>🔥 CẢNH BÁO CHÁY!</Text>
      <Text style={styles.deviceText}>Thiết bị: {deviceName}</Text>

      {!showVideo ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => setShowVideo(true)}>
            <Text style={styles.buttonText}>▶ Xem video hướng dẫn thoát hiểm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: "#28a745" }]} onPress={handleSafe}>
            <Text style={styles.buttonText}>✅ Tôi an toàn</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Video
          source={require("../assets/escape_guide.mp4")}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay
          useNativeControls
          style={styles.video}
        />
      )}
    </Animated.View>
  );
}
<TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Quay lại</Text>
      </TouchableOpacity>
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  alertText: { fontSize: 32, fontWeight: "bold", color: "#fff", marginTop: 10, textAlign: "center" },
  deviceText: { fontSize: 18, color: "#fff", marginVertical: 20 },
  button: { backgroundColor: "#ff4444", padding: 15, borderRadius: 10, marginVertical: 10, width: "80%", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  video: { 
    width: "100%", 
    height: 300, 
    marginTop: 20 
  },
  backText: 
  { 
    marginTop: 20, 
    color: "#ff4444", 
    fontSize: 16, 
    textAlign: "center" 
  },
});

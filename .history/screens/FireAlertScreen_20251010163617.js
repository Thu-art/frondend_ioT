import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View, Alert } from "react-native";

export default function FireAlertScreen({ navigation, route }) {
  const deviceName = route?.params?.deviceName || "Thiết bị không xác định";
  const [flashAnim] = useState(new Animated.Value(0));
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Nhấp nháy nền
    Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 700, useNativeDriver:false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 700, useNativeDriver:false }),
      ])
    ).start();

    // Rung liên tục
    Vibration.vibrate([500,500], true);

    return () => Vibration.cancel();
  }, []);

  const backgroundColor = flashAnim.interpolate({
    inputRange:[0,1],
    outputRange:["#ff0000","#ffffff"],
  });

  const handleSafe = () => {
    Vibration.cancel();
    const iso = new Date().toISOString();
    const alert = { deviceName, time: iso, syncKey: `${deviceName}::${iso}` };
    navigation.navigate("NotificationScreen",{ newAlert: alert });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={28} color="#ff4444" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>🔥 Cảnh báo cháy</Text>

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

      {/* Nội dung */}
      <Ionicons name="alert-circle-outline" size={80} color="#fff" style={{marginTop:50}}/>
      <Text style={styles.alertText}>CẢNH BÁO CHÁY!</Text>
      <Text style={styles.deviceText}>Thiết bị: {deviceName}</Text>

      {!showVideo ? (
        <>
          <TouchableOpacity style={styles.button} onPress={()=>setShowVideo(true)}>
            <Text style={styles.buttonText}>▶ Xem video hướng dẫn thoát hiểm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button,{backgroundColor:'#28a745'}]} onPress={handleSafe}>
            <Text style={styles.buttonText}>✅ Tôi an toàn</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Video source={require("../assets/escape_guide.mp4")}
          rate={1.0} volume={1.0} isMuted={false} resizeMode="contain"
          shouldPlay useNativeControls style={styles.video} />
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, justifyContent:'center', alignItems:'center' },
  
  // Header
  header: { 
    flexDirection:'row', 
    justifyContent:'space-between', 
    alignItems:'center', 
    width:'100%', 
    paddingHorizontal:20, 
    marginTop:50, 
    marginBottom:20, 
    position:'absolute', 
    top:0
  },
  headerTitle:{ fontSize:20, fontWeight:'bold', color:'#ff4444' },

  alertText:{ fontSize:32, fontWeight:'bold', color:'#fff', marginTop:10, textAlign:'center' },
  deviceText:{ fontSize:18, color:'#fff', marginVertical:20 },

  button:{ backgroundColor:'#ff4444', padding:15, borderRadius:10, marginVertical:10, width:'80%', alignItems:'center' },
  buttonText:{ color:'#fff', fontSize:16, fontWeight:'bold' },

  video:{ width:'100%', height:300, marginTop:20 },
});

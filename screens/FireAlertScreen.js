import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, Vibration, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VideoView, useVideoPlayer } from 'expo-video';
import { markSafe } from '../src/services/deviceService';
import { ackAlert } from '../src/services/alertService';

export default function FireAlertScreen({ navigation, route }) {
  const deviceName = route?.params?.deviceName || 'Thiết bị không xác định';
  const [flashAnim] = useState(new Animated.Value(0));
  const [showVideo, setShowVideo] = useState(false);
  const player = useVideoPlayer(require('../assets/escape_guide.mp4'), (p) => {
    try { p.muted = false; p.volume = 1; p.loop = false; } catch (e) {}
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(flashAnim, { toValue: 0, duration: 700, useNativeDriver: false }),
      ])
    );
    loop.start();
    Vibration.vibrate([500, 500], true);
    return () => { loop.stop(); Vibration.cancel(); };
  }, []);

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ff0000', '#ffffff'],
  });

  const handleSafe = async () => {
    try {
      const alertId = route?.params?.alertId;
      const deviceId = route?.params?.deviceId;
      if (alertId) {
        try { await ackAlert(alertId); } catch (e) {}
      }
      if (deviceId) {
        try { await markSafe(deviceId); } catch (e) {}
      }
    } catch (e) {}
    Vibration.cancel();
    // Gỡ alert đã xử lý khỏi cache local
    try {
      const alertId = route?.params?.alertId;
      if (alertId) {
        const uStr = await AsyncStorage.getItem('user');
        const uid = uStr ? (JSON.parse(uStr).id || 'anon') : 'anon';
        const key = `localAlerts:${uid}`;
        const rawList = await AsyncStorage.getItem(key);
        const list = rawList ? JSON.parse(rawList) : [];
        const filtered = list.filter(a => a.id ? a.id !== alertId : true);
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
      }
    } catch (e) {}
    navigation.replace('NotificationScreen');
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name='arrow-back-outline' size={28} color='#ff4444' />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cảnh báo cháy</Text>
        <TouchableOpacity onPress={() => { Vibration.cancel(); navigation.reset({ index: 0, routes: [{ name: 'DeviceListScreen' }] }); }}>
          <Ionicons name='home-outline' size={28} color='#ff4444' />
        </TouchableOpacity>
      </View>

      <Ionicons name='alert-circle-outline' size={80} color='#fff' style={{ marginTop: 50 }} />
      <Text style={styles.alertText}>CẢNH BÁO CHÁY!</Text>
      <Text style={styles.deviceText}>Thiết bị: {deviceName}</Text>

      {!showVideo ? (
        <>
          <TouchableOpacity style={styles.button} onPress={() => setShowVideo(true)}>
            <Text style={styles.buttonText}>Xem video hướng dẫn thoát nạn</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: '#28a745' }]} onPress={handleSafe}>
            <Text style={styles.buttonText}>Đánh dấu an toàn</Text>
          </TouchableOpacity>
        </>
      ) : (
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls
          contentFit='contain'
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20, marginTop: 50, marginBottom: 20, position: 'absolute', top: 0 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ff4444' },
  alertText: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginTop: 10, textAlign: 'center' },
  deviceText: { fontSize: 18, color: '#fff', marginVertical: 20 },
  button: { backgroundColor: '#ff4444', padding: 15, borderRadius: 10, marginVertical: 10, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  video: { width: '100%', height: 300, marginTop: 20 },
});

import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { connectAlertsStream } from "../src/utils/sse";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vibration } from 'react-native';

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import FireAlertScreen from "../screens/FireAlertScreen";
import NotificationScreen from "../screens/NotificationScreen";
import DeviceListScreen from "../screens/DeviceListScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useRef();

  useEffect(() => {
    let disconnect = null;
    (async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) return; // don't connect until user logged in
  disconnect = connectAlertsStream(token, (evt) => {
        if (evt.type === 'alert') {
          const a = evt.data;
          const deviceName = a.device_name || (a.device && a.device.name) || a.deviceName || 'Thiết bị';
          const deviceId = a.device_id || (a.device && a.device.id) || null;
          // vibrate and navigate to FireAlertScreen
          Vibration.vibrate([500, 500]);
          try {
            navigationRef.current?.navigate('FireAlertScreen', { deviceName, deviceId });
          } catch (e) {
            // ignore navigation errors
          }
        }
      });
    })();

    return () => { if (disconnect) disconnect(); };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="DeviceListScreen" component={DeviceListScreen} />
        <Stack.Screen name="AddDeviceScreen" component={AddDeviceScreen} />
        <Stack.Screen name="FireAlertScreen" component={FireAlertScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import AddDeviceScreen from "../screens/AddDeviceScreen";
import FireAlertScreen from "../screens/FireAlertScreen";
import NotificationScreen from "../screens/NotificationScreen";
import DeviceListScreen from "../screens/DeviceListScreen";
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
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

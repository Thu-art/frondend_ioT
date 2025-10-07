// App.js
import React from "react";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

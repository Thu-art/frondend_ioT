import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // 👈 THÊM DÒNG NÀY
import { AuthContext } from "../src/context/AuthProvider";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 THÊM STATE
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await signIn({ email, password });
      navigation.replace("DeviceListScreen");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Login failed';
      alert(msg);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Ô nhập mật khẩu + icon con mắt */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogin}>
        <LinearGradient colors={["#ff4444", "#ff8888"]} style={styles.button}>
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#fff0f0',
    padding:20
  },
  title: {
    fontSize:32,
    fontWeight:'bold',
    color:'#ff4444',
    marginBottom:30
  },
  input: {
    width:'100%',
    padding:15,
    marginBottom:20,
    backgroundColor:'#fff',
    borderRadius:15,
    borderWidth:1,
    borderColor:'#ffbbbb',
    fontSize:16,
    shadowColor: "#000",
    shadowOffset: { width:0, height:2 },
    shadowOpacity:0.1,
    shadowRadius:3,
    elevation:3
  },
  passwordContainer: {
    width: '100%',
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  button: {
    width:'100%',
    padding:15,
    borderRadius:15,
    alignItems:'center',
    marginTop:10,
    marginBottom:15,
    shadowColor: "#ff4444",
    shadowOffset: { width:0, height:4 },
    shadowOpacity:0.3,
    shadowRadius:5,
    elevation:5
  },
  buttonText: {
    color:'#fff',
    fontSize:18,
    fontWeight:'bold'
  },
  link: {
    marginTop:10,
    color:'#ff4444',
    fontSize:16
  }
});

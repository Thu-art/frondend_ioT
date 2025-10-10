import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // ✅ thêm icon con mắt

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ state ẩn/hiện mật khẩu

  const handleSignup = () => {
    alert("Đăng ký thành công!");
    navigation.replace("LoginScreen");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo tài khoản</Text>

      <TextInput
        placeholder="Họ và tên"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Ô nhập mật khẩu + icon con mắt */}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mật khẩu"
          style={[styles.input, { flex: 1, marginVertical: 0 }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword} // ✅ đổi true/false
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)} // ✅ toggle
        >
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={24}
            color="#ff4444"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignup}>
        <LinearGradient colors={["#ff4444", "#ff8888"]} style={styles.button}>
          <Text style={styles.buttonText}>Đăng ký</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
        <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff0f0",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#ff4444",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ffbbbb",
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
  },
  button: {
    padding: 15,
    borderRadius: 15,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#ff4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#ff4444",
    fontSize: 16,
  },
});

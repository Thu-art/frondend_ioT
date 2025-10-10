import { useState, useContext } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../src/context/AuthProvider";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signUp } = useContext(AuthContext);

  const handleSignup = async () => {
    try {
      await signUp({ name, email, password });
      navigation.replace("DeviceListScreen");
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Signup failed';
      alert(msg);
    }
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
        autoCapitalize="none"
      /> 
      <View style={styles.input}>
        <TextInput
          placeholder="Mật khẩu"
          style={{ flex: 1, paddingVertical:15, fontSize:16 }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={24} 
            color="#ff4444" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleSignup}>
        <LinearGradient
          colors={["#ff4444", "#ff8888"]}
          style={styles.button}
        >
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
    justifyContent:"center",
    padding:20,
    backgroundColor:"#fff0f0"
  },
  title: {
    fontSize:32,
    fontWeight:"bold",
    marginBottom:30,
    textAlign:"center",
    color:"#ff4444"
  },
  input: {
    paddingVertical:10, fontSize:1,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:"#fff",
    borderRadius:15,
    paddingHorizontal:15,
    marginVertical:10,
    shadowColor: "#000",
    shadowOffset: { width:0, height:2 },
    shadowOpacity:0.1,
    shadowRadius:3,
    elevation:3
  },
  button: {
    padding:15,
    borderRadius:15,
    marginTop:20,
    alignItems:"center",
    shadowColor:"#ff4444",
    shadowOffset:{ width:0, height:4 },
    shadowOpacity:0.3,
    shadowRadius:5,
    elevation:5
  },
  buttonText: {
    color:"#fff",
    fontSize:18,
    fontWeight:"bold"
  },
  link: {
    marginTop:15,
    textAlign:"center",
    color:"#ff4444",
    fontSize:16
  }
});

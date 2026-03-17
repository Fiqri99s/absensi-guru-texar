import React, { useState } from "react";
import { View, StyleSheet, Image } from "react-native";
import { Text, TextInput, Button, Surface, Avatar } from "react-native-paper";
import { supabase } from "../services/supabase";

const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secureText, setSecureText] = useState(true);

  const prosesLogin = async () => {
    if (username === "" || password === "") {
      alert("Username dan Password tidak boleh kosong!");
      return;
    }

    setLoading(true);

    // Mencari di tabel_user berdasarkan username DAN password
    const { data, error } = await supabase.from("tabel_user").select("*").eq("username", username).eq("password", password).single();

    setLoading(false);

    if (data) {
      console.log("Login Berhasil sebagai:", data.role);
      onLoginSuccess(data); // Lempar data user ke App.js
    } else {
      console.log("Error Login:", error?.message);
      alert("Username atau Password salah!");
    }
  };

  return (
    <View style={styles.layar}>
      <Surface style={styles.kartu} elevation={3}>
        <Image source={require("../../assets/logo-texar.png")} style={styles.logo} resizeMode="contain" />
        {/* <Avatar.Icon size={70} icon="lock-check" backgroundColor="#2196F3" style={{ marginBottom: 10 }} /> */}
        <Text style={styles.judul}>SISTEM PRESENSI</Text>
        <Text style={styles.sub}>SMK TEXAR KLARI KARAWANG</Text>

        <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" textColor="#03075e" style={styles.input} activeOutlineColor="#2196F3" outlineColor="#E0E0E0" left={<TextInput.Icon icon="account" />} />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          textColor="#03075e"
          secureTextEntry={secureText}
          style={styles.input}
          activeOutlineColor="#2196F3"
          outlineColor="#E0E0E0"
          left={<TextInput.Icon icon="key" />}
          right={<TextInput.Icon icon={secureText ? "eye" : "eye-off"} onPress={() => setSecureText(!secureText)} />}
        />

        <Button mode="contained" onPress={prosesLogin} loading={loading} disabled={loading} style={[styles.tombol, { cursor: "pointer" }]} contentStyle={{ height: 50 }} labelStyle={{ color: "white" }}>
          {loading ? "Checking..." : "MASUK"}
        </Button>
      </Surface>

      <Text style={styles.version}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  layar: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "#F5F7FA" },
  kartu: { padding: 30, borderRadius: 25, backgroundColor: "white", alignItems: "center" },
  judul: { fontSize: 22, fontWeight: "bold", color: "#333" },
  sub: { fontSize: 12, color: "#757575", marginBottom: 25, letterSpacing: 1 },
  input: { width: "100%", marginBottom: 15, backgroundColor: "white" },
  tombol: { width: "100%", marginTop: 10, borderRadius: 12, backgroundColor: "#2196F3" },
  logo: { width: 80, height: 80, marginBottom: 10, alignSelf: "center" },
  version: { textAlign: "center", color: "#B0BEC5", fontSize: 11, marginVertical: 25 },
});

export default LoginScreen;

import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Text, Avatar, Card, Button, TextInput, Appbar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../services/supabase";

const UserProfile = ({ user, onLogout, onBack, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Konfigurasi Warna Dinamis
  const primaryColor = "#1976D2";
  const bgColor = isDarkMode ? "#121212" : "#F8F9FA";
  const cardColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const inputBg = isDarkMode ? "#2C2C2C" : "#FFFFFF";

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("tabel_user").select("*").eq("id", user.id).single();

      if (error) throw error;
      if (data) {
        setFullName(data.full_name);
        setUsername(data.username);
        setPassword(data.password);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const pilihFoto = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Izin Ditolak", "Aplikasi butuh izin galeri.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Foto utuh (tidak terpotong)
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("tabel_user")
        .update({
          full_name: fullName,
          username: username,
          password: password,
          avatar_url: avatarUrl,
        })
        .eq("id", user.id);

      if (error) throw error;
      Alert.alert("Berhasil", "Profil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* HEADER */}
      <Appbar.Header style={{ backgroundColor: isDarkMode ? "#1E1E1E" : primaryColor }}>
        <Appbar.BackAction color="#fff" onPress={onBack} />
        <Appbar.Content title="Profil Guru" titleStyle={{ color: "#fff" }} />
        {!isEditing && <Appbar.Action icon="account-edit" color="#fff" onPress={() => setIsEditing(true)} />}
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        {/* FOTO PROFIL */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pilihFoto} disabled={!isEditing}>
            {avatarUrl ? <Avatar.Image size={110} source={{ uri: avatarUrl }} style={styles.avatarShadow} /> : <Avatar.Text size={110} label={fullName?.substring(0, 2).toUpperCase() || "FI"} style={{ backgroundColor: primaryColor }} />}
            {isEditing && (
              <View style={styles.cameraBadge}>
                <Avatar.Icon size={30} icon="camera" style={{ backgroundColor: "#eee" }} color="#333" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={{ color: isDarkMode ? "#BBB" : "#757575", marginTop: 10, fontSize: 12 }}>Tap foto untuk mengubah</Text>
        </View>

        {/* FORM DATA */}
        <Card style={[styles.card, { backgroundColor: cardColor }]} elevation={3}>
          <Card.Content>
            <TextInput label="Nama Lengkap" value={fullName} onChangeText={setFullName} disabled={!isEditing} mode="outlined" style={[styles.input, { backgroundColor: inputBg }]} textColor={textColor} />
            <TextInput label="Username" value={username} onChangeText={setUsername} disabled={!isEditing} mode="outlined" style={[styles.input, { backgroundColor: inputBg }]} textColor={textColor} />
            <TextInput label="Password" value={password} onChangeText={setPassword} disabled={!isEditing} secureTextEntry mode="outlined" style={[styles.input, { backgroundColor: inputBg }]} textColor={textColor} />

            {isEditing ? (
              <View style={styles.actionRow}>
                <Button mode="outlined" onPress={() => setIsEditing(false)} style={styles.btnHalf}>
                  Batal
                </Button>
                <Button mode="contained" onPress={handleUpdate} style={styles.btnHalf} loading={loading}>
                  Simpan
                </Button>
              </View>
            ) : (
              <Button mode="contained" icon="logout" onPress={onLogout} buttonColor="#D32F2F" style={styles.btnLogout} labelStyle={{ color: "white" }}>
                Log Out
              </Button>
            )}
          </Card.Content>
        </Card>

        <Text style={[styles.footerText, { color: isDarkMode ? "#555" : "#B0BEC5" }]}>ID User: {user.id}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  avatarSection: { alignItems: "center", marginVertical: 20 },
  avatarShadow: { elevation: 8 },
  cameraBadge: { position: "absolute", bottom: 0, right: 0 },
  card: { borderRadius: 15 },
  input: { marginBottom: 15 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btnHalf: { width: "48%" },
  btnLogout: { marginTop: 10, borderRadius: 10 },
  footerText: { textAlign: "center", marginTop: 25, fontSize: 10 },
});

export default UserProfile;

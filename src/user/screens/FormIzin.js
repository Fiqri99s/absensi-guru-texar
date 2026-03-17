import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Linking, Alert, Platform } from "react-native";
import { Text, TextInput, Button, RadioButton, Card, Appbar, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const FormIzin = ({ user, onBack, isDarkMode }) => {
  const [status, setStatus] = useState("Sakit");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  // Konfigurasi Warna Dinamis
  const theme = {
    primary: "#1976D2",
    bg: isDarkMode ? "#121212" : "#F5F7FA",
    card: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    subText: isDarkMode ? "#B0BEC5" : "#546E7A",
    inputBg: isDarkMode ? "#2C2C2C" : "#FFFFFF",
    infoBg: isDarkMode ? "#2C2100" : "#FFF9C4",
    infoText: isDarkMode ? "#FFD54F" : "#F57F17",
  };

  const prosesIzin = async () => {
    if (!keterangan) {
      Alert.alert("Data Kosong", "Silakan isi alasan/keterangan terlebih dahulu.");
      return;
    }

    setLoading(true);
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    try {
      // 1. Simpan ke Database Supabase
      const { error } = await supabase.from("tabel_kehadiran").insert([
        {
          user_id: user.id,
          status: status,
          keterangan: keterangan,
          tanggal_absen: tanggalHariIni,
        },
      ]);

      if (error) throw error;

      // 2. Format Pesan WhatsApp
      const namaUser = user?.full_name || "Guru SMK Texar";
      const formatTanggal = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const pesanRaw =
        `*PEMBERITAHUAN IZIN/SAKIT*\n` +
        `------------------------------------\n` +
        `*Nama :* ${namaUser}\n` +
        `*Status :* ${status}\n` +
        `*Keterangan :* ${keterangan}\n` +
        `*Tanggal :* ${formatTanggal}\n\n` +
        `_Mohon izin tidak dapat hadir hari ini. Bukti foto/SKD akan saya lampirkan setelah pesan ini._\n` +
        `Terima kasih.`;

      // 3. Encode Pesan untuk URL
      const pesanEncoded = encodeURIComponent(pesanRaw);

      // Gunakan api.whatsapp.com agar otomatis mendeteksi aplikasi WA di HP
      const url = `https://api.whatsapp.com/send?text=${pesanEncoded}`;

      // 4. Eksekusi Pembukaan WhatsApp (Support Web & Mobile)
      if (Platform.OS === "web") {
        // Coba buka di tab baru
        const win = window.open(url, "_blank");
        if (win) {
          win.focus();
        } else {
          // Jika diblokir popup blocker browser HP, paksa pindah halaman
          window.location.assign(url);
        }
      } else {
        // Jika dijalankan sebagai APK/Native
        await Linking.openURL(url);
      }

      // Kembali ke halaman utama setelah sukses
      onBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal Simpan", "Terjadi kesalahan saat menyimpan data ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* HEADER */}
      <Appbar.Header style={{ backgroundColor: isDarkMode ? "#1E1E1E" : theme.primary }}>
        <Appbar.BackAction color="#fff" onPress={onBack} />
        <Appbar.Content title="Form Izin & Sakit" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={[styles.card, { backgroundColor: theme.card }]} elevation={3}>
          <Card.Content>
            <View style={styles.headerForm}>
              <Avatar.Icon size={40} icon="file-document-outline" style={{ backgroundColor: isDarkMode ? "#333" : "#E3F2FD" }} color={theme.primary} />
              <Text variant="titleMedium" style={[styles.title, { color: theme.text }]}>
                Data Absensi
              </Text>
            </View>

            <Text style={[styles.label, { color: theme.subText }]}>Alasan Tidak Hadir:</Text>

            <RadioButton.Group onValueChange={(value) => setStatus(value)} value={status}>
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="Sakit" color={theme.primary} />
                  <Text style={{ color: theme.text }}>Sakit</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Izin" color={theme.primary} />
                  <Text style={{ color: theme.text }}>Izin</Text>
                </View>
              </View>
            </RadioButton.Group>

            <TextInput
              label="Keterangan Spesifik"
              placeholder="Contoh: Demam tinggi atau urusan keluarga"
              placeholderTextColor={isDarkMode ? "#666" : "#999"}
              value={keterangan}
              onChangeText={setKeterangan}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: theme.inputBg }]}
              activeOutlineColor={theme.primary}
              textColor={theme.text}
            />

            <Button mode="contained" icon="whatsapp" onPress={prosesIzin} style={styles.btnSend} buttonColor={theme.primary} loading={loading} labelStyle={{ color: "white", fontWeight: "bold" }} disabled={loading}>
              SIMPAN & KIRIM KE WA
            </Button>

            <View style={[styles.infoBox, { backgroundColor: theme.infoBg }]}>
              <Text style={[styles.infoText, { color: theme.infoText }]}>💡 *Info:* Data Anda akan tersimpan di rekap sekolah. Setelah klik tombol, browser akan mengarahkan Anda ke aplikasi WhatsApp.</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Text style={[styles.version, { color: isDarkMode ? "#444" : "#B0BEC5" }]}>v1.1.0 • Texar Attendance System</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  card: { borderRadius: 20 },
  headerForm: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { marginLeft: 10, fontWeight: "bold" },
  label: { fontWeight: "bold", marginBottom: 5, fontSize: 13 },
  radioRow: { flexDirection: "row", marginBottom: 15, marginLeft: -8 },
  radioItem: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  input: { marginBottom: 20 },
  btnSend: { borderRadius: 12, paddingVertical: 8 },
  infoBox: { marginTop: 20, padding: 12, borderRadius: 12 },
  version: { textAlign: "center", fontSize: 11, marginVertical: 25 },
  infoText: { fontSize: 11, lineHeight: 18 },
});

export default FormIzin;

import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Linking, Alert } from "react-native";
import { Text, TextInput, Button, RadioButton, Card, Appbar, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const FormIzin = ({ user, onBack }) => {
  const [status, setStatus] = useState("Sakit");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const primaryColor = "#1976D2";

  const prosesIzin = async () => {
    // 1. Validasi Input
    if (!keterangan) {
      Alert.alert("Data Kosong", "Silakan isi alasan/keterangan terlebih dahulu.");
      return;
    }

    setLoading(true);
    const tanggalHariIni = new Date().toISOString().split("T")[0];

    try {
      // 2. Simpan ke Database Supabase
      const { error } = await supabase.from("tabel_kehadiran").insert([
        {
          user_id: user.id,
          status: status,
          keterangan: keterangan,
          tanggal_absen: tanggalHariIni,
        },
      ]);

      if (error) throw error;

      // 3. Buat Format Pesan WhatsApp
      const namaUser = user?.full_name || "Guru SMK Texar";
      const pesanWA =
        `*PEMBERITAHUAN IZIN/SAKIT*%0A` +
        `------------------------------------%0A` +
        `*Nama :* ${namaUser}%0A` +
        `*Status :* ${status}%0A` +
        `*Keterangan :* ${keterangan}%0A` +
        `*Tanggal :* ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}%0A%0A` +
        `_Mohon izin tidak dapat hadir hari ini. Bukti foto/SKD akan saya lampirkan setelah pesan ini._%0A` +
        `Terima kasih.`;

      const url = `whatsapp://send?text=${pesanWA}`;

      // 4. Buka WhatsApp
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Info", "Data berhasil disimpan, tapi WhatsApp tidak terpasang di perangkat ini.");
      }

      // 5. KEMBALI KE DASHBOARD (Navigasi Balik)
      onBack();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal Simpan", "Terjadi kesalahan saat menyimpan data ke sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER: Tombol Back di pojok kiri */}
      <Appbar.Header style={{ backgroundColor: primaryColor }}>
        <Appbar.BackAction color="#fff" onPress={onBack} />
        <Appbar.Content title="Form Izin & Sakit" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            <View style={styles.headerForm}>
              <Avatar.Icon size={40} icon="file-document-outline" style={{ backgroundColor: "#E3F2FD" }} color={primaryColor} />
              <Text variant="titleMedium" style={styles.title}>
                Data Absensi
              </Text>
            </View>

            <Text style={styles.label}>Alasan Tidak Hadir:</Text>
            <RadioButton.Group onValueChange={(value) => setStatus(value)} value={status}>
              <View style={styles.radioRow}>
                <View style={styles.radioItem}>
                  <RadioButton value="Sakit" color={primaryColor} />
                  <Text style={styles.radioText}>Sakit</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton value="Izin" color={primaryColor} />
                  <Text style={styles.radioText}>Izin</Text>
                </View>
              </View>
            </RadioButton.Group>

            <TextInput
              label="Keterangan Spesifik"
              placeholder="Contoh: Demam tinggi atau urusan keluarga"
              value={keterangan}
              onChangeText={setKeterangan}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.input}
              activeOutlineColor={primaryColor}
              textColor="#000"
            />

            <Button mode="contained" icon="whatsapp" onPress={prosesIzin} style={styles.btnSend} buttonColor={primaryColor} loading={loading} labelStyle={{ color: "white" }} disabled={loading}>
              Simpan & Kirim WA
            </Button>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>💡 *Info:* Data Anda akan langsung masuk ke rekap admin. Setelah klik tombol, silakan pilih grup WA sekolah.</Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Text style={styles.version}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 20 },
  card: { borderRadius: 20, backgroundColor: "#fff" },
  headerForm: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  title: { marginLeft: 10, fontWeight: "bold", color: "#333" },
  label: { fontWeight: "bold", marginBottom: 5, color: "#546E7A", fontSize: 13 },
  radioRow: { flexDirection: "row", marginBottom: 15, marginLeft: -8 },
  radioItem: { flexDirection: "row", alignItems: "center", marginRight: 20 },
  radioText: { color: "#333" },
  input: { backgroundColor: "#fff", marginBottom: 20 },
  btnSend: { borderRadius: 12, paddingVertical: 8 },
  infoBox: { marginTop: 20, padding: 10, backgroundColor: "#FFF9C4", borderRadius: 10 },
  version: { textAlign: "center", color: "#B0BEC5", fontSize: 11, marginVertical: 25 },
  infoText: { fontSize: 11, color: "#F57F17", lineHeight: 16 },
});

export default FormIzin;

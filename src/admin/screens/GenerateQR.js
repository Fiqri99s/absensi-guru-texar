import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Dimensions, Platform } from "react-native";
import { Text, Button, Surface, Card } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../../services/supabase";

const GenerateQR = ({ navigation }) => {
  const [mode, setMode] = useState("MASUK");
  const [loading, setLoading] = useState(false);

  const getHariIni = () => {
    const d = new Date();
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, "0");
    const tgl = String(d.getDate()).padStart(2, "0");
    return `${tahun}${bulan}${tgl}`;
  };

  // Kita pakai format yang kamu mau, tapi simpan ke kolom 'token_code'
  const [qrValue, setQrValue] = useState(`TEXAR_${getHariIni()}_${mode}`);

  useEffect(() => {
    setQrValue(`TEXAR_${getHariIni()}_${mode}`);
  }, [mode]);

  const handleSimpanKeSupabase = async () => {
    setLoading(true);
    try {
      // DISESUAIKAN DENGAN SCREENSHOT DATABASE KAMU:
      // Nama Tabel: tabel_qr_token
      // Nama Kolom Token: token_code
      const { error } = await supabase.from("tabel_qr_token").upsert(
        {
          id: 1,
          token_code: qrValue, // Menggunakan 'token_code' bukan 'qr_token'
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) throw error;

      Alert.alert("Berhasil!", `Token ${mode} sudah aktif di database.`);
    } catch (err) {
      Alert.alert("Gagal Simpan", err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Panel QR Absensi" subtitle="SMK Texar Klari" />
        <Card.Content style={styles.content}>
          <View style={styles.btnRow}>
            <Button mode={mode === "MASUK" ? "contained" : "outlined"} onPress={() => setMode("MASUK")} style={styles.flexBtn} buttonColor={mode === "MASUK" ? "#2E7D32" : undefined}>
              {" "}
              MASUK{" "}
            </Button>
            <Button mode={mode === "PULANG" ? "contained" : "outlined"} onPress={() => setMode("PULANG")} style={styles.flexBtn} buttonColor={mode === "PULANG" ? "#D84315" : undefined}>
              {" "}
              PULANG{" "}
            </Button>
          </View>

          <View style={styles.qrContainer}>
            <Surface style={styles.qrSurface} elevation={4}>
              <QRCode value={qrValue} size={220} />
            </Surface>
            <Text style={styles.qrLabel}>Sesi: {mode}</Text>
            <Text style={styles.tokenHint}>{qrValue}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button onPress={() => navigation.goBack()}>Kembali</Button>
          <Button mode="contained" onPress={handleSimpanKeSupabase} loading={loading} style={{ borderRadius: 10 }}>
            AKTIFKAN QR
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 20 },
  card: { width: "100%", maxWidth: 450, borderRadius: 20, backgroundColor: "#F5F5F5" },
  content: { alignItems: "center" },
  btnRow: { flexDirection: "row", gap: 10, marginBottom: 20, width: "100%" },
  flexBtn: { flex: 1 },
  qrContainer: { alignItems: "center" },
  qrSurface: { padding: 15, backgroundColor: "white", borderRadius: 15 },
  qrLabel: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "#1A237E" },
  tokenHint: { fontSize: 10, color: "#999" },
  actions: { justifyContent: "space-between", padding: 15 },
});

export default GenerateQR;

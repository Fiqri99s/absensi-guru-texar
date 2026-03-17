import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Surface, Card, IconButton, Portal, Dialog, Avatar } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../../services/supabase";

const GenerateQR = ({ navigation, isDarkMode }) => {
  const [mode, setMode] = useState("MASUK");
  const [loading, setLoading] = useState(false);

  // State untuk Popup Cakep
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ title: "", body: "", icon: "check-circle", color: "#4CAF50" });

  // Konfigurasi Warna Dinamis
  const bgColor = isDarkMode ? "#121212" : "#F8F9FA";
  const cardColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#1A237E";
  const subTextColor = isDarkMode ? "#B0BEC5" : "#999999";

  const getHariIni = () => {
    const d = new Date();
    const tahun = d.getFullYear();
    const bulan = String(d.getMonth() + 1).padStart(2, "0");
    const tgl = String(d.getDate()).padStart(2, "0");
    return `${tahun}${bulan}${tgl}`;
  };

  const [qrValue, setQrValue] = useState(`TEXAR_${getHariIni()}_${mode}`);

  useEffect(() => {
    setQrValue(`TEXAR_${getHariIni()}_${mode}`);
  }, [mode]);

  // Fungsi untuk memicu Popup
  const showPopup = (title, body, icon, color) => {
    setMsg({ title, body, icon, color });
    setVisible(true);
  };

  const handleSimpanKeSupabase = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("tabel_qr_token").upsert(
        {
          id: 1,
          token_code: qrValue,
          created_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) throw error;

      // Popup Sukses
      showPopup("QR Diaktifkan!", `Token untuk sesi ${mode} berhasil diperbarui. Guru sekarang dapat melakukan scan absensi.`, "qrcode-check", "#2E7D32");
    } catch (err) {
      // Popup Gagal
      showPopup("Waduh, Gagal!", err.message || "Terjadi kesalahan saat menghubungkan ke database.", "alert-circle", "#D32F2F");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Card style={[styles.card, { backgroundColor: cardColor }]}>
        <Card.Title
          title="Panel QR Absensi"
          subtitle="SMK Texar Klari"
          titleStyle={{ color: textColor, fontWeight: "bold" }}
          subtitleStyle={{ color: subTextColor }}
          left={(props) => <IconButton {...props} icon="qrcode-scan" iconColor="#1976D2" />}
        />

        <Card.Content style={styles.content}>
          <View style={styles.btnRow}>
            <Button mode={mode === "MASUK" ? "contained" : "outlined"} onPress={() => setMode("MASUK")} style={styles.flexBtn} buttonColor={mode === "MASUK" ? "#2E7D32" : "transparent"} textColor={mode === "MASUK" ? "#FFF" : "#2E7D32"}>
              MASUK
            </Button>
            <Button mode={mode === "PULANG" ? "contained" : "outlined"} onPress={() => setMode("PULANG")} style={styles.flexBtn} buttonColor={mode === "PULANG" ? "#D84315" : "transparent"} textColor={mode === "PULANG" ? "#FFF" : "#D84315"}>
              PULANG
            </Button>
          </View>

          <View style={styles.qrContainer}>
            <Surface style={styles.qrSurface} elevation={4}>
              <QRCode value={qrValue} size={220} backgroundColor="white" color="black" />
            </Surface>

            <Text style={[styles.qrLabel, { color: textColor }]}>Sesi: {mode}</Text>
            <Text style={[styles.tokenHint, { color: subTextColor }]}>{qrValue}</Text>
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button textColor={subTextColor} onPress={() => navigation.goBack()}>
            Kembali
          </Button>
          <Button mode="contained" onPress={handleSimpanKeSupabase} loading={loading} buttonColor="#1976D2" style={{ borderRadius: 10, paddingHorizontal: 10 }}>
            AKTIFKAN QR
          </Button>
        </Card.Actions>
      </Card>

      <Text style={[styles.footerText, { color: subTextColor }]}>Token akan diperbarui secara otomatis sesuai tanggal hari ini.</Text>

      {/* --- MODAL POPUP CAKEP --- */}
      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={{ borderRadius: 25, backgroundColor: isDarkMode ? "#242424" : "#FFFFFF" }}>
          <Dialog.Content style={styles.modalContent}>
            <Avatar.Icon size={70} icon={msg.icon} style={{ backgroundColor: msg.color }} color="white" />
            <Text style={[styles.modalTitle, { color: textColor }]}>{msg.title}</Text>
            <Text style={[styles.modalBody, { color: subTextColor }]}>{msg.body}</Text>
          </Dialog.Content>
          <Dialog.Actions style={styles.modalActions}>
            <Button mode="contained" onPress={() => setVisible(false)} buttonColor={msg.color} style={{ borderRadius: 12, paddingHorizontal: 20 }}>
              MENGERTI
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 450, borderRadius: 25, elevation: 5 },
  content: { alignItems: "center" },
  btnRow: { flexDirection: "row", gap: 10, marginBottom: 25, width: "100%" },
  flexBtn: { flex: 1, borderRadius: 12 },
  qrContainer: { alignItems: "center", marginVertical: 10 },
  qrSurface: { padding: 20, backgroundColor: "white", borderRadius: 20 },
  qrLabel: { marginTop: 15, fontSize: 20, fontWeight: "bold", letterSpacing: 1 },
  tokenHint: { fontSize: 11, marginTop: 5, fontStyle: "italic" },
  actions: { justifyContent: "space-between", padding: 20, marginTop: 10 },
  footerText: { marginTop: 30, fontSize: 12, textAlign: "center", paddingHorizontal: 40 },

  // Styles untuk Modal
  modalContent: { alignItems: "center", paddingTop: 20 },
  modalTitle: { marginTop: 15, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  modalBody: { marginTop: 10, textAlign: "center", fontSize: 14, lineHeight: 20 },
  modalActions: { justifyContent: "center", paddingBottom: 15 },
});

export default GenerateQR;

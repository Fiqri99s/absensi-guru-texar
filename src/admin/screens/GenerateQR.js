import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text, Button, Surface, Card, IconButton, Portal, Dialog, Avatar } from "react-native-paper";
import QRCode from "react-native-qrcode-svg";
import { supabase } from "../../services/supabase";

const GenerateQR = ({ navigation, isDarkMode }) => {
  const [mode, setMode] = useState("MASUK");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ title: "", body: "", icon: "check-circle", color: "#4CAF50" });

  const bgColor = isDarkMode ? "#121212" : "#F8F9FA";
  const cardColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#1A237E";
  const subTextColor = isDarkMode ? "#B0BEC5" : "#999999";

  const getHariIni = () => {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  };

  const [qrValue, setQrValue] = useState(`TEXAR_${getHariIni()}_${mode}`);

  useEffect(() => {
    setQrValue(`TEXAR_${getHariIni()}_${mode}`);
  }, [mode]);

  const showPopup = (title, body, icon, color) => {
    setMsg({ title, body, icon, color });
    setVisible(true);
  };

  const handleAktifkanQR = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("tabel_qr_token").upsert({ id: 1, token_code: qrValue, created_at: new Date().toISOString() }, { onConflict: "id" });
      if (error) throw error;
      showPopup("QR Berhasil Aktif", `Sesi ${mode} sekarang sudah sinkron dengan server.`, "qrcode-check", "#2E7D32");
    } catch (err) {
      showPopup("Gagal", err.message, "alert-circle", "#D32F2F");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Card style={[styles.card, { backgroundColor: cardColor }]}>
        <Card.Title title="Panel QR Admin" subtitle="Sinkronisasi Token Harian" titleStyle={{ color: textColor, fontWeight: "bold" }} left={(props) => <IconButton {...props} icon="shield-lock" iconColor="#1976D2" />} />
        <Card.Content style={styles.content}>
          <View style={styles.btnRow}>
            <Button mode={mode === "MASUK" ? "contained" : "outlined"} onPress={() => setMode("MASUK")} style={styles.flexBtn} buttonColor={mode === "MASUK" ? "#2E7D32" : "transparent"} textColor={mode === "MASUK" ? "#FFF" : "#2E7D32"}>
              MASUK
            </Button>
            <Button mode={mode === "PULANG" ? "contained" : "outlined"} onPress={() => setMode("PULANG")} style={styles.flexBtn} buttonColor={mode === "PULANG" ? "#D84315" : "transparent"} textColor={mode === "PULANG" ? "#FFF" : "#D84315"}>
              PULANG
            </Button>
          </View>
          <Surface style={styles.qrSurface} elevation={4}>
            <QRCode value={qrValue} size={200} />
          </Surface>
          <Text style={[styles.qrLabel, { color: textColor }]}>
            {mode} - {getHariIni()}
          </Text>
          <Text style={[styles.tokenHint, { color: subTextColor }]}>{qrValue}</Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <Button onPress={() => navigation.goBack()} textColor={subTextColor}>
            Tutup
          </Button>
          <Button mode="contained" onPress={handleAktifkanQR} loading={loading} buttonColor="#1976D2" style={{ borderRadius: 10 }}>
            AKTIFKAN QR
          </Button>
        </Card.Actions>
      </Card>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Content style={styles.modalContent}>
            <Avatar.Icon size={70} icon={msg.icon} style={{ backgroundColor: msg.color }} color="white" />
            <Text style={[styles.modalTitle, { color: textColor }]}>{msg.title}</Text>
            <Text style={[styles.modalBody, { color: subTextColor }]}>{msg.body}</Text>
            <Button mode="contained" onPress={() => setVisible(false)} buttonColor={msg.color} style={styles.modalBtn}>
              MENGERTI
            </Button>
          </Dialog.Content>
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
  qrSurface: { padding: 15, backgroundColor: "white", borderRadius: 20 },
  qrLabel: { marginTop: 15, fontSize: 18, fontWeight: "bold" },
  tokenHint: { fontSize: 10, marginTop: 5, fontStyle: "italic" },
  actions: { justifyContent: "space-between", padding: 20 },
  dialog: { borderRadius: 30 },
  modalContent: { alignItems: "center", paddingTop: 10 },
  modalTitle: { marginTop: 15, fontSize: 22, fontWeight: "bold", textAlign: "center" },
  modalBody: { marginTop: 10, textAlign: "center", fontSize: 15, lineHeight: 22, paddingHorizontal: 10 },
  modalBtn: { marginTop: 25, borderRadius: 15, paddingHorizontal: 30 },
});

export default GenerateQR;

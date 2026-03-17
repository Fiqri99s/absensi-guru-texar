import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { Text, IconButton, Portal, Dialog, Avatar, Button } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../../services/supabase";

const ScannerAbsen = ({ navigation, user, isDarkMode }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ title: "", body: "", icon: "", color: "", success: false });

  if (!permission?.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? "#121212" : "#FFF" }]}>
        <Avatar.Icon size={80} icon="camera-off" style={{ backgroundColor: "#333" }} />
        <Text style={{ color: isDarkMode ? "#FFF" : "#000", marginTop: 15 }}>Akses kamera diperlukan.</Text>
        <Button mode="contained" onPress={requestPermission} style={{ marginTop: 15 }}>
          Izinkan Kamera
        </Button>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      const { data: dbData, error: dbError } = await supabase.from("tabel_qr_token").select("token_code").eq("id", 1).single();

      if (dbError) throw new Error("Sesi belum diaktifkan Admin.");

      if (data === dbData.token_code) {
        const sesi = data.includes("MASUK") ? "Masuk" : "Pulang";
        const { error } = await supabase.from("tabel_kehadiran").insert([
          {
            user_id: user.id,
            waktu_masuk: new Date().toISOString(),
            tanggal_absen: new Date().toISOString().split("T")[0],
            status: "Hadir",
            token_used: data,
            keterangan: `Absen via QR Sesi ${sesi}`,
          },
        ]);

        if (error) throw error;
        setMsg({ title: "Berhasil!", body: `Absensi ${sesi} Anda sah. Selamat bertugas!`, icon: "check-decagram", color: "#4CAF50", success: true });
      } else {
        setMsg({ title: "QR Tidak Valid", body: "Token sudah kadaluarsa atau sesi sudah berganti.", icon: "close-circle", color: "#D32F2F", success: false });
      }
    } catch (err) {
      setMsg({ title: "Gagal", body: err.message, icon: "alert-circle", color: "#FF9800", success: false });
    } finally {
      setIsProcessing(false);
      setVisible(true);
    }
  };

  return (
    <View style={styles.containerScanner}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} />

      <View style={styles.overlay}>
        <View style={styles.headerScanner}>
          <IconButton icon="arrow-left" iconColor="white" onPress={() => navigation.goBack()} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
          <Text style={styles.headerText}>SCAN ABSENSI</Text>
        </View>

        <View style={styles.finder}>
          {isProcessing && <ActivityIndicator size="large" color="white" />}
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
        </View>

        <Text style={styles.footerText}>Arahkan kamera ke QR Code Admin</Text>
      </View>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Content style={styles.modalContent}>
            <Avatar.Icon size={70} icon={msg.icon} style={{ backgroundColor: msg.color }} color="white" />
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>{msg.title}</Text>
            <Text style={[styles.modalBody, { color: isDarkMode ? "#B0BEC5" : "#546E7A" }]}>{msg.body}</Text>
            <Button
              mode="contained"
              onPress={() => {
                setVisible(false);
                msg.success ? navigation.goBack() : setScanned(false);
              }}
              buttonColor={msg.color}
              style={styles.modalBtn}
            >
              OKE
            </Button>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  containerScanner: { flex: 1, backgroundColor: "#000" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, justifyContent: "space-between", paddingVertical: 60, alignItems: "center" },
  headerScanner: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 20 },
  headerText: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  finder: { width: 260, height: 260, justifyContent: "center", alignItems: "center", backgroundColor: "transparent" },
  footerText: { color: "white", backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 10, paddingHorizontal: 25, borderRadius: 25, fontSize: 13 },

  // Ornamen Sudut Finder
  cornerTL: { position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#1976D2", borderTopLeftRadius: 20 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: "#1976D2", borderTopRightRadius: 20 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: "#1976D2", borderBottomLeftRadius: 20 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#1976D2", borderBottomRightRadius: 20 },

  // MODAL CAKEP STYLES
  dialog: { borderRadius: 30 },
  modalContent: { alignItems: "center", paddingTop: 10 },
  modalTitle: { marginTop: 15, fontSize: 22, fontWeight: "bold", textAlign: "center" },
  modalBody: { marginTop: 10, textAlign: "center", fontSize: 15, lineHeight: 22, paddingHorizontal: 10 },
  modalBtn: { marginTop: 25, borderRadius: 15, paddingHorizontal: 30 },
});

export default ScannerAbsen;

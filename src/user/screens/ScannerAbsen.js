import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { Text, IconButton, ActivityIndicator, Portal, Dialog, Avatar, Button } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../../services/supabase";

const ScannerAbsen = ({ navigation, user, isDarkMode }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // State untuk Popup Cakep
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ title: "", body: "", icon: "check-circle", color: "#4CAF50", success: true });

  const showPopup = (title, body, icon, color, success) => {
    setMsg({ title, body, icon, color, success });
    setVisible(true);
  };

  // 1. Cek Izin Kamera
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Avatar.Icon size={80} icon="camera-off" style={{ backgroundColor: "#333" }} />
        <Text style={styles.centerText}>Akses kamera diperlukan untuk scan QR.</Text>
        <Button mode="contained" onPress={requestPermission} buttonColor="#1976D2" style={{ borderRadius: 10 }}>
          IZINKAN KAMERA
        </Button>
      </View>
    );
  }

  // 2. Fungsi Utama Scan
  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);

    try {
      // Ambil token dari database
      const { data: dbData, error: dbError } = await supabase.from("tabel_qr_token").select("token_code").eq("id", 1).single();

      if (dbError) throw new Error("Gagal validasi ke server.");

      if (data === dbData.token_code) {
        // Simpan ke tabel_kehadiran
        const { error: insertError } = await supabase.from("tabel_kehadiran").insert([
          {
            user_id: user.id,
            waktu_masuk: new Date().toISOString(),
            tanggal_absen: new Date().toISOString().split("T")[0],
            status: "Hadir",
            keterangan: "Absen via QR Scan",
          },
        ]);

        if (insertError) throw insertError;

        showPopup("Absensi Berhasil!", "Data kehadiran Anda telah tercatat. Selamat bertugas!", "check-decagram", "#2E7D32", true);
      } else {
        showPopup("QR Tidak Valid", "Kode QR yang Anda scan salah atau sudah tidak berlaku hari ini.", "close-circle", "#D32F2F", false);
      }
    } catch (err) {
      showPopup("Terjadi Kesalahan", err.message, "alert-circle", "#D32F2F", false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClosePopup = () => {
    setVisible(false);
    if (msg.success) {
      navigation?.goBack();
    } else {
      setScanned(false); // Reset scanner jika gagal agar bisa coba lagi
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" iconColor="white" size={28} onPress={() => navigation?.goBack()} style={{ backgroundColor: "rgba(0,0,0,0.5)" }} />
          <Text style={styles.headerTitle}>SCAN ABSENSI</Text>
        </View>

        {/* Finder Box */}
        <View style={[styles.finder, { borderColor: scanned ? "#4CAF50" : "#1976D2" }]}>
          {isProcessing && <ActivityIndicator animating={true} color="#fff" size="large" />}
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Arahkan kamera ke QR Code di layar Admin</Text>
        </View>
      </View>

      {/* --- POPUP DIALOG CAKEP --- */}
      <Portal>
        <Dialog visible={visible} onDismiss={handleClosePopup} style={{ borderRadius: 25, backgroundColor: isDarkMode ? "#242424" : "#FFFFFF" }}>
          <Dialog.Content style={styles.modalContent}>
            <Avatar.Icon size={70} icon={msg.icon} style={{ backgroundColor: msg.color }} color="white" />
            <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#000" }]}>{msg.title}</Text>
            <Text style={[styles.modalBody, { color: isDarkMode ? "#B0BEC5" : "#546E7A" }]}>{msg.body}</Text>
          </Dialog.Content>
          <Dialog.Actions style={{ justifyContent: "center", paddingBottom: 20 }}>
            <Button mode="contained" onPress={handleClosePopup} buttonColor={msg.color} style={{ borderRadius: 12, paddingHorizontal: 30 }} labelStyle={{ fontWeight: "bold" }}>
              {msg.success ? "Selesai" : "Coba Lagi"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centerText: { color: "#fff", textAlign: "center", marginBottom: 20, marginTop: 15, paddingHorizontal: 40 },
  overlay: { flex: 1, justifyContent: "space-between", paddingVertical: 50 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 10, textShadowColor: "rgba(0, 0, 0, 0.75)", textShadowOffset: { width: -1, height: 1 }, textShadowRadius: 10 },
  finder: {
    width: 250,
    height: 250,
    borderWidth: 1,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  // Ornamen Sudut Kotak Scan
  cornerTopLeft: { position: "absolute", top: -3, left: -3, width: 40, height: 40, borderTopWidth: 5, borderLeftWidth: 5, borderColor: "#1976D2", borderTopLeftRadius: 20 },
  cornerTopRight: { position: "absolute", top: -3, right: -3, width: 40, height: 40, borderTopWidth: 5, borderRightWidth: 5, borderColor: "#1976D2", borderTopRightRadius: 20 },
  cornerBottomLeft: { position: "absolute", bottom: -3, left: -3, width: 40, height: 40, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: "#1976D2", borderBottomLeftRadius: 20 },
  cornerBottomRight: { position: "absolute", bottom: -3, right: -3, width: 40, height: 40, borderBottomWidth: 5, borderRightWidth: 5, borderColor: "#1976D2", borderBottomRightRadius: 20 },

  footer: { alignItems: "center", paddingBottom: 20 },
  footerText: {
    color: "white",
    fontSize: 13,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    overflow: "hidden",
  },
  modalContent: { alignItems: "center", paddingTop: 20 },
  modalTitle: { marginTop: 15, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  modalBody: { marginTop: 10, textAlign: "center", fontSize: 14, lineHeight: 20, paddingHorizontal: 10 },
});

export default ScannerAbsen;

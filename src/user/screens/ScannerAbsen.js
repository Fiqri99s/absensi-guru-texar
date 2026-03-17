import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, IconButton, Portal, Dialog, Avatar, Button, Surface } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../../services/supabase";

const ScannerAbsen = ({ navigation, user, isDarkMode }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [msg, setMsg] = useState({ title: "", body: "", icon: "check", color: "#4CAF50", success: false });

  if (!permission?.granted) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: isDarkMode ? "#121212" : "#FFF" }]}>
        <Avatar.Icon size={80} icon="camera-off" style={{ backgroundColor: "#333" }} />
        <Text style={{ color: isDarkMode ? "#FFF" : "#000", marginTop: 15 }}>Izin kamera diperlukan.</Text>
        <Button mode="contained" onPress={requestPermission} style={{ marginTop: 20 }}>
          Berikan Izin
        </Button>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      // 1. CEK APAKAH GURU SUDAH ABSEN (Pakai .limit(1) agar tidak error JSON)
      const { data: attendanceData, error: checkError } = await supabase.from("tabel_kehadiran").select("id").eq("user_id", user.id).eq("tanggal_absen", today).limit(1);

      if (checkError) throw checkError;

      if (attendanceData && attendanceData.length > 0) {
        setMsg({
          title: "Sudah Absen",
          body: "Anda sudah melakukan absensi hari ini. Data sudah masuk ke rekap.",
          icon: "information-outline",
          color: "#1976D2",
          success: false,
        });
        setVisible(true);
        return;
      }

      // 2. AMBIL TOKEN QR AKTIF (ID 1)
      // Pakai .limit(1) alih-alih .single() untuk menghindari crash JSON
      const { data: tokenData, error: dbError } = await supabase.from("tabel_qr_token").select("token_code").eq("id", 1).limit(1);

      if (dbError) throw dbError;

      // Cek apakah data ID 1 ditemukan dalam array
      if (!tokenData || tokenData.length === 0) {
        throw new Error("Sesi QR (ID 1) tidak ditemukan di database.");
      }

      const activeToken = tokenData[0].token_code;

      // 3. VALIDASI TOKEN HASIL SCAN
      if (data === activeToken) {
        const { error: insertError } = await supabase.from("tabel_kehadiran").insert([
          {
            user_id: user.id,
            waktu_masuk: new Date().toISOString(),
            tanggal_absen: today,
            status: "Hadir",
            token_used: data,
            keterangan: `Absen QR Berhasil`,
          },
        ]);

        if (insertError) throw insertError;

        setMsg({
          title: "Berhasil!",
          body: "Absensi hari ini tercatat. Selamat bekerja!",
          icon: "check-decagram",
          color: "#00E676",
          success: true,
        });
      } else {
        setMsg({
          title: "QR Tidak Sah",
          body: "Kode QR tidak cocok dengan sistem Texar. Pastikan scan QR dari Admin.",
          icon: "qrcode-remove",
          color: "#FF5252",
          success: false,
        });
      }
    } catch (err) {
      setMsg({
        title: "Kesalahan Sistem",
        body: err.message,
        icon: "alert-circle",
        color: "#FFAB00",
        success: false,
      });
    } finally {
      setIsProcessing(false);
      setVisible(true);
    }
  };

  return (
    <View style={styles.containerScanner}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" iconColor="white" onPress={() => navigation.goBack()} style={styles.backBtn} />
          <Text style={styles.headerTitle}>SCANNER ABSENSI</Text>
        </View>

        <View style={styles.finder}>
          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />
          {isProcessing && <ActivityIndicator size="large" color="#00E5FF" />}
        </View>

        <View style={styles.footerHint}>
          <Text style={styles.footerText}>Arahkan ke QR Code Admin</Text>
        </View>
      </View>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <View style={styles.modalWrapper}>
            <View style={[styles.decoCircle, { backgroundColor: msg.color, opacity: 0.1 }]} />
            <Dialog.Content style={styles.modalContent}>
              <Surface style={[styles.iconSurface, { shadowColor: msg.color }]} elevation={5}>
                <Avatar.Icon size={80} icon={msg.icon} color="white" style={{ backgroundColor: msg.color }} />
              </Surface>
              <Text style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#1A237E" }]}>{msg.title}</Text>
              <Text style={[styles.modalBody, { color: isDarkMode ? "#B0BEC5" : "#546E7A" }]}>{msg.body}</Text>
              <Button
                mode="contained"
                onPress={() => {
                  setVisible(false);
                  msg.success || msg.title === "Sudah Absen" ? navigation.goBack() : setScanned(false);
                }}
                buttonColor={msg.color}
                style={styles.actionBtn}
              >
                {msg.success || msg.title === "Sudah Absen" ? "SELESAI" : "COBA LAGI"}
              </Button>
            </Dialog.Content>
          </View>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  containerScanner: { flex: 1, backgroundColor: "#000" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, justifyContent: "space-between", alignItems: "center", paddingVertical: 60 },
  header: { flexDirection: "row", alignItems: "center", width: "100%", paddingHorizontal: 20 },
  headerTitle: { color: "white", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  backBtn: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 12 },
  finder: { width: 260, height: 260, justifyContent: "center", alignItems: "center" },
  cornerTL: { position: "absolute", top: 0, left: 0, width: 45, height: 45, borderTopWidth: 5, borderLeftWidth: 5, borderColor: "#00E5FF", borderTopLeftRadius: 20 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 45, height: 45, borderTopWidth: 5, borderRightWidth: 5, borderColor: "#00E5FF", borderTopRightRadius: 20 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 45, height: 45, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: "#00E5FF", borderBottomLeftRadius: 20 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 45, height: 45, borderBottomWidth: 5, borderRightWidth: 5, borderColor: "#00E5FF", borderBottomRightRadius: 20 },
  footerHint: { backgroundColor: "rgba(0,0,0,0.6)", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 30 },
  footerText: { color: "white", fontSize: 13 },
  dialog: { borderRadius: 40, overflow: "hidden" },
  modalWrapper: { paddingBottom: 20 },
  decoCircle: { position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: 50 },
  modalContent: { alignItems: "center", paddingTop: 30 },
  iconSurface: { borderRadius: 40, marginBottom: 20, elevation: 10 },
  modalTitle: { fontSize: 24, fontWeight: "900", textAlign: "center", marginBottom: 10 },
  modalBody: { fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 15, marginBottom: 30 },
  actionBtn: { width: "100%", borderRadius: 18 },
});

export default ScannerAbsen;

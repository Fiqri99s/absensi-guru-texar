import React, { useState } from "react";
import { View, StyleSheet, Alert, Dimensions, Platform } from "react-native";
import { Text, IconButton, ActivityIndicator } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";
import { supabase } from "../../services/supabase";

const ScannerAbsen = ({ navigation, user }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Cek Izin Kamera
  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.centerText}>Akses kamera diperlukan untuk scan QR.</Text>
        <IconButton icon="camera" mode="contained" size={40} onPress={requestPermission} containerColor="#1976D2" />
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
        // Simpan ke tabel_kehadiran (Kolom sesuai screenshot kamu)
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

        // NOTIFIKASI BERHASIL
        const msg = "Absensi Anda berhasil dicatat!";
        if (Platform.OS === "web") {
          alert("Berhasil: " + msg);
          navigation?.goBack();
        } else {
          Alert.alert("Berhasil!", msg, [{ text: "OK", onPress: () => navigation?.goBack() }]);
        }
      } else {
        // NOTIFIKASI GAGAL
        const msgGagal = "Kode QR tidak valid atau sudah kadaluarsa.";
        if (Platform.OS === "web") {
          alert("Gagal: " + msgGagal);
          setScanned(false);
          setIsProcessing(false);
        } else {
          Alert.alert("Gagal", msgGagal, [
            {
              text: "Coba Lagi",
              onPress: () => {
                setScanned(false);
                setIsProcessing(false);
              },
            },
          ]);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
      setScanned(false);
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} barcodeScannerSettings={{ barcodeTypes: ["qr"] }} />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" iconColor="white" size={30} onPress={() => navigation?.goBack()} style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />
          <Text style={styles.headerTitle}>SCAN ABSENSI</Text>
        </View>

        <View style={styles.finder}>{isProcessing && <ActivityIndicator animating={true} color="#fff" size="large" />}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Arahkan kamera ke QR Code Admin</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centerText: { color: "#fff", textAlign: "center", marginBottom: 20 },
  overlay: { flex: 1, justifyContent: "space-between", paddingVertical: 50 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  finder: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#1976D2",
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  footer: { alignItems: "center", paddingBottom: 20 },
  footerText: {
    color: "white",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

export default ScannerAbsen;

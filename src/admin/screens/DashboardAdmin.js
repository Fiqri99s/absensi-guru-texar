import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, RefreshControl, Dimensions } from "react-native";
import { Text, Avatar, IconButton, Surface, TouchableRipple } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { supabase } from "../../services/supabase";

const screenWidth = Dimensions.get("window").width;

const DashboardAdmin = ({ user, onLogout, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alpa: 0, totalGuru: 0 });
  const primaryColor = "#1976D2";
  const lightBlue = "#E3F2FD";

  const muatData = async () => {
    setLoading(true);
    const hariIni = new Date().toISOString().split("T")[0];

    try {
      // 1. Ambil Total Semua Guru
      const { count: total } = await supabase.from("tabel_user").select("*", { count: "exact", head: true }).eq("role", "guru");

      // 2. Ambil yang Hadir hari ini
      const { count: jmlHadir } = await supabase.from("tabel_kehadiran").select("*", { count: "exact", head: true }).eq("tanggal_absen", hariIni).eq("status", "Hadir");

      // 3. Ambil yang Izin/Sakit hari ini
      const { count: jmlIzin } = await supabase.from("tabel_kehadiran").select("*", { count: "exact", head: true }).eq("tanggal_absen", hariIni).in("status", ["Izin", "Sakit"]);

      const nHadir = jmlHadir || 0;
      const nIzin = jmlIzin || 0;
      const nTotal = total || 0;
      const nAlpa = nTotal - (nHadir + nIzin);

      setStats({
        hadir: nHadir,
        izin: nIzin,
        alpa: nAlpa < 0 ? 0 : nAlpa,
        totalGuru: nTotal,
      });
    } catch (err) {
      console.log("Error stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  const chartData = [
    { name: "Hadir", population: stats.hadir, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Izin", population: stats.izin, color: "#FFC107", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Alpa", population: stats.alpa, color: "#F44336", legendFontColor: "#7F7F7F", legendFontSize: 12 },
  ];

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={muatData} color={primaryColor} />}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: lightBlue }]}>
        <View style={styles.headerTop}>
          <Surface style={styles.logoContainer} elevation={2}>
            <Image source={require("../../../assets/logo-texar.png")} style={styles.logo} resizeMode="contain" />
          </Surface>
          <IconButton icon="logout-variant" iconColor="#D32F2F" size={26} onPress={onLogout} />
        </View>

        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={styles.welcomeText}>
            Selamat Datang,
          </Text>
          <Text variant="headlineSmall" style={styles.adminName}>
            {user?.full_name || "Admin Sekolah"}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "ADMINISTRATOR"}</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: "#4CAF50", fontWeight: "bold" }}>
            {stats.hadir}
          </Text>
          <Text variant="labelSmall">HADIR</Text>
        </Surface>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: primaryColor, fontWeight: "bold" }}>
            {stats.totalGuru}
          </Text>
          <Text variant="labelSmall">GURU</Text>
        </Surface>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: "#C62828", fontWeight: "bold" }}>
            {stats.izin}
          </Text>
          <Text variant="labelSmall">IZIN/SKT</Text>
        </Surface>
      </View>

      {/* Menu Container dengan Grid yang Benar */}
      <View style={styles.menuContainer}>
        <Text variant="titleMedium" style={styles.menuTitle}>
          MANAJEMEN SISTEM
        </Text>

        {/* Menu 1 */}
        <Surface style={styles.menuItem} elevation={2}>
          <TouchableRipple onPress={() => navigation?.navigate("KelolaGuru")} style={styles.ripple}>
            <View style={styles.menuInside}>
              <Avatar.Icon size={50} icon="account-group" style={{ backgroundColor: "#E8EAF6" }} color={primaryColor} />
              <Text variant="labelLarge" style={styles.menuText}>
                Kelola Guru
              </Text>
            </View>
          </TouchableRipple>
        </Surface>

        {/* Menu 2 */}
        <Surface style={styles.menuItem} elevation={2}>
          <TouchableRipple onPress={() => navigation?.navigate("RekapAbsensi")} style={styles.ripple}>
            <View style={styles.menuInside}>
              <Avatar.Icon size={50} icon="file-chart" style={{ backgroundColor: "#F1F8E9" }} color="#388E3C" />
              <Text variant="labelLarge" style={styles.menuText}>
                Rekap Absen
              </Text>
            </View>
          </TouchableRipple>
        </Surface>

        {/* Menu 3 - Otomatis pindah ke baris baru */}
        <Surface style={styles.menuItem} elevation={2}>
          <TouchableRipple onPress={() => navigation?.navigate("KelolaInformasi")} style={styles.ripple}>
            <View style={styles.menuInside}>
              <Avatar.Icon size={50} icon="bullhorn-variant" style={{ backgroundColor: "#E3F2FD" }} color="#1976D2" />
              <Text variant="labelLarge" style={styles.menuText}>
                Buat Informasi
              </Text>
            </View>
          </TouchableRipple>
        </Surface>

        {/* Menu Full Width */}
        <Surface style={[styles.menuItem, styles.fullWidth, { backgroundColor: primaryColor }]} elevation={4}>
          <TouchableRipple onPress={() => navigation?.navigate("GenerateQR")} style={styles.ripple}>
            <View style={[styles.menuInside, { flexDirection: "row", paddingHorizontal: 20 }]}>
              <Avatar.Icon size={50} icon="qrcode-scan" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} color="#fff" />
              <View style={{ marginLeft: 20 }}>
                <Text variant="titleMedium" style={{ color: "#fff", fontWeight: "bold" }}>
                  AKTIFKAN ABSENSI
                </Text>
                <Text variant="bodySmall" style={{ color: "#BBDEFB" }}>
                  Buka Sesi Scan Hari Ini
                </Text>
              </View>
            </View>
          </TouchableRipple>
        </Surface>
      </View>

      {/* Grafik Kehadiran */}
      <View style={styles.chartSection}>
        <Text variant="titleMedium" style={styles.menuTitle}>
          PRESENTASE KEHADIRAN HARI INI
        </Text>
        <Surface style={styles.chartCard} elevation={2}>
          <PieChart data={chartData} width={screenWidth - 60} height={180} chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
        </Surface>
      </View>

      <Text style={styles.version}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { paddingTop: 50, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  logoContainer: { borderRadius: 20, padding: 5, backgroundColor: "#fff" },
  logo: { width: 50, height: 50 },
  textContainer: { marginTop: 5 },
  welcomeText: { color: "#546E7A", marginBottom: -5 },
  adminName: { color: "#1A237E", fontWeight: "bold", fontSize: 24 },
  roleBadge: { backgroundColor: "#1976D2", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 5 },
  roleText: { color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },

  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -25, paddingHorizontal: 20 },
  statBox: { backgroundColor: "#fff", width: "30%", padding: 15, borderRadius: 20, alignItems: "center" },

  chartSection: { paddingHorizontal: 25, marginTop: 25 },
  chartCard: { backgroundColor: "#fff", borderRadius: 25, padding: 10, alignItems: "center" },

  // Perbaikan menuContainer
  menuContainer: {
    padding: 25,
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuTitle: { color: "#90A4AE", fontWeight: "bold", marginBottom: 15, fontSize: 11, letterSpacing: 1.2, width: "100%" },
  menuItem: { backgroundColor: "#F8F9FA", width: "48%", aspectRatio: 1, borderRadius: 25, overflow: "hidden", marginBottom: 15 },
  fullWidth: { width: "100%", aspectRatio: undefined, height: 90, marginTop: 5 },
  ripple: { flex: 1, width: "100%" },
  menuInside: { flex: 1, alignItems: "center", justifyContent: "center" },
  menuText: { marginTop: 12, fontWeight: "bold", color: "#455A64", fontSize: 13 },
  version: { textAlign: "center", color: "#B0BEC5", fontSize: 11, marginVertical: 25 },
});

export default DashboardAdmin;

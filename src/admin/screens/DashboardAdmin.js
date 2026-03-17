import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, RefreshControl, Dimensions } from "react-native";
import { Text, Avatar, IconButton, Surface, TouchableRipple } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { supabase } from "../../services/supabase";

const screenWidth = Dimensions.get("window").width;

const DashboardAdmin = ({ user, onLogout, navigation, isDarkMode, onToggleTheme }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alpa: 0, totalGuru: 0 });

  // --- VARIABEL WARNA DINAMIS ---
  const primaryColor = "#1976D2";
  const bgColor = isDarkMode ? "#121212" : "#F5F7FA";
  const headerColor = isDarkMode ? "#1E1E1E" : "#E3F2FD";
  const surfaceColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#1A237E";
  const subTextColor = isDarkMode ? "#B0BEC5" : "#546E7A";

  const muatData = async () => {
    setLoading(true);
    const hariIni = new Date().toISOString().split("T")[0];

    try {
      const { count: total } = await supabase.from("tabel_user").select("*", { count: "exact", head: true }).eq("role", "guru");
      const { count: jmlHadir } = await supabase.from("tabel_kehadiran").select("*", { count: "exact", head: true }).eq("tanggal_absen", hariIni).eq("status", "Hadir");
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

  const chartConfig = {
    color: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
  };

  const chartData = [
    { name: "Hadir", population: stats.hadir, color: "#4CAF50", legendFontColor: isDarkMode ? "#FFF" : "#455A64", legendFontSize: 12 },
    { name: "Izin", population: stats.izin, color: "#FFC107", legendFontColor: isDarkMode ? "#FFF" : "#455A64", legendFontSize: 12 },
    { name: "Alpa", population: stats.alpa, color: "#F44336", legendFontColor: isDarkMode ? "#FFF" : "#455A64", legendFontSize: 12 },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={muatData} color={primaryColor} />}>
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerTop}>
          <Surface style={styles.logoContainer} elevation={2}>
            <Image source={require("../../../assets/logo-texar.png")} style={styles.logo} resizeMode="contain" />
          </Surface>

          <View style={{ flexDirection: "row" }}>
            <IconButton icon={isDarkMode ? "weather-sunny" : "weather-night"} iconColor={isDarkMode ? "#FFD600" : "#455A64"} onPress={onToggleTheme} />
            <IconButton icon="logout-variant" iconColor="#D32F2F" size={26} onPress={onLogout} />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text variant="titleMedium" style={{ color: subTextColor }}>
            Selamat Datang,
          </Text>
          <Text variant="headlineSmall" style={[styles.adminName, { color: textColor }]}>
            {user?.full_name || "Admin Sekolah"}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: primaryColor }]}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || "ADMINISTRATOR"}</Text>
          </View>
        </View>
      </View>

      {/* Statistics Row */}
      <View style={styles.statsRow}>
        <StatBox value={stats.hadir} label="HADIR" color="#4CAF50" isDarkMode={isDarkMode} surfaceColor={surfaceColor} subTextColor={subTextColor} />
        <StatBox value={stats.totalGuru} label="GURU" color={primaryColor} isDarkMode={isDarkMode} surfaceColor={surfaceColor} subTextColor={subTextColor} />
        <StatBox value={stats.izin} label="IZIN/SKT" color="#C62828" isDarkMode={isDarkMode} surfaceColor={surfaceColor} subTextColor={subTextColor} />
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        <Text variant="titleMedium" style={[styles.menuTitle, { color: subTextColor }]}>
          MANAJEMEN SISTEM
        </Text>

        <MenuCard icon="account-group" label="Kelola Guru" color={primaryColor} bgColor={isDarkMode ? "#1A237E" : "#E8EAF6"} onPress={() => navigation?.navigate("KelolaGuru")} isDarkMode={isDarkMode} />

        <MenuCard icon="file-chart" label="Rekap Absen" color="#388E3C" bgColor={isDarkMode ? "#1B5E20" : "#F1F8E9"} onPress={() => navigation?.navigate("RekapAbsensi")} isDarkMode={isDarkMode} />

        <MenuCard icon="bullhorn-variant" label="Buat Informasi" color="#FF9800" bgColor={isDarkMode ? "#E65100" : "#FFF3E0"} onPress={() => navigation?.navigate("KelolaInformasi")} isDarkMode={isDarkMode} />

        {/* QR Menu (Full Width) */}
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

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <Text variant="titleMedium" style={[styles.menuTitle, { color: subTextColor }]}>
          PRESENTASE KEHADIRAN HARI INI
        </Text>
        <Surface style={[styles.chartCard, { backgroundColor: surfaceColor }]} elevation={2}>
          <PieChart data={chartData} width={screenWidth - 60} height={180} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
        </Surface>
      </View>

      <Text style={[styles.version, { color: subTextColor }]}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </ScrollView>
  );
};

// --- SUB KOMPONEN ---

const StatBox = ({ value, label, color, surfaceColor, subTextColor }) => (
  <Surface style={[styles.statBox, { backgroundColor: surfaceColor }]} elevation={2}>
    <Text variant="titleLarge" style={{ color: color, fontWeight: "bold" }}>
      {value}
    </Text>
    <Text variant="labelSmall" style={{ color: subTextColor }}>
      {label}
    </Text>
  </Surface>
);

const MenuCard = ({ icon, label, color, bgColor, onPress, isDarkMode }) => (
  <Surface style={[styles.menuItem, { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF" }]} elevation={2}>
    <TouchableRipple onPress={onPress} style={styles.ripple}>
      <View style={styles.menuInside}>
        <Avatar.Icon size={50} icon={icon} style={{ backgroundColor: bgColor }} color={color} />
        <Text variant="labelLarge" style={[styles.menuText, { color: isDarkMode ? "#FFF" : "#455A64" }]}>
          {label}
        </Text>
      </View>
    </TouchableRipple>
  </Surface>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 50, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 },
  logoContainer: { borderRadius: 20, padding: 5, backgroundColor: "#fff" },
  logo: { width: 50, height: 50 },
  textContainer: { marginTop: 5 },
  adminName: { fontWeight: "bold", fontSize: 24 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 5 },
  roleText: { color: "#fff", fontSize: 10, fontWeight: "bold", letterSpacing: 1 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -35, paddingHorizontal: 25 },
  statBox: { width: "30%", padding: 15, borderRadius: 20, alignItems: "center" },
  chartSection: { paddingHorizontal: 25, marginTop: 25 },
  chartCard: { borderRadius: 25, padding: 10, alignItems: "center" },
  menuContainer: { padding: 25, marginTop: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuTitle: { fontWeight: "bold", marginBottom: 15, fontSize: 11, letterSpacing: 1.2, width: "100%" },
  menuItem: { width: "48%", aspectRatio: 1, borderRadius: 25, overflow: "hidden", marginBottom: 15 },
  fullWidth: { width: "100%", aspectRatio: undefined, height: 90, marginTop: 5 },
  ripple: { flex: 1, width: "100%" },
  menuInside: { flex: 1, alignItems: "center", justifyContent: "center" },
  menuText: { marginTop: 12, fontWeight: "bold", fontSize: 13 },
  version: { textAlign: "center", fontSize: 11, marginVertical: 25 },
});

export default DashboardAdmin;

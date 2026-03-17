import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, RefreshControl, Dimensions } from "react-native";
import { Text, Avatar, IconButton, Surface, TouchableRipple } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { supabase } from "../../services/supabase";

const screenWidth = Dimensions.get("window").width;

const UserDashboard = ({ user, onLogout, navigation, isDarkMode, onToggleTheme }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alpa: 0, totalHari: 0 });
  const [infoTerbaru, setInfoTerbaru] = useState(null);

  // Variabel Warna Dinamis
  const primaryColor = "#1976D2";
  const bgColor = isDarkMode ? "#121212" : "#FFFFFF";
  const headerColor = isDarkMode ? "#1E1E1E" : "#E3F2FD";
  const textColor = isDarkMode ? "#FFFFFF" : "#000000";
  const surfaceColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const subTextColor = isDarkMode ? "#B0BEC5" : "#455A64";

  const muatDataUser = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tabel_kehadiran").select("status").eq("user_id", user.id);
      if (data) {
        const nHadir = data.filter((item) => item.status === "Hadir").length;
        const nIzin = data.filter((item) => ["Izin", "Sakit"].includes(item.status)).length;
        const nAlpa = data.filter((item) => item.status === "Alpa").length;
        setStats({ hadir: nHadir, izin: nIzin, alpa: nAlpa, totalHari: data.length });
      }
    } catch (err) {
      console.log("Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const muatInfoTerbaru = async () => {
    try {
      const { data, error } = await supabase.from("tabel_informasi").select("*").order("created_at", { ascending: false }).limit(1).single();
      if (!error && data) setInfoTerbaru(data);
    } catch (err) {
      console.log("Info Error:", err.message);
    }
  };

  useEffect(() => {
    muatDataUser();
    muatInfoTerbaru();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: surfaceColor,
    backgroundGradientTo: surfaceColor,
    color: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
    labelColor: (opacity = 1) => (isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`),
  };

  const chartData = [
    { name: "Hadir", population: stats.hadir, color: "#4CAF50", legendFontColor: textColor, legendFontSize: 12 },
    { name: "Izin", population: stats.izin, color: "#FFC107", legendFontColor: textColor, legendFontSize: 12 },
    { name: "Alpa", population: stats.alpa, color: "#F44336", legendFontColor: textColor, legendFontSize: 12 },
  ];

  const getInisial = (nama) => {
    if (!nama) return "U";
    return nama.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={muatDataUser} color={primaryColor} />}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerTop}>
          <Surface style={styles.logoContainer} elevation={2}>
            <Image source={require("../../../assets/logo-texar.png")} style={styles.logo} resizeMode="contain" />
          </Surface>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton icon={isDarkMode ? "weather-sunny" : "weather-night"} iconColor={isDarkMode ? "#FFD600" : "#455A64"} size={24} onPress={onToggleTheme} />
            <IconButton icon="logout-variant" iconColor="#D32F2F" size={26} onPress={onLogout} />
          </View>
        </View>

        <View style={styles.profileRow}>
          <View style={styles.textContainer}>
            <Text style={{ color: subTextColor, fontSize: 14 }}>Selamat Pagi,</Text>
            <Text style={{ color: textColor, fontWeight: "bold", fontSize: 22 }}>{user?.full_name || "Guru SMK Texar"}</Text>
            <View style={[styles.roleBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.roleText}>User: {user?.username || "user"}</Text>
            </View>
          </View>
          <View style={styles.avatarCircle}>
            {user?.avatar_url ? (
              <Avatar.Image size={75} source={{ uri: user.avatar_url }} style={{ backgroundColor: surfaceColor }} />
            ) : (
              <Avatar.Text size={75} label={getInisial(user?.full_name)} style={{ backgroundColor: primaryColor }} labelStyle={{ color: "#fff" }} />
            )}
          </View>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Surface style={[styles.statBox, { backgroundColor: surfaceColor }]} elevation={2}>
          <Text style={{ color: "#4CAF50", fontWeight: "bold", fontSize: 20 }}>{stats.hadir}</Text>
          <Text style={{ color: textColor, fontSize: 10 }}>HADIR</Text>
        </Surface>
        <Surface style={[styles.statBox, { backgroundColor: surfaceColor }]} elevation={2}>
          <Text style={{ color: primaryColor, fontWeight: "bold", fontSize: 20 }}>{stats.totalHari}</Text>
          <Text style={{ color: textColor, fontSize: 10 }}>TOTAL</Text>
        </Surface>
        <Surface style={[styles.statBox, { backgroundColor: surfaceColor }]} elevation={2}>
          <Text style={{ color: "#C62828", fontWeight: "bold", fontSize: 20 }}>{stats.izin}</Text>
          <Text style={{ color: textColor, fontSize: 10 }}>IZIN</Text>
        </Surface>
      </View>

      {/* PEMBERITAHUAN */}
      {infoTerbaru && (
        <View style={{ paddingHorizontal: 25, marginTop: 25 }}>
          <Surface style={[styles.alertBox, { backgroundColor: isDarkMode ? "#2C1E00" : "#FFFBEB" }]} elevation={3}>
            <View style={styles.alertHeader}>
              <Avatar.Icon size={30} icon="alert-decagram" style={{ backgroundColor: "#FFE0B2" }} color="#E65100" />
              <Text style={{ marginLeft: 10, color: "#FF9800", fontWeight: "bold", fontSize: 12 }}>PEMBERITAHUAN</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={{ color: textColor, fontWeight: "bold", fontSize: 16 }}>{infoTerbaru.judul}</Text>
              <Text style={{ color: textColor, fontSize: 14, marginTop: 4 }}>{infoTerbaru.isi}</Text>
              <Text style={{ color: subTextColor, fontSize: 10, marginTop: 10, fontStyle: "italic" }}>Diterbitkan: {new Date(infoTerbaru.created_at).toLocaleDateString("id-ID")}</Text>
            </View>
          </Surface>
        </View>
      )}

      {/* MENU UTAMA */}
      <View style={styles.menuContainer}>
        <Text style={{ color: subTextColor, fontWeight: "bold", marginBottom: 15, fontSize: 12 }}>LAYANAN PRESENSI</Text>
        <View style={styles.grid}>
          <MenuButton icon="qrcode-scan" label="Scan" color={primaryColor} bgColor={isDarkMode ? "#1A237E" : "#E8EAF6"} onPress={() => navigation?.navigate("ScannerAbsen")} isDarkMode={isDarkMode} />
          <MenuButton icon="file-document-edit" label="Izin" color="#388E3C" bgColor={isDarkMode ? "#1B5E20" : "#F1F8E9"} onPress={() => navigation?.navigate("FormIzin")} isDarkMode={isDarkMode} />
          <MenuButton icon="account-cog" label="Profil" color="#F57C00" bgColor={isDarkMode ? "#4E342E" : "#FFF3E0"} onPress={() => navigation?.navigate("UserProfile")} isDarkMode={isDarkMode} />
        </View>
      </View>

      {/* CHART */}
      <View style={styles.chartSection}>
        <Surface style={[styles.chartCard, { backgroundColor: surfaceColor }]} elevation={2}>
          <PieChart data={chartData} width={screenWidth - 60} height={180} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={"15"} absolute />
        </Surface>
      </View>
      <Text style={[styles.version, { color: subTextColor }]}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </ScrollView>
  );
};

// Komponen Kecil untuk Menu agar rapi
const MenuButton = ({ icon, label, color, bgColor, onPress, isDarkMode }) => (
  <Surface style={[styles.menuItem, { backgroundColor: isDarkMode ? "#1E1E1E" : "#F8F9FA" }]} elevation={2}>
    <TouchableRipple onPress={onPress} style={styles.ripple}>
      <View style={styles.menuInside}>
        <Avatar.Icon size={45} icon={icon} style={{ backgroundColor: bgColor }} color={color} />
        <Text style={{ marginTop: 8, fontWeight: "bold", color: isDarkMode ? "#FFFFFF" : "#000000" }}>{label}</Text>
      </View>
    </TouchableRipple>
  </Surface>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingBottom: 40, paddingHorizontal: 25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  logoContainer: { borderRadius: 15, padding: 5, backgroundColor: "#fff" },
  profileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  textContainer: { flex: 1 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginTop: 5 },
  roleText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  avatarCircle: { elevation: 5, borderRadius: 40 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -25, paddingHorizontal: 20 },
  statBox: { width: "30%", padding: 15, borderRadius: 20, alignItems: "center" },
  chartSection: { padding: 25, paddingTop: 0 },
  chartCard: { borderRadius: 25, padding: 10, alignItems: "center" },
  menuContainer: { padding: 25 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  menuItem: { width: "31%", borderRadius: 20, overflow: "hidden" },
  ripple: { paddingVertical: 20 },
  menuInside: { alignItems: "center" },
  logo: { width: 45, height: 45 },
  alertBox: { borderRadius: 15, borderLeftWidth: 6, borderLeftColor: "#FF9800", padding: 15 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  alertContent: { paddingLeft: 0 },
  version: { textAlign: "center", fontSize: 11, marginBottom: 20 },
});

export default UserDashboard;

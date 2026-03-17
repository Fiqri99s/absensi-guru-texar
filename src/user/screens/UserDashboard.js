import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, ScrollView, RefreshControl, Dimensions } from "react-native";
import { Text, Avatar, IconButton, Surface, TouchableRipple } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { supabase } from "../../services/supabase";

const screenWidth = Dimensions.get("window").width;

const UserDashboard = ({ user, onLogout, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ hadir: 0, izin: 0, alpa: 0, totalHari: 0 });
  const [infoTerbaru, setInfoTerbaru] = useState(null);

  const primaryColor = "#1976D2";
  const lightBlue = "#E3F2FD";

  const muatDataUser = async () => {
    setLoading(true);
    try {
      // 1. Ambil Stats Kehadiran berdasarkan user_id (Sesuai screenshot tabel_kehadiran kamu)
      const { data, error } = await supabase.from("tabel_kehadiran").select("status").eq("user_id", user.id);

      if (data) {
        const nHadir = data.filter((item) => item.status === "Hadir").length;
        const nIzin = data.filter((item) => ["Izin", "Sakit"].includes(item.status)).length;
        const nAlpa = data.filter((item) => item.status === "Alpa").length;
        setStats({ hadir: nHadir, izin: nIzin, alpa: nAlpa, totalHari: data.length });
      }
    } catch (err) {
      console.log("Error fetching stats:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const muatInfoTerbaru = async () => {
    try {
      const { data, error } = await supabase.from("tabel_informasi").select("*").order("created_at", { ascending: false }).limit(1).single();

      if (!error && data) {
        setInfoTerbaru(data);
      }
    } catch (err) {
      console.log("Info Error:", err.message);
    }
  };

  useEffect(() => {
    muatDataUser();
    muatInfoTerbaru();
  }, []);

  const chartData = [
    { name: "Hadir", population: stats.hadir, color: "#4CAF50", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Izin", population: stats.izin, color: "#FFC107", legendFontColor: "#7F7F7F", legendFontSize: 12 },
    { name: "Alpa", population: stats.alpa, color: "#F44336", legendFontColor: "#7F7F7F", legendFontSize: 12 },
  ];

  // Fungsi untuk mengambil inisial (Contoh: Anisa -> AN)
  const getInisial = (nama) => {
    if (!nama) return "U";
    return nama.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={loading} onRefresh={muatDataUser} color={primaryColor} />}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: lightBlue }]}>
        <View style={styles.headerTop}>
          <Surface style={styles.logoContainer} elevation={2}>
            <Image source={require("../../../assets/logo-texar.png")} style={styles.logo} resizeMode="contain" />
          </Surface>
          <IconButton icon="logout-variant" iconColor="#D32F2F" size={26} onPress={onLogout} />
        </View>

        <View style={styles.profileRow}>
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={styles.welcomeText}>
              Selamat Pagi,
            </Text>
            <Text variant="headlineSmall" style={styles.adminName}>
              {user?.full_name || "Nama User"}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.roleText}>User: {user?.username || "USER"}</Text>
            </View>
          </View>

          {/* FOTO PROFIL (Hanya Inisial Text, Tanpa avatar_url) */}
          <View style={styles.avatarCircle}>
            <Avatar.Text size={75} label={getInisial(user?.full_name)} style={{ backgroundColor: primaryColor }} labelStyle={{ fontWeight: "bold" }} />
          </View>
        </View>
      </View>

      {/* STATS ROW */}
      <View style={styles.statsRow}>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: "#4CAF50", fontWeight: "bold" }}>
            {stats.hadir}
          </Text>
          <Text variant="labelSmall">HADIR</Text>
        </Surface>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: primaryColor, fontWeight: "bold" }}>
            {stats.totalHari}
          </Text>
          <Text variant="labelSmall">TOTAL</Text>
        </Surface>
        <Surface style={styles.statBox} elevation={1}>
          <Text variant="titleLarge" style={{ color: "#C62828", fontWeight: "bold" }}>
            {stats.izin}
          </Text>
          <Text variant="labelSmall">IZIN/SKT</Text>
        </Surface>
      </View>

      {/* MENU UTAMA */}

      {infoTerbaru && (
        <View style={{ paddingHorizontal: 25, marginTop: 25, marginBottom: 10 }}>
          <Surface style={styles.alertBox} elevation={3}>
            {/* Container Ikon & Label */}
            <View style={styles.alertHeader}>
              <Avatar.Icon size={30} icon="alert-decagram" style={styles.iconBackground} color="#E65100" />
              <Text variant="labelLarge" style={styles.alertLabel}>
                PEMBERITAHUAN
              </Text>
              <IconButton icon="close" size={16} onPress={() => setInfoTerbaru(null)} />
            </View>

            {/* Isi Informasi */}
            <View style={styles.alertContent}>
              <Text variant="titleMedium" style={styles.infoTitle}>
                {infoTerbaru.judul}
              </Text>
              <Text variant="bodySmall" style={styles.infoIsi}>
                {infoTerbaru.isi}
              </Text>

              {/* Tanggal terbit */}
              <View style={styles.dateRow}>
                <Text style={styles.infoTgl}>Diterbitkan: {new Date(infoTerbaru.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</Text>
              </View>
            </View>
          </Surface>
        </View>
      )}

      <View style={styles.menuContainer}>
        <Text variant="titleMedium" style={styles.menuTitle}>
          LAYANAN PRESENSI
        </Text>
        <View style={styles.grid}>
          <Surface style={styles.menuItem} elevation={2}>
            <TouchableRipple onPress={() => navigation?.navigate("ScannerAbsen")} style={styles.ripple}>
              <View style={styles.menuInside}>
                <Avatar.Icon size={50} icon="qrcode-scan" style={{ backgroundColor: "#E8EAF6" }} color={primaryColor} />
                <Text variant="labelLarge" style={styles.menuText}>
                  Scan Absen
                </Text>
              </View>
            </TouchableRipple>
          </Surface>

          <Surface style={styles.menuItem} elevation={2}>
            <TouchableRipple onPress={() => navigation?.navigate("FormIzin")} style={styles.ripple}>
              <View style={styles.menuInside}>
                <Avatar.Icon size={50} icon="file-document-edit" style={{ backgroundColor: "#F1F8E9" }} color="#388E3C" />
                <Text variant="labelLarge" style={styles.menuText}>
                  Izin / Sakit
                </Text>
              </View>
            </TouchableRipple>
          </Surface>
        </View>
      </View>

      {/* CHART */}
      <View style={styles.chartSection}>
        <Text variant="titleMedium" style={styles.menuTitle}>
          PRESENTASE KEHADIRAN
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
  logoContainer: { borderRadius: 15, padding: 5, backgroundColor: "#fff" },
  profileRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  textContainer: { flex: 1 },
  welcomeText: { color: "#546E7A" },
  adminName: { color: "#1A237E", fontWeight: "bold", fontSize: 24 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 2, borderRadius: 5, marginTop: 5 },
  roleText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  avatarCircle: { elevation: 5, borderRadius: 40, borderLineWidth: 3, borderColor: "#fff" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -25, paddingHorizontal: 20 },
  statBox: { backgroundColor: "#fff", width: "30%", padding: 15, borderRadius: 20, alignItems: "center" },
  chartSection: { paddingHorizontal: 25, marginTop: 25 },
  chartCard: { backgroundColor: "#fff", borderRadius: 25, padding: 10, alignItems: "center" },
  menuContainer: { padding: 25, marginTop: 10 },
  menuTitle: { color: "#90A4AE", fontWeight: "bold", marginBottom: 15, fontSize: 11, letterSpacing: 1.2 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  menuItem: { backgroundColor: "#F8F9FA", width: "47%", borderRadius: 25, overflow: "hidden" },
  ripple: { padding: 22 },
  menuInside: { alignItems: "center" },
  menuText: { marginTop: 12, fontWeight: "bold", color: "#455A64" },
  version: { textAlign: "center", color: "#B0BEC5", fontSize: 11, marginVertical: 25 },
  logo: { width: 45, height: 45 },
  alertBox: { backgroundColor: "#FFFBEB", borderRadius: 15, borderLeftWidth: 6, borderLeftColor: "#FF9800", overflow: "hidden" },
  alertHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingTop: 8 },
  iconBackground: { backgroundColor: "#FFE0B2" },
  alertLabel: { flex: 1, marginLeft: 12, color: "#E65100", fontWeight: "bold", letterSpacing: 1.5, fontSize: 10 },
  alertContent: { paddingHorizontal: 20, paddingLeft: 52, paddingBottom: 12, marginTop: -5 },
  infoTitle: { color: "#000", fontWeight: "bold", marginBottom: 4 },
  infoIsi: { color: "#444", lineHeight: 18 },
  dateRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  infoTgl: { fontSize: 9, color: "#999", fontStyle: "italic" },
});

export default UserDashboard;

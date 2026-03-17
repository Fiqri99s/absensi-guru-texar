import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator, Dimensions, Platform } from "react-native";
import { DataTable, Searchbar, Appbar, Text, Surface, Button, Portal, Modal, Divider, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
// Import bersyarat agar tidak crash di web
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { supabase } from "../../services/supabase";

const RekapAbsensi = ({ navigation, onBack, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalFilterVisible, setModalFilterVisible] = useState(false);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const theme = {
    primary: "#1976D2",
    bg: isDarkMode ? "#121212" : "#F0F4F8",
    surface: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A237E",
    subText: isDarkMode ? "#B0BEC5" : "#546E7A",
    headerTable: isDarkMode ? "#2C2C2C" : "#E3F2FD",
    border: isDarkMode ? "#333333" : "#E0E0E0",
    modalBg: isDarkMode ? "#242424" : "#FFFFFF",
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const fetchAndDownload = async (filterRange = "all", shouldDownload = false) => {
    setLoading(true);
    setModalFilterVisible(false);

    let query = supabase.from("tabel_kehadiran").select(`*, tabel_user(full_name)`).order("tanggal_absen", { ascending: false });
    const now = new Date();

    if (filterRange === "today") {
      query = query.eq("tanggal_absen", now.toISOString().split("T")[0]);
    } else if (filterRange === "week") {
      const past = new Date(now.setDate(now.getDate() - 7)).toISOString().split("T")[0];
      query = query.gte("tanggal_absen", past);
    } else if (filterRange === "month") {
      const past = new Date(now.setMonth(now.getMonth() - 1)).toISOString().split("T")[0];
      query = query.gte("tanggal_absen", past);
    }

    try {
      const { data, error } = await query;
      if (error) throw error;
      setDataAbsen(data || []);

      if (shouldDownload) {
        processDownload(data, filterRange);
      }
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAbsensi = () => fetchAndDownload("all", false);

  // --- LOGIKA DOWNLOAD YANG SUPPORT WEB & MOBILE ---
  const processDownload = async (dataToExport, rangeName) => {
    if (!dataToExport || dataToExport.length === 0) {
      return Alert.alert("Kosong", "Tidak ada data untuk rentang waktu ini.");
    }

    const header = "Nama Guru,Tanggal,Status\n";
    const rows = dataToExport.map((item) => `${item.tabel_user?.full_name},${item.tanggal_absen},${item.status}`).join("\n");
    const csvContent = header + rows;
    const fileName = `Rekap_${rangeName}_${new Date().getTime()}.csv`;

    // JIKA DI WEB
    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // JIKA DI MOBILE (Android/iOS)
    else {
      try {
        const filePath = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(filePath, {
          mimeType: "text/csv",
          dialogTitle: `Download Rekap ${rangeName}`,
          UTI: "public.comma-separated-values-text",
        });
      } catch (e) {
        Alert.alert("Gagal Download", e.message);
      }
    }
  };

  const handleHapusSemua = () => {
    Alert.alert("Hapus Permanen", "Yakin hapus SEMUA data?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("tabel_kehadiran").delete().neq("id", 0);
          fetchAbsensi();
          setModalFilterVisible(false);
        },
      },
    ]);
  };

  const filteredData = dataAbsen.filter((item) => (item.tabel_user?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <Appbar.Header style={{ backgroundColor: isDarkMode ? "#1E1E1E" : theme.primary }}>
        <Appbar.BackAction color="#fff" onPress={() => navigation?.goBack() || onBack()} />
        <Appbar.Content title="Rekap Absensi" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar placeholder="Cari Nama Guru..." onChangeText={setSearchQuery} value={searchQuery} style={[styles.search, { backgroundColor: theme.surface }]} inputStyle={{ color: theme.text }} iconColor={theme.subText} />

        <Button mode="contained" icon="download-box" onPress={() => setModalFilterVisible(true)} style={styles.mainBtn} buttonColor={theme.primary} labelStyle={{ color: "#fff", fontWeight: "bold" }}>
          DOWNLOAD REKAPITULASI
        </Button>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : (
          <Surface style={[styles.tableCard, { backgroundColor: theme.surface }]} elevation={2}>
            <ScrollView horizontal>
              <DataTable>
                <DataTable.Header style={{ backgroundColor: theme.headerTable }}>
                  <DataTable.Title style={{ width: 140 }}>
                    <Text style={[styles.columnLabel, { color: theme.primary }]}>NAMA GURU</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ width: 100 }}>
                    <Text style={[styles.columnLabel, { color: theme.primary }]}>TANGGAL</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ width: 80 }}>
                    <Text style={[styles.columnLabel, { color: theme.primary }]}>STATUS</Text>
                  </DataTable.Title>
                  <DataTable.Title style={{ width: 50 }}>
                    <Text style={[styles.columnLabel, { color: theme.primary }]}>OPSI</Text>
                  </DataTable.Title>
                </DataTable.Header>

                <ScrollView style={{ maxHeight: Dimensions.get("window").height - 380 }}>
                  {filteredData.map((item) => (
                    <DataTable.Row key={item.id} style={{ borderBottomColor: theme.border }}>
                      <DataTable.Cell style={{ width: 140 }}>
                        <Text style={{ color: theme.text }}>{item.tabel_user?.full_name}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        <Text style={{ color: theme.text }}>{item.tanggal_absen}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 80 }}>
                        <Text style={{ color: item.status === "Hadir" ? "#4CAF50" : "#F44336", fontWeight: "bold" }}>{item.status}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 50 }}>
                        <IconButton
                          icon="trash-can-outline"
                          iconColor="#D32F2F"
                          size={18}
                          onPress={() => {
                            setSelectedId(item.id);
                            setModalDeleteVisible(true);
                          }}
                        />
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </ScrollView>
              </DataTable>
            </ScrollView>
          </Surface>
        )}
      </View>

      <Portal>
        <Modal visible={modalFilterVisible} onDismiss={() => setModalFilterVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.modalBg }]}>
          <Text variant="titleLarge" style={[styles.modalTitle, { color: theme.text }]}>
            Pilih Rekap Download
          </Text>
          <Divider style={{ marginBottom: 20 }} />

          <View style={styles.grid}>
            <Button mode="contained" style={styles.gridBtn} onPress={() => fetchAndDownload("today", true)} buttonColor={theme.primary} textColor="#fff">
              Rekap Hari Ini
            </Button>
            <Button mode="contained" style={styles.gridBtn} onPress={() => fetchAndDownload("week", true)} buttonColor={theme.primary} textColor="#fff">
              Rekap 7 Hari
            </Button>
            <Button mode="contained" style={styles.gridBtn} onPress={() => fetchAndDownload("month", true)} buttonColor={theme.primary} textColor="#fff">
              Rekap 30 Hari
            </Button>
            <Button mode="contained" style={styles.gridBtn} onPress={() => fetchAndDownload("all", true)} buttonColor="#757575" textColor="#fff">
              Semua Data
            </Button>
          </View>

          <Divider style={{ marginVertical: 15 }} />
          <Button mode="outlined" icon="delete-forever" onPress={handleHapusSemua} textColor="#D32F2F" style={{ borderColor: "#D32F2F" }}>
            HAPUS SEMUA DATA
          </Button>
          <Button onPress={() => setModalFilterVisible(false)} textColor={theme.primary} style={{ marginTop: 15 }}>
            Batal
          </Button>
        </Modal>

        <Modal visible={modalDeleteVisible} onDismiss={() => setModalDeleteVisible(false)} contentContainerStyle={[styles.modal, { backgroundColor: theme.modalBg }]}>
          <Text style={{ color: theme.text, fontWeight: "bold", fontSize: 18 }}>Hapus Baris Ini?</Text>
          <Text style={{ color: theme.subText, marginVertical: 15 }}>Data ini akan dihapus permanen.</Text>
          <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
            <Button onPress={() => setModalDeleteVisible(false)}>Batal</Button>
            <Button
              mode="contained"
              buttonColor="#D32F2F"
              style={{ marginLeft: 10 }}
              onPress={async () => {
                await supabase.from("tabel_kehadiran").delete().eq("id", selectedId);
                fetchAbsensi();
                setModalDeleteVisible(false);
              }}
            >
              Hapus
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 15, flex: 1 },
  search: { marginBottom: 15, borderRadius: 12 },
  mainBtn: { marginBottom: 15, borderRadius: 12, paddingVertical: 8 },
  tableCard: { borderRadius: 15, overflow: "hidden" },
  columnLabel: { fontWeight: "bold", fontSize: 11 },
  modal: { padding: 25, margin: 20, borderRadius: 25 },
  modalTitle: { fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridBtn: { width: "48%", marginBottom: 12, borderRadius: 10 },
});

export default RekapAbsensi;

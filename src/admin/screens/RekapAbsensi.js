import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator, Platform } from "react-native";
import { DataTable, IconButton, Searchbar, FAB, Portal, Modal, Button, Text, List, Appbar, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const RekapAbsensi = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleExport, setVisibleExport] = useState(false);

  const fetchAbsensi = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tabel_kehadiran").select(`id, user_id, tanggal_absen, status, keterangan, tabel_user (full_name)`).order("tanggal_absen", { ascending: false });

      if (error) throw error;
      setDataAbsen(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const handleExport = (tipe) => {
    const todayStr = new Date().toISOString().split("T")[0];
    let filteredData = [];

    if (tipe === "hari") {
      filteredData = dataAbsen.filter((item) => item.tanggal_absen === todayStr);
    } else if (tipe === "minggu") {
      const limit = new Date();
      limit.setDate(limit.getDate() - 7);
      filteredData = dataAbsen.filter((item) => new Date(item.tanggal_absen) >= limit);
    } else if (tipe === "bulan") {
      const limit = new Date();
      limit.setMonth(limit.getMonth() - 1);
      filteredData = dataAbsen.filter((item) => new Date(item.tanggal_absen) >= limit);
    } else {
      filteredData = dataAbsen;
    }

    if (filteredData.length === 0) return Alert.alert("Info", "Data tidak ditemukan untuk periode ini.");

    let csvContent = "Nama,Tanggal,Status,Keterangan\n";
    filteredData.forEach((row) => {
      csvContent += `${row.tabel_user?.full_name || row.user_id},${row.tanggal_absen},${row.status},${row.keterangan || "-"}\n`;
    });

    if (Platform.OS === "web") {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Laporan_${tipe}_${todayStr}.csv`;
      link.click();
    }
    setVisibleExport(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus data absensi ini?")) {
      try {
        const { error } = await supabase.from("tabel_kehadiran").delete().eq("id", id);
        if (error) throw error;
        fetchAbsensi();
      } catch (e) {
        alert(e.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("⚠️ PERINGATAN: Hapus SELURUH data absensi secara permanen?")) {
      try {
        setLoading(true);
        const { error } = await supabase.from("tabel_kehadiran").delete().not("id", "is", null);
        if (error) throw error;
        fetchAbsensi();
        setVisibleExport(false);
      } catch (e) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#fff" onPress={onBack} />
        <Appbar.Content title="Rekap Absensi" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="refresh" color="#fff" onPress={fetchAbsensi} />
      </Appbar.Header>

      <Searchbar placeholder="Cari Nama Guru..." onChangeText={setSearchQuery} value={searchQuery} style={styles.search} inputStyle={{ color: "#000" }} />

      {loading ? (
        <ActivityIndicator size="large" color="#1976D2" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableWrapper}>
            <DataTable>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.colNama}>
                  <Text style={styles.headerText}>Nama</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.colTgl}>
                  <Text style={styles.headerText}>Tanggal</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.colStatus}>
                  <Text style={styles.headerText}>Status</Text>
                </DataTable.Title>
                <DataTable.Title numeric style={styles.colAksi}>
                  <Text style={styles.headerText}>Aksi</Text>
                </DataTable.Title>
              </DataTable.Header>

              {dataAbsen
                .filter((item) => (item.tabel_user?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <DataTable.Row key={item.id}>
                    <DataTable.Cell style={styles.colNama}>
                      <Text style={styles.textDark}>{item.tabel_user?.full_name || item.user_id}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.colTgl}>
                      <Text style={styles.textDark}>{item.tanggal_absen}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.colStatus}>
                      <Text style={[styles.textDark, { fontWeight: "bold" }]}>{item.status}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.colAksi}>
                      <IconButton icon="trash-can" size={20} iconColor="#D32F2F" onPress={() => handleDelete(item.id)} />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
            </DataTable>
          </View>
        </ScrollView>
      )}

      <FAB icon="file-chart" label="Menu Laporan" style={styles.fab} color="#fff" onPress={() => setVisibleExport(true)} />

      <Portal>
        <Modal visible={visibleExport} onDismiss={() => setVisibleExport(false)} contentContainerStyle={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Opsi Laporan & Data</Text>
            <IconButton icon="close" size={20} onPress={() => setVisibleExport(false)} />
          </View>

          <ScrollView>
            <Text style={styles.sectionLabel}>UNDUH LAPORAN (CSV)</Text>
            <List.Item title="Hari Ini" left={(p) => <List.Icon {...p} icon="calendar-today" color="#1976D2" />} onPress={() => handleExport("hari")} />
            <List.Item title="Minggu Ini" left={(p) => <List.Icon {...p} icon="calendar-week" color="#1976D2" />} onPress={() => handleExport("minggu")} />
            <List.Item title="Bulan Ini" left={(p) => <List.Icon {...p} icon="calendar-month" color="#1976D2" />} onPress={() => handleExport("bulan")} />
            <List.Item title="Semua Periode" left={(p) => <List.Icon {...p} icon="database-export" color="#1976D2" />} onPress={() => handleExport("semua")} />

            <Divider style={styles.modalDivider} />

            <Text style={[styles.sectionLabel, { color: "#D32F2F" }]}>TINDAKAN BERBAHAYA</Text>
            <List.Item title="Hapus Semua Data" titleStyle={{ color: "#D32F2F", fontWeight: "bold" }} left={(p) => <List.Icon {...p} icon="delete-forever" color="#D32F2F" />} onPress={handleClearAll} />
          </ScrollView>

          <Button mode="contained" onPress={() => setVisibleExport(false)} style={styles.closeBtn} buttonColor="#1976D2">
            Selesai
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0F4F8" },
  appbar: { backgroundColor: "#1976D2" },
  appbarTitle: { color: "#fff", fontWeight: "bold" },
  search: { margin: 15, elevation: 4, backgroundColor: "#fff", borderRadius: 10 },
  tableWrapper: { backgroundColor: "#fff", marginHorizontal: 10, borderRadius: 8, elevation: 3, marginBottom: 120 },
  tableHeader: { backgroundColor: "#E3F2FD" },
  headerText: { fontWeight: "bold", color: "#1976D2" },
  textDark: { color: "#333" },
  colNama: { width: 140 },
  colTgl: { width: 100 },
  colStatus: { width: 80 },
  colAksi: { width: 60 },
  fab: { position: "absolute", right: 16, bottom: 20, backgroundColor: "#1976D2" },

  // Gaya Modal yang dipercantik
  modal: { backgroundColor: "white", padding: 20, margin: 20, borderRadius: 15, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: "#1976D2" },
  sectionLabel: { fontSize: 12, fontWeight: "bold", color: "#777", marginTop: 10, marginLeft: 15 },
  modalDivider: { marginVertical: 15 },
  closeBtn: { marginTop: 20, borderRadius: 8 },
});

export default RekapAbsensi;

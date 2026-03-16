import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { DataTable, Searchbar, Button, IconButton, Text, Surface, ActivityIndicator } from "react-native-paper";
import { supabase } from "../../services/supabase";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const RekapAbsensi = () => {
  const [dataAbsen, setDataAbsen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. Fetch Data (JOIN dengan tabel_user untuk ambil nama)
  const fetchRekap = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tabel_kehadiran")
        .select(
          `
          id,
          user_id,
          waktu_masuk,
          tanggal_absen,
          status,
          keterangan,
          tabel_user (full_name)
        `,
        )
        .order("tanggal_absen", { ascending: false });

      if (error) throw error;
      setDataAbsen(data);
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRekap();
  }, []);

  // 2. Fungsi Hapus (CRUD - Delete)
  const hapusData = (id) => {
    Alert.alert("Konfirmasi", "Hapus data absensi ini?", [
      { text: "Batal" },
      {
        text: "Hapus",
        onPress: async () => {
          const { error } = await supabase.from("tabel_kehadiran").delete().eq("id", id);
          if (!error) fetchRekap();
        },
      },
    ]);
  };

  // 3. Export ke CSV
  const exportData = async () => {
    if (dataAbsen.length === 0) return;

    // Susun header dan baris CSV
    let csvContent = "Nama,Tanggal,Jam,Status,Keterangan\n";
    dataAbsen.forEach((item) => {
      const nama = item.tabel_user?.full_name || "Tanpa Nama";
      const jam = item.waktu_masuk ? new Date(item.waktu_masuk).toLocaleTimeString() : "-";
      csvContent += `${nama},${item.tanggal_absen},${jam},${item.status},${item.keterangan}\n`;
    });

    if (Platform.OS === "web") {
      // Export untuk Browser
      const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
      window.open(encodedUri);
    } else {
      // Export untuk Android/iOS
      const fileUri = FileSystem.documentDirectory + "Rekap_Absensi_SMK_Texar.csv";
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    }
  };

  const filteredData = dataAbsen.filter((item) => item.tabel_user?.full_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineSmall" style={styles.title}>
          Rekap Absensi
        </Text>
        <Button icon="microsoft-excel" mode="contained" onPress={exportData} buttonColor="#2E7D32">
          Export CSV
        </Button>
      </Surface>

      <Searchbar placeholder="Cari nama guru..." onChangeText={setSearch} value={search} style={styles.search} />

      <ScrollView horizontal>
        <View>
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title style={{ width: 150 }}>Nama Guru</DataTable.Title>
              <DataTable.Title style={{ width: 100 }}>Tanggal</DataTable.Title>
              <DataTable.Title style={{ width: 80 }}>Status</DataTable.Title>
              <DataTable.Title style={{ width: 100 }}>Aksi</DataTable.Title>
            </DataTable.Header>

            {loading ? (
              <ActivityIndicator style={{ marginTop: 20 }} />
            ) : (
              filteredData.map((item) => (
                <DataTable.Row key={item.id}>
                  <DataTable.Cell style={{ width: 150 }}>{item.tabel_user?.full_name}</DataTable.Cell>
                  <DataTable.Cell style={{ width: 100 }}>{item.tanggal_absen}</DataTable.Cell>
                  <DataTable.Cell style={{ width: 80 }}>
                    <Text style={{ color: item.status === "Hadir" ? "green" : "red" }}>{item.status}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{ width: 100 }}>
                    <IconButton icon="pencil" size={18} onPress={() => {}} />
                    <IconButton icon="trash-can" iconColor="red" size={18} onPress={() => hapusData(item.id)} />
                  </DataTable.Cell>
                </DataTable.Row>
              ))
            )}
          </DataTable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff" },
  title: { fontWeight: "bold", color: "#1976D2" },
  search: { margin: 15, elevation: 1, backgroundColor: "#fff" },
  table: { backgroundColor: "#fff", minWidth: 450 },
  tableHeader: { backgroundColor: "#f0f0f0" },
});

export default RekapAbsensi;

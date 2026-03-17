import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Alert, ActivityIndicator, Dimensions } from "react-native";
import { DataTable, Searchbar, Appbar, Text, Surface, IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const RekapAbsensi = ({ navigation, onBack, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [dataAbsen, setDataAbsen] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // --- TEMA DINAMIS ---
  const theme = {
    primary: "#1976D2",
    bg: isDarkMode ? "#121212" : "#F0F4F8",
    surface: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A237E",
    subText: isDarkMode ? "#B0BEC5" : "#546E7A",
    headerTable: isDarkMode ? "#2C2C2C" : "#E3F2FD",
    border: isDarkMode ? "#333333" : "#E0E0E0",
  };

  useEffect(() => {
    fetchAbsensi();
  }, []);

  const fetchAbsensi = async () => {
    setLoading(true);
    try {
      // Mengambil data kehadiran beserta nama dari tabel_user
      const { data, error } = await supabase.from("tabel_kehadiran").select(`*, tabel_user(full_name)`).order("tanggal_absen", { ascending: false });

      if (error) throw error;
      setDataAbsen(data || []);
    } catch (e) {
      console.error("Error fetch:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = dataAbsen.filter((item) => (item.tabel_user?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header */}
      <Appbar.Header style={{ backgroundColor: isDarkMode ? "#1E1E1E" : theme.primary }}>
        <Appbar.BackAction color="#fff" onPress={() => navigation?.goBack() || onBack()} />
        <Appbar.Content title="Rekap Absensi" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
        <Appbar.Action icon="refresh" color="#fff" onPress={fetchAbsensi} />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Search Bar Dinamis */}
        <Searchbar
          placeholder="Cari Nama Guru..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.search, { backgroundColor: theme.surface }]}
          inputStyle={{ color: theme.text }}
          iconColor={theme.subText}
          placeholderTextColor={theme.subText}
        />

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={{ color: theme.subText, marginTop: 10 }}>Memuat Data...</Text>
          </View>
        ) : (
          <Surface style={[styles.tableCard, { backgroundColor: theme.surface }]} elevation={2}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                <DataTable>
                  {/* Header Tabel */}
                  <DataTable.Header style={[styles.tableHeader, { backgroundColor: theme.headerTable }]}>
                    <DataTable.Title style={{ width: 150 }}>
                      <Text style={[styles.columnLabel, { color: theme.primary }]}>NAMA GURU</Text>
                    </DataTable.Title>
                    <DataTable.Title style={{ width: 110 }}>
                      <Text style={[styles.columnLabel, { color: theme.primary }]}>TANGGAL</Text>
                    </DataTable.Title>
                    <DataTable.Title style={{ width: 90 }}>
                      <Text style={[styles.columnLabel, { color: theme.primary }]}>STATUS</Text>
                    </DataTable.Title>
                  </DataTable.Header>

                  {/* Body Tabel */}
                  <ScrollView style={{ maxHeight: 450 }}>
                    {filteredData.length === 0 ? (
                      <Text style={[styles.emptyText, { color: theme.subText }]}>Data tidak ditemukan</Text>
                    ) : (
                      filteredData.map((item) => (
                        <DataTable.Row key={item.id} style={{ borderBottomColor: theme.border }}>
                          <DataTable.Cell style={{ width: 150 }}>
                            <Text style={{ color: theme.text }}>{item.tabel_user?.full_name || "Guru"}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 110 }}>
                            <Text style={{ color: theme.text }}>{item.tanggal_absen}</Text>
                          </DataTable.Cell>
                          <DataTable.Cell style={{ width: 90 }}>
                            <View style={[styles.statusBadge, { backgroundColor: item.status === "Hadir" ? "#E8F5E9" : "#FFEBEE" }]}>
                              <Text
                                style={{
                                  color: item.status === "Hadir" ? "#2E7D32" : "#C62828",
                                  fontWeight: "bold",
                                  fontSize: 12,
                                }}
                              >
                                {item.status}
                              </Text>
                            </View>
                          </DataTable.Cell>
                        </DataTable.Row>
                      ))
                    )}
                  </ScrollView>
                </DataTable>
              </View>
            </ScrollView>
          </Surface>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 15, flex: 1 },
  search: { marginBottom: 15, borderRadius: 12, elevation: 2 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  tableCard: { borderRadius: 15, overflow: "hidden", paddingBottom: 10 },
  tableHeader: { borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
  columnLabel: { fontWeight: "bold", fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: "center" },
  emptyText: { textAlign: "center", padding: 20, fontStyle: "italic" },
});

export default RekapAbsensi;

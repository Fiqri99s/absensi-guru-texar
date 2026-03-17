import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Text, TextInput, Button, Card, IconButton, Appbar, ActivityIndicator, List, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const KelolaInformasi = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [informasi, setInformasi] = useState([]);

  // State untuk Form
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const primaryColor = "#1976D2";

  // 1. Ambil Data dari Database
  const fetchInformasi = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.from("tabel_informasi").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      setInformasi(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  // 2. Simpan Informasi Baru (Create)
  const handleSimpan = async () => {
    if (!judul || !isi) {
      alert("Judul dan isi informasi harus diisi!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("tabel_informasi").insert([{ judul, isi, penulis: "Admin" }]);

      if (error) throw error;

      alert("Informasi berhasil diterbitkan!");
      setJudul("");
      setIsi("");
      fetchInformasi(); // Refresh list
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Hapus Informasi (Delete)
  const handleHapus = async (id) => {
    const yakin = window.confirm("Hapus informasi ini?");
    if (!yakin) return;

    try {
      const { error } = await supabase.from("tabel_informasi").delete().eq("id", id);
      if (error) throw error;
      fetchInformasi();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Appbar / Header dengan tombol kembali */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#fff" onPress={onBack} />
        <Appbar.Content title="Kelola Informasi" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Form Input */}
        <Card style={styles.cardInput}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Buat Pengumuman Baru
            </Text>
            <TextInput label="Judul Informasi" value={judul} onChangeText={setJudul} mode="outlined" style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={primaryColor} textColor="#000" />
            <TextInput label="Isi Pengumuman" value={isi} onChangeText={setIsi} mode="outlined" multiline numberOfLines={4} style={styles.input} outlineColor="#E0E0E0" activeOutlineColor={primaryColor} textColor="#000" />
            <Button mode="contained" onPress={handleSimpan} loading={loading} disabled={loading} style={styles.button} buttonColor={primaryColor} labelStyle={{ color: "white" }}>
              Terbitkan Sekarang
            </Button>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        {/* Daftar Informasi (CRUD) */}
        <Text variant="titleMedium" style={styles.historyTitle}>
          Riwayat Informasi
        </Text>

        {fetching ? (
          <ActivityIndicator color={primaryColor} style={{ marginTop: 20 }} />
        ) : informasi.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada informasi yang dibuat.</Text>
        ) : (
          informasi.map((item) => (
            <Card key={item.id} style={styles.cardItem}>
              <List.Item
                title={item.judul}
                titleStyle={styles.itemTitle}
                description={item.isi}
                descriptionStyle={styles.itemDesc}
                descriptionNumberOfLines={3}
                right={(props) => <IconButton {...props} icon="trash-can-outline" iconColor="#D32F2F" onPress={() => handleHapus(item.id)} />}
              />
              <View style={styles.itemFooter}>
                <Text style={styles.dateText}>
                  {new Date(item.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Text style={styles.version}>v1.0.0 • RPL SMK TEXAR - 2026</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  appbar: { backgroundColor: "#1976D2" },
  appbarTitle: { color: "#fff", fontWeight: "bold" },
  scrollContent: { padding: 20 },
  cardInput: { borderRadius: 15, backgroundColor: "#fff", elevation: 3 },
  sectionTitle: { color: "#1976D2", fontWeight: "bold", marginBottom: 15 },
  input: { backgroundColor: "#fff", marginBottom: 15 },
  button: { borderRadius: 10, paddingVertical: 5 },
  divider: { marginVertical: 25, height: 1 },
  historyTitle: { color: "#455A64", fontWeight: "bold", marginBottom: 15 },
  cardItem: { marginBottom: 12, backgroundColor: "#fff", borderRadius: 12, elevation: 2 },
  itemTitle: { fontWeight: "bold", color: "#000" },
  itemDesc: { color: "#444", marginTop: 5 },
  itemFooter: { paddingHorizontal: 15, paddingBottom: 10, alignItems: "flex-end" },
  dateText: { fontSize: 10, color: "#999" },
  version: { textAlign: "center", color: "#B0BEC5", fontSize: 11, marginVertical: 25 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 20 },
});

export default KelolaInformasi;

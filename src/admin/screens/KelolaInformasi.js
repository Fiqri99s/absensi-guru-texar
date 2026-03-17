import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Text, TextInput, Button, Card, IconButton, Appbar, List, Divider, Surface } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../services/supabase";

const KelolaInformasi = ({ navigation, route, onBack, isDarkMode: propsDarkMode }) => {
  // Ambil isDarkMode dari props atau dari navigation params (jika pakai library navigation)
  const isDarkMode = propsDarkMode ?? route?.params?.isDarkMode;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [informasi, setInformasi] = useState([]);
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  // --- PAKET TEMA DINAMIS ---
  const theme = {
    primary: "#1976D2",
    bg: isDarkMode ? "#121212" : "#F5F7FA",
    surface: isDarkMode ? "#1E1E1E" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#1A237E",
    subText: isDarkMode ? "#B0BEC5" : "#546E7A",
    inputBg: isDarkMode ? "#2C2C2C" : "#FFFFFF",
    border: isDarkMode ? "#333333" : "#E0E0E0",
    header: isDarkMode ? "#1E1E1E" : "#1976D2",
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  const fetchInformasi = async () => {
    setFetching(true);
    try {
      const { data, error } = await supabase.from("tabel_informasi").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setInformasi(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleSimpan = async () => {
    if (!judul || !isi) return Alert.alert("Peringatan", "Judul dan isi tidak boleh kosong!");
    setLoading(true);
    try {
      const { error } = await supabase.from("tabel_informasi").insert([{ judul, isi, penulis: "Admin" }]);
      if (error) throw error;
      Alert.alert("Berhasil", "Informasi diterbitkan!");
      setJudul("");
      setIsi("");
      fetchInformasi();
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Appbar.Header style={{ backgroundColor: theme.header }}>
        <Appbar.BackAction color="#fff" onPress={() => navigation?.goBack() || onBack()} />
        <Appbar.Content title="Kelola Informasi" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card Input Utama */}
        <Surface style={[styles.mainCard, { backgroundColor: theme.surface }]} elevation={2}>
          <Text variant="titleMedium" style={{ color: theme.primary, fontWeight: "bold", marginBottom: 15 }}>
            Buat Pengumuman
          </Text>

          <TextInput
            label="Judul"
            value={judul}
            onChangeText={setJudul}
            mode="outlined"
            style={[styles.input, { backgroundColor: theme.inputBg }]}
            textColor={theme.text}
            activeOutlineColor={theme.primary}
            outlineColor={theme.border}
            placeholderTextColor={theme.subText}
          />

          <TextInput
            label="Isi Pengumuman"
            value={isi}
            onChangeText={setIsi}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, { backgroundColor: theme.inputBg }]}
            textColor={theme.text}
            activeOutlineColor={theme.primary}
            outlineColor={theme.border}
            placeholderTextColor={theme.subText}
          />

          <Button mode="contained" onPress={handleSimpan} loading={loading} buttonColor={theme.primary} style={styles.btn}>
            Terbitkan
          </Button>
        </Surface>

        <View style={styles.historyHeader}>
          <Divider style={[styles.divider, { backgroundColor: theme.border }]} />
          <Text style={[styles.historyTitle, { color: theme.subText }]}>RIWAYAT INFORMASI</Text>
          <Divider style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {fetching ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 20 }} />
        ) : (
          informasi.map((item) => (
            <Surface key={item.id} style={[styles.itemCard, { backgroundColor: theme.surface }]} elevation={1}>
              <List.Item
                title={item.judul}
                titleStyle={{ color: theme.text, fontWeight: "bold" }}
                description={item.isi}
                descriptionStyle={{ color: theme.subText }}
                left={(props) => <List.Icon {...props} icon="bullhorn-outline" color={theme.primary} />}
                right={() => (
                  <IconButton
                    icon="trash-can-outline"
                    iconColor="#D32F2F"
                    onPress={() => {
                      /* fungsi hapus */
                    }}
                  />
                )}
              />
            </Surface>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  mainCard: { padding: 20, borderRadius: 20, marginBottom: 10 },
  input: { marginBottom: 15 },
  btn: { borderRadius: 12, paddingVertical: 4 },
  historyHeader: { flexDirection: "row", alignItems: "center", marginVertical: 25 },
  divider: { flex: 1, height: 1 },
  historyTitle: { marginHorizontal: 10, fontSize: 12, fontWeight: "bold", letterSpacing: 1 },
  itemCard: { marginBottom: 12, borderRadius: 15, overflow: "hidden" },
});

export default KelolaInformasi;

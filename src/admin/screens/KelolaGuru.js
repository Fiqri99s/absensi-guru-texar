import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, FAB, Avatar, IconButton, Portal, Modal, TextInput, Button, Surface, ActivityIndicator, Searchbar } from "react-native-paper";
import { supabase } from "../../services/supabase";

const KelolaGuru = ({ navigation, isDarkMode }) => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const [idEdit, setIdEdit] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Konfigurasi Warna Dinamis
  const primaryColor = "#1976D2";
  const bgColor = isDarkMode ? "#121212" : "#F5F7FA";
  const surfaceColor = isDarkMode ? "#1E1E1E" : "#FFFFFF";
  const textColor = isDarkMode ? "#FFFFFF" : "#03075e";
  const subTextColor = isDarkMode ? "#B0BEC5" : "#455A64";
  const inputBg = isDarkMode ? "#2C2C2C" : "#F5F5F5";

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("tabel_user").select("*").eq("role", "guru").order("full_name", { ascending: true });

      if (error) throw error;

      setTeachers(data || []);
      setFilteredTeachers(data || []);
    } catch (error) {
      Alert.alert("Error", "Gagal mengambil data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = teachers.filter((item) => item.full_name?.toUpperCase().includes(query.toUpperCase()));
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  };

  const handleSimpan = async () => {
    if (!fullName || !username || !password) {
      Alert.alert("Data Kosong", "Semua kolom harus diisi!");
      return;
    }

    setLoading(true);
    const payload = { full_name: fullName, username, password, role: "guru" };

    try {
      let result;
      if (idEdit) {
        result = await supabase.from("tabel_user").update(payload).eq("id", idEdit);
      } else {
        result = await supabase.from("tabel_user").insert([payload]);
      }

      if (result.error) throw result.error;

      tutupModal();
      fetchTeachers();
    } catch (error) {
      Alert.alert("Gagal Menyimpan", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- PERBAIKAN FUNGSI HAPUS ---
  const handleHapus = (id) => {
    Alert.alert("Hapus Guru", "Data guru akan dihapus permanen. Lanjutkan?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase.from("tabel_user").delete().eq("id", id);

            if (error) throw error;

            // Refresh data secara lokal dan dari database
            fetchTeachers();
          } catch (error) {
            Alert.alert("Gagal Hapus", error.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const bukaModalEdit = (item) => {
    setIdEdit(item.id);
    setFullName(item.full_name);
    setUsername(item.username);
    setPassword(item.password);
    setVisible(true);
  };

  const tutupModal = () => {
    setVisible(false);
    setIdEdit(null);
    setFullName("");
    setUsername("");
    setPassword("");
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Surface style={[styles.header, { backgroundColor: surfaceColor }]} elevation={2}>
        <View style={styles.headerTop}>
          <IconButton icon="arrow-left" iconColor={isDarkMode ? "#FFF" : "#000"} onPress={() => navigation.goBack()} />
          <Text variant="titleLarge" style={[styles.headerTitle, { color: isDarkMode ? "#FFF" : "#1A237E" }]}>
            Kelola Data Guru
          </Text>
        </View>

        <Searchbar
          placeholder="Cari nama guru..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: inputBg }]}
          inputStyle={{ fontSize: 14, color: textColor }}
          placeholderTextColor={subTextColor}
          iconColor={subTextColor}
          elevation={0}
        />
      </Surface>

      {loading && !visible ? (
        <ActivityIndicator style={{ flex: 1 }} color={primaryColor} />
      ) : (
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Surface style={[styles.card, { backgroundColor: surfaceColor }]} elevation={1}>
              <View style={styles.cardContent}>
                <Avatar.Text size={50} label={item.full_name?.substring(0, 2).toUpperCase() || "G"} style={{ backgroundColor: isDarkMode ? "#333" : "#E3F2FD" }} color={primaryColor} />

                <View style={styles.textSection}>
                  <Text style={[styles.txtNama, { color: textColor }]}>{item.full_name}</Text>
                  <Text style={[styles.txtUsername, { color: subTextColor }]}>User: {item.username}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <IconButton icon="pencil-outline" iconColor={primaryColor} size={20} onPress={() => bukaModalEdit(item)} />
                  <IconButton icon="trash-can-outline" iconColor="#D32F2F" size={20} onPress={() => handleHapus(item.id)} />
                </View>
              </View>
            </Surface>
          )}
          ListEmptyComponent={<Text style={[styles.txtNotFound, { color: subTextColor }]}>Guru tidak ditemukan</Text>}
        />
      )}

      <Portal>
        <Modal visible={visible} onDismiss={tutupModal} contentContainerStyle={[styles.modal, { backgroundColor: surfaceColor }]}>
          <Text variant="headlineSmall" style={[styles.modalTitle, { color: isDarkMode ? "#FFF" : "#1A237E" }]}>
            {idEdit ? "Update Data Guru" : "Tambah Guru Baru"}
          </Text>

          <TextInput label="Nama Lengkap" value={fullName} onChangeText={setFullName} mode="outlined" textColor={textColor} style={styles.input} activeOutlineColor={primaryColor} />
          <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" textColor={textColor} style={styles.input} autoCapitalize="none" activeOutlineColor={primaryColor} />
          <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" textColor={textColor} style={styles.input} secureTextEntry activeOutlineColor={primaryColor} />

          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={tutupModal} textColor={isDarkMode ? "#BBB" : primaryColor} style={{ flex: 1, marginRight: 10 }}>
              Batal
            </Button>
            <Button mode="contained" onPress={handleSimpan} loading={loading} style={{ flex: 1, backgroundColor: primaryColor }}>
              Simpan
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB icon="plus" style={[styles.fab, { backgroundColor: primaryColor }]} color="white" onPress={() => setVisible(true)} label="Tambah" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontWeight: "bold" },
  searchBar: { marginHorizontal: 15, marginTop: 10, borderRadius: 12, height: 45 },
  card: { borderRadius: 20, marginBottom: 12 },
  cardContent: { flexDirection: "row", alignItems: "center", paddingVertical: 15, paddingHorizontal: 18 },
  textSection: { flex: 1, paddingLeft: 15, justifyContent: "center" },
  txtNama: { fontSize: 16, fontWeight: "700", textTransform: "capitalize" },
  txtUsername: { fontSize: 12, marginTop: 2 },
  actionButtons: { flexDirection: "row" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, borderRadius: 15 },
  modal: { padding: 25, margin: 20, borderRadius: 25 },
  modalTitle: { marginBottom: 20, fontWeight: "bold" },
  input: { marginBottom: 15 },
  modalButtons: { flexDirection: "row", marginTop: 10 },
  txtNotFound: { textAlign: "center", marginTop: 30, fontStyle: "italic" },
});

export default KelolaGuru;

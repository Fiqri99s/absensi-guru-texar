import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import { Text, FAB, List, Avatar, IconButton, Portal, Modal, TextInput, Button, Surface, ActivityIndicator, Searchbar } from "react-native-paper";
import { supabase } from "../../services/supabase";

const KelolaGuru = ({ navigation }) => {
  const [teachers, setTeachers] = useState([]); // Data asli dari DB
  const [filteredTeachers, setFilteredTeachers] = useState([]); // Data yang sudah difilter
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  const [idEdit, setIdEdit] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const primaryColor = "#1976D2";

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tabel_user").select("*").eq("role", "guru").order("full_name", { ascending: true });

    if (data) {
      setTeachers(data);
      setFilteredTeachers(data); // Inisialisasi data filter
    }
    setLoading(false);
  };

  // Fungsi Pencarian
  const onChangeSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = teachers.filter((item) => {
        const itemData = item.full_name ? item.full_name.toUpperCase() : "".toUpperCase();
        const textData = query.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredTeachers(filtered);
    } else {
      setFilteredTeachers(teachers);
    }
  };

  const handleSimpan = async () => {
    if (!fullName || !username || !password) {
      alert("Semua kolom harus diisi!");
      return;
    }
    setLoading(true);
    const payload = { full_name: fullName, username: username, password: password, role: "guru" };
    let error;
    if (idEdit) {
      const { error: err } = await supabase.from("tabel_user").update(payload).eq("id", idEdit);
      error = err;
    } else {
      const { error: err } = await supabase.from("tabel_user").insert([payload]);
      error = err;
    }

    if (!error) {
      tutupModal();
      fetchTeachers();
    } else {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleHapus = (id) => {
    Alert.alert("Hapus Guru", "Apakah Anda yakin?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          await supabase.from("tabel_user").delete().eq("id", id);
          fetchTeachers();
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
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerTop}>
          <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
          <Text variant="titleLarge" style={styles.headerTitle}>
            Kelola Data Guru
          </Text>
        </View>

        {/* Kolom Pencarian */}
        <Searchbar placeholder="Cari nama guru..." onChangeText={onChangeSearch} value={searchQuery} style={styles.searchBar} inputStyle={{ fontSize: 14, color: "#03075e" }} elevation={0} />
      </Surface>

      {loading && !visible ? (
        <ActivityIndicator style={{ flex: 1 }} color={primaryColor} />
      ) : (
        <FlatList
          data={filteredTeachers}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 15, paddingTop: 10, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <Surface style={styles.card} elevation={1}>
              <View style={styles.cardContent}>
                {/* 1. Avatar (Bulatan inisial nama) */}
                <Avatar.Text
                  size={50}
                  label={item.full_name.substring(0, 2).toUpperCase()}
                  style={styles.avatarAestetic}
                  color={primaryColor} // Teks bulatan biru gelap
                />

                {/* 2. Bagian Teks (Nama & Username) */}
                <View style={styles.textSection}>
                  {/* Nama Guru - Sekarang TEBAL dan HITAM/BIRU GELAP */}
                  <Text style={styles.txtNama}>{item.full_name}</Text>

                  {/* Username - Sekarang Warnanya pas, tidak pudar */}
                  <Text style={styles.txtUsername}>Username: {item.username}</Text>
                </View>

                {/* 3. Tombol Aksi (Edit & Hapus) */}
                <View style={styles.actionButtons}>
                  <IconButton
                    icon="pencil-outline"
                    iconColor={primaryColor} // Biru
                    size={20}
                    onPress={() => bukaModalEdit(item)}
                    style={styles.btnAksi}
                  />
                  <IconButton
                    icon="trash-can-outline"
                    iconColor="#D32F2F" // Merah
                    size={20}
                    onPress={() => handleHapus(item.id)}
                    style={styles.btnAksi}
                  />
                </View>
              </View>
            </Surface>
          )}
          ListEmptyComponent={<Text style={{ textAlign: "center", marginTop: 20, color: "#999" }}>Guru tidak ditemukan</Text>}
        />
      )}

      <Portal>
        <Modal visible={visible} onDismiss={tutupModal} contentContainerStyle={styles.modal}>
          <Text variant="headlineSmall" style={styles.modalTitle}>
            {idEdit ? "Update Guru" : "Guru Baru"}
          </Text>
          <TextInput label="Nama Lengkap" value={fullName} onChangeText={setFullName} mode="outlined" textColor="#03075e" style={styles.input} />
          <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" textColor="#03075e" style={styles.input} autoCapitalize="none" />
          <TextInput label="Password" value={password} onChangeText={setPassword} mode="outlined" textColor="#03075e" style={styles.input} secureTextEntry />
          <View style={styles.modalButtons}>
            <Button mode="outlined" onPress={tutupModal} style={{ flex: 1, marginRight: 10 }}>
              Batal
            </Button>
            <Button mode="contained" onPress={handleSimpan} style={{ flex: 1, backgroundColor: primaryColor }}>
              Simpan
            </Button>
          </View>
        </Modal>
      </Portal>

      <FAB icon="plus" style={[styles.fab, { backgroundColor: primaryColor }]} color="white" onPress={() => setVisible(true)} label="Tambah" />
    </View>
  );
};

const lightBlue = "#E3F2FD";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontWeight: "bold", color: "#1A237E" },
  searchBar: {
    marginHorizontal: 15,
    marginTop: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    height: 45,
  },
  card: { backgroundColor: "#fff", borderRadius: 15, marginBottom: 12, overflow: "hidden" },
  fab: { position: "absolute", margin: 16, right: 0, bottom: 0, borderRadius: 15 },
  modal: { backgroundColor: "white", padding: 25, margin: 20, borderRadius: 20 },
  modalTitle: { marginBottom: 20, fontWeight: "bold", color: "#1A237E" },
  input: { marginBottom: 15, backgroundColor: "#fff" },
  modalButtons: { flexDirection: "row", marginTop: 10 },
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  cardAestetic: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "#EEEEEE",  },
  cardContent: { flexDirection: "row", alignItems: "center", paddingVertical: 15,paddingHorizontal: 18, },
  avatarAestetic: { backgroundColor: lightBlue, borderWidth: 1, borderColor: "#BBDEFB", },
  textSection: { flex: 1, paddingLeft: 15, justifyContent: "center", },
  txtNama: { fontSize: 16, fontWeight: "700", color: "#03075e", letterSpacing: 0.5, textTransform: "capitalize", },
  txtUsername: { fontSize: 12, fontWeight: "400", color: "#455A64", marginTop: 2, },
  actionButtons: { flexDirection: "row", alignItems: "center", },
  btnAksi: { marginHorizontal: -2, },
  txtNotFound: { textAlign: "center", marginTop: 30, color: "#757575", fontStyle: "italic", },
});

export default KelolaGuru;

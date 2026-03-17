import React, { useState } from "react";
import { Provider as PaperProvider } from "react-native-paper";

// Import Screens
import LoginScreen from "./src/auth/LoginScreen";
import DashboardAdmin from "./src/admin/screens/DashboardAdmin";
import KelolaGuru from "./src/admin/screens/KelolaGuru";
import GenerateQR from "./src/admin/screens/GenerateQR";
import RekapAbsensi from "./src/admin/screens/RekapAbsensi";
import UserDashboard from "./src/user/screens/UserDashboard";
import ScannerAbsen from "./src/user/screens/ScannerAbsen";
import KelolaInformasi from "./src/admin/screens/KelolaInformasi";
import FormIzin from "./src/user/screens/FormIzin";

export default function App() {
  const [user, setUser] = useState(null);
  const [halamanAktif, setHalamanAktif] = useState("Dashboard");

  // Fungsi Login - Memastikan mendarat di Dashboard
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setHalamanAktif("Dashboard");
  };

  // Fungsi Logout
  const handleLogout = () => {
    setUser(null);
    setHalamanAktif("Dashboard");
  };

  // Objek navigasi untuk dilempar ke props
  const navigation = {
    navigate: (tujuan) => setHalamanAktif(tujuan),
    goBack: () => setHalamanAktif("Dashboard"),
  };

  return (
    <PaperProvider>
      {!user ? (
        /* --- 1. PROSES LOGIN --- */
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : user.role === "admin" ? (
        /* --- 2. LAYAR ADMIN --- */
        <>
          {halamanAktif === "Dashboard" ? (
            <DashboardAdmin user={user} onLogout={handleLogout} navigation={navigation} />
          ) : halamanAktif === "KelolaGuru" ? (
            <KelolaGuru navigation={navigation} />
          ) : halamanAktif === "GenerateQR" ? (
            <GenerateQR navigation={navigation} />
          ) : halamanAktif === "RekapAbsensi" ? (
            <RekapAbsensi onBack={navigation.goBack} />
          ) : halamanAktif === "KelolaInformasi" ? (
            <KelolaInformasi onBack={navigation.goBack} />
          ) : null}
        </>
      ) : (
        /* --- 3. LAYAR GURU (USER) --- */
        <>
          {halamanAktif === "Dashboard" ? (
            <UserDashboard user={user} onLogout={handleLogout} navigation={navigation} />
          ) : halamanAktif === "ScannerAbsen" ? (
            <ScannerAbsen user={user} navigation={navigation} />
          ) : halamanAktif === "FormIzin" ? (
            <FormIzin user={user} onBack={navigation.goBack} />
          ) : null}
        </>
      )}
    </PaperProvider>
  );
}

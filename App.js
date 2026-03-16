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

export default function App() {
  const [user, setUser] = useState(null);
  const [halamanAktif, setHalamanAktif] = useState("Dashboard");

  // Fungsi Logout
  const handleLogout = () => {
    setUser(null);
    setHalamanAktif("Dashboard");
  };

  // Objek navigasi sederhana untuk Admin
  const navAdmin = {
    navigate: (t) => setHalamanAktif(t),
    goBack: () => setHalamanAktif("Dashboard"),
  };

  // Objek navigasi sederhana untuk Guru
  const navUser = {
    navigate: (t) => setHalamanAktif(t),
    goBack: () => setHalamanAktif("Dashboard"),
  };

  return (
    <PaperProvider>
      {!user ? (
        /* --- 1. PROSES LOGIN --- */
        <LoginScreen onLoginSuccess={(data) => setUser(data)} />
      ) : user.role === "admin" ? (
        /* --- 2. LAYAR ADMIN --- */
        <>
          {halamanAktif === "Dashboard" ? (
            <DashboardAdmin user={user} onLogout={handleLogout} navigation={navAdmin} />
          ) : halamanAktif === "KelolaGuru" ? (
            <KelolaGuru navigation={navAdmin} />
          ) : halamanAktif === "GenerateQR" ? (
            <GenerateQR navigation={navAdmin} />
          ) : halamanAktif === "RekapAbsensi" ? (
            <RekapAbsensi onBack={() => setHalamanAktif("Dashboard")} />
          ) : null}
        </>
      ) : (
        /* --- 3. LAYAR GURU --- */
        <>{halamanAktif === "Dashboard" ? <UserDashboard user={user} onLogout={handleLogout} navigation={navUser} /> : halamanAktif === "ScannerAbsen" ? <ScannerAbsen user={user} navigation={navUser} /> : null}</>
      )}
    </PaperProvider>
  );
}

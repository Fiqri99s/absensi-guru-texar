import React, { useState } from "react";
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

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
import UserProfile from "./src/user/screens/UserProfile";

export default function App() {
  const [user, setUser] = useState(null);
  const [halamanAktif, setHalamanAktif] = useState("Dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setHalamanAktif("Dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setHalamanAktif("Dashboard");
  };

  const navigation = {
    navigate: (tujuan) => setHalamanAktif(tujuan),
    goBack: () => setHalamanAktif("Dashboard"),
  };

  return (
    <PaperProvider theme={theme}>
      {!user ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} isDarkMode={isDarkMode} />
      ) : user.role === "admin" ? (
        /* --- 2. LAYAR ADMIN (DITAMBAHKAN PROPS DARKMODE) --- */
        <>
          {halamanAktif === "Dashboard" ? (
            <DashboardAdmin user={user} onLogout={handleLogout} navigation={navigation} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          ) : halamanAktif === "KelolaGuru" ? (
            <KelolaGuru navigation={navigation} isDarkMode={isDarkMode} />
          ) : halamanAktif === "GenerateQR" ? (
            <GenerateQR navigation={navigation} isDarkMode={isDarkMode} />
          ) : halamanAktif === "RekapAbsensi" ? (
            <RekapAbsensi onBack={navigation.goBack} isDarkMode={isDarkMode} />
          ) : halamanAktif === "KelolaInformasi" ? (
            <KelolaInformasi onBack={navigation.goBack} isDarkMode={isDarkMode} />
          ) : null}
        </>
      ) : (
        /* --- 3. LAYAR GURU (DITAMBAHKAN PROPS DARKMODE) --- */
        <>
          {halamanAktif === "Dashboard" ? (
            <UserDashboard user={user} onLogout={handleLogout} navigation={navigation} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          ) : halamanAktif === "ScannerAbsen" ? (
            <ScannerAbsen user={user} navigation={navigation} isDarkMode={isDarkMode} />
          ) : halamanAktif === "FormIzin" ? (
            <FormIzin user={user} onBack={navigation.goBack} isDarkMode={isDarkMode} />
          ) : halamanAktif === "UserProfile" ? (
            <UserProfile user={user} onLogout={handleLogout} onBack={navigation.goBack} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          ) : null}
        </>
      )}
    </PaperProvider>
  );
}

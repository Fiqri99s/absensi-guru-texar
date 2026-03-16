import { supabase } from "./supabase";

export const testConnection = async () => {
  const { data, error } = await supabase.from("profiles").select("*").limit(1);
  if (error) {
    console.log("❌ Koneksi Gagal:", error.message);
  } else {
    console.log("✅ Koneksi Berhasil! Data:", data);
  }
};

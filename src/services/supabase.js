import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://lavzsonrmummilbxcnrs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhdnpzb25ybXVtbWlsYnhjbnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NzU2NDIsImV4cCI6MjA4OTI1MTY0Mn0.c3MpbudAzsKNOuJY0CF34uoh2TKpSxuL-dvQyeuAyDg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

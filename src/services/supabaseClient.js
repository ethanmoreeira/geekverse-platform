// supabaseClient.js
// Cliente Supabase para o GeekVerse G8.
// Lê credenciais de import.meta.env (Vite).
// Se as variáveis não existirem, exporta null — o rankingService
// usará localStorage como fallback automático.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

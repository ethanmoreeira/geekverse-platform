
// O "Porteiro" do Banco de Dados.
// É ele quem pega as senhas secretas (no arquivo .env) e abre a porta do Supabase na internet.
// Se a internet cair ou a senha estiver errada, ele avisa o resto do jogo para usar a memória local (fallback).

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

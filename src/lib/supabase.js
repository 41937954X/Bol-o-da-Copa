// Pegamos o createClient direto do objeto global que o CDN injetou no navegador
const { createClient } = window.supabase;

const supabaseUrl = import.meta.env.VITE_SUPERBASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPERBASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
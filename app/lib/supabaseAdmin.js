// Cliente de Supabase SÓLO para el servidor (rutas de sincronización).
// Usa la clave privada SUPABASE_SERVICE_ROLE_KEY (configurada en Vercel, nunca con NEXT_PUBLIC_).
// Mientras esa clave no exista, sigue usando la clave pública para no cortar la sincronización.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clave = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseAdmin = createClient(url, clave, {
  auth: { persistSession: false, autoRefreshToken: false },
});

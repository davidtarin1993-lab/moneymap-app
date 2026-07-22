"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZXhsdmJyaGduaWFocnZlZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MzEyNzEsImV4cCI6MjEwMDIwNzI3MX0.e3rMrUF-A7d33fVT_B9VeGZCINurmTslAsm92wMF4XE";

export async function autenticarUsuario(email: string, password: string) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data?.session && data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle();

      return {
        success: true,
        role: profile?.role || 'user',
        email: data.user.email,
        token: data.session.access_token,
        expires: data.session.expires_in
      };
    }
    return { error: 'No se pudo iniciar sesión.' };
  } catch (err: any) {
    return { error: err?.message || 'Error interno del servidor.' };
  }
}

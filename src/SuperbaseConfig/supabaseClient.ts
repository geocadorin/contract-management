import { createClient } from '@supabase/supabase-js';

// Usar credenciais diretamente
const supabaseUrl = 'https://jurkinxbxmfimgjkyzbo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cmtpbnhieG1maW1namt5emJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2OTgxNjEsImV4cCI6MjA2MjI3NDE2MX0.jLWmK6PNcKAAOmQMkJ8ZdP2O8KX0lvbGTT5LQQZLBBE';

// Criar cliente Supabase com tratamento de erro
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.error('Erro ao criar cliente Supabase:', error);
  // Criar um cliente mock para evitar erros de undefined
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    // Adicionar métodos mock conforme necessário
  };
}

export { supabase };

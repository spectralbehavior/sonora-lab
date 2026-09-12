// Integração Supabase (FASE de deploy real).
//
// Este projeto foi construído com uma camada de repositório (src/lib/db.ts)
// que espelha o schema SQL em supabase/schema.sql. Para plugar Supabase:
//
// 1. Crie um projeto em https://supabase.com e rode supabase/schema.sql no SQL Editor
//    (cria tabelas + Row Level Security + policies).
// 2. Copie .env.example → .env.local com:
//      VITE_SUPABASE_URL=https://<proj>.supabase.co
//      VITE_SUPABASE_ANON_KEY=<chave anon pública>
//      (a service key fica APENAS no servidor/Edge Functions — nunca no front)
// 3. Instale `@supabase/supabase-js` e substitua as operações de db.ts por
//    supabase.from(table)... — nomes de tabelas/colunas já batem com o schema.
// 4. Auth: supabase.auth.signUp / signInWithPassword / resetPasswordForEmail.
// 5. RLS: o `anon` já está coberto pelas policies; usuários só leem os próprios
//    dados; `admin` via claim na tabela profiles.
//
// Enquanto VITE_SUPABASE_URL estiver ausente, o app roda em modo demo local
// (localStorage) — e a UI exibe um aviso honesto de "modo demonstração".

export function supabaseConfig(): { url: string; anonKey: string } | null {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {}
  const url = env.VITE_SUPABASE_URL
  const anonKey = env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function isDemoMode(): boolean {
  return supabaseConfig() === null
}

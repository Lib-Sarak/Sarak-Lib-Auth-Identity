-- Habilitação de Segurança de Nível de Linha (RLS)
-- v1.0 - Sarak Sovereign Identity Protection

ALTER TABLE sarak_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sarak_auth.user_interactions ENABLE ROW LEVEL SECURITY;

-- Política de Isolamento Soberano para Tabela de Usuários (v2.0)
-- MASTER (100) vê tudo. ADMIN (50) vê usuários do seu sistema. USER (10) vê apenas a si mesmo.
CREATE POLICY "Sovereign isolation" ON sarak_auth.users
    FOR ALL
    USING (
        ((auth.jwt() ->> 'level')::int >= 100) -- Bypass Global Master
        OR (system = ((auth.jwt() ->> 'system')::text) AND (auth.jwt() ->> 'level')::int >= 50) -- Bypass System Admin
        OR (auth.uid() = user_id AND system = ((auth.jwt() ->> 'system')::text)) -- Self isolation
    );

-- Política de Isolamento Soberano para Interações
CREATE POLICY "Sovereign isolation" ON sarak_auth.user_interactions
    FOR ALL
    USING (
        ((auth.jwt() ->> 'level')::int >= 100)
        OR (system = ((auth.jwt() ->> 'system')::text) AND (auth.jwt() ->> 'level')::int >= 50)
        OR (auth.uid() = user_id AND system = ((auth.jwt() ->> 'system')::text))
    );

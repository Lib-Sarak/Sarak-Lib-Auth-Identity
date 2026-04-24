-- Habilitação de Segurança de Nível de Linha (RLS)
-- v1.0 - Sarak Sovereign Identity Protection

ALTER TABLE sarak_auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sarak_auth.user_interactions ENABLE ROW LEVEL SECURITY;

-- Política de Isolamento Soberano para Tabela de Usuários
CREATE POLICY "Sovereign isolation" ON sarak_auth.users
    FOR ALL
    USING (
        auth.uid() = user_id 
        AND system = ((auth.jwt() ->> 'system')::text)
    )
    WITH CHECK (
        auth.uid() = user_id 
        AND system = ((auth.jwt() ->> 'system')::text)
    );

-- Política de Isolamento Soberano para Interações
CREATE POLICY "Sovereign isolation" ON sarak_auth.user_interactions
    FOR ALL
    USING (
        auth.uid() = user_id 
        AND system = ((auth.jwt() ->> 'system')::text)
    )
    WITH CHECK (
        auth.uid() = user_id 
        AND system = ((auth.jwt() ->> 'system')::text)
    );

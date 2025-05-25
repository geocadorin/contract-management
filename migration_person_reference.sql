-- Migração para atualizar a tabela person_reference
-- Execute este script para adicionar os novos campos à tabela existente

-- Adicionar novos campos à tabela person_reference
ALTER TABLE person_reference 
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Remover campo CPF se existir
ALTER TABLE person_reference 
DROP COLUMN IF EXISTS cpf;

-- Atualizar campos existentes para ter tamanhos adequados
ALTER TABLE person_reference 
ALTER COLUMN email TYPE VARCHAR(255),
ALTER COLUMN telefone TYPE VARCHAR(15),
ALTER COLUMN endereco_completo TYPE TEXT,
ALTER COLUMN cep TYPE VARCHAR(8),
ALTER COLUMN kinship TYPE VARCHAR(100);

-- Tornar person_id NOT NULL se ainda não for
ALTER TABLE person_reference 
ALTER COLUMN person_id SET NOT NULL;

-- Adicionar constraint de CASCADE se não existir
ALTER TABLE person_reference 
DROP CONSTRAINT IF EXISTS fk_person_reference_person;

ALTER TABLE person_reference 
ADD CONSTRAINT fk_person_reference_person
    FOREIGN KEY (person_id)
    REFERENCES persons(id)
    ON DELETE CASCADE;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_person_reference_person_id ON person_reference(person_id);
CREATE INDEX IF NOT EXISTS idx_person_reference_full_name ON person_reference(full_name);

-- Remover índice do CPF se existir
DROP INDEX IF EXISTS idx_person_reference_cpf;

-- Criar trigger para updated_at se não existir
DROP TRIGGER IF EXISTS set_timestamp_person_reference ON person_reference;

CREATE TRIGGER set_timestamp_person_reference
BEFORE UPDATE ON person_reference
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Atualizar registros existentes para preencher campos obrigatórios
-- (Apenas se houver dados existentes sem full_name)
UPDATE person_reference 
SET full_name = 'Nome não informado'
WHERE full_name IS NULL OR full_name = '';

-- Tornar full_name NOT NULL após preencher valores
ALTER TABLE person_reference 
ALTER COLUMN full_name SET NOT NULL; 

-- Script para remover o campo CPF da tabela person_reference
-- Execute este script para remover o campo CPF e seu índice

-- Remover índice do CPF se existir
DROP INDEX IF EXISTS idx_person_reference_cpf;

-- Remover coluna CPF da tabela person_reference
ALTER TABLE person_reference 
DROP COLUMN IF EXISTS cpf;

-- Verificar se a remoção foi bem-sucedida
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'person_reference' 
-- ORDER BY ordinal_position; 

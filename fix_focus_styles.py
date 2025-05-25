#!/usr/bin/env python3
import re
import os

def fix_focus_styles():
    # Padrão antigo e novo
    old_pattern = r'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
    new_pattern = 'shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all'
    
    # Arquivos para atualizar
    files_to_update = [
        'src/Components/Lessee/LesseeForm.tsx',
        'src/Components/Owner/OwnerForm.tsx'
    ]
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            print(f"Atualizando {file_path}...")
            
            # Ler o arquivo
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fazer a substituição
            updated_content = content.replace(old_pattern, new_pattern)
            
            # Escrever de volta
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            
            print(f"✅ {file_path} atualizado!")
        else:
            print(f"❌ Arquivo não encontrado: {file_path}")

if __name__ == "__main__":
    fix_focus_styles()
    print("🎉 Estilos de foco atualizados com sucesso!") 

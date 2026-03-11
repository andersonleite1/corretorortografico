#!/usr/bin/env python3

# Scanner de Classes CSS vs SCSS Modules
# Script para assegurar que imports styles não fiquem sem uso

import re
import sys

def scan_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            has_styles_import = re.search(r'import\s+styles\s+from\s+[\'"].*?\.module\.scss[\'"]', content)
            has_styles_usage = re.search(r'styles\.', content)
            
            if has_styles_import and not has_styles_usage:
                print(f"❌ Erro de SCSS em {file_path}: 'styles' importado mas não utilizado no código.")
                sys.exit(1)
            else:
                print(f"✅ SCSS module validado em {file_path}")
                
    except FileNotFoundError:
        print(f"Erro: Arquivo {file_path} não encontrado.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Erro: Forneça o caminho do arquivo a ser validado.")
        sys.exit(1)
    
    scan_file(sys.argv[1])

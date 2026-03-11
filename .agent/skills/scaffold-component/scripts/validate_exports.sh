#!/bin/bash

# Validador de Exportação Nomeada
# Verifica se o componente não está usando 'export default' sem necessidade

FILE_PATH=$1

if [ -z "$FILE_PATH" ]; then
  echo "Erro: Forneça o caminho do arquivo a ser validado."
  exit 1
fi

if grep -q "export default" "$FILE_PATH"; then
  echo "❌ Aviso: O projeto prefere exportações nomeadas (ex: export const Component) sobre 'export default', exceto em pages."
  exit 1
else
  echo "✅ Exportação nomeada validada em $FILE_PATH"
fi

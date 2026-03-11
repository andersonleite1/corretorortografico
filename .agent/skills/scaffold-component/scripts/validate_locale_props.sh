#!/bin/bash

# Validador de Props Locale
# Para componentes em _components que devem ser traduzidos

FILE_PATH=$1

if [ -z "$FILE_PATH" ]; then
  echo "Erro: Forneça o caminho do arquivo a ser validado."
  exit 1
fi

# Verifica se o arquivo está dentro de um diretório _components
if [[ "$FILE_PATH" == *"_components"* ]]; then
  if ! grep -q "locale[:?]" "$FILE_PATH"; then
    echo "⚠️ Aviso: A prop 'locale' não foi encontrada na interface de props deste componente em $FILE_PATH. Como ele está em '_components', é provável que precise de internacionalização."
    exit 1
  else
    echo "✅ Prop locale validada em $FILE_PATH"
  fi
else
  echo "ℹ️ Pulo da validação de locale: Arquivo não está em '_components'."
fi

#!/bin/bash

echo "======================================"
echo "🔎 Verificando formatação com Prettier..."
echo "======================================"
npx prettier --check .

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️  Problemas de formatação encontrados."
  echo "✏️  Aplicando correções automáticas..."
  echo "--------------------------------------"
  npx prettier --write .
else
  echo ""
  echo "✅ Código já está formatado."
fi

echo ""
echo "======================================"
echo "🔎 Verificando novamente após ajustes..."
echo "======================================"
npx prettier --check .

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Formatação concluída com sucesso!"
else
  echo ""
  echo "❌ Ainda existem problemas de formatação."
  exit 1
fi
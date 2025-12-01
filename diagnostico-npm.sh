#!/bin/bash

# ================================================
# SCRIPT DE DIAGNÓSTICO - NPM INSTALL
# ================================================
# Este script verifica todos os possíveis problemas
# com a instalação de módulos do Node.js
# ================================================

echo "🔍 DIAGNÓSTICO DE INSTALAÇÃO NPM"
echo "=================================="
echo ""

# 1. VERIFICAR NODE.JS
echo "📦 1. Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js instalado: $NODE_VERSION"
else
    echo "❌ Node.js NÃO está instalado!"
    echo "   Instale com: brew install node"
    exit 1
fi
echo ""

# 2. VERIFICAR NPM
echo "📦 2. Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm instalado: $NPM_VERSION"
else
    echo "❌ npm NÃO está instalado!"
    exit 1
fi
echo ""

# 3. VERIFICAR DIRETÓRIO
echo "📂 3. Verificando diretório..."
if [ -f "package.json" ]; then
    echo "✅ package.json encontrado"
else
    echo "❌ package.json NÃO encontrado!"
    echo "   Você está no diretório correto?"
    echo "   Diretório atual: $(pwd)"
    exit 1
fi
echo ""

# 4. VERIFICAR PERMISSÕES
echo "🔒 4. Verificando permissões..."
if [ -w "." ]; then
    echo "✅ Você tem permissão de escrita neste diretório"
else
    echo "❌ Você NÃO tem permissão de escrita!"
    echo "   Execute: sudo chown -R $(whoami) ."
    exit 1
fi
echo ""

# 5. VERIFICAR CONEXÃO COM INTERNET
echo "🌐 5. Verificando conexão com internet..."
if ping -c 1 registry.npmjs.org &> /dev/null; then
    echo "✅ Conexão com registry.npmjs.org OK"
else
    echo "⚠️  Não foi possível conectar ao registry.npmjs.org"
    echo "   Verifique sua conexão com internet"
fi
echo ""

# 6. VERIFICAR CACHE DO NPM
echo "💾 6. Verificando cache do npm..."
CACHE_SIZE=$(du -sh ~/.npm 2>/dev/null | awk '{print $1}')
if [ -d ~/.npm ]; then
    echo "✅ Cache do npm existe (tamanho: $CACHE_SIZE)"
else
    echo "⚠️  Cache do npm não existe (será criado)"
fi
echo ""

# 7. VERIFICAR node_modules EXISTENTE
echo "📚 7. Verificando node_modules existente..."
if [ -d "node_modules" ]; then
    MODULES_COUNT=$(ls -1 node_modules 2>/dev/null | wc -l)
    echo "⚠️  node_modules já existe ($MODULES_COUNT pacotes)"
    echo "   Recomendado: deletar e reinstalar"
else
    echo "✅ node_modules não existe (instalação limpa)"
fi
echo ""

# 8. VERIFICAR package-lock.json
echo "🔒 8. Verificando package-lock.json..."
if [ -f "package-lock.json" ]; then
    echo "⚠️  package-lock.json existe"
else
    echo "✅ package-lock.json não existe (será criado)"
fi
echo ""

# RESUMO
echo "=================================="
echo "📊 RESUMO DO DIAGNÓSTICO"
echo "=================================="
echo "Node.js: $NODE_VERSION"
echo "npm: $NPM_VERSION"
echo "Diretório: $(pwd)"
echo "package.json: OK"
echo ""

# RECOMENDAÇÕES
echo "🎯 PRÓXIMOS PASSOS RECOMENDADOS:"
echo "=================================="
echo ""
echo "1. Limpar instalação antiga (se houver):"
echo "   rm -rf node_modules package-lock.json"
echo ""
echo "2. Instalar módulos:"
echo "   npm install"
echo ""
echo "3. Se der erro de permissão, tente:"
echo "   sudo npm install"
echo ""
echo "4. Após instalar, testar:"
echo "   npm start"
echo ""
echo "=================================="

#!/usr/bin/env bash
# ==============================================================================
# Pactio Pre-Flight Cybersecurity & Secret Leak Auditor
# Validates repository hygiene, secret exposure, and credential isolation.
# ==============================================================================
set -euo pipefail

echo "🛡️  Iniciando auditoría de ciberseguridad preventiva para Pactio..."

FAILURES=0

# 1. Check for unencrypted private key patterns in tracked git files
echo "🔍 [1/5] Verificando ausencia de llaves privadas y certificados criptográficos..."
if git grep -E -i "BEGIN (RSA|OPENSSH|DSA|EC|PRIVATE) KEY" -- ':!*.test.ts' ':!*.test.tsx' ':!*.md' ':!docs/**' > /dev/null 2>&1; then
    echo "❌ ERROR: Se detectó una llave privada en archivos de código fuente."
    FAILURES=$((FAILURES + 1))
else
    echo "✅ Llaves privadas: 0 encontradas en código fuente."
fi

# 2. Check for SSH key files in repository tree
echo "🔍 [2/5] Verificando ausencia de archivos SSH o credenciales de host..."
SSH_FILES=$(find . -maxdepth 3 \( -name "id_rsa*" -o -name "id_ed25519*" -o -name "known_hosts*" -o -name "authorized_keys*" \) -not -path "*/.git/*" -not -path "*/node_modules/*")
if [ -n "$SSH_FILES" ]; then
    echo "❌ ERROR: Se detectaron archivos SSH en el árbol de trabajo:"
    echo "$SSH_FILES"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ Archivos SSH: 0 detectados."
fi

# 3. Check for .env files with real credentials
echo "🔍 [3/5] Verificando aislamiento de archivos .env y secretos locales..."
ENV_FILES=$(find . -maxdepth 3 -name ".env*" -not -name ".env.example" -not -path "*/.git/*" -not -path "*/node_modules/*")
if [ -n "$ENV_FILES" ]; then
    echo "❌ ERROR: Se detectó archivo .env no ignorado:"
    echo "$ENV_FILES"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ Archivos .env: Solo existe .env.example sanitizado."
fi

# 4. Check for SQLite databases or uncommitted session stores
echo "🔍 [4/5] Verificando ausencia de bases de datos locales o gitea.db..."
DB_FILES=$(find . -maxdepth 3 \( -name "*.sqlite*" -o -name "*.db" -o -name "gitea.db*" \) -not -path "*/.git/*" -not -path "*/node_modules/*")
if [ -n "$DB_FILES" ]; then
    echo "❌ ERROR: Base de datos detectada en el repositorio:"
    echo "$DB_FILES"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ Bases de datos embebidas: 0 encontradas."
fi

# 5. Check git staged / tracked files against sensitive extensions
echo "🔍 [5/5] Verificando lista de archivos rastreados en git..."
SENSITIVE_TRACKED=$(git ls-files | grep -E "\.(pem|key|cer|crt|p12|pfx|jks|sqlite|db|secret|token|log)$" || true)
if [ -n "$SENSITIVE_TRACKED" ]; then
    echo "❌ ERROR: Archivos con extensiones de seguridad rastreados por git:"
    echo "$SENSITIVE_TRACKED"
    FAILURES=$((FAILURES + 1))
else
    echo "✅ Archivos rastreados en git: 100% seguros y limpios."
fi

if [ "$FAILURES" -gt 0 ]; then
    echo "🚨 AUDITORÍA FALLIDA: Se encontraron $FAILURES anomalías de seguridad."
    exit 1
else
    echo "🎉 AUDITORÍA DE SEGURIDAD EXITOSA: El repositorio está 100% blindado para GitHub y Gitea."
    exit 0
fi

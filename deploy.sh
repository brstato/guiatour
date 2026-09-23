#!/bin/bash

# --- CONFIGURAÇÕES ---
# Altere estes valores de acordo com seu servidor
SERVER_USER="bruno"
SERVER_IP="100.72.176.93" # Endereço IP da máquina (Tailscale/Local)
DEST_DIR="/home/bruno/guiatour/pages"
# ---------------------

echo "🚀 Iniciando build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build finalizado com sucesso!"
    
    echo "📦 Sincronizando arquivos com o servidor via rsync..."
    # Garante que o diretório de destino exista
    ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEST_DIR}"
    
    # Sincroniza a pasta dist com o servidor
    rsync -rvz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${DEST_DIR}
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy realizado com sucesso em ${DEST_DIR}!"
        echo "Lembre-se de configurar o Nginx para apontar para este diretório."
    else
        echo "❌ Erro ao transferir arquivos."
    fi
else
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

# -----------------------------
# Etapa base: usar Node leve
# -----------------------------
FROM node:18-slim

# -----------------------------
# Instalar dependências do sistema
# -----------------------------
# - poppler-utils: usado para lidar com PDFs
# - imagemagick: usado pelo pdf-image
# - fonts: garante suporte a renderização de texto
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        poppler-utils \
        imagemagick \
        fonts-dejavu-core \
        ghostscript && \
    # ⚙️ Corrigir política de segurança do ImageMagick para permitir PDFs
    sed -i 's/<policy domain="coder" rights="none" pattern="PDF"/<policy domain="coder" rights="read|write" pattern="PDF"/g' /etc/ImageMagick-6/policy.xml || true && \
    sed -i 's/<policy domain="coder" rights="none" pattern="PDF"/<policy domain="coder" rights="read|write" pattern="PDF"/g' /etc/ImageMagick/policy.xml || true && \
    rm -rf /var/lib/apt/lists/*

# -----------------------------
# Criar diretório de trabalho
# -----------------------------
WORKDIR /usr/src/app

# -----------------------------
# Copiar dependências primeiro (para aproveitar cache Docker)
# -----------------------------
COPY package*.json ./

# Instalar apenas produção por padrão (você pode mudar se quiser dev deps)
RUN npm install --production

# -----------------------------
# Copiar o restante do código
# -----------------------------
COPY . .

# -----------------------------
# Garantir que uploads existam
# -----------------------------
RUN mkdir -p src/uploads

# -----------------------------
# Expor a porta
# -----------------------------
EXPOSE 3000

# -----------------------------
# Comando padrão
# -----------------------------
CMD ["npm", "start"]

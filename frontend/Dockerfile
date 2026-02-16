# Node 20 LTS
FROM node:20-alpine

WORKDIR /app

# Önce bağımlılık dosyalarını kopyala (cache için)
COPY package.json package-lock.json* ./

# Bağımlılıkları yükle
RUN npm ci

# Proje dosyalarını kopyala
COPY . .

# Port
EXPOSE 3000

# Geliştirme sunucusu (hot reload için volume ile kod mount edilecek)
CMD ["npm", "run", "dev"]

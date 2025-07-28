FROM node:18-slim
WORKDIR /app

# 1) Copiamos metadatos e instalamos deps (incluye devDeps)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# 2) Ahora copiamos TODO el código fuente dentro de la imagen
COPY . .

# 3) Exponemos y arrancamos en dev
EXPOSE 3000
CMD ["npm","run","dev","--","-H","0.0.0.0"]

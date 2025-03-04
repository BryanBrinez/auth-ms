# Usa la imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo package.json y package-lock.json para aprovechar el cache de Docker
COPY package*.json ./

# Instala dependencias en una carpeta separada (mejor rendimiento en volúmenes)
RUN npm install --legacy-peer-deps --prefix /app

# Copia el resto del código
COPY . .

# Expone el puerto de NestJS (si lo necesitas)
EXPOSE 3001

# Comando por defecto
CMD ["npm", "run", "start:dev"]

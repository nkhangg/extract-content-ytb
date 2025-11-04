# ==============================
# 🏗️ Stage 1: Cài deps & build
# ==============================
FROM node:20-alpine AS build-env

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ==============================
# 🚀 Stage 2: Chạy preview (Vite)
# ==============================
FROM node:20-alpine

WORKDIR /app
COPY --from=build-env /app /app
EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host"]

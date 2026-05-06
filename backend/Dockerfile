FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm install

FROM node:22-alpine AS backend-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/backend/package*.json ./backend/
COPY backend ./backend
RUN npm --prefix backend run build

FROM node:22-alpine AS backend-runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/backend ./backend
WORKDIR /app/backend
EXPOSE 4000
CMD ["npm", "run", "start"]

FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/
RUN npm install

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/frontend/package*.json ./frontend/
COPY --from=deps /app/backend/package*.json ./backend/
COPY frontend ./frontend
COPY backend/config ./backend/config
RUN npm --prefix frontend run build

FROM node:22-alpine AS frontend-runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=frontend-build /app/node_modules ./node_modules
COPY --from=frontend-build /app/frontend ./frontend
COPY --from=frontend-build /app/backend/config ./backend/config
WORKDIR /app/frontend
EXPOSE 3001
CMD ["npm", "run", "start"]

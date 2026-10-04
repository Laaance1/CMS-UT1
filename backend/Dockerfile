FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --workspace backend --omit=dev
COPY backend backend
COPY cms/schema.mjs cms/schema.mjs
COPY content content
USER node
EXPOSE 3030
CMD ["node", "backend/src/index.mjs"]

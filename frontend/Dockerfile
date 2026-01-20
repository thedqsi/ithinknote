FROM node:20.19-alpine AS builder

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20.19-alpine AS runner

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "build"]

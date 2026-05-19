# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build --configuration=production

# Nginx stage
FROM nginx:alpine
COPY --from=builder /app/dist/roomie-frontend/browser /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY src/assets/env.template.js /usr/share/nginx/html/assets/env.template.js
RUN apk add --no-cache gettext
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]

EXPOSE 80
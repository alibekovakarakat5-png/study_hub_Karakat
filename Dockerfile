FROM node:20-alpine AS build
WORKDIR /app

# Build-time Vite vars — Railway injects these via service Variables
ARG VITE_API_URL
ARG VITE_BASE_URL
ARG VITE_GA_ID
ARG VITE_WHATSAPP_NUMBER
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_GA_ID=${VITE_GA_ID}
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER}

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Serve with lightweight static server.
# Using the official nginx template mechanism so $PORT from Railway is
# substituted into the listen directive at container start.
FROM nginx:alpine AS production
ENV PORT=80
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

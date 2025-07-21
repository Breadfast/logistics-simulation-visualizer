# Stage 1: Build the app with Bun
FROM oven/bun:1.0 AS builder

WORKDIR /app

COPY . .

RUN bun install
RUN bun run build

# Stage 2: Serve the build with a static server
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

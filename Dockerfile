# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Create public directory if it doesn't exist
RUN mkdir -p public
RUN npm run build

# Stage 2: Build the backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY main.go go.mod go.sum ./
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# Stage 3: Final stage
FROM alpine:latest
WORKDIR /app

# Install dependencies
RUN apk --no-cache add ca-certificates tini nodejs npm curl jq

# Copy application files
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/server ./

# Copy startup script
COPY start.sh .
RUN chmod +x start.sh

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["./start.sh"]

EXPOSE 3000 8080
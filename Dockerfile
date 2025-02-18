# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build the backend
FROM golang:1.23-alpine AS backend-builder
WORKDIR /app
COPY main.go go.mod go.sum ./
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# Stage 3: Final stage
FROM alpine:3.18
WORKDIR /app

# Install necessary runtime dependencies
RUN apk --no-cache add ca-certificates

# Copy the frontend build
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package.json ./package.json

# Copy the backend binary
COPY --from=backend-builder /app/server ./

# Install production node modules
COPY --from=frontend-builder /app/node_modules ./node_modules

# Expose ports for both frontend and backend
EXPOSE 3000 8080

# Create start script
RUN echo '#!/bin/sh\n\
(./server &)\n\
exec npm start' > start.sh && chmod +x start.sh

CMD ["./start.sh"]
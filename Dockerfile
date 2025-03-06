# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./
# Download dependencies
RUN go mod download

# Copy the source code
COPY main.go .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o bolt-app .

# Runtime stage
FROM alpine:3.19

WORKDIR /app

# Install ca-certificates for HTTPS connections to k8s API
RUN apk --no-cache add ca-certificates

# Copy the binary from builder stage
COPY --from=builder /app/bolt-app .

# First create the user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Then create the directories and set permissions
RUN mkdir -p /home/appuser/.kube && \
    chown -R appuser:appgroup /home/appuser/.kube && \
    mkdir -p /root/.kube

# Default to appuser but can be overridden with --user flag
USER appuser

# Expose the API port
EXPOSE 8080

# Run the application
ENTRYPOINT ["./bolt-app"]
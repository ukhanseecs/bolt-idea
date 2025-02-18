#!/bin/sh
# start.sh

# Create kubernetes config directory
mkdir -p /root/.kube

# Function to check kubernetes connection
check_k8s() {
  curl -sk "$1/version" > /dev/null 2>&1
}

# Try different auth methods
setup_auth() {
  # 1. Try existing mounted config
  if [ -f "/root/.kube/config" ]; then
    return 0
  fi

  # 2. Try service account token
  if [ -f "/var/run/secrets/kubernetes.io/serviceaccount/token" ]; then
    TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
    CA_CERT="/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
    K8S_HOST="https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}"
    
    echo "apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority: ${CA_CERT}
    server: ${K8S_HOST}
  name: default
contexts:
- context:
    cluster: default
    user: default
  name: default
current-context: default
users:
- name: default
  user:
    token: ${TOKEN}" > /root/.kube/config
    return 0
  fi

  # 3. Try environment variables
  if [ ! -z "$KUBERNETES_MASTER" ]; then
    echo "apiVersion: v1
kind: Config
clusters:
- cluster:
    insecure-skip-tls-verify: true
    server: ${KUBERNETES_MASTER}
  name: default
contexts:
- context:
    cluster: default
    user: default
  name: default
current-context: default
users:
- name: default
  user: {}" > /root/.kube/config
    return 0
  fi

  return 1
}

# Setup kubernetes auth
if ! setup_auth; then
  echo "No valid Kubernetes configuration found"
  exit 1
fi

# Start services
./server &
SERVER_PID=$!
npm start &
FRONTEND_PID=$!
wait $SERVER_PID $FRONTEND_PID
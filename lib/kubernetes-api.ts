// lib/kubernetes-api.ts
const API_BASE_URL = 'http://localhost:8080';

export interface KubernetesResource {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec?: any;
  status?: any;
}

export async function getResourceTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/`);
  return response.json();
}

export async function getResourceList(type: string): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/list/${type}`);
  return response.json();
}

export async function getResourceDetails(type: string, name: string): Promise<KubernetesResource> {
  const response = await fetch(`${API_BASE_URL}/details/${type}/${name}`);
  return response.json();
}
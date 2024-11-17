// hooks/useKubernetesResources.ts
import { useState, useEffect } from 'react';
import { getResourceTypes, getResourceList, getResourceDetails, KubernetesResource } from '@/lib/kubernetes-api';

export interface FormattedResource {
  name: string;
  namespace: string;
  status?: string;
  age: string;
  labels?: Record<string, string>;
  [key: string]: any;
}

export function useKubernetesResources() {
  const [resources, setResources] = useState<Record<string, FormattedResource[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchResources() {
      try {
        const types = await getResourceTypes();
        const resourceData: Record<string, FormattedResource[]> = {};

        for (const type of types) {
          const names = await getResourceList(type);
          const details = await Promise.all(
            names.map(async (name) => {
              const resource = await getResourceDetails(type, name);
              return formatResource(resource, type);
            })
          );
          resourceData[type] = details;
        }

        setResources(resourceData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch resources');
        setLoading(false);
      }
    }

    fetchResources();
  }, []);

  return { resources, loading, error, searchQuery, setSearchQuery };
}

function formatResource(resource: KubernetesResource, type: string): FormattedResource {
  const age = calculateAge(resource.metadata.creationTimestamp);

  const formatted: FormattedResource = {
    name: resource.metadata.name,
    namespace: resource.metadata.namespace,
    age,
    labels: resource.metadata.labels || {},
  };

  // Add type-specific formatting
  switch (type) {
    case 'pods':
      formatted.status = resource.status?.phase;
      formatted.nodeName = resource.spec?.nodeName;
      break;
    case 'services':
      formatted.type = resource.spec?.type;
      formatted.clusterIP = resource.spec?.clusterIP;
      break;
    // Add more cases as needed
  }

  return formatted;
}

function calculateAge(timestamp: string): string {
  const created = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  return `${Math.floor(diffInSeconds / 86400)}d`;
}
// hooks/useResourceYaml.ts
import { useState } from 'react';

export function useResourceYaml() {
  const [yamlContent, setYamlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYaml = async (type: string, name: string) => {
    setIsLoading(true);
    try {
      // Use format=yaml query parameter instead of Accept header
      const response = await fetch(`http://localhost:8080/details/${type}/${name}?format=yaml`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch YAML: ${response.status} ${response.statusText}`);
      }
      
      const yaml = await response.text();
      setYamlContent(yaml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch YAML');
      console.error("YAML fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { yamlContent, isLoading, error, fetchYaml };
}
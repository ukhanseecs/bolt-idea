// hooks/useResourceYaml.ts
import { useState } from 'react';

export function useResourceYaml() {
  const [yamlContent, setYamlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchYaml = async (type: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/details/${type}/${name}`, {
        headers: {
          'Accept': 'text/yaml'
        }
      });
      const yaml = await response.text();
      setYamlContent(yaml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch YAML');
    } finally {
      setIsLoading(false);
    }
  };

  return { yamlContent, isLoading, error, fetchYaml };
}
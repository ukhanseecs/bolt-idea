// components/dashboard/cluster-resources.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, Network } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState, useMemo } from 'react';
import { resourceIcons, resourceCategories } from '@/components/ui/resource-config';
import { YamlDialog } from '@/components/ui/yaml-dialog';
import { useKubernetesResources } from '@/hooks/useKubernetesResources';
import { useResourceYaml } from '@/hooks/useResourceYaml';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Box, Database, Globe, Lock, Shield,
  Cloud, Cpu, HardDrive, Layers,
  Settings, FileText, Clock, Network as NetworkIcon,
  Component 
} from 'lucide-react';
import { RelatedResources } from "@/components/ui/related-resources";

export function ClusterResources() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof resourceCategories>("Workloads");
  const [searchQuery, setSearchQuery] = useState("");
  const { resources, loading, error } = useKubernetesResources();
  
  // Modified filteredResources to support cross-category search
  const filteredResources = useMemo(() => {
    if (!resources) return {};
    
    // If there's a search query, search across all resources regardless of category
    if (searchQuery.trim()) {
      const normalized = searchQuery.toLowerCase().trim();
      const searchResults: Record<string, any[]> = {};
      
      // Loop through all resource types
      Object.keys(resources).forEach(resourceType => {
        const filtered = resources[resourceType]?.filter(resource => {
          if (!resource) return false;
          return (
            (resource.name || '').toLowerCase().includes(normalized) ||
            (resource.namespace || '').toLowerCase().includes(normalized) ||
            (resource.status || '').toLowerCase().includes(normalized) ||
            // Safely check labels
            (resource.labels && Object.entries(resource.labels).some(([k, v]) => 
              k.toLowerCase().includes(normalized) || 
              String(v).toLowerCase().includes(normalized)
            )) ||
            // Safely check annotations
            (resource.annotations && Object.entries(resource.annotations).some(([k, v]) => 
              k.toLowerCase().includes(normalized) || 
              String(v).toLowerCase().includes(normalized)
            ))
          );
        });
        
        if (filtered && filtered.length > 0) {
          searchResults[resourceType] = filtered;
        }
      });
      
      return searchResults;
    }
    
    // Otherwise, filter by category as before
    return Object.keys(resources).reduce((acc, key) => {
      if (resourceCategories[selectedCategory].includes(key)) {
        acc[key] = resources[key];
      }
      return acc;
    }, {} as Record<string, any[]>);
  }, [resources, selectedCategory, searchQuery]);

  // Get visible resource types based on search results or category
  const visibleResourceTypes = useMemo(() => {
    if (searchQuery.trim()) {
      return Object.keys(filteredResources);
    }
    return resourceCategories[selectedCategory];
  }, [filteredResources, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <Card className="flex flex-col h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-2 text-sm text-muted-foreground">Loading cluster resources...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col h-full items-center justify-center text-destructive">
        <p className="text-sm">Error: {error}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>
            {searchQuery.trim() ? 'Search Results' : 'Cluster Resources'}
            {searchQuery.trim() && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                for "{searchQuery}"
              </span>
            )}
          </CardTitle>
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!searchQuery.trim() && (
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as keyof typeof resourceCategories)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(resourceCategories).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {searchQuery.trim() && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                size="sm"
              >
                Clear Search
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {visibleResourceTypes.length > 0 ? (
          <Tabs defaultValue={visibleResourceTypes[0]} className="space-y-4">
            <ScrollArea className="h-[50px] whitespace-nowrap">
              <TabsList>
                {visibleResourceTypes.map(resource => (
                  <TabsTrigger key={resource} value={resource} className="capitalize">
                    {resource}
                    {filteredResources[resource] && (
                      <Badge className="ml-2 text-xs" variant="secondary">
                        {filteredResources[resource].length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            {visibleResourceTypes.map(resource => (
              <TabsContent key={resource} value={resource}>
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources[resource]?.map((item, index) => (
                      <ResourceCard
                        key={index}
                        icon={React.createElement(
                          resourceIcons[resource as keyof typeof resourceIcons] || Component
                        )}
                        data={getResourceData(item, resource)}
                        title={item.name}
                        resourceType={resource}
                        allResources={resources} 
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] text-center">
            <Search className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium">No resources found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search term or select a different category.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResourceCard({
  icon,
  data,
  title,
  resourceType,
  allResources 
}: {
  icon: React.ReactNode;
  data: { label: string; value: string }[];
  title: string;
  resourceType: string;
  allResources: Record<string, any[]>;
}) {
  const [isYamlOpen, setIsYamlOpen] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const { yamlContent, isLoading, fetchYaml } = useResourceYaml();

  const labelsString = data.find(item => item.label === 'Labels')?.value;
  const currentLabels = labelsString && labelsString !== 'None'
    ? Object.fromEntries(labelsString.split(', ').map(l => l.split(': ')))
    : {};

  const relatedResources = useMemo(() => {
    return [];
  }, [currentLabels, resourceType, allResources]);

  function handleRelatedClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.stopPropagation(); 
    setShowRelated(!showRelated);
  }

  async function handleYamlClick(event: React.MouseEvent<HTMLSpanElement, MouseEvent>): Promise<void> {
    event.stopPropagation(); 
    await fetchYaml(resourceType, title); 
    setIsYamlOpen(true);
  }

  return (
    <>
      <Card className="mb-4 transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            <span className="hover:underline cursor-pointer" onClick={handleYamlClick}>
              {title}
            </span>
          </CardTitle>
          {relatedResources.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRelatedClick}
            >
              <Network className="h-4 w-4 mr-1" />
              {relatedResources.length} Related
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-muted-foreground">
                  {item.label}
                </p>
                {item.label === 'Labels' ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.value !== 'None' ? item.value.split(', ').map((label) => {
                      const [key, value] = label.split(': ');
                      return (
                        <Badge key={key} variant="secondary" className="text-xs">
                          {key}: {value}
                        </Badge>
                      );
                    }) : (
                      <span className="text-sm text-muted-foreground">None</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {showRelated && relatedResources.length > 0 && (
            <RelatedResources resources={relatedResources} />
          )}
        </CardContent>
      </\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    </>
  );
}

function formatLabels(labels: Record<string, string> | undefined): string {
  if (!labels || Object.keys(labels).length === 0) return 'None';
  return Object.entries(labels)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
}

function getResourceData(item: any, resourceType: string) {
  const commonFields = [
    { label: 'Namespace', value: item.namespace },
    { label: 'Age', value: item.age },
    { label: 'Labels', value: formatLabels(item.labels) }, 
  ];

  const specificFields: Record<string, Array<{label: string, value: string}>> = {
    pods: [
      { label: 'Status', value: item.status },
      { label: 'CPU', value: item.cpu || 'N/A' },
      { label: 'Memory', value: item.memory || 'N/A' },
      { label: 'Node', value: item.nodeName || 'N/A' },
    ],
    deployments: [
      { label: 'Replicas', value: `${item.readyReplicas || 0}/${item.replicas || 0}` },
      { label: 'Strategy', value: item.strategy?.type || 'N/A' },
    ],
    services: [
      { label: 'Type', value: item.type || 'ClusterIP' },
      { label: 'Cluster IP', value: item.clusterIP || 'N/A' },
      { label: 'External IP', value: item.loadBalancer?.ingress?.[0]?.ip || 'None' },
      { label: 'Ports', value: formatPorts(item.ports) },
    ],
  };

  return [
    ...commonFields,
    ...(specificFields[resourceType] || []),
  ];
}

function formatPorts(ports: any[]): string {
  if (!ports) return 'N/A';
  return ports.map(p => `${p.port}${p.targetPort ? ':' + p.targetPort : ''}`).join(', ');
}

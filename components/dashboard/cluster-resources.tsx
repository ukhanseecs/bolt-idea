// components/dashboard/cluster-resources.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react';
import { resourceIcons, resourceCategories } from '@/components/ui/resource-config';
import { YamlDialog } from '@/components/ui/yaml-dialog';
import { useKubernetesResources } from '@/hooks/useKubernetesResources';
import { useResourceYaml } from '@/hooks/useResourceYaml'; // Add this import
import { Badge } from "@/components/ui/badge"; // Add this import

export function ClusterResources() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof resourceCategories>("Workloads");
  const [searchQuery, setSearchQuery] = useState("");
  const { resources, loading, error } = useKubernetesResources();

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

  const filteredResources = Object.keys(resources).reduce((acc, key) => {
    // Only filter resources that belong to the selected category
    if (resourceCategories[selectedCategory].includes(key)) {
      const filtered = resources[key].filter(resource =>
        // Search across resource fields
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.namespace?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.status?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filtered.length > 0) {
        acc[key] = filtered;
      }
    }
    return acc;
  }, {} as typeof resources);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>Cluster Resources</CardTitle>
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={resourceCategories[selectedCategory][0]} className="space-y-4">
          <ScrollArea className="h-[50px] whitespace-nowrap">
            <TabsList>
              {resourceCategories[selectedCategory].map(resource => (
                <TabsTrigger key={resource} value={resource} className="capitalize">
                  {resource}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          {resourceCategories[selectedCategory]
            .filter(resource => resource.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(resource => (
              <TabsContent key={resource} value={resource}>
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources[resource]?.map((item, index) => (
                      <ResourceCard
                        key={index}
                        icon={React.createElement(resourceIcons[resource as keyof typeof resourceIcons])}
                        data={getResourceData(item, resource)}
                        title={item.name}
                        resourceType={resource}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ResourceCard({
  icon,
  data,
  title,
  resourceType
}: {
  icon: React.ReactNode;
  data: { label: string; value: string }[];
  title: string;
  resourceType: string;
}) {
  const [isYamlOpen, setIsYamlOpen] = useState(false);
  const { yamlContent, isLoading, fetchYaml } = useResourceYaml();
  const labels = data.find(item => item.label === 'Labels')?.value;

  const handleClick = async () => {
    await fetchYaml(resourceType, title);
    setIsYamlOpen(true);
  };

  return (
    <>
      <Card className="mb-4 transition-all hover:shadow-md cursor-pointer" onClick={handleClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            <span className="hover:underline">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
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
        </CardContent>
      </Card>
      <YamlDialog
        isOpen={isYamlOpen}
        onClose={() => setIsYamlOpen(false)}
        title={`${title} YAML`}
        content={isLoading ? "Loading..." : yamlContent}
      />
    </>
  );
}

// Add this helper function to format labels
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
    { label: 'Labels', value: formatLabels(item.labels) }, // Add labels to common fields
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

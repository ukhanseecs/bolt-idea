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
import { FormattedResource, useKubernetesResources } from '@/hooks/useKubernetesResources';

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

  function getResourceData(item: FormattedResource, resource: string): { label: string; value: string; }[] {
    const data = [];

    if (resource === "pods") {
      data.push({ label: "Namespace", value: item.namespace });
      data.push({ label: "Status", value: item.status });
      data.push({ label: "Node", value: item.node });
    } else if (resource === "services") {
      data.push({ label: "Namespace", value: item.namespace });
      data.push({ label: "Cluster IP", value: item.clusterIP });
      data.push({ label: "Ports", value: item.ports.join(", ") });
    } else if (resource === "deployments") {
      data.push({ label: "Namespace", value: item.namespace });
      data.push({ label: "Replicas", value: `${item.replicas}` });
      data.push({ label: "Available Replicas", value: `${item.availableReplicas}` });
    }

    return data;
  }

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
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as string as keyof typeof resourceCategories)}>
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
                {resourceCategories[selectedCategory]
                .filter((resource: string) => resource.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((resource: string) => (
                  <TabsTrigger key={resource} value={resource} className="capitalize">
                  {resource}
                  </TabsTrigger>
                ))}
            </TabsList>
          </ScrollArea>
          {resourceCategories[selectedCategory]
            .filter((resource: string) => resource.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((resource: string) => (
              <TabsContent key={resource} value={resource}>
                <ScrollArea className="h-[600px]">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {resources[resource]?.map((item, index) => (
                      <ResourceCard
                        key={index}
                        icon={React.createElement(resourceIcons[resource as keyof typeof resourceIcons])}
                        data={getResourceData(item, resource)}
                        title={item.name}
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
  title
}: {
  icon: React.ReactNode,
  data: { label: string, value: string }[],
  title: string
}) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {data.map((item, index) => (
            <div key={index}>
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
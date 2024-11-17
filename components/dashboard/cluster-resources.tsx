// components/dashboard/cluster-resources.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Box, Database, Globe, Lock, Search,
  Shield, Cloud, Cpu, HardDrive, Layers,
  Settings, FileText, Clock, Network
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react';

// Mock data - replace with real K8s API calls
const resources = {
  pods: [
    { name: 'frontend-pod-1', status: 'Running', namespace: 'default', cpu: '120m', memory: '256Mi', node: 'node-1', age: '2d' },
    { name: 'backend-pod-1', status: 'Running', namespace: 'backend', cpu: '250m', memory: '512Mi', node: 'node-2', age: '5d' },
  ],
  deployments: [
    { name: 'frontend', replicas: '3/3', namespace: 'default', strategy: 'RollingUpdate', age: '5d' },
    { name: 'backend', replicas: '2/2', namespace: 'backend', strategy: 'RollingUpdate', age: '5d' },
  ],
  services: [
    { name: 'frontend-svc', type: 'LoadBalancer', clusterIP: '10.0.0.1', externalIP: '34.123.123.123', ports: '80:30000', age: '5d' },
    { name: 'backend-svc', type: 'ClusterIP', clusterIP: '10.0.0.2', ports: '8080', age: '5d' },
  ],
  secrets: [
    { name: 'api-keys', type: 'Opaque', namespace: 'default', age: '10d' },
    { name: 'tls-cert', type: 'kubernetes.io/tls', namespace: 'default', age: '5d' },
  ]
};

// Resource type icons mapping
const resourceIcons = {
  pods: Box,
  deployments: Database,
  services: Globe,
  secrets: Lock,
  configmaps: FileText,
  persistentvolumeclaims: HardDrive,
  networkpolicies: Network,
  ingresses: Cloud,
  statefulsets: Layers,
  daemonsets: Cpu,
  cronjobs: Clock,
  jobs: Clock,
  roles: Shield,
  rolebindings: Shield,
  serviceaccounts: Shield,
  resourcequotas: Settings,
  horizontalpodautoscalers: Settings,
  replicasets: Database,
  endpoints: Globe,
  // Add more resource icons...
};

// Resource categories and their items
const resourceCategories = {
  "Workloads": [
    "pods",
    "deployments",
    "statefulsets",
    "daemonsets",
    "jobs",
    "cronjobs",
    "replicasets",
    "replicationcontrollers",
  ],
  "Network": [
    "services",
    "ingresses",
    "networkpolicies",
    "endpoints",
    "endpointslices"
  ],
  "Config & Storage": [
    "configmaps",
    "secrets",
    "persistentvolumeclaims",
    "csistoragecapacities"
  ],
  "RBAC": [
    "serviceaccounts",
    "roles",
    "rolebindings"
  ],
  "Cluster": [
    "resourcequotas",
    "limitranges",
    "horizontalpodautoscalers",
    "poddisruptionbudgets"
  ],
  "Other": [
    "events",
    "leases",
    "controllerrevisions",
    "podtemplates"
  ]
};

export function ClusterResources() {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof resourceCategories>("Workloads");
  const [searchQuery, setSearchQuery] = useState("");

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
              {resourceCategories[selectedCategory]
                .filter(resource => resource.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(resource => (
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
                    {resources[resource as keyof typeof resources]?.map((item, index) => (
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

// Helper function to get formatted data for each resource type
function getResourceData(item: any, resourceType: string) {
  const commonFields = [
    { label: 'Namespace', value: item.namespace },
    { label: 'Age', value: item.age },
  ];

  const specificFields: Record<string, Array<{label: string, value: string}>> = {
    pods: [
      { label: 'Status', value: item.status },
      { label: 'CPU', value: item.cpu },
      { label: 'Memory', value: item.memory },
      { label: 'Node', value: item.node },
    ],
    deployments: [
      { label: 'Replicas', value: item.replicas },
      { label: 'Strategy', value: item.strategy },
    ],
    services: [
      { label: 'Type', value: item.type },
      { label: 'Cluster IP', value: item.clusterIP },
      { label: 'External IP', value: item.externalIP || 'None' },
      { label: 'Ports', value: item.ports },
    ],
    // Add more resource type specific fields...
  };

  return [...(specificFields[resourceType] || []), ...commonFields];
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
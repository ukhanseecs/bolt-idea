// components/dashboard/resource-config.ts
import {
  Box, Database, Globe, Lock, Shield,
  Cloud, Cpu, HardDrive, Layers,
  Settings, FileText, Clock, Network
} from 'lucide-react';

export const resourceIcons = {
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
};

export const resourceCategories = {
  "Workloads": [
    "pods",
    "deployments",
    "statefulsets",
    "daemonsets",
    "jobs",
    "cronjobs",
    "replicasets",
  ],
  "Network": [
    "services",
    "ingresses",
    "networkpolicies",
    "endpoints",
  ],
  "Config & Storage": [
    "configmaps",
    "secrets",
    "persistentvolumeclaims",
  ],
  "RBAC": [
    "serviceaccounts",
    "roles",
    "rolebindings"
  ],
  "Cluster": [
    "resourcequotas",
    "horizontalpodautoscalers",
  ]
};
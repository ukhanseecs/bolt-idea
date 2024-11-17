'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ClusterResources } from '@/components/dashboard/cluster-resources';
import { Users, Server, Activity, BarChart, Lock, Globe } from 'lucide-react';
import { useKubernetesResources } from '@/hooks/useKubernetesResources';

export default function Home() {
  const { resources, loading, error } = useKubernetesResources();

  // Calculate statistics
  const stats = {
    pods: {
      total: resources.pods?.length || 0,
      running: resources.pods?.filter(pod => pod.status === 'Running').length || 0,
      change: 0 // We would need historical data for this
    },
    deployments: {
      total: resources.deployments?.length || 0,
      healthy: resources.deployments?.filter(dep =>
        (dep.readyReplicas || 0) === (dep.replicas || 0)
      ).length || 0
    },
    services: {
      total: resources.services?.length || 0,
      loadBalancers: resources.services?.filter(svc =>
        svc.type === 'LoadBalancer'
      ).length || 0
    },
    secrets: {
      total: resources.secrets?.length || 0,
      needsRotation: resources.secrets?.filter(secret => {
        const creationTimestamp = secret.metadata?.creationTimestamp;
        if (!creationTimestamp) return false;
        const age = new Date().getTime() - new Date(creationTimestamp).getTime();
        const daysOld = Math.floor(age / (1000 * 60 * 60 * 24));
        return daysOld > 90; // Assuming secrets older than 90 days need rotation
      }).length || 0
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cluster Overview</h1>
          <p className="text-muted-foreground">
            Here's an overview of your Kubernetes resources
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Pods"
            value={stats.pods.total.toString()}
            description={`${stats.pods.running} running pods`}
            icon={<Server className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Deployments"
            value={stats.deployments.total.toString()}
            description={`${stats.deployments.healthy} healthy`}
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Services"
            value={stats.services.total.toString()}
            description={`${stats.services.loadBalancers} LoadBalancers`}
            icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Secrets"
            value={stats.secrets.total.toString()}
            description={`${stats.secrets.needsRotation} pending rotation`}
            icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <ClusterResources />
      </div>
    </DashboardLayout>
  );
}
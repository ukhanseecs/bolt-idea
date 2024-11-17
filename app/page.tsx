import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { ClusterResources } from '@/components/dashboard/cluster-resources';
import { Users, Server, Activity, BarChart, Lock, Globe } from 'lucide-react';

export default function Home() {
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
            value="24"
            description="+2 pods from last hour"
            icon={<Server className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Deployments"
            value="8"
            description="All healthy"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Services"
            value="12"
            description="3 LoadBalancers"
            icon={<Globe className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Secrets"
            value="15"
            description="4 pending rotation"
            icon={<Lock className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        <ClusterResources />
      </div>
    </DashboardLayout>
  );
}
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsCard } from '@/components/dashboard/stats-card';
import { Users, Server, Activity, BarChart } from 'lucide-react';

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your dashboard
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value="10.5k"
            description="+12% from last month"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Active Clusters"
            value="234"
            description="18 clusters added today"
            icon={<Server className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Server Load"
            value="75%"
            description="Average across all nodes"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Total Revenue"
            value="$45.2k"
            description="+8% from last week"
            icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
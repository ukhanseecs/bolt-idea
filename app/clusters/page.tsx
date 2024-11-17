import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Cpu, HardDrive, Network } from 'lucide-react';

const clusters = [
  {
    name: 'Production Cluster',
    status: 'Healthy',
    nodes: 12,
    region: 'us-east-1',
    icon: Server,
  },
  {
    name: 'Staging Cluster',
    status: 'Healthy',
    nodes: 6,
    region: 'eu-west-1',
    icon: Cpu,
  },
  {
    name: 'Development Cluster',
    status: 'Maintenance',
    nodes: 4,
    region: 'ap-south-1',
    icon: HardDrive,
  },
  {
    name: 'Testing Cluster',
    status: 'Healthy',
    nodes: 3,
    region: 'us-west-2',
    icon: Network,
  },
];

export default function ClustersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clusters</h1>
          <p className="text-muted-foreground">
            Manage and monitor your cluster infrastructure
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {clusters.map((cluster, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {cluster.name}
                </CardTitle>
                <cluster.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      {cluster.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nodes</p>
                    <p className="text-sm text-muted-foreground">
                      {cluster.nodes}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Region</p>
                    <p className="text-sm text-muted-foreground">
                      {cluster.region}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
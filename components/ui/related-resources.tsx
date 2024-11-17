// components/ui/related-resources.tsx
import { Badge } from "@/components/ui/badge";
import { Component } from "lucide-react";
import { resourceIcons } from "@/components/ui/resource-config";

interface RelatedResourcesProps {
  resources: Array<{
    name: string;
    type: string;
    matchedLabels: string[];
  }>;
}

export function RelatedResources({ resources }: RelatedResourcesProps) {
  const getResourceIcon = (type: string) => {
    const IconComponent = resourceIcons[type as keyof typeof resourceIcons] || Component;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="mt-4 border-t pt-4">
      <p className="text-sm font-medium mb-2">Related Resources</p>
      <div className="space-y-2">
        {resources.map((resource) => (
          <div
            key={`${resource.type}-${resource.name}`}
            className="flex items-center justify-between p-2 rounded-md bg-accent/20 hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              {getResourceIcon(resource.type)}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{resource.name}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {resource.type}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              {resource.matchedLabels.map(label => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
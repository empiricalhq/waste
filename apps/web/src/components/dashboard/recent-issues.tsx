import { AlertTriangle, User, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Issue } from '@/lib/api-contract';

const sourceIcons: Record<Issue['source'], React.ElementType> = {
  citizen: User,
  driver: Wrench,
};

const sourceColors: Record<Issue['source'], string> = {
  citizen: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  driver: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
};

export function RecentIssues({ issues }: { issues: Issue[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Incidencias recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issues.length > 0 ? (
            issues.map((issue) => {
              const Icon = sourceIcons[issue.source] || AlertTriangle;
              return (
                <div key={issue.id} className="flex items-start space-x-4">
                  <div
                    className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      sourceColors[issue.source]
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">{issue.type.replace(/_/g, ' ')}</p>
                      <Badge variant="secondary" className="text-xs">
                        {issue.source}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{issue.description || 'No description provided.'}</p>
                    <p className="text-muted-foreground pt-1 text-xs">{new Date(issue.created_at).toLocaleString()}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex h-100 items-center justify-center">
              <p className="text-muted-foreground text-center text-sm">No hay incidencias recientes.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

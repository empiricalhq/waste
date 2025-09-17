import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireUser } from '@/features/auth/lib';

export const runtime = 'edge';

export default async function SettingsPage() {
  // Only admins can access this page.
  await requireUser(['admin']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System-wide settings and configurations.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">User creation, role assignment, and permissions are managed here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">General settings for notifications, integrations, etc.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { requireUser } from '@/features/auth/lib';

// biome-ignore lint: cloudflare requires edge runtime
export const runtime = 'edge';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // This layout is only for admins and supervisors.
  // The middleware also enforces this, but this check provides an extra layer of security.
  const user = await requireUser(['admin', 'supervisor']);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar isAdmin={user.appRole === 'admin'} />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

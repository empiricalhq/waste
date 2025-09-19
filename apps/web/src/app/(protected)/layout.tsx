import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { getAuth, requireUser } from '@/features/auth/lib';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const auth = await getAuth();
  const memberRole = auth?.member?.role ?? null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} memberRole={memberRole} />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

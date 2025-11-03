import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { getAuth, requireUser } from '@/features/auth/lib';
import type { Role } from '@/features/auth/roles';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const auth = await getAuth();
  const userRole = (auth?.user?.role as Role) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} memberRole={userRole} />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

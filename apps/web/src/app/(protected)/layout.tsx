import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { getCurrentMember, requireUser } from '@/features/auth/lib';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  // This layout is for admins and supervisors. The middleware also enforces this.
  // This call ensures the user is logged in. The role check is an extra layer of security.
  const user = await requireUser(['admin', 'supervisor']);
  const member = await getCurrentMember();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} memberRole={member?.role ?? null} />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

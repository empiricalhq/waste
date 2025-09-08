import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="lg:pl-64">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
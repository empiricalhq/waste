import { AddUserButton } from "@/components/dashboard/add-user-button";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  return (
    <div>
      <DashboardSidebar />
      <div className="lg:pl-64">
        <main className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="mb-1 text-3xl font-bold">Dashboard</h1>
              <p>
                Sistema de gestión de administradores, supervisores y choferes
              </p>
            </div>
            <AddUserButton />
          </div>

          <DashboardStats />
          <div className="mt-6">
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}

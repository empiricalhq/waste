'use client';

import { Bell, LayoutDashboard, Leaf, LogOut, MapPin, Settings, Truck, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { User } from '@/db/types';
import { signOut } from '@/features/auth/actions';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Choferes', href: '/drivers', icon: Users },
  { name: 'Rutas', href: '/routes', icon: MapPin },
  { name: 'Vehículos', href: '/trucks', icon: Truck },
];

const adminNavigation = [{ name: 'Configuración', href: '/settings', icon: Settings }];

function UserInfo({ user }: { user: User }) {
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button variant="ghost" className="flex w-full items-center justify-start space-x-3 p-2 h-auto">
            <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
              <span className="text-primary font-medium">{user.name?.[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="text-muted-foreground truncate text-xs">{user.email}</p>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button variant="ghost" size="icon" className="relative h-8 w-8 shrink-0">
        <Bell className="h-5 w-5" />
      </Button>
    </div>
  );
}

interface DashboardSidebarProps {
  user: User;
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isAdmin = user.appRole === 'admin';
  const navItems = isAdmin ? [...navigation, ...adminNavigation] : navigation;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Leaf className="text-primary h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">Lima Limpia</h1>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="border-t p-4">
        <UserInfo user={user} />
      </div>
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:block">
      <SidebarContent />
    </aside>
  );
}

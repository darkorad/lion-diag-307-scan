import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Car,
  Settings,
  Bluetooth
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MainLayout = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/diagnostics', label: 'Diagnostics', icon: Wrench },
    { to: '/vehicle-selection', label: 'Vehicle', icon: Car },
    { to: '/connections', label: 'Connection', icon: Bluetooth },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex flex-col w-64 border-r">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">LionDiag</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent',
                  isActive ? 'bg-primary text-primary-foreground' : ''
                )
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom navigation for smaller screens */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background">
        <nav className="flex justify-around p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center text-xs p-1 rounded-md',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )
              }
            >
              <item.icon className="h-6 w-6" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default MainLayout;

import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Simple sidebar */}
      <div className="w-64 bg-card border-r p-4 hidden md:block">
        <h1 className="text-xl font-bold mb-4">LionDiag Pro</h1>
        <nav>
          <ul className="space-y-2">
            <li><a href="/" className="block p-2 hover:bg-accent rounded">Dashboard</a></li>
            <li><a href="/connections" className="block p-2 hover:bg-accent rounded">Connections</a></li>
            <li><a href="/diagnostics" className="block p-2 hover:bg-accent rounded">Diagnostics</a></li>
            <li><a href="/vehicle-selection" className="block p-2 hover:bg-accent rounded">Vehicles</a></li>
            <li><a href="/settings" className="block p-2 hover:bg-accent rounded">Settings</a></li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-card border-b p-4 z-10">
        <h1 className="text-xl font-bold">LionDiag Pro</h1>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 md:pt-6 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

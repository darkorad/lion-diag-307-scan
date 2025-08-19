import React from 'react';
import ConnectionStatusWidget from '../components/widgets/ConnectionStatusWidget';
import VehicleProfileWidget from '../components/widgets/VehicleProfileWidget';
import QuickActionsWidget from '../components/widgets/QuickActionsWidget';

const Dashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ConnectionStatusWidget />
        <VehicleProfileWidget />
        <QuickActionsWidget />
      </div>
    </div>
  );
};

export default Dashboard;

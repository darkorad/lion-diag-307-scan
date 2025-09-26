import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import MainLayout from '@/components/MainLayout';
import Index from '@/pages/Index';
import Connections from '@/pages/Connections';
import Diagnostics from '@/pages/Diagnostics';
import VehicleSelection from '@/pages/VehicleSelection';
import Settings from '@/pages/Settings';
import ProfessionalDiagnostics from '@/pages/ProfessionalDiagnostics';
import VehicleSpecific from '@/pages/VehicleSpecific';
import LiveDataPage from '@/pages/LiveDataPage';
import BluetoothTest from '@/pages/BluetoothTest';
import PreviewPage from '@/components/PreviewPage';
import SystemTestingPage from '@/pages/SystemTestingPage';
import TroubleCodesPage from '@/pages/TroubleCodesPage';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="connections" element={<Connections />} />
            <Route path="diagnostics" element={<Diagnostics />} />
            <Route path="vehicle-selection" element={<VehicleSelection />} />
            <Route path="settings" element={<Settings />} />
            <Route path="professional" element={<ProfessionalDiagnostics />} />
            <Route path="vehicle-specific" element={<VehicleSpecific />} />
            <Route path="vehicle-specific/:make/:model/:generation/:engine" element={<VehicleSpecific />} />
            <Route path="live-data" element={<LiveDataPage />} />
            <Route path="bluetooth-test" element={<BluetoothTest />} />
            <Route path="system-testing" element={<SystemTestingPage />} />
            <Route path="trouble-codes" element={<TroubleCodesPage />} />
            <Route path="preview" element={<PreviewPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;

import { Home, Car, Settings, Info, Wrench, Cpu, Radio, Shield, Bluetooth, Activity } from "lucide-react";
import Index from "./pages/Index";
import ProfessionalDiagnostics from "./pages/ProfessionalDiagnostics";
import VehicleSpecific from "./pages/VehicleSpecific";
import ConnectionScreen from "./components/ConnectionScreen";
import LiveDataMonitor from "./components/LiveDataMonitor";
import SettingsPage from "./pages/SettingsPage";
import ConnectionsPage from "./components/ConnectionsPage";
import LiveDataPage from "./pages/LiveDataPage";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Professional Diagnostics",
    to: "/professional",
    icon: <Wrench className="h-4 w-4" />,
    page: <ProfessionalDiagnostics />,
  },
  {
    title: "Vehicle Specific",
    to: "/vehicle-specific",
    icon: <Car className="h-4 w-4" />,
    page: <VehicleSpecific />,
  },
  {
    title: "Connections",
    to: "/connections",
    icon: <Bluetooth className="h-4 w-4" />,
    page: <ConnectionsPage />,
  },
  {
    title: "Live Data",
    to: "/live-data",
    icon: <Activity className="h-4 w-4" />,
    page: <LiveDataPage />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <SettingsPage />,
  },
  {
    title: "Advanced Functions",
    to: "/advanced",
    icon: <Cpu className="h-4 w-4" />,
    page: <div>Advanced Functions Coming Soon</div>,
  },
];

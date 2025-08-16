
import { Home, Car, Settings, Info, Wrench, Cpu, Radio, Shield } from "lucide-react";
import Index from "./pages/Index";
import ProfessionalDiagnostics from "./pages/ProfessionalDiagnostics";
import VehicleSpecific from "./pages/VehicleSpecific";

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
    title: "Advanced Functions",
    to: "/advanced",
    icon: <Cpu className="h-4 w-4" />,
    page: <div>Advanced Functions Coming Soon</div>,
  },
];

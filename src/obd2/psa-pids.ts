
export interface ObdPid {
  name: string;
  mode: string;
  pid: string;
  formula: string;
  unit: string;
  description: string;
  category?: 'engine' | 'dpf' | 'turbo' | 'egr' | 'fuel' | 'emission' | 'standard';
}

export const PSA_PIDS: ObdPid[] = [
  // Standard OBD2 PIDs (Mode 01)
  {
    name: "Engine RPM",
    mode: "01",
    pid: "0C",
    formula: "(A*256+B)/4",
    unit: "rpm",
    description: "Engine revolutions per minute",
    category: "engine"
  },
  {
    name: "Vehicle Speed",
    mode: "01",
    pid: "0D",
    formula: "A",
    unit: "km/h",
    description: "Vehicle speed sensor",
    category: "standard"
  },
  {
    name: "Engine Coolant Temperature",
    mode: "01",
    pid: "05",
    formula: "A-40",
    unit: "°C",
    description: "Engine coolant temperature",
    category: "engine"
  },
  {
    name: "Intake Air Temperature",
    mode: "01",
    pid: "0F",
    formula: "A-40",
    unit: "°C",
    description: "Intake air temperature sensor",
    category: "engine"
  },
  {
    name: "MAF Air Flow Rate",
    mode: "01",
    pid: "10",
    formula: "(A*256+B)/100",
    unit: "g/s",
    description: "Mass air flow sensor rate",
    category: "engine"
  },
  {
    name: "Throttle Position",
    mode: "01",
    pid: "11",
    formula: "A*100/255",
    unit: "%",
    description: "Absolute throttle position",
    category: "engine"
  },
  {
    name: "Fuel Level",
    mode: "01",
    pid: "2F",
    formula: "A*100/255",
    unit: "%",
    description: "Fuel tank level input",
    category: "fuel"
  },
  
  // PSA/Peugeot Specific PIDs (Mode 22)
  {
    name: "DPF Inlet Temperature",
    mode: "22",
    pid: "1C30",
    formula: "(A*256+B)*0.75-48",
    unit: "°C",
    description: "Diesel Particulate Filter inlet temperature",
    category: "dpf"
  },
  {
    name: "DPF Outlet Temperature",
    mode: "22",
    pid: "1C31",
    formula: "(A*256+B)*0.75-48",
    unit: "°C",
    description: "Diesel Particulate Filter outlet temperature",
    category: "dpf"
  },
  {
    name: "DPF Soot Load",
    mode: "22",
    pid: "1C34",
    formula: "(A*256+B)/100",
    unit: "g",
    description: "DPF accumulated soot load",
    category: "dpf"
  },
  {
    name: "DPF Differential Pressure",
    mode: "22",
    pid: "1C32",
    formula: "(A*256+B)-32768",
    unit: "Pa",
    description: "DPF differential pressure sensor",
    category: "dpf"
  },
  {
    name: "EGR Position",
    mode: "22",
    pid: "1C40",
    formula: "A*100/255",
    unit: "%",
    description: "EGR valve position",
    category: "egr"
  },
  {
    name: "EGR Temperature",
    mode: "22",
    pid: "1C41",
    formula: "A*0.75-48",
    unit: "°C",
    description: "EGR temperature sensor",
    category: "egr"
  },
  {
    name: "Turbo Pressure",
    mode: "22",
    pid: "1C50",
    formula: "(A*256+B)/100",
    unit: "mbar",
    description: "Turbocharger boost pressure",
    category: "turbo"
  },
  {
    name: "Fuel Rail Pressure",
    mode: "22",
    pid: "1C60",
    formula: "(A*256+B)*10",
    unit: "bar",
    description: "Common rail fuel pressure",
    category: "fuel"
  },
  {
    name: "Fuel Temperature",
    mode: "22",
    pid: "1C61",
    formula: "A*0.75-48",
    unit: "°C",
    description: "Fuel temperature sensor",
    category: "fuel"
  },
  {
    name: "AdBlue Level",
    mode: "22",
    pid: "1C70",
    formula: "A*100/255",
    unit: "%",
    description: "AdBlue/DEF tank level",
    category: "emission"
  },
  {
    name: "NOx Sensor Upstream",
    mode: "22",
    pid: "1C71",
    formula: "(A*256+B)/100",
    unit: "ppm",
    description: "NOx sensor before SCR catalyst",
    category: "emission"
  },
  {
    name: "NOx Sensor Downstream",
    mode: "22",
    pid: "1C72",
    formula: "(A*256+B)/100",
    unit: "ppm",
    description: "NOx sensor after SCR catalyst",
    category: "emission"
  },
  {
    name: "Oil Temperature",
    mode: "22",
    pid: "1C80",
    formula: "A*0.75-48",
    unit: "°C",
    description: "Engine oil temperature",
    category: "engine"
  },
  {
    name: "Oil Pressure",
    mode: "22",
    pid: "1C81",
    formula: "(A*256+B)/100",
    unit: "bar",
    description: "Engine oil pressure",
    category: "engine"
  },
  {
    name: "Glow Plug Status",
    mode: "22",
    pid: "1C90",
    formula: "A",
    unit: "bool",
    description: "Glow plug heating status",
    category: "engine"
  }
];

// Default PID storage key
export const PID_STORAGE_KEY = 'psa_custom_pids';

// Get PIDs from local storage or return defaults
export const getStoredPids = (): ObdPid[] => {
  try {
    const stored = localStorage.getItem(PID_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load stored PIDs:', error);
  }
  return [...PSA_PIDS];
};

// Save PIDs to local storage
export const saveCustomPids = (pids: ObdPid[]): void => {
  try {
    localStorage.setItem(PID_STORAGE_KEY, JSON.stringify(pids));
  } catch (error) {
    console.error('Failed to save PIDs:', error);
  }
};

// Reset to default PIDs
export const resetToDefaultPids = (): ObdPid[] => {
  localStorage.removeItem(PID_STORAGE_KEY);
  return [...PSA_PIDS];
};

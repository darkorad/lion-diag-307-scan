export interface MaintenanceAlert {
  id: string;
  type: 'oil_change' | 'filter_change' | 'brake_service' | 'timing_belt' | 'coolant_flush';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  mileageInterval?: number;
  currentMileage: number;
  lastServiceMileage?: number;
}

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'stable' | 'declining';
  threshold?: {
    warning: number;
    critical: number;
  };
}

interface OBD2Data {
  engineTemp?: number;
  batteryVoltage?: number;
  fuelLevel?: number;
  [key: string]: unknown;
}

class VehicleHealthService {
  private alerts: MaintenanceAlert[] = [];
  private healthHistory: { timestamp: Date; metrics: HealthMetric[] }[] = [];

  generateMaintenanceAlerts(currentMileage: number, lastOilChange?: number): MaintenanceAlert[] {
    const alerts: MaintenanceAlert[] = [];

    // Oil change alert
    if (lastOilChange && currentMileage - lastOilChange > 8000) {
      alerts.push({
        id: 'oil_change',
        type: 'oil_change',
        title: 'Oil Change Due',
        description: 'Engine oil should be changed every 8,000 km for diesel engines',
        severity: currentMileage - lastOilChange > 10000 ? 'critical' : 'high',
        mileageInterval: 8000,
        currentMileage,
        lastServiceMileage: lastOilChange
      });
    }

    // Air filter alert
    if (lastOilChange && currentMileage - lastOilChange > 15000) {
      alerts.push({
        id: 'air_filter',
        type: 'filter_change',
        title: 'Air Filter Replacement',
        description: 'Air filter should be replaced every 15,000 km',
        severity: 'medium',
        mileageInterval: 15000,
        currentMileage,
        lastServiceMileage: lastOilChange
      });
    }

    return alerts;
  }

  analyzeHealthMetrics(obd2Data: OBD2Data): HealthMetric[] {
    const metrics: HealthMetric[] = [];

    // Engine temperature analysis
    if (obd2Data.engineTemp !== undefined) {
      metrics.push({
        name: 'Engine Temperature',
        value: obd2Data.engineTemp,
        unit: '°C',
        status: obd2Data.engineTemp > 105 ? 'critical' : obd2Data.engineTemp > 95 ? 'warning' : 'good',
        trend: 'stable',
        threshold: { warning: 95, critical: 105 }
      });
    }

    // Battery voltage analysis
    if (obd2Data.batteryVoltage !== undefined) {
      metrics.push({
        name: 'Battery Voltage',
        value: obd2Data.batteryVoltage,
        unit: 'V',
        status: obd2Data.batteryVoltage < 11.5 ? 'critical' : obd2Data.batteryVoltage < 12.0 ? 'warning' : 'good',
        trend: 'stable',
        threshold: { warning: 12.0, critical: 11.5 }
      });
    }

    // Fuel level analysis
    if (obd2Data.fuelLevel !== undefined) {
      metrics.push({
        name: 'Fuel Level',
        value: obd2Data.fuelLevel,
        unit: '%',
        status: obd2Data.fuelLevel < 10 ? 'warning' : 'good',
        trend: 'declining',
        threshold: { warning: 10, critical: 5 }
      });
    }

    return metrics;
  }

  recordHealthSnapshot(metrics: HealthMetric[]): void {
    this.healthHistory.push({
      timestamp: new Date(),
      metrics
    });

    // Keep only last 100 snapshots
    if (this.healthHistory.length > 100) {
      this.healthHistory = this.healthHistory.slice(-100);
    }
  }

  getHealthTrends(): { name: string; data: { timestamp: Date; value: number }[] }[] {
    const trends: { [key: string]: { timestamp: Date; value: number }[] } = {};

    this.healthHistory.forEach(snapshot => {
      snapshot.metrics.forEach(metric => {
        if (!trends[metric.name]) {
          trends[metric.name] = [];
        }
        trends[metric.name].push({
          timestamp: snapshot.timestamp,
          value: metric.value
        });
      });
    });

    return Object.entries(trends).map(([name, data]) => ({ name, data }));
  }

  predictiveAnalysis(metrics: HealthMetric[]): string[] {
    const predictions: string[] = [];

    metrics.forEach(metric => {
      if (metric.name === 'Engine Temperature' && metric.value > 100) {
        predictions.push('Engine may be running hot. Check coolant levels and thermostat.');
      }
      
      if (metric.name === 'Battery Voltage' && metric.value < 12.5) {
        predictions.push('Battery voltage is low. Consider testing charging system.');
      }
    });

    return predictions;
  }
}

export const vehicleHealthService = new VehicleHealthService();

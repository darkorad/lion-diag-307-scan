
export interface PerformanceMetrics {
  accelerationTest: {
    zeroToSixty: number | null;
    quarterMile: number | null;
    maxAcceleration: number;
  };
  fuelEfficiency: {
    instantMPG: number;
    averageMPG: number;
    tripMPG: number;
    fuelRate: number;
  };
  enginePerformance: {
    powerOutput: number;
    torqueEstimate: number;
    efficiency: number;
    loadFactor: number;
  };
}

class PerformanceMetricsService {
  private accelerationData: { timestamp: Date; speed: number }[] = [];
  private fuelData: { timestamp: Date; consumption: number; distance: number }[] = [];
  private isRecordingAcceleration = false;

  startAccelerationTest(): void {
    this.accelerationData = [];
    this.isRecordingAcceleration = true;
    console.log('Started acceleration test');
  }

  recordAccelerationData(speed: number): void {
    if (!this.isRecordingAcceleration) return;

    this.accelerationData.push({
      timestamp: new Date(),
      speed
    });

    // Auto-stop at 100 km/h
    if (speed >= 100) {
      this.stopAccelerationTest();
    }
  }

  stopAccelerationTest(): PerformanceMetrics['accelerationTest'] {
    this.isRecordingAcceleration = false;
    
    const result = this.calculateAccelerationMetrics();
    console.log('Acceleration test completed:', result);
    return result;
  }

  private calculateAccelerationMetrics(): PerformanceMetrics['accelerationTest'] {
    if (this.accelerationData.length < 2) {
      return {
        zeroToSixty: null,
        quarterMile: null,
        maxAcceleration: 0
      };
    }

    const startTime = this.accelerationData[0].timestamp.getTime();
    let zeroToSixty: number | null = null;
    let maxAcceleration = 0;

    // Find 0-60 time
    for (let i = 1; i < this.accelerationData.length; i++) {
      const currentSpeed = this.accelerationData[i].speed;
      const timeElapsed = (this.accelerationData[i].timestamp.getTime() - startTime) / 1000;

      if (currentSpeed >= 60 && zeroToSixty === null) {
        zeroToSixty = timeElapsed;
      }

      // Calculate acceleration (rough estimate)
      if (i > 0) {
        const prevSpeed = this.accelerationData[i - 1].speed;
        const timeDiff = (this.accelerationData[i].timestamp.getTime() - this.accelerationData[i - 1].timestamp.getTime()) / 1000;
        const acceleration = (currentSpeed - prevSpeed) / timeDiff;
        maxAcceleration = Math.max(maxAcceleration, acceleration);
      }
    }

    return {
      zeroToSixty,
      quarterMile: null, // Would need distance data
      maxAcceleration
    };
  }

  calculateFuelEfficiency(
    mafRate: number, 
    speed: number, 
    fuelType: 'gasoline' | 'diesel' = 'diesel'
  ): PerformanceMetrics['fuelEfficiency'] {
    // Air/fuel ratio for diesel is approximately 14.5:1
    const airFuelRatio = fuelType === 'diesel' ? 14.5 : 14.7;
    
    // Convert MAF (g/s) to fuel consumption (L/100km)
    const fuelFlowRate = mafRate / airFuelRatio; // g/s
    const fuelFlowLitersPerHour = (fuelFlowRate * 3600) / 850; // Convert to L/h (diesel density ~850 g/L)
    
    let instantMPG = 0;
    if (speed > 0 && fuelFlowLitersPerHour > 0) {
      const litersPer100km = (fuelFlowLitersPerHour * 100) / speed;
      instantMPG = 235.214583 / litersPer100km; // Convert L/100km to MPG
    }

    return {
      instantMPG,
      averageMPG: this.calculateAverageMPG(),
      tripMPG: this.calculateTripMPG(),
      fuelRate: fuelFlowLitersPerHour
    };
  }

  private calculateAverageMPG(): number {
    // Simplified calculation - would use historical data in practice
    return 45; // Typical for Peugeot 307 HDi
  }

  private calculateTripMPG(): number {
    // Simplified calculation - would use trip data in practice
    return 42;
  }

  calculateEnginePerformance(
    rpm: number, 
    mafRate: number, 
    throttlePosition: number
  ): PerformanceMetrics['enginePerformance'] {
    // Simplified calculations for demonstration
    const maxPower = 80; // kW for Peugeot 307 1.6 HDi
    const powerOutput = (throttlePosition / 100) * maxPower * (rpm / 4000);
    
    const efficiency = this.calculateEngineEfficiency(rpm, mafRate);
    const loadFactor = throttlePosition;
    
    // Torque estimate based on power and RPM
    const torqueEstimate = rpm > 0 ? (powerOutput * 9549) / rpm : 0; // Nm

    return {
      powerOutput: Math.max(0, powerOutput),
      torqueEstimate: Math.max(0, torqueEstimate),
      efficiency,
      loadFactor
    };
  }

  private calculateEngineEfficiency(rpm: number, mafRate: number): number {
    // Simplified efficiency calculation
    // Diesel engines are most efficient around 2000-2500 RPM
    const optimalRPM = 2250;
    const rpmEfficiency = 1 - Math.abs(rpm - optimalRPM) / optimalRPM;
    
    // MAF rate efficiency (lower is generally better for efficiency)
    const mafEfficiency = Math.max(0, 1 - (mafRate / 100));
    
    return Math.max(0, Math.min(1, (rpmEfficiency + mafEfficiency) / 2)) * 100;
  }
}

export const performanceMetricsService = new PerformanceMetricsService();

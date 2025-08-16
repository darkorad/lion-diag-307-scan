
export class HeartbeatManager {
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  startHeartbeat(onSuccess: (latency: number) => void, onFailure: () => void): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(async () => {
      try {
        const startTime = Date.now();
        await this.testConnection();
        const latency = Date.now() - startTime;
        
        onSuccess(latency);
        this.lastHeartbeat = Date.now();
        
      } catch (error) {
        console.warn('Heartbeat failed:', error);
        onFailure();
        
        if (Date.now() - this.lastHeartbeat > 30000) {
          console.error('Connection lost - no heartbeat for 30 seconds');
          this.stopHeartbeat();
        }
      }
    }, 10000);
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private async testConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.bluetoothSerial) {
        reject(new Error('Bluetooth not available'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Test connection timeout'));
      }, 5000);

      window.bluetoothSerial.write('ATI\r', 
        () => {
          setTimeout(() => {
            window.bluetoothSerial.read(
              (data: string) => {
                clearTimeout(timeout);
                if (data && data.length > 0) {
                  resolve();
                } else {
                  reject(new Error('No response'));
                }
              },
              () => {
                clearTimeout(timeout);
                reject(new Error('Read failed'));
              }
            );
          }, 100);
        },
        () => {
          clearTimeout(timeout);
          reject(new Error('Write failed'));
        }
      );
    });
  }
}

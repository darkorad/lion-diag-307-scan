// src/services/connection-errors.ts

export class ConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConnectionError';
  }
}

export class BluetoothNotAvailableError extends ConnectionError {
  constructor() {
    super('Bluetooth is not available on this device.');
    this.name = 'BluetoothNotAvailableError';
  }
}

export class DeviceNotFoundError extends ConnectionError {
  constructor(deviceId: string) {
    super(`Device with ID ${deviceId} not found.`);
    this.name = 'DeviceNotFoundError';
  }
}

export class ConnectionFailedError extends ConnectionError {
  constructor(deviceName: string, reason: string) {
    super(`Failed to connect to ${deviceName}: ${reason}`);
    this.name = 'ConnectionFailedError';
  }
}

export class DisconnectFailedError extends ConnectionError {
  constructor(reason: string) {
    super(`Failed to disconnect: ${reason}`);
    this.name = 'DisconnectFailedError';
  }
}

export class CommandExecutionError extends ConnectionError {
  constructor(command: string, reason: string) {
    super(`Failed to execute command "${command}": ${reason}`);
    this.name = 'CommandExecutionError';
  }
}

export class NoDataReceivedError extends ConnectionError {
  constructor() {
    super('No data received from the device.');
    this.name = 'NoDataReceivedError';
  }
}

export const handleError = (error: unknown): ConnectionError => {
  if (error instanceof ConnectionError) {
    return error;
  }

  if (error instanceof Error) {
    return new ConnectionError(error.message);
  }

  return new ConnectionError('An unknown error occurred.');
};

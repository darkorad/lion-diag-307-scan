
import React from 'react';

const ConnectionTips: React.FC = () => {
  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p>• Make sure your ELM327 adapter is plugged into the OBD2 port</p>
      <p>• Turn on your vehicle's ignition</p>
      <p>• Enable Bluetooth on your device</p>
      <p>• Put ELM327 in pairing mode if required</p>
    </div>
  );
};

export default ConnectionTips;

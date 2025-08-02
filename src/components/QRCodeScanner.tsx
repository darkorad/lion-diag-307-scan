import React from 'react';
import QrScanner from 'react-qr-scanner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string | null) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const handleScan = (data: any) => {
    if (data) {
      onScan(data.text);
      onClose();
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    onScan(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at the QR code on the child's device.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
            constraints={{
              video: { facingMode: 'environment' }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;

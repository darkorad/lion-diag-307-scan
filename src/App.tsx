
import React, { useState } from 'react';
import './App.css';
import BluetoothMainScreen from './components/BluetoothMainScreen';
import { Toaster } from 'sonner';

function App() {
  const [currentScreen] = useState('bluetooth');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-4">
        {currentScreen === 'bluetooth' && <BluetoothMainScreen />}
      </main>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;

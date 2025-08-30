import React from 'react'
import { Toaster } from 'sonner'

import '@ionic/core/css/core.css';
import '@ionic/core/css/ionic.bundle.css';

import './App.css'
import './index.css'
import BluetoothMainScreen from '@/components/BluetoothMainScreen';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRoute = urlParams.get('route') || '/';

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <BluetoothMainScreen />
    </div>
  );
}

export default App;


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent crashes with proper error boundaries
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found - creating fallback");
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  document.body.appendChild(fallbackRoot);
}

const root = createRoot(rootElement || document.getElementById('root')!);

// Wrap app in error boundary for mobile stability
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>App Loading Error</h1>
      <p>Please restart the application</p>
    </div>
  );
}

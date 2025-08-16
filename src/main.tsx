
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Enhanced error handling for mobile
const handleGlobalError = (error: ErrorEvent) => {
  console.error('Global error caught:', error);
  // Prevent the error from crashing the app
  return true;
};

const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent the rejection from crashing the app
  event.preventDefault();
};

// Set up global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Ensure root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found - creating fallback");
  const fallbackRoot = document.createElement('div');
  fallbackRoot.id = 'root';
  fallbackRoot.style.width = '100%';
  fallbackRoot.style.height = '100vh';
  document.body.appendChild(fallbackRoot);
}

const root = createRoot(rootElement || document.getElementById('root')!);

// Render app with comprehensive error handling
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback UI for critical render failures
  root.render(
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'system-ui, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{ color: '#dc3545', marginBottom: '16px' }}>App Loading Error</h1>
      <p style={{ color: '#6c757d', marginBottom: '24px' }}>
        The OBD2 Diagnostic Tool failed to start properly.
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 24px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Restart Application
      </button>
    </div>
  );
}


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

// Set up global error handlers before anything else
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Simple startup function with error handling
const startApp = () => {
  try {
    console.log('Starting OBD2 Diagnostic App...');
    
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
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Critical startup error:', error);
    
    // Create emergency fallback UI
    const emergency = document.createElement('div');
    emergency.innerHTML = `
      <div style="
        padding: 20px; 
        text-align: center; 
        font-family: system-ui, sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #f8f9fa;
      ">
        <h1 style="color: #dc3545; margin-bottom: 16px;">Startup Error</h1>
        <p style="color: #6c757d; margin-bottom: 24px;">
          The OBD2 Diagnostic Tool failed to start.
        </p>
        <button 
          onclick="window.location.reload()"
          style="
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
          "
        >
          Restart Application
        </button>
      </div>
    `;
    document.body.appendChild(emergency);
  }
};

// Wait for DOM to be ready before starting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}


import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Enhanced error handling for mobile with better crash prevention
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

// Set up global error handlers immediately
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Mobile-safe startup function
const startApp = () => {
  try {
    console.log('Starting OBD2 Diagnostic App for mobile...');
    
    // Ensure root element exists
    let rootElement = document.getElementById("root");
    if (!rootElement) {
      console.warn("Root element not found - creating fallback");
      const fallbackRoot = document.createElement('div');
      fallbackRoot.id = 'root';
      fallbackRoot.style.width = '100%';
      fallbackRoot.style.height = '100vh';
      fallbackRoot.style.margin = '0';
      fallbackRoot.style.padding = '0';
      document.body.appendChild(fallbackRoot);
      rootElement = fallbackRoot;
    }

    const root = createRoot(rootElement);

    // Render app with comprehensive mobile error handling
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log('App rendered successfully for mobile');
  } catch (error) {
    console.error('Critical mobile startup error:', error);
    
    // Create mobile-friendly emergency fallback UI
    const emergency = document.createElement('div');
    emergency.innerHTML = `
      <div style="
        padding: 20px; 
        text-align: center; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background-color: #f8f9fa;
        margin: 0;
        box-sizing: border-box;
      ">
        <div style="max-width: 300px; margin: 0 auto;">
          <h1 style="color: #dc3545; margin-bottom: 16px; font-size: 18px;">OBD2 App Error</h1>
          <p style="color: #6c757d; margin-bottom: 24px; font-size: 14px;">
            The diagnostic app failed to start. This may be due to missing permissions or device compatibility.
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
              width: 100%;
            "
          >
            Restart App
          </button>
          <p style="margin-top: 16px; font-size: 12px; color: #999;">
            If this problem persists, please check your device permissions and try again.
          </p>
        </div>
      </div>
    `;
    document.body.innerHTML = '';
    document.body.appendChild(emergency);
  }
};

import { unifiedBluetoothService } from './services/UnifiedBluetoothService';

// Wait for the deviceready event to ensure all plugins are loaded
const initializeApp = () => {
  console.log('Starting app initialization...');
  if (typeof window !== 'undefined' && (window.cordova || window.Capacitor)) {
    console.log('Native platform detected, waiting for Capacitor...');
    document.addEventListener('deviceready', () => {
      unifiedBluetoothService.initialize();
      startApp();
    }, false);
  } else {
    console.log('Web platform detected, starting app immediately.');
    unifiedBluetoothService.initialize();
    startApp();
  }
};

initializeApp();

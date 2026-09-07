import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import './i18n/i18n';

// Suppress benign Firestore WebSocket/gRPC idle stream warnings
const originalWarn = console.warn;
const originalError = console.error;

console.warn = function (...args) {
  const msg = args.join(' ');
  if (msg.includes('Disconnecting idle stream') || msg.includes('Timed out waiting for new targets')) {
    return;
  }
  originalWarn.apply(console, args);
};

console.error = function (...args) {
  const msg = args.join(' ');
  if (msg.includes('Disconnecting idle stream') || msg.includes('Timed out waiting for new targets')) {
    return;
  }
  originalError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);


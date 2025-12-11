import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initWebVitals } from './utils/webVitals'

initWebVitals();

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered successfully:', registration.scope);
        console.log('[SW] Registration state:', registration.active ? 'active' : registration.installing ? 'installing' : 'waiting');
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW] New service worker found, installing...');
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              console.log('[SW] Service Worker state changed to:', newWorker.state);
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New service worker installed, will activate on next page load');
              }
            });
          }
        });
        
        if (registration.waiting) {
          console.log('[SW] Service worker is waiting, sending SKIP_WAITING message');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      })
      .catch((error) => {
        console.error('[SW] Service Worker registration failed:', error);
      });
  });
}
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // Assurez-vous que le chemin d'importation est correct
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistrement du service worker pour activer le PWA
serviceWorkerRegistration.register(); // Utilisation correcte basée sur votre importation

// Si vous souhaitez commencer à mesurer les performances de votre application
reportWebVitals();

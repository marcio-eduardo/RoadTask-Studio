import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { GanttProvider } from './context/GanttContext';
import { GuidedAccessProvider } from './context/GuidedAccessContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GanttProvider>
      <GuidedAccessProvider>
        <App />
      </GuidedAccessProvider>
    </GanttProvider>
  </React.StrictMode>
);

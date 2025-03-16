import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BibleContextProvider } from './contexts/BibleContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BibleContextProvider>
      <App />
    </BibleContextProvider>
  </React.StrictMode>,
);
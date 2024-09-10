import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
// import { DebugSpectrum } from './components/DebugSpectrum.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <DebugSpectrum /> */}
    <App />
  </StrictMode>
);

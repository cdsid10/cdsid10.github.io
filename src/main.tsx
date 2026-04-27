import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// [GLOBAL] Prevent the browser from restoring scroll position on hard reload.
// Our ScrollToTop component handles scroll resets on route changes instead.
window.history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

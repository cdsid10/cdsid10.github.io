import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';
import { applyFontMode } from './lib/fontMode';

applyFontMode(); // hidden ?fontMode=previous|current typography switch (see src/lib/fontMode.ts)

// [GLOBAL] Prevent the browser from restoring scroll position on hard reload.
// Our ScrollToTop component handles scroll resets on route changes instead.
window.history.scrollRestoration = 'manual';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

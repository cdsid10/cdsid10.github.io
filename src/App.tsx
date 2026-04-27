import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import OtherWorks from './pages/OtherWorks';
import ProjectOverview from './pages/ProjectOverview';
import About from './pages/About';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import MobileWorks from './pages/MobileWorks';
import { AnimatePresence } from 'motion/react';

/**
 * [GLOBAL] ScrollToTop
 * Resets scroll position on every route change.
 * - Scrolls #scroll-container (used by all non-home pages and desktop home) to top.
 * - Dispatches mobileScrollToTop for MobileHome's standalone scroll container.
 * Works in concert with window.history.scrollRestoration = 'manual' (set in main.tsx)
 * to prevent browser from restoring old scroll positions on hard reload.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset the main Layout scroll container
    const scrollEl = document.getElementById('scroll-container');
    if (scrollEl) {
      scrollEl.scrollTo({ top: 0, left: 0 });
    }

    // Signal MobileHome to snap back to first project
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('mobileScrollToTop'));
    }
  }, [pathname]);

  return null;
}

function AnimatedRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="project/:id" element={<ProjectOverview />} />
          <Route path="other-works" element={<OtherWorks />} />
          <Route path="about" element={<About />} />
          <Route path="resume" element={<Resume />} />
          <Route path="contact" element={<Contact />} />
          <Route path="mobile-works" element={<MobileWorks />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

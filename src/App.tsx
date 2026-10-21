import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import OtherWorks from './pages/OtherWorks';
import ProjectOverview from './pages/ProjectOverview';
import MobileWorks from './pages/MobileWorks';
import NotFound from './pages/NotFound';
import { MotionConfig } from 'motion/react';

function AnimatedRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="project/:id" element={<ProjectOverview />} />
          <Route path="other-works" element={<OtherWorks />} />
          <Route path="mobile-works" element={<MobileWorks />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    // [GLOBAL] reducedMotion="user": when the visitor prefers reduced motion, Motion keeps opacity and
    // colour changes but drops transform/layout movement (parallax, slides, scale).
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </MotionConfig>
  );
}

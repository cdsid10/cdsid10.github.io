import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import OtherWorks from './pages/OtherWorks';
import ProjectOverview from './pages/ProjectOverview';
import About from './pages/About';
import Resume from './pages/Resume';
import Contact from './pages/Contact';
import { AnimatePresence } from 'motion/react';

function AnimatedRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="project/:id" element={<ProjectOverview />} />
        <Route path="other-works" element={<OtherWorks />} />
        <Route path="about" element={<About />} />
        <Route path="resume" element={<Resume />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

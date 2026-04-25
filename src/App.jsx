import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BiddingPage from './pages/BiddingPage';
import RevealPage from './pages/RevealPage';
import HowItWorksPage from './pages/HowItWorksPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#050507', minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/auction/:id" element={<BiddingPage />} />
          <Route path="/auction/:id/reveal" element={<RevealPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

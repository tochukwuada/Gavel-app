import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from './components/Toast';
import HomePage from './pages/HomePage';
import BiddingPage from './pages/BiddingPage';
import RevealPage from './pages/RevealPage';
import HowItWorksPage from './pages/HowItWorksPage';
import WatchlistPage from './pages/WatchlistPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import DocsPage from './pages/DocsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import VerifyPage from './pages/VerifyPage';
import AboutPage from './pages/AboutPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ background: '#050507', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/"                    element={<HomePage />} />
            <Route path="/how-it-works"        element={<HowItWorksPage />} />
            <Route path="/watchlist"           element={<WatchlistPage />} />
            <Route path="/admin"               element={<AdminPage />} />
            <Route path="/docs"                element={<DocsPage />} />
            <Route path="/terms"               element={<TermsPage />} />
            <Route path="/privacy"             element={<PrivacyPage />} />
            <Route path="/faq"                 element={<FAQPage />} />
            <Route path="/verify"              element={<VerifyPage />} />
            <Route path="/about"               element={<AboutPage />} />
            <Route path="/auction/:id"         element={<BiddingPage />} />
            <Route path="/auction/:id/reveal"  element={<RevealPage />} />
            <Route path="*"                    element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

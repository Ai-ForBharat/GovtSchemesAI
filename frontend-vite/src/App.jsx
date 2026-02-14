import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import SchemeExplorer from './components/SchemeExplorer';
import UserForm from './components/UserForm';
import Loading from './components/Loading';
import Results from './components/Results';
import ChatBot from './components/ChatBot';
import FAQ from './components/FAQ';
import About from './components/About';
import AboutPage from './components/AboutPage';
import FAQPage from './components/FAQPage';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';
import { FaCommentDots, FaTimes } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const { currentView } = useApp();
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="app">
      <Navbar />

      <div className="app-content">
        {currentView === 'home' && (
          <>
            <Hero />
            <HowItWorks />
            <SchemeExplorer />
            <FAQ />
            <About />
          </>
        )}

        {currentView === 'form' && <UserForm />}
        {currentView === 'loading' && <Loading />}
        {currentView === 'results' && <Results />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'faq' && <FAQPage />}
        {currentView === 'search' && <SearchResults />}
      </div>

      {/* Floating Chatbot */}
      <motion.button
        style={styles.chatFab}
        onClick={() => setShowChat(!showChat)}
        title="AI Assistant"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {showChat ? <FaTimes /> : <FaCommentDots />}
      </motion.button>

      <AnimatePresence>
        {showChat && <ChatBot onClose={() => setShowChat(false)} />}
      </AnimatePresence>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

const styles = {
  chatFab: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 8px 30px rgba(249,115,22,0.4)',
    zIndex: 2000,
    fontFamily: 'Inter, sans-serif',
  },
};

export default App;
import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Categories from './components/Categories';
import CentralSchemes from './components/CentralSchemes';
import StateSchemes from './components/StateSchemes';
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
            <UserForm />
            <Categories />
            <CentralSchemes />
            <StateSchemes />
            <FAQ />
            <About />
          </>
        )}

        {currentView === 'loading' && <Loading />}
        {currentView === 'results' && <Results />}
        {currentView === 'about' && <AboutPage />}
        {currentView === 'faq' && <FAQPage />}
        {currentView === 'search' && <SearchResults />}
      </div>

      {/* Floating Chatbot */}
      <button
        className="chat-fab"
        onClick={() => setShowChat(!showChat)}
        title="AI Assistant"
      >
        {showChat ? '✕' : '🤖'}
        {!showChat && <span className="fab-badge">AI</span>}
      </button>

      {showChat && <ChatBot onClose={() => setShowChat(false)} />}

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
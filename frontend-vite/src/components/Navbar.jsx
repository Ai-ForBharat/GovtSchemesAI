import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getAllSchemes } from '../api/api';
import { toast } from 'react-toastify';
import {
  FaGlobe, FaSearch, FaBars, FaTimes,
  FaHome, FaThList, FaInfoCircle
} from 'react-icons/fa';
import logo from '../assets/logo.png'; // ← Import the logo

const Navbar = () => {
  const {
    language, setLanguage, LANGUAGES, resetApp,
    setCurrentView, setSearchQuery, setSearchResults,
    setActiveExplorerTab
  } = useApp();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    try {
      const data = await getAllSchemes();
      const filtered = data.schemes.filter(s =>
        s.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        s.description.toLowerCase().includes(searchInput.toLowerCase()) ||
        s.category.toLowerCase().includes(searchInput.toLowerCase())
      );

      setSearchQuery(searchInput);
      setSearchResults(filtered);
      setCurrentView('search');
      setMobileMenu(false);
      setSearchInput('');
    } catch {
      toast.error('Search failed. Is backend running?');
    }
  };

  const scrollToExplorer = (tab) => {
    setCurrentView('home');
    setActiveExplorerTab(tab);
    setMobileMenu(false);

    setTimeout(() => {
      document.getElementById('scheme-explorer')
        ?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const navLinks = [
    {
      label: 'Home',
      icon: <FaHome />,
      action: () => { resetApp(); setMobileMenu(false); },
    },
    {
      label: 'Categories',
      icon: <FaThList />,
      action: () => scrollToExplorer('categories'),
    },
    {
      label: 'About',
      icon: <FaInfoCircle />,
      action: () => {
        setCurrentView('about');
        setMobileMenu(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];

  return (
    <motion.nav
      style={{
        ...styles.navbar,
        ...(scrolled ? styles.navbarScrolled : {}),
      }}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div style={styles.container}>

        {/* ─── Brand ─── */}
        <motion.div
          style={styles.brand}
          onClick={() => { resetApp(); setMobileMenu(false); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* ─── Logo Image ─── */}
          <img
            src={logo}
            alt="Saarthi AI Logo"
            style={styles.logo}
          />
          <h1 style={styles.title}>
            <span style={styles.titleOrange}>Saarthi</span>{' '}
            <span style={styles.titleDark}>AI</span>
          </h1>
        </motion.div>

        {/* ─── Desktop Search ─── */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <FaSearch style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search schemes..."
          />
          {searchInput && (
            <motion.button
              type="button"
              onClick={() => setSearchInput('')}
              style={styles.clearBtn}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.8 }}
            >
              <FaTimes />
            </motion.button>
          )}
        </form>

        {/* ─── Desktop Nav Links ─── */}
        <div style={styles.navLinks}>
          {navLinks.map(link => (
            <motion.button
              key={link.label}
              onClick={link.action}
              style={styles.navLink}
              whileHover={{ color: '#f97316' }}
              whileTap={{ scale: 0.95 }}
            >
              {link.icon}
              <span>{link.label}</span>
            </motion.button>
          ))}
        </div>

        {/* ─── Language Selector ─── */}
        <div style={styles.langWrapper}>
          <FaGlobe style={styles.langIcon} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.langSelect}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code} style={styles.langOption}>
                {l.flag} {l.native}
              </option>
            ))}
          </select>
        </div>

        {/* ─── Mobile Menu Button ─── */}
        <motion.button
          style={styles.menuBtn}
          onClick={() => setMobileMenu(!mobileMenu)}
          whileTap={{ scale: 0.9 }}
        >
          {mobileMenu ? <FaTimes /> : <FaBars />}
        </motion.button>

      </div>

      {/* ─── Mobile Menu ─── */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            style={styles.mobileMenu}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSearch} style={styles.mobileSearchForm}>
              <FaSearch style={styles.mobileSearchIcon} />
              <input
                style={styles.mobileSearchInput}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search schemes..."
              />
            </form>

            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                onClick={link.action}
                style={styles.mobileLink}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.98 }}
              >
                <span style={styles.mobileLinkIcon}>{link.icon}</span>
                {link.label}
              </motion.button>
            ))}

            <div style={styles.mobileLangRow}>
              <FaGlobe style={{ color: '#6b7280', fontSize: '14px' }} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={styles.mobileLangSelect}
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code} style={styles.langOption}>
                    {l.flag} {l.native}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    background: '#ffffff',
    borderBottom: '1px solid transparent',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
  },
  navbarScrolled: {
    background: 'rgba(255, 255, 255, 0.97)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },

  container: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#1a1a1a',
    textDecoration: 'none',
    flexShrink: 0,
    gap: '10px', // ← Added gap between logo and text
  },

  // ─── Logo Style ───
  logo: {
    width: '36px',
    height: '36px',
    objectFit: 'contain',
    borderRadius: '8px',
  },

  title: {
    fontSize: '20px',
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.3px',
    lineHeight: 1,
  },
  titleOrange: {
    color: '#f97316',
  },
  titleDark: {
    color: '#1a1a1a',
  },

  searchForm: {
    flex: 1,
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '0 14px',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
  },
  searchIcon: {
    color: '#9ca3af',
    fontSize: '13px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#1a1a1a',
    padding: '10px 10px',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
  },
  clearBtn: {
    background: '#e5e7eb',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    flexShrink: 0,
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  navLink: {
    background: 'transparent',
    border: 'none',
    color: '#4b5563',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    transition: 'all 0.2s ease',
    fontFamily: 'Inter, sans-serif',
    whiteSpace: 'nowrap',
  },

  langWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#4b5563',
    padding: '6px 12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    flexShrink: 0,
  },
  langIcon: {
    fontSize: '13px',
    color: '#6b7280',
  },
  langSelect: {
    background: 'transparent',
    border: 'none',
    color: '#1a1a1a',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    maxWidth: '100px',
  },
  langOption: {
    background: '#ffffff',
    color: '#1a1a1a',
  },

  menuBtn: {
    display: 'none',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#4b5563',
    fontSize: '18px',
    cursor: 'pointer',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  mobileMenu: {
    padding: '12px 20px 20px',
    background: '#ffffff',
    borderTop: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  mobileSearchForm: {
    display: 'flex',
    alignItems: 'center',
    background: '#f9fafb',
    borderRadius: '12px',
    padding: '0 14px',
    border: '1px solid #e5e7eb',
    marginBottom: '12px',
  },
  mobileSearchIcon: {
    color: '#9ca3af',
    fontSize: '13px',
    flexShrink: 0,
  },
  mobileSearchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#1a1a1a',
    padding: '12px 10px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  mobileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    color: '#1a1a1a',
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '8px',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s ease',
  },
  mobileLinkIcon: {
    color: '#f97316',
    fontSize: '16px',
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileLangRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    marginTop: '4px',
  },
  mobileLangSelect: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#1a1a1a',
    outline: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
  },
};

export default Navbar;
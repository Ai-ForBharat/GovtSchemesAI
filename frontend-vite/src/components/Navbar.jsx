import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAllSchemes } from '../api/api';
import { toast } from 'react-toastify';
import {
  FaGlobe, FaSearch, FaBars, FaTimes,
  FaHome, FaThList, FaLandmark,
  FaMapMarkedAlt, FaQuestionCircle,
  FaInfoCircle, FaMoon, FaSun
} from 'react-icons/fa';

const Navbar = () => {
  const {
    language, setLanguage, LANGUAGES, resetApp,
    setCurrentView, setSearchQuery, setSearchResults,
    setActiveExplorerTab, darkMode, toggleDarkMode
  } = useApp();

  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState('');

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
    { label: 'Home', icon: <FaHome />, action: () => { resetApp(); setMobileMenu(false); } },
    { label: 'Categories', icon: <FaThList />, action: () => scrollToExplorer('categories') },
    { label: 'Central', icon: <FaLandmark />, action: () => scrollToExplorer('central') },
    { label: 'States', icon: <FaMapMarkedAlt />, action: () => scrollToExplorer('states') },
    { label: 'FAQ', icon: <FaQuestionCircle />, action: () => { setCurrentView('faq'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { label: 'About', icon: <FaInfoCircle />, action: () => { setCurrentView('about'); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>

        {/* Logo */}
        <div
          style={styles.brand}
          onClick={() => { resetApp(); setMobileMenu(false); }}
        >
          <span style={{ fontSize: 26 }}>🏛️</span>
          <h1 style={styles.title}>GovScheme</h1>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <FaSearch style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search schemes..."
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              style={styles.clearBtn}
            >
              <FaTimes />
            </button>
          )}
        </form>

        {/* Desktop Links */}
        <div style={styles.navLinks}>
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={link.action}
              style={styles.navLink}
            >
              {link.icon}
              <span>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Dark Mode */}
        <button
          onClick={toggleDarkMode}
          style={styles.iconBtn}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Language */}
        <div style={styles.langWrapper}>
          <FaGlobe style={{ fontSize: 14 }} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={styles.langSelect}
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.native}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Toggle */}
        <button
          style={styles.menuBtn}
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          {mobileMenu ? <FaTimes /> : <FaBars />}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div style={styles.mobileMenu}>
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={link.action}
              style={styles.mobileLink}
            >
              {link.icon} {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

const styles = {
navbar: {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  background: '#081426',  // dark navy shade
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0,0,0,0.4)' // subtle depth
},


  container: {
    maxWidth: 1300,
    margin: '0 auto',
    padding: '18px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 20
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    color: 'white'
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: 'white'
  },

  searchForm: {
    flex: 1,
    maxWidth: 450,
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: 30,
    padding: '8px 18px',
    border: '1px solid rgba(255,255,255,0.15)'
  },

  searchIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14
  },

  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'white',
    padding: '8px 12px',
    fontSize: 14
  },

  clearBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer'
  },

  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: 14
  },

  navLink: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: '0.2s'
  },

  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 18,
    cursor: 'pointer'
  },

  langWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'white'
  },

  langSelect: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    outline: 'none',
    cursor: 'pointer'
  },

  menuBtn: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: 22,
    cursor: 'pointer'
  },

  mobileMenu: {
    padding: 20,
    background: 'rgba(0,0,0,0.8)'
  },

  mobileLink: {
    display: 'block',
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'white',
    padding: '12px 0',
    textAlign: 'left',
    fontSize: 16,
    cursor: 'pointer'
  }
};

export default Navbar;

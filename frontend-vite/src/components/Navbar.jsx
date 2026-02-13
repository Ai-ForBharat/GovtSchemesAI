import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAllSchemes } from '../api/api';
import { toast } from 'react-toastify';
import { FaGlobe, FaSearch, FaBars, FaTimes, FaHome, FaThList, FaLandmark, FaMapMarkedAlt, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

const Navbar = () => {
  const { language, setLanguage, LANGUAGES, resetApp, setCurrentView, setSearchQuery, setSearchResults } = useApp();
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
    } catch (err) {
      toast.error('Search failed. Is backend running?');
    }
  };

  const navLinks = [
    { label: 'Home', icon: <FaHome />, action: () => { resetApp(); setMobileMenu(false); } },
    { label: 'Categories', icon: <FaThList />, action: () => { setCurrentView('home'); setTimeout(() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }), 100); setMobileMenu(false); } },
    { label: 'Central', icon: <FaLandmark />, action: () => { setCurrentView('home'); setTimeout(() => document.getElementById('central')?.scrollIntoView({ behavior: 'smooth' }), 100); setMobileMenu(false); } },
    { label: 'States', icon: <FaMapMarkedAlt />, action: () => { setCurrentView('home'); setTimeout(() => document.getElementById('states')?.scrollIntoView({ behavior: 'smooth' }), 100); setMobileMenu(false); } },
    { label: 'FAQ', icon: <FaQuestionCircle />, action: () => { setCurrentView('faq'); setMobileMenu(false); } },
    { label: 'About', icon: <FaInfoCircle />, action: () => { setCurrentView('about'); setMobileMenu(false); } },
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Brand */}
        <div style={styles.brand} onClick={resetApp}>
          <span style={{ fontSize: '28px' }}>🏛️</span>
          <h1 style={styles.title}>GovScheme<span style={styles.aiBadge}>AI</span></h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <FaSearch style={styles.searchIcon} />
          <input
            style={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search schemes..."
          />
        </form>

        {/* Desktop Nav Links */}
        <div style={styles.navLinks}>
          {navLinks.map(link => (
            <button key={link.label} onClick={link.action} style={styles.navLink}>
              {link.icon} <span>{link.label}</span>
            </button>
          ))}
        </div>

        {/* Language */}
        <div style={styles.langWrapper}>
          <FaGlobe style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }} />
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.langSelect}>
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.flag} {l.native}</option>
            ))}
          </select>
        </div>

        {/* Mobile Toggle */}
        <button style={styles.menuBtn} onClick={() => setMobileMenu(!mobileMenu)}>
          {mobileMenu ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div style={styles.mobileMenu}>
          <form onSubmit={handleSearch} style={{ ...styles.searchForm, width: '100%', marginBottom: '12px' }}>
            <FaSearch style={styles.searchIcon} />
            <input style={styles.searchInput} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search schemes..." />
          </form>
          {navLinks.map(link => (
            <button key={link.label} onClick={link.action} style={styles.mobileLink}>
              {link.icon} {link.label}
            </button>
          ))}
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ ...styles.langSelect, width: '100%', marginTop: '8px', padding: '10px', background: 'rgba(255,255,255,0.1)' }}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.native}</option>)}
          </select>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    background: 'linear-gradient(135deg, #1e3a8a, #1e40af, #3730a3)',
    position: 'sticky', top: 0, zIndex: 1000,
    boxShadow: '0 4px 30px rgba(0,0,0,0.2)',
  },
  container: {
    maxWidth: '1300px', margin: '0 auto', padding: '10px 20px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexShrink: 0,
  },
  title: {
    fontSize: '20px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px',
  },
  aiBadge: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    padding: '1px 8px', borderRadius: '6px', fontSize: '12px',
    fontWeight: 900, marginLeft: '4px',
  },
  searchForm: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.12)',
    borderRadius: '10px', padding: '0 12px',
    border: '1px solid rgba(255,255,255,0.15)',
    flex: 1, maxWidth: '320px',
  },
  searchIcon: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', flexShrink: 0 },
  searchInput: {
    background: 'transparent', border: 'none', color: 'white',
    padding: '10px 10px', fontSize: '13px', width: '100%',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  },
  navLinks: {
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  navLink: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    padding: '8px 10px', borderRadius: '8px',
    display: 'flex', alignItems: 'center', gap: '4px',
    transition: 'all 0.2s', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
  },
  langWrapper: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.1)', padding: '6px 10px',
    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
  },
  langSelect: {
    background: 'transparent', border: 'none', color: 'white',
    fontSize: '12px', fontWeight: 500, cursor: 'pointer',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  },
  menuBtn: {
    display: 'none', background: 'none', border: 'none',
    color: 'white', fontSize: '20px', cursor: 'pointer',
  },
  mobileMenu: {
    padding: '12px 20px 16px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '12px', background: 'none',
    border: 'none', color: 'white', fontSize: '14px',
    fontWeight: 500, cursor: 'pointer', borderRadius: '8px',
    fontFamily: 'Inter, sans-serif', textAlign: 'left',
  },
};

export default Navbar;
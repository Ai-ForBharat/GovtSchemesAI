import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  FaExternalLinkAlt
} from 'react-icons/fa';

const Footer = () => {
  const { setCurrentView } = useApp();

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: 'About Us', action: () => navigateTo('about') },
    { label: 'FAQs', action: () => navigateTo('faq') },
    { label: 'Find Schemes', action: () => navigateTo('form') },
    { label: 'Home', action: () => navigateTo('home') },
    { label: 'Disclaimer', action: () => {} },
    { label: 'Terms & Conditions', action: () => {} },
    { label: 'Privacy Policy', action: () => {} },
    { label: 'Accessibility Statement', action: () => {} },
  ];

  const govLinks = [
    { label: 'Digital India', url: 'https://www.digitalindia.gov.in/' },
    { label: 'DigiLocker', url: 'https://www.digilocker.gov.in/' },
    { label: 'UMANG', url: 'https://web.umang.gov.in/' },
    { label: 'India.gov.in', url: 'https://www.india.gov.in/' },
    { label: 'data.gov.in', url: 'https://data.gov.in/' },
    { label: 'MyGov.in', url: 'https://www.mygov.in/' },
    { label: 'PM India', url: 'https://www.pmindia.gov.in/' },
    { label: 'National Portal', url: 'https://services.india.gov.in/' },
  ];

  const schemeLinks = [
    { label: 'PM Awas Yojana', url: 'https://pmaymis.gov.in/' },
    { label: 'PM Kisan', url: 'https://pmkisan.gov.in/' },
    { label: 'Ayushman Bharat', url: 'https://pmjay.gov.in/' },
    { label: 'PM Mudra Yojana', url: 'https://www.mudra.org.in/' },
    { label: 'Skill India', url: 'https://www.skillindia.gov.in/' },
    { label: 'Jan Dhan Yojana', url: 'https://pmjdy.gov.in/' },
  ];

  return (
    <footer style={styles.footer}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.container}>

        {/* Column 1 — Brand */}
        <div style={styles.column}>
          <div style={styles.brandRow}>
            <h2 style={styles.brand}>
              <span style={styles.brandOrange}>Saarthi</span> AI
            </h2>
          </div>

          <div style={styles.govInfo}>
            <p style={styles.text}>
              Empowering every Indian citizen to access government welfare schemes
            </p>
          </div>
        </div>

        {/* Column 2 — Quick Links */}
        <div style={styles.column}>
          <h3 style={styles.heading}>
            <span style={styles.headingDot} /> Quick Links
          </h3>
          <ul style={styles.list}>
            {quickLinks.map((link, i) => (
              <motion.li
                key={i}
                style={styles.listItem}
                whileHover={{ x: 4, color: '#f97316' }}
                onClick={link.action}
              >
                <span style={styles.listArrow}>›</span>
                {link.label}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Government Links */}
        <div style={styles.column}>
          <h3 style={styles.heading}>
            <span style={{ ...styles.headingDot, background: '#3b82f6' }} /> Government Portals
          </h3>
          <ul style={styles.list}>
            {govLinks.map((link, i) => (
              <motion.li
                key={i}
                style={styles.listItem}
                whileHover={{ x: 4, color: '#3b82f6' }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.externalLink}
                >
                  <span style={styles.listArrow}>›</span>
                  {link.label}
                  <FaExternalLinkAlt style={styles.externalIcon} />
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Column 4 — Popular Schemes */}
        <div style={styles.column}>
          <h3 style={styles.heading}>
            <span style={{ ...styles.headingDot, background: '#8b5cf6' }} /> Popular Schemes
          </h3>
          <ul style={styles.list}>
            {schemeLinks.map((link, i) => (
              <motion.li
                key={i}
                style={styles.listItem}
                whileHover={{ x: 4, color: '#8b5cf6' }}
              >
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.externalLink}
                >
                  <span style={styles.listArrow}>›</span>
                  {link.label}
                  <FaExternalLinkAlt style={styles.externalIcon} />
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#ffffff',
    color: '#1a1a1a',
    marginTop: 'auto',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
    borderTop: '1px solid #e5e7eb',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'clamp(30px, 4vw, 50px)',
    padding: 'clamp(50px, 6vw, 70px) 20px',
    position: 'relative',
    zIndex: 1,
  },

  column: {},

  brandRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  brand: {
    fontSize: '22px',
    fontWeight: 800,
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-0.3px',
  },
  brandOrange: { color: '#f97316' },

  govInfo: {
    padding: '12px 14px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },

  heading: {
    fontSize: '15px',
    fontWeight: 700,
    marginBottom: '16px',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  headingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f97316',
    flexShrink: 0,
  },

  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 0',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listArrow: {
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  externalLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 500,
    width: '100%',
  },
  externalIcon: {
    fontSize: '9px',
    color: '#d1d5db',
    marginLeft: 'auto',
  },

  text: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: 0,
  },
};

export default Footer;
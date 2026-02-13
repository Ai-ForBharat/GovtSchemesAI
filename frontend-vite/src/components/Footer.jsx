import React from 'react';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.content}>
        <p style={styles.main}>
          🏛️ GovScheme AI — Made with{' '}
          <FaHeart style={{ color: '#ef4444', verticalAlign: 'middle' }} />{' '}
          for every Indian citizen
        </p>
        <p style={styles.sub}>
          This is an informational tool. Please verify details on official government websites before applying.
        </p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
    padding: 'clamp(20px, 4vw, 30px) clamp(16px, 4vw, 24px)',
    textAlign: 'center',
    marginTop: 'auto',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  main: {
    color: 'white',
    fontSize: 'clamp(13px, 3vw, 15px)',
    fontWeight: 600,
    marginBottom: '6px',
  },
  sub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 'clamp(10px, 2vw, 12px)',
    lineHeight: 1.5,
    padding: '0 10px',
  },
};

export default Footer;
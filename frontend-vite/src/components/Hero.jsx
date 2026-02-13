import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaShieldAlt, FaLanguage, FaRobot } from 'react-icons/fa';

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={styles.hero}>
      <div style={styles.content}>
        <motion.div
          style={styles.badge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          🇮🇳 Powered by AI • Made for India
        </motion.div>

        <motion.h1
          style={styles.heading}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Find Government Schemes
          <br />
          <span style={styles.headingHighlight}>
            You Actually Deserve
          </span>
        </motion.h1>

        <p style={styles.subtitle}>
          Enter your details and our AI instantly matches you with eligible
          Central & State government schemes — in your preferred language.
        </p>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { num: '200+', label: 'Schemes', icon: '📋' },
            { num: '36', label: 'States & UTs', icon: '🗺️' },
            { num: '12', label: 'Languages', icon: '🌐' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              style={styles.stat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <span style={styles.statIcon}>{stat.icon}</span>
              <span style={styles.statNum}>{stat.num}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          style={styles.ctaBtn}
          onClick={scrollToForm}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaSearch /> Find My Schemes
        </motion.button>

        {/* Feature Pills */}
        <div style={styles.features}>
          {[
            { icon: <FaShieldAlt />, text: '100% Free' },
            { icon: <FaLanguage />, text: 'Multilingual' },
            { icon: <FaRobot />, text: 'AI Powered' },
          ].map((f, i) => (
            <span key={i} style={styles.featurePill}>
              {f.icon} {f.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  hero: {
    background: '#ffffff',
    padding: 'clamp(50px, 8vw, 80px) clamp(16px, 4vw, 24px) clamp(60px, 10vw, 100px)',
    textAlign: 'center',
    color: '#1e293b',
    position: 'relative',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-block',
    background: '#f1f5f9',
    padding: '6px 16px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '20px',
    color: '#1e3a8a',
  },
  heading: {
    fontSize: 'clamp(28px, 6vw, 52px)',
    fontWeight: 900,
    lineHeight: 1.15,
    marginBottom: '16px',
  },
  headingHighlight: {
    color: '#16a34a', // Green text
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 18px)',
    maxWidth: '580px',
    margin: '0 auto 28px',
    lineHeight: 1.6,
    color: '#475569',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '14px 24px',
    borderRadius: '12px',
    minWidth: '100px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statNum: {
    fontSize: '26px',
    fontWeight: 900,
    color: '#16a34a',
  },
  statLabel: {
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#64748b',
  },
  ctaBtn: {
    padding: '16px 40px',
    fontSize: '16px',
    fontWeight: 700,
    background: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: '#f1f5f9',
    borderRadius: '50px',
    fontSize: '13px',
  },
};

export default Hero;

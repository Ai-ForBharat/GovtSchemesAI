import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaShieldAlt, FaLanguage, FaRobot } from 'react-icons/fa';

const Hero = () => {
  const scrollToForm = () => {
    document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section style={styles.hero}>
      <div style={styles.bgPattern}></div>

      <motion.div
        style={styles.content}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          style={styles.badge}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          🇮🇳 Powered by AI • Made for India
        </motion.div>

        <h1 style={styles.heading}>
          Find Government Schemes
          <br />
          <span style={styles.headingHighlight}>You Actually Deserve</span>
        </h1>

        <p style={styles.subtitle}>
          Enter your details and our AI instantly matches you with eligible
          Central & State government schemes — in your preferred language
        </p>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { num: '200+', label: 'Schemes', icon: '📋' },
            { num: '36', label: 'States & UTs', icon: '🗺️' },
            { num: '12', label: 'Languages', icon: '🌐' },
            { num: 'AI', label: 'Powered', icon: '🤖' },
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
          whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(249,115,22,0.5)' }}
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
      </motion.div>
    </section>
  );
};

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 40%, #1e40af 70%, #1e3a8a 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientMove 8s ease infinite',
    padding: 'clamp(50px, 8vw, 80px) clamp(16px, 4vw, 24px) clamp(60px, 10vw, 100px)',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
  },
  bgPattern: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%)',
    pointerEvents: 'none',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 2,
  },
  badge: {
    display: 'inline-block',
    background: 'rgba(255, 255, 255, 0.12)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 16px',
    borderRadius: '50px',
    fontSize: 'clamp(11px, 2.5vw, 13px)',
    fontWeight: 600,
    marginBottom: '20px',
    backdropFilter: 'blur(10px)',
    letterSpacing: '0.5px',
  },
  heading: {
    fontSize: 'clamp(26px, 6vw, 52px)',
    fontWeight: 900,
    lineHeight: 1.15,
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  headingHighlight: {
    background: 'linear-gradient(135deg, #f97316, #fbbf24, #f97316)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 18px)',
    opacity: 0.85,
    maxWidth: '580px',
    margin: '0 auto 28px',
    lineHeight: 1.6,
    fontWeight: 400,
    padding: '0 10px',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(10px, 3vw, 24px)',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: 'clamp(10px, 2vw, 16px) clamp(14px, 3vw, 24px)',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    minWidth: 'clamp(70px, 15vw, 100px)',
  },
  statIcon: {
    fontSize: 'clamp(16px, 3vw, 22px)',
    marginBottom: '2px',
  },
  statNum: {
    fontSize: 'clamp(20px, 4vw, 28px)',
    fontWeight: 900,
    color: '#fbbf24',
    letterSpacing: '-1px',
  },
  statLabel: {
    fontSize: 'clamp(9px, 2vw, 12px)',
    opacity: 0.7,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  ctaBtn: {
    padding: 'clamp(14px, 3vw, 18px) clamp(30px, 6vw, 48px)',
    fontSize: 'clamp(14px, 3vw, 18px)',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    border: 'none',
    borderRadius: '60px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
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
    padding: '5px 14px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '50px',
    fontSize: 'clamp(11px, 2.5vw, 13px)',
    fontWeight: 500,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

export default Hero;
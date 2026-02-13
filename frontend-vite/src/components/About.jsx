import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaArrowRight, FaShieldAlt, FaLanguage, FaRobot, FaUsers } from 'react-icons/fa';

const About = () => {
  const { setCurrentView } = useApp();

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={styles.labelBadge}>About Us</span>
          <h2 style={styles.heading}>About GovScheme AI</h2>

          <p style={styles.text}>
            <strong>GovScheme AI</strong> is a platform that aims to offer one-stop search and discovery
            of Government schemes. It provides an innovative, technology-based solution to discover
            scheme information based upon the eligibility of the citizen.
          </p>

          <p style={styles.text}>
            The platform helps citizens find the right Government schemes for them.
            It also guides on how to apply for different Government schemes.
            Thus no need to visit multiple Government websites.
          </p>

          <div style={styles.features}>
            {[
              { icon: <FaRobot />, label: 'AI Powered Matching', color: '#3b82f6' },
              { icon: <FaLanguage />, label: '12 Languages Supported', color: '#8b5cf6' },
              { icon: <FaShieldAlt />, label: '100% Free & Secure', color: '#22c55e' },
              { icon: <FaUsers />, label: 'For Every Indian Citizen', color: '#f97316' },
            ].map((f, i) => (
              <motion.div
                key={f.label}
                style={styles.featureItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{ ...styles.featureIcon, background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <span style={styles.featureText}>{f.label}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            style={styles.btn}
            onClick={() => setCurrentView('about')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View More <FaArrowRight />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: 'clamp(50px, 8vw, 80px) clamp(12px, 3vw, 24px)',
    background: '#f0f4ff',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  content: {
    background: 'white',
    borderRadius: 'clamp(16px, 3vw, 24px)',
    padding: 'clamp(28px, 5vw, 50px) clamp(20px, 4vw, 40px)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
    textAlign: 'center',
  },
  labelBadge: {
    display: 'inline-block',
    background: '#ede9fe',
    color: '#7c3aed',
    padding: '6px 20px',
    borderRadius: '50px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 600,
    marginBottom: '14px',
  },
  heading: {
    fontSize: 'clamp(24px, 5vw, 32px)',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: 'clamp(16px, 3vw, 24px)',
  },
  text: {
    fontSize: 'clamp(13px, 2.5vw, 16px)',
    color: '#475569',
    lineHeight: 1.8,
    marginBottom: '14px',
    textAlign: 'left',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 200px), 1fr))',
    gap: 'clamp(8px, 2vw, 12px)',
    margin: 'clamp(20px, 4vw, 30px) 0',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 16px)',
    background: '#f8faff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  featureIcon: {
    width: 'clamp(30px, 5vw, 36px)',
    height: 'clamp(30px, 5vw, 36px)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    flexShrink: 0,
  },
  featureText: {
    fontSize: 'clamp(11px, 2.5vw, 13px)',
    fontWeight: 600,
    color: '#1e293b',
  },
  btn: {
    padding: 'clamp(12px, 2.5vw, 14px) clamp(24px, 4vw, 32px)',
    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
  },
};

export default About;
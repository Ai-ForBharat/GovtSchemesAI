import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  FaArrowRight,
  FaCheckCircle, FaMapMarkerAlt
} from 'react-icons/fa';

const About = () => {
  const { setCurrentView } = useApp();

  return (
    <section style={styles.section}>
      {/* Background decorations */}
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.container}>

        {/* LEFT SIDE */}
        <motion.div
          style={styles.left}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={styles.title}>
            <span style={styles.titleBlack}>About</span>{' '}
            <span style={styles.titleHighlight}>Saarthi AI</span>
          </h2>

          <p style={styles.text}>
            <strong style={styles.bold}>Saarthi AI</strong> is a national platform that aims to offer
            one-stop search and discovery of Government schemes.
          </p>

          <p style={styles.text}>
            It provides an innovative, technology-based solution to discover
            scheme information based upon the eligibility of the citizen.
          </p>

          <p style={styles.text}>
            The platform helps citizens find the right Government schemes for them.
            It also guides on how to apply for different Government schemes.
            Thus no need to visit multiple Government websites.
          </p>

          <motion.button
            style={styles.button}
            whileHover={{
              scale: 1.05,
              background: '#f97316',
              color: '#ffffff',
              borderColor: '#f97316',
              boxShadow: '0 8px 30px rgba(249,115,22,0.3)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView('about')}
          >
            View More <FaArrowRight />
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE – DECORATIVE FRAME */}
        <motion.div
          style={styles.right}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div style={styles.placeholderWrapper}>
            {/* Glow behind */}
            <div style={styles.placeholderGlow} />

            <div style={styles.placeholder}>
              {/* Decorative content inside the frame */}
              <div style={styles.frameContent}>

                {/* Top bar */}
                <div style={styles.frameTopBar}>
                  <div style={styles.frameDots}>
                    <span style={{ ...styles.frameDot, background: '#ef4444' }} />
                    <span style={{ ...styles.frameDot, background: '#f59e0b' }} />
                    <span style={{ ...styles.frameDot, background: '#22c55e' }} />
                  </div>
                  <span style={styles.frameUrl}>saarthi.ai</span>
                </div>

                {/* Mock content */}
                <div style={styles.mockContent}>
                  <div style={styles.mockTitle}>Saarthi AI</div>
                  <div style={styles.mockSubtitle}>Find schemes you deserve</div>

                  {/* Mock stats */}
                  <div style={styles.mockStats}>
                    {[
                      { num: '200+', label: 'Schemes' },
                      { num: '36', label: 'States' },
                      { num: '12', label: 'Languages' },
                    ].map((s, i) => (
                      <motion.div
                        key={i}
                        style={styles.mockStatItem}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                      >
                        <span style={styles.mockStatNum}>{s.num}</span>
                        <span style={styles.mockStatLabel}>{s.label}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Mock checklist */}
                  <div style={styles.mockChecklist}>
                    {[
                      'AI-powered scheme matching',
                      'Multi-language support',
                      'Real-time eligibility check',
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        style={styles.mockCheckItem}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 + i * 0.1 }}
                      >
                        <FaCheckCircle style={{ color: '#f97316', fontSize: '12px', flexShrink: 0 }} />
                        <span style={styles.mockCheckText}>{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating element */}
                <motion.div
                  style={styles.floatingBadge1}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <FaMapMarkerAlt style={{ fontSize: '10px' }} /> 36 States
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: 'clamp(60px, 10vw, 100px) 20px',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  bgDecor2: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(40px, 6vw, 80px)',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },

  left: {
    color: '#1a1a1a',
  },

  title: {
    fontSize: 'clamp(32px, 5vw, 44px)',
    fontWeight: 800,
    marginBottom: '24px',
    lineHeight: 1.2,
  },

  titleBlack: {
    color: '#1a1a1a',
  },

  titleHighlight: {
    color: '#f97316',
  },

  text: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    lineHeight: 1.8,
    color: '#333333',
    marginBottom: '16px',
  },

  bold: {
    color: '#f97316',
  },

  button: {
    marginTop: '8px',
    padding: '14px 32px',
    background: 'transparent',
    border: '2px solid #f97316',
    color: '#f97316',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease',
  },

  right: {
    display: 'flex',
    justifyContent: 'center',
  },

  placeholderWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
  },

  placeholderGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  placeholder: {
    width: '100%',
    height: '420px',
    borderRadius: '20px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 0 0 1px #e5e7eb',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },

  frameContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },

  frameTopBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f3f4f6',
  },

  frameDots: {
    display: 'flex',
    gap: '6px',
  },

  frameDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'block',
  },

  frameUrl: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: 500,
    background: '#ffffff',
    padding: '3px 12px',
    borderRadius: '6px',
    flex: 1,
    textAlign: 'center',
  },

  mockContent: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },

  mockTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#f97316',
  },

  mockSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },

  mockStats: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },

  mockStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    minWidth: '70px',
  },

  mockStatNum: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#f97316',
  },

  mockStatLabel: {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  mockChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
    width: '100%',
    paddingLeft: '8px',
  },

  mockCheckItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },

  mockCheckText: {
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: 500,
  },

  floatingBadge1: {
    position: 'absolute',
    top: '80px',
    right: '-8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: '#ffffff',
    border: '1px solid rgba(249,115,22,0.3)',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#f97316',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    zIndex: 2,
  },
};

export default About;
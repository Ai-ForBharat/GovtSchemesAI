import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEdit, FaSearch, FaCheckCircle,
  FaArrowRight, FaArrowDown, FaRocket
} from 'react-icons/fa';

const HowItWorks = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const steps = [
    {
      icon: <FaEdit />,
      title: 'Enter Details',
      desc: 'Fill a simple form with your basic details like age, state, income, category, and occupation.',
      color: '#f97316',
      features: ['Name & Age', 'State & Category', 'Income & Occupation'],
    },
    {
      icon: <FaSearch />,
      title: 'AI Matches Schemes',
      desc: 'Our AI engine compares your profile against 200+ scheme eligibility criteria in real-time.',
      color: '#3b82f6',
      features: ['Smart Matching', 'Central & State', 'Relevance Score'],
    },
    {
      icon: <FaCheckCircle />,
      title: 'View Results',
      desc: 'See all eligible schemes with benefits, documents needed, and match percentage at a glance.',
      color: '#8b5cf6',
      features: ['Detailed Info', 'Documents List', 'Match Percentage'],
    },
    {
      icon: <FaRocket />,
      title: 'Apply Online',
      desc: 'Apply directly through official government portals with our step-by-step guidance.',
      color: '#f59e0b',
      features: ['Official Links', 'Step-by-Step', 'Track Status'],
    },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.innerContainer}>

        {/* Header */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span style={styles.label}>How it works</span>

          <h2 style={styles.heading}>
            Easy steps to find & apply for
            <br />
            <span style={styles.headingHighlight}>Government Schemes</span>
          </h2>

          <p style={styles.headerDesc}>
            Our AI-powered platform makes it simple to discover eligible schemes
            in just a few minutes — no paperwork, no confusion.
          </p>
        </motion.div>

        {/* Steps */}
        <div style={styles.stepsContainer}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <motion.div
                style={styles.stepCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{
                  y: -8,
                  borderColor: '#d1d5db',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.06)',
                }}
              >
                <motion.div
                  style={styles.iconCircle}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span style={{ fontSize: '26px', color: '#1a1a1a' }}>
                    {step.icon}
                  </span>
                </motion.div>

                <h3 style={{ ...styles.stepTitle, color: step.color }}>
                  {step.title}
                </h3>

                <p style={styles.stepDesc}>{step.desc}</p>

                <div style={styles.stepFeatures}>
                  {step.features.map((feat, fi) => (
                    <motion.div
                      key={fi}
                      style={styles.stepFeature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 + fi * 0.08 }}
                    >
                      <FaCheckCircle style={{ color: step.color, fontSize: '10px', flexShrink: 0 }} />
                      <span style={styles.stepFeatureText}>{feat}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {i < steps.length - 1 && (
                <>
                  {!isMobile && (
                    <motion.div
                      style={styles.arrowDesktop}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.15 }}
                    >
                      <div style={styles.arrowCircle}>
                        <FaArrowRight style={{ color: '#9ca3af', fontSize: '14px' }} />
                      </div>
                      <div style={{
                        ...styles.arrowLine,
                        background: `linear-gradient(90deg, ${step.color}30, ${steps[i + 1].color}30)`,
                      }} />
                    </motion.div>
                  )}
                  {isMobile && (
                    <motion.div
                      style={styles.arrowMobile}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                    >
                      <div style={styles.arrowMobileCircle}>
                        <FaArrowDown style={{ color: '#9ca3af', fontSize: '14px' }} />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </React.Fragment>
          ))}
        </div>

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
    top: '-150px',
    right: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  innerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  header: {
    textAlign: 'center',
    marginBottom: 'clamp(40px, 6vw, 60px)',
  },

  label: {
    display: 'block',
    color: '#9ca3af',
    fontSize: '13px',
    marginBottom: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  heading: {
    fontSize: 'clamp(26px, 5vw, 44px)',
    fontWeight: 800,
    color: '#1a1a1a',
    lineHeight: 1.2,
    marginBottom: '14px',
  },

  headingHighlight: {
    color: '#f97316',
  },

  headerDesc: {
    fontSize: 'clamp(13px, 2.5vw, 16px)',
    color: '#6b7280',
    maxWidth: '550px',
    margin: '0 auto',
    lineHeight: 1.7,
  },

  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },

  stepCard: {
    background: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '20px',
    padding: 'clamp(28px, 4vw, 36px) clamp(20px, 3vw, 28px)',
    textAlign: 'center',
    width: 'clamp(220px, 22vw, 240px)',
    position: 'relative',
    transition: 'all 0.4s ease',
    cursor: 'default',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },

  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    transition: 'all 0.3s ease',
    background: '#f3f4f6',
    border: '2px solid #1a1a1a',
  },

  stepTitle: {
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    fontWeight: 700,
    marginBottom: '10px',
  },

  stepDesc: {
    fontSize: 'clamp(12px, 2vw, 13px)',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '14px',
  },

  stepFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '4px',
  },
  stepFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
  },
  stepFeatureText: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: 500,
  },

  arrowDesktop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    position: 'relative',
  },
  arrowCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  arrowLine: {
    position: 'absolute',
    top: '50%',
    left: '-8px',
    right: '-8px',
    height: '2px',
    zIndex: 1,
  },

  arrowMobile: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    margin: '4px 0',
  },
  arrowMobileCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default HowItWorks;
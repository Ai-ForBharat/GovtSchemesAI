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
      color: '#22c55e',
      num: '01',
      features: ['Name & Age', 'State & Category', 'Income & Occupation'],
    },
    {
      icon: <FaSearch />,
      title: 'AI Matches Schemes',
      desc: 'Our AI engine compares your profile against 200+ scheme eligibility criteria in real-time.',
      color: '#3b82f6',
      num: '02',
      features: ['Smart Matching', 'Central & State', 'Relevance Score'],
    },
    {
      icon: <FaCheckCircle />,
      title: 'View Results',
      desc: 'See all eligible schemes with benefits, documents needed, and match percentage at a glance.',
      color: '#8b5cf6',
      num: '03',
      features: ['Detailed Info', 'Documents List', 'Match Percentage'],
    },
    {
      icon: <FaRocket />,
      title: 'Apply Online',
      desc: 'Apply directly through official government portals with our step-by-step guidance.',
      color: '#f59e0b',
      num: '04',
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
            <React.Fragment key={step.num}>
              <motion.div
                style={styles.stepCard}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                whileHover={{
                  y: -8,
                  borderColor: `${step.color}40`,
                  boxShadow: `0 20px 50px ${step.color}15`,
                }}
              >
                <div style={{
                  ...styles.numBadge,
                  background: `${step.color}15`,
                  color: step.color,
                  border: `1px solid ${step.color}30`,
                }}>
                  {step.num}
                </div>

                <motion.div
                  style={{
                    ...styles.iconCircle,
                    background: `${step.color}10`,
                    border: `2px solid ${step.color}25`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <span style={{ fontSize: '26px', color: step.color }}>
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

                <div style={{
                  ...styles.accentLine,
                  background: `linear-gradient(90deg, ${step.color}, transparent)`,
                }} />
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
                        <FaArrowRight style={{ color: '#64748b', fontSize: '14px' }} />
                      </div>
                      <div style={{
                        ...styles.arrowLine,
                        background: `linear-gradient(90deg, ${step.color}40, ${steps[i + 1].color}40)`,
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
                        <FaArrowDown style={{ color: '#64748b', fontSize: '14px' }} />
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
    background: '#0f172a',
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
    background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
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
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  heading: {
    fontSize: 'clamp(26px, 5vw, 44px)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: '14px',
  },

  headingHighlight: {
    color: '#22c55e',
  },

  headerDesc: {
    fontSize: 'clamp(13px, 2.5vw, 16px)',
    color: '#94a3b8',
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
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '20px',
    padding: 'clamp(28px, 4vw, 36px) clamp(20px, 3vw, 28px)',
    textAlign: 'center',
    width: 'clamp(220px, 22vw, 240px)',
    position: 'relative',
    transition: 'all 0.4s ease',
    cursor: 'default',
    overflow: 'hidden',
  },

  numBadge: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
  },

  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    transition: 'all 0.3s ease',
  },

  stepTitle: {
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    fontWeight: 700,
    marginBottom: '10px',
  },

  stepDesc: {
    fontSize: 'clamp(12px, 2vw, 13px)',
    color: '#94a3b8',
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
    color: '#64748b',
    fontWeight: 500,
  },

  accentLine: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '3px',
    borderRadius: '0 0 20px 20px',
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
    background: '#0f172a',
    border: '1px solid #1e293b',
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
    background: '#0f172a',
    border: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default HowItWorks;
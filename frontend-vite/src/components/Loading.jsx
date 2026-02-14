import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaClipboardCheck, FaChartBar,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';

const Loading = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [factIndex, setFactIndex] = useState(0);

  const steps = [
    { icon: <FaUser />, text: 'Reading your details' },
    { icon: <FaClipboardCheck />, text: 'Checking eligibility criteria' },
    { icon: <FaChartBar />, text: 'Calculating match scores' },
    { icon: <FaCheckCircle />, text: 'Preparing your results' },
  ];

  const facts = [
    'India has 200+ active government welfare schemes',
    'Schemes cover all 36 States & Union Territories',
    'Over 10 Lakh citizens have used AI scheme finders',
    'Schemes are available in 12+ Indian languages',
    'PM Kisan provides ₹6,000/year to eligible farmers',
    'Ayushman Bharat covers up to ₹5 Lakh in medical expenses',
    'National Scholarship Portal offers 100+ scholarships',
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep(prev => {
        if (prev < steps.length - 1) {
          setCompletedSteps(c => [...c, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 1800);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % facts.length);
    }, 3000);
    return () => clearInterval(factInterval);
  }, []);

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <section style={styles.fullPage}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />
      <div style={styles.bgDecor3} />

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Spinner */}
        <div style={styles.spinnerWrapper}>
          <div style={styles.spinnerOuter}>
            <div style={styles.spinnerInner}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={styles.spinnerRing}
              />
              <div style={styles.spinnerCenter}>
                <motion.span
                  style={styles.spinnerPercent}
                  key={Math.round(progress)}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>
          </div>

          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={styles.orbitDot}
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1,
              }}
              initial={false}
            />
          ))}
        </div>

        {/* Title */}
        <motion.h2
          style={styles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Analyzing Your Profile
        </motion.h2>

        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Matching with government schemes across India
        </motion.p>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <motion.div
            style={styles.progressBar}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Steps */}
        <div style={styles.steps}>
          {steps.map((step, i) => {
            const isCompleted = completedSteps.includes(i);
            const isActive = activeStep === i;

            return (
              <motion.div
                key={i}
                style={{
                  ...styles.stepItem,
                  ...(isActive ? styles.stepItemActive : {}),
                  ...(isCompleted ? styles.stepItemCompleted : {}),
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                <div style={{
                  ...styles.stepIcon,
                  ...(isCompleted ? styles.stepIconCompleted : {}),
                  ...(isActive ? styles.stepIconActive : {}),
                }}>
                  {isCompleted ? (
                    <FaCheckCircle style={{ fontSize: '14px' }} />
                  ) : isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <FaSpinner style={{ fontSize: '14px' }} />
                    </motion.div>
                  ) : (
                    <span style={{ fontSize: '13px' }}>{step.icon}</span>
                  )}
                </div>

                <div style={styles.stepTextWrapper}>
                  <span style={{
                    ...styles.stepText,
                    color: isCompleted
                      ? '#f97316'
                      : isActive
                        ? '#1a1a1a'
                        : '#9ca3af',
                  }}>
                    {step.text}
                  </span>
                  {isActive && (
                    <motion.span
                      style={styles.stepStatusProcessing}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing...
                    </motion.span>
                  )}
                  {isCompleted && (
                    <span style={styles.stepStatusComplete}>Complete</span>
                  )}
                </div>

                <span style={{
                  ...styles.stepNum,
                  color: isCompleted || isActive ? '#f97316' : '#d1d5db',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Fun fact */}
        <div style={styles.factSection}>
          <span style={styles.factLabel}>Did you know?</span>
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              style={styles.factText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {facts[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

const styles = {
  fullPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    padding: 'clamp(30px, 5vw, 60px) 20px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Inter, sans-serif',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-150px',
    right: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  card: {
    textAlign: 'center',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    padding: 'clamp(30px, 5vw, 48px)',
    borderRadius: '24px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 0 0 1px #e5e7eb',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
  },

  /* Spinner */
  spinnerWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    margin: '0 auto 24px',
  },
  spinnerOuter: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  spinnerInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    inset: '4px',
    borderRadius: '50%',
    border: '3px solid transparent',
    borderTopColor: '#f97316',
    borderRightColor: '#1a1a1a',
  },
  spinnerCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerPercent: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#f97316',
    fontFamily: 'Inter, sans-serif',
  },

  orbitDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f97316',
    top: '-4px',
    left: '46px',
    transformOrigin: '4px 54px',
    opacity: 0.5,
  },

  /* Title */
  title: {
    fontSize: 'clamp(20px, 4vw, 26px)',
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: '#6b7280',
    marginBottom: '24px',
    fontWeight: 500,
  },

  /* Progress bar */
  progressTrack: {
    width: '100%',
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    marginBottom: '28px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '3px',
    background: '#f97316',
    boxShadow: '0 0 10px rgba(249,115,22,0.3)',
  },

  /* Steps */
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    transition: 'all 0.4s ease',
  },
  stepItemActive: {
    background: '#ffffff',
    borderColor: 'rgba(249,115,22,0.3)',
    boxShadow: '0 4px 15px rgba(249,115,22,0.08)',
  },
  stepItemCompleted: {
    background: '#f9fafb',
    borderColor: 'rgba(249,115,22,0.15)',
  },

  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#ffffff',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
  stepIconActive: {
    background: 'rgba(249,115,22,0.08)',
    borderColor: 'rgba(249,115,22,0.3)',
    color: '#f97316',
  },
  stepIconCompleted: {
    background: 'rgba(249,115,22,0.08)',
    borderColor: 'rgba(249,115,22,0.2)',
    color: '#f97316',
  },

  stepTextWrapper: {
    flex: 1,
    textAlign: 'left',
  },
  stepText: {
    fontSize: '14px',
    fontWeight: 600,
    display: 'block',
    transition: 'color 0.3s ease',
  },
  stepStatusProcessing: {
    fontSize: '11px',
    color: '#f97316',
    fontWeight: 500,
    display: 'block',
    marginTop: '2px',
  },
  stepStatusComplete: {
    fontSize: '11px',
    color: '#f97316',
    fontWeight: 500,
    display: 'block',
    marginTop: '2px',
  },

  stepNum: {
    fontSize: '12px',
    fontWeight: 800,
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
  },

  /* Divider */
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '24px 0 20px',
  },

  /* Fun fact */
  factSection: {
    minHeight: '50px',
  },
  factLabel: {
    fontSize: '11px',
    color: '#1a1a1a',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  factText: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
    fontWeight: 500,
    margin: 0,
  },
};

export default Loading;
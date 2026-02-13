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
    {
      icon: <FaUser />,
      text: 'Reading your details',
      color: '#22c55e',
    },
    {
      icon: <FaClipboardCheck />,
      text: 'Checking eligibility criteria',
      color: '#3b82f6',
    },
    {
      icon: <FaChartBar />,
      text: 'Calculating match scores',
      color: '#8b5cf6',
    },
    {
      icon: <FaCheckCircle />,
      text: 'Preparing your results',
      color: '#f59e0b',
    },
  ];

  const facts = [
    '💡 India has 200+ active government welfare schemes',
    '🇮🇳 Schemes cover all 36 States & Union Territories',
    '📊 Over 10 Lakh citizens have used AI scheme finders',
    '🌐 Schemes are available in 12+ Indian languages',
    '💰 PM Kisan provides ₹6,000/year to eligible farmers',
    '🏥 Ayushman Bharat covers up to ₹5 Lakh in medical expenses',
    '🎓 National Scholarship Portal offers 100+ scholarships',
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
          {/* Orbiting dots */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              style={{
                ...styles.orbitDot,
                background: steps[Math.min(activeStep, steps.length - 1)].color,
              }}
              animate={{
                rotate: 360,
              }}
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
          🔍 Analyzing Your Profile
        </motion.h2>

        <motion.p
          style={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Matching with 200+ government schemes across India
        </motion.p>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <motion.div
            style={{
              ...styles.progressBar,
              background: `linear-gradient(90deg, #22c55e, ${steps[Math.min(activeStep, steps.length - 1)].color})`,
            }}
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
                  borderColor: isActive
                    ? `${step.color}40`
                    : isCompleted
                      ? `${step.color}20`
                      : '#1e293b',
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                {/* Step icon */}
                <div style={{
                  ...styles.stepIcon,
                  background: isCompleted
                    ? `${step.color}20`
                    : isActive
                      ? `${step.color}15`
                      : '#0f172a',
                  borderColor: isCompleted || isActive
                    ? `${step.color}40`
                    : '#1e293b',
                  color: isCompleted || isActive
                    ? step.color
                    : '#475569',
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

                {/* Step text */}
                <div style={styles.stepTextWrapper}>
                  <span style={{
                    ...styles.stepText,
                    color: isCompleted
                      ? step.color
                      : isActive
                        ? '#e2e8f0'
                        : '#475569',
                  }}>
                    {step.text}
                  </span>
                  {isActive && (
                    <motion.span
                      style={styles.stepStatus}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      Processing...
                    </motion.span>
                  )}
                  {isCompleted && (
                    <span style={{ ...styles.stepStatus, color: step.color }}>
                      Complete
                    </span>
                  )}
                </div>

                {/* Step number */}
                <span style={{
                  ...styles.stepNum,
                  color: isCompleted || isActive ? step.color : '#334155',
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

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.1); }
          50% { box-shadow: 0 0 40px rgba(34,197,94,0.2); }
        }
      `}</style>
    </section>
  );
};

const styles = {
  fullPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 50%, #020617 100%)',
    padding: 'clamp(30px, 5vw, 60px) 20px',
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
    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
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
    background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  card: {
    textAlign: 'center',
    background: '#0f172a',
    border: '1px solid #1e293b',
    padding: 'clamp(30px, 5vw, 48px)',
    borderRadius: '24px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
    maxWidth: '500px',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    animation: 'pulse-glow 3s ease-in-out infinite',
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
    background: '#020617',
    border: '2px solid #1e293b',
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
    borderTopColor: '#22c55e',
    borderRightColor: '#3b82f6',
  },
  spinnerCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerPercent: {
    fontSize: '22px',
    fontWeight: 900,
    color: '#22c55e',
    fontFamily: 'Inter, sans-serif',
  },

  orbitDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    top: '-4px',
    left: '46px',
    transformOrigin: '4px 54px',
    opacity: 0.6,
  },

  /* Title */
  title: {
    fontSize: 'clamp(20px, 4vw, 26px)',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '8px',
  },

  subtitle: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: '#64748b',
    marginBottom: '24px',
    fontWeight: 500,
  },

  /* Progress bar */
  progressTrack: {
    width: '100%',
    height: '6px',
    background: '#1e293b',
    borderRadius: '3px',
    marginBottom: '28px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '3px',
    boxShadow: '0 0 10px rgba(34,197,94,0.3)',
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
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    transition: 'all 0.4s ease',
  },
  stepItemActive: {
    background: '#0f172a',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  stepItemCompleted: {
    background: '#020617',
  },

  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.3s ease',
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
  stepStatus: {
    fontSize: '11px',
    color: '#475569',
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
    background: 'linear-gradient(90deg, transparent, #1e293b, transparent)',
    margin: '24px 0 20px',
  },

  /* Fun fact */
  factSection: {
    minHeight: '50px',
  },
  factLabel: {
    fontSize: '11px',
    color: '#475569',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'block',
    marginBottom: '8px',
  },
  factText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.6,
    fontWeight: 500,
    margin: 0,
  },
};

export default Loading;
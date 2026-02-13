import React from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaSearch, FaCheckCircle, FaArrowRight, FaArrowDown } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaEdit />, title: 'Enter Details',
      desc: 'Start by entering your basic details like age, state, income, and occupation.',
      color: '#22c55e', bg: '#052e1f', num: '01',
    },
    {
      icon: <FaSearch />, title: 'Search',
      desc: 'Our AI search engine will find the relevant schemes matching your profile.',
      color: '#22c55e', bg: '#052e1f', num: '02',
    },
    {
      icon: <FaCheckCircle />, title: 'Select & Apply',
      desc: 'Select and apply for the best suited scheme directly through official websites.',
      color: '#22c55e', bg: '#052e1f', num: '03',
    },
  ];

  return (
    <section style={styles.section}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span style={styles.label}>How it works</span>
        <h2 style={styles.heading}>
          Easy steps to apply<br />
          for <span style={styles.headingHighlight}>Government Schemes</span>
        </h2>
      </motion.div>

      <div style={styles.stepsContainer}>
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <motion.div
              style={styles.stepCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -10, boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}
            >
              <div style={{ ...styles.numBadge }}>
                {step.num}
              </div>

              <div style={{ ...styles.iconCircle }}>
                <span style={{ fontSize: '28px', color: step.color }}>
                  {step.icon}
                </span>
              </div>

              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </motion.div>

            {i < steps.length - 1 && (
              <>
                <div style={styles.arrowDesktop}>
                  <FaArrowRight style={{ color: '#1f2937', fontSize: '28px' }} />
                </div>
                <div style={styles.arrowMobile}>
                  <FaArrowDown style={{ color: '#1f2937', fontSize: '28px' }} />
                </div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const styles = {
  section: {
    padding: 'clamp(60px, 10vw, 100px) 20px',
    background: 'linear-gradient(135deg, #0f172a, #111827)',
  },

  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },

  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '16px',
    letterSpacing: '1px',
  },

  heading: {
    fontSize: 'clamp(28px, 5vw, 48px)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
  },

  headingHighlight: {
    color: '#22c55e',
  },

  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    maxWidth: '1100px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },

  stepCard: {
    background: '#0b1220',
    borderRadius: '16px',
    padding: '40px 30px',
    textAlign: 'center',
    width: '280px',
    position: 'relative',
    transition: 'all 0.3s ease',
  },

  numBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#052e1f',
    color: '#22c55e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },

  iconCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: '#052e1f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },

  stepTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#22c55e',
    marginBottom: '12px',
  },

  stepDesc: {
    fontSize: '14px',
    color: '#cbd5e1',
    lineHeight: 1.6,
  },

  arrowDesktop: {
    display: isMobile ? 'none' : 'flex',
    alignItems: 'center',
  },

  arrowMobile: {
    display: isMobile ? 'flex' : 'none',
    justifyContent: 'center',
    width: '100%',
    margin: '10px 0',
  },
};

export default HowItWorks;

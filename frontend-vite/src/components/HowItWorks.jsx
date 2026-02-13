import React from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaSearch, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FaEdit />,
      title: 'Enter Details',
      desc: 'Start by entering your basic details like age, state, income, and occupation.',
      color: '#3b82f6',
      bg: '#dbeafe',
      num: '01',
    },
    {
      icon: <FaSearch />,
      title: 'AI Searches',
      desc: 'Our AI search engine will find the most relevant schemes matching your profile.',
      color: '#f97316',
      bg: '#ffedd5',
      num: '02',
    },
    {
      icon: <FaCheckCircle />,
      title: 'Select & Apply',
      desc: 'Select and apply for the best suited scheme directly through official websites.',
      color: '#22c55e',
      bg: '#dcfce7',
      num: '03',
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
        <span style={styles.label}>How it Works</span>
        <h2 style={styles.heading}>
          Easy steps to apply for<br />
          <span style={styles.headingHighlight}>Government Schemes</span>
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
              whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ ...styles.numBadge, background: step.bg, color: step.color }}>
                {step.num}
              </div>
              <div style={{ ...styles.iconCircle, background: step.bg }}>
                <span style={{ fontSize: '28px', color: step.color }}>{step.icon}</span>
              </div>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </motion.div>

            {i < steps.length - 1 && (
              <div style={styles.arrow}>
                <FaArrowRight style={{ color: '#cbd5e1', fontSize: '24px' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 24px',
    background: 'white',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  label: {
    display: 'inline-block',
    background: '#eff6ff',
    color: '#3b82f6',
    padding: '6px 20px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  heading: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: 800,
    color: '#1e293b',
    lineHeight: 1.2,
  },
  headingHighlight: {
    color: '#3b82f6',
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  stepCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '36px 28px',
    textAlign: 'center',
    width: '280px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  numBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
  },
  iconCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '10px',
  },
  stepDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: 1.6,
  },
  arrow: {
    display: 'flex',
    alignItems: 'center',
  },
};

export default HowItWorks;
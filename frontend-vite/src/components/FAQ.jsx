import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaArrowRight } from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const FAQ = () => {
  const { setCurrentView } = useApp();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'What is Saarthi AI?',
      a: 'Saarthi AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for based on their personal profile.',
    },
    {
      q: 'How will Saarthi AI help common citizens?',
      a: 'It simplifies access to welfare schemes by matching users with relevant Central and State schemes instantly in one place.',
    },
    {
      q: 'Can I apply for the schemes through Saarthi AI?',
      a: 'We provide official application links and complete guidance so you can apply directly through government portals.',
    },
    {
      q: 'How does Saarthi AI work? How do I check eligibility?',
      a: 'You fill out a simple form. Our AI compares your details with scheme eligibility criteria and shows the best matches instantly.',
    },
    {
      q: 'What information about a scheme can I find?',
      a: 'You can see eligibility, benefits, documents required, application steps, official website links, and match percentage.',
    },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.container}>

        {/* LEFT SIDE - MINI IMAGE */}
        <motion.div
          style={styles.left}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.imageWrapper}>
            <div style={styles.imageGlow} />

            <div style={styles.imagePlaceholder}>
              <div style={styles.illustrationContent}>

                <div style={styles.frameTopBar}>
                  <div style={styles.frameDots}>
                    <span style={{ ...styles.frameDot, background: '#ef4444' }} />
                    <span style={{ ...styles.frameDot, background: '#f59e0b' }} />
                    <span style={{ ...styles.frameDot, background: '#22c55e' }} />
                  </div>
                  <span style={styles.frameUrl}>saarthi.ai</span>
                </div>

                <div style={styles.illustrationMain}>
                  <div style={styles.illustrationTitle}>Saarthi AI</div>
                  <div style={styles.illustrationSub}>Find answers quickly</div>

                  <div style={styles.mockFaqList}>
                    {['What schemes am I eligible for?', 'How to apply for schemes?', 'Documents required?', 'Check eligibility criteria?', 'State vs Central schemes?'].map((item, i) => (
                      <motion.div
                        key={i}
                        style={styles.mockFaqItem}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                      >
                        <span style={styles.mockFaqText}>{item}</span>
                        <FaChevronDown style={{ color: '#f97316', fontSize: '10px', flexShrink: 0 }} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE CONTENT */}
        <motion.div
          style={styles.right}
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={styles.bigTitle}>
            Frequently Asked{' '}
            <span style={styles.bigTitleHighlight}>Questions</span>
          </h2>

          <div style={styles.faqList}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                style={{
                  ...styles.faqItem,
                  ...(openIndex === i ? styles.faqItemActive : {}),
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <button
                  style={styles.question}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span style={styles.questionText}>{faq.q}</span>
                  <motion.div
                    style={styles.chevronWrapper}
                    animate={{ rotate: openIndex === i ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown style={{
                      fontSize: '12px',
                      color: openIndex === i ? '#f97316' : '#9ca3af',
                    }} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={styles.answer}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <motion.div
            style={styles.bottomRow}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              style={styles.viewMoreBtn}
              onClick={() => setCurrentView('faq')}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              View All Questions <FaArrowRight style={{ fontSize: '12px' }} />
            </motion.button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

const styles = {
  section: {
    background: '#ffffff',
    padding: 'clamp(60px, 10vw, 100px) 20px',
    color: '#1a1a1a',
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

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: 'clamp(40px, 6vw, 80px)',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 1,
  },

  left: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    justifyContent: 'center',
  },

  imageWrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '450px',
  },

  imageGlow: {
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

  imagePlaceholder: {
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

  illustrationContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
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

  illustrationMain: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  illustrationTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#f97316',
  },
  illustrationSub: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },

  mockFaqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%',
    marginTop: '8px',
  },
  mockFaqItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
  },
  mockFaqText: {
    fontSize: '11px',
    color: '#4b5563',
    fontWeight: 500,
  },

  right: {
    flex: 1,
    minWidth: '320px',
  },

  bigTitle: {
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 'clamp(28px, 5vw, 40px)',
    color: '#1a1a1a',
  },

  bigTitleHighlight: {
    color: '#f97316',
  },

  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  faqItem: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '4px',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
  },

  faqItemActive: {
    borderColor: 'rgba(249,115,22,0.3)',
    boxShadow: '0 4px 20px rgba(249,115,22,0.06)',
  },

  question: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(12px, 2.5vw, 16px)',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    fontFamily: 'Inter, sans-serif',
  },

  questionText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    fontWeight: 600,
    color: '#1a1a1a',
    lineHeight: 1.4,
    flex: 1,
  },

  chevronWrapper: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  answer: {
    color: '#4b5563',
    fontSize: 'clamp(13px, 2.5vw, 14px)',
    lineHeight: 1.7,
    padding: '0 clamp(12px, 2.5vw, 16px) clamp(12px, 2.5vw, 16px)',
    margin: 0,
  },

  bottomRow: {
    marginTop: 'clamp(28px, 5vw, 40px)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },

  viewMoreBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

export default FAQ;
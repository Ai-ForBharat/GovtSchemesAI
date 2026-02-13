import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaChevronDown } from 'react-icons/fa';

const FAQPage = () => {
  const { resetApp } = useApp();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is GovScheme AI?', a: 'GovScheme AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for, available in 12 Indian languages.' },
    { q: 'How will GovScheme AI help common citizens?', a: 'It eliminates the need to visit multiple government websites. Fill one form and instantly see all schemes you qualify for with benefits, documents, and apply links.' },
    { q: 'Can I apply for schemes through GovScheme AI?', a: 'We provide detailed information and direct links to official government portals where you can apply.' },
    { q: 'How does the eligibility check work?', a: 'Our AI compares your profile against scheme eligibility criteria and shows matching ones with a relevance score.' },
    { q: 'What information about a scheme can I find?', a: 'You can view eligibility, benefits, required documents, application steps, and official links.' },
    { q: 'Is this service free?', a: 'Yes! GovScheme AI is completely free to use.' },
  ];

  return (
    <div style={styles.page}>

      {/* HERO HEADER */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Frequently Asked Questions</h1>

        <p style={styles.breadcrumb}>
          <span onClick={resetApp} style={{ cursor: 'pointer' }}>Home</span>
          <span style={{ margin: '0 8px' }}>›</span>
          Frequently Asked Questions
        </p>

        {/* CLEAN WAVE DIVIDER */}
        <div style={styles.wave}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path
              d="M0,80 C360,140 1080,20 1440,80 L1440,120 L0,120 Z"
              fill="#1f2937"
            />
          </svg>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.contentContainer}>

        {/* LEFT SIDE IMAGE SPACE */}
        <div style={styles.left}>
          <div style={styles.imagePlaceholder}>
            Custom Image Here
          </div>
        </div>

        {/* RIGHT SIDE FAQ */}
        <div style={styles.right}>
          <div style={styles.faqList}>
            {faqs.map((faq, i) => (
              <div key={i} style={styles.faqItem}>
                <button
                  style={styles.question}
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  <FaChevronDown
                    style={{
                      transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: '0.3s',
                    }}
                  />
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
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const styles = {
  page: {
    background: '#1f2937',
    minHeight: '100vh',
    color: 'white',
  },

  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #0f172a 0%, #111827 50%, #0f172a 100%)',
    padding: '80px 20px 120px',
    textAlign: 'center',
    overflow: 'hidden',
  },

  heroTitle: {
    fontSize: '42px',
    fontWeight: 800,
    marginBottom: '15px',
  },

  breadcrumb: {
    color: '#22c55e',
    fontSize: '14px',
  },

  wave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '70px',
  },

  contentContainer: {
    maxWidth: '1200px',
    margin: '40px auto 80px', // ✅ removed negative margin
    display: 'flex',
    gap: '60px',
    padding: '0 20px',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  left: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    justifyContent: 'center',
  },

  imagePlaceholder: {
    width: '100%',
    maxWidth: '450px',
    height: '380px',
    borderRadius: '20px',
    border: '2px dashed rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6,
    fontSize: '18px',
  },

  right: {
    flex: 1,
    minWidth: '320px',
  },

  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },

  faqItem: {
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    paddingBottom: '14px',
  },

  question: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
  },

  answer: {
    marginTop: '10px',
    color: '#cbd5e1',
    fontSize: '15px',
    lineHeight: 1.6,
  },
};

export default FAQPage;

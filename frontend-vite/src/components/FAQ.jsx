import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

const FAQ = () => {
  const { setCurrentView } = useApp();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is GovScheme AI?', a: 'GovScheme AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for. It uses machine learning to match your profile with 200+ Central and State government schemes.' },
    { q: 'How will GovScheme AI help common citizens?', a: 'It eliminates the need to visit multiple government websites. Just fill one simple form, and our AI instantly shows you all schemes you qualify for — with benefits, documents needed, and direct apply links.' },
    { q: 'Can I apply for the schemes through GovScheme AI?', a: 'GovScheme AI provides detailed information and direct links to official government portals where you can apply. We guide you to the right place to submit your application.' },
    { q: 'How does GovScheme AI work? How do I check my eligibility?', a: 'Fill the form with your details (age, state, income, category, occupation). Our AI matching engine compares your profile against eligibility criteria of all schemes and shows you the matching ones with a relevance score.' },
    { q: 'What information about a scheme can I find on GovScheme AI?', a: 'For each scheme you can find: scheme name, description, eligibility criteria, benefits, required documents, how to apply, official website link, and your match percentage.' },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={styles.labelBadge}><FaQuestionCircle /> FAQ</span>
          <h2 style={styles.heading}>Frequently Asked Questions</h2>
          <p style={styles.subtitleText}>Checkout our knowledge base for some of your answers!</p>
        </motion.div>

        <div style={styles.faqList}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              style={styles.faqItem}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <button
                style={{
                  ...styles.faqQuestion,
                  color: openIndex === i ? '#3b82f6' : '#1e293b',
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span>{faq.q}</span>
                <FaChevronDown style={{
                  transition: 'transform 0.3s',
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)',
                  flexShrink: 0,
                  color: openIndex === i ? '#3b82f6' : '#94a3b8',
                  fontSize: '14px',
                }} />
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
                    <p style={styles.faqAnswer}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <motion.button
            style={styles.viewMoreBtn}
            onClick={() => setCurrentView('faq')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View More Questions →
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: 'clamp(50px, 8vw, 80px) clamp(12px, 3vw, 24px)',
    background: 'white',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(28px, 5vw, 40px)',
  },
  labelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: '#fef3c7',
    color: '#d97706',
    padding: '6px 20px',
    borderRadius: '50px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 600,
    marginBottom: '14px',
  },
  heading: {
    fontSize: 'clamp(22px, 5vw, 36px)',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitleText: {
    color: '#64748b',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(8px, 2vw, 12px)',
  },
  faqItem: {
    background: '#f8faff',
    borderRadius: 'clamp(10px, 2vw, 14px)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  faqQuestion: {
    width: '100%',
    padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3vw, 20px)',
    background: 'none',
    border: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '14px',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'left',
    fontFamily: 'Inter, sans-serif',
    lineHeight: 1.4,
  },
  faqAnswer: {
    padding: '0 clamp(14px, 3vw, 20px) clamp(14px, 3vw, 18px)',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    color: '#64748b',
    lineHeight: 1.7,
  },
  viewMoreBtn: {
    padding: 'clamp(10px, 2vw, 12px) clamp(24px, 4vw, 30px)',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
};

export default FAQ;
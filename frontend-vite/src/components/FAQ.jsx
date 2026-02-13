import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const FAQ = () => {
  const { setCurrentView } = useApp();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'What is GovScheme AI?',
      a: 'GovScheme AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for based on their personal profile.',
    },
    {
      q: 'How will GovScheme AI help common citizens?',
      a: 'It simplifies access to welfare schemes by matching users with relevant Central and State schemes instantly in one place.',
    },
    {
      q: 'Can I apply for the schemes through GovScheme AI?',
      a: 'We provide official application links and complete guidance so you can apply directly through government portals.',
    },
    {
      q: 'How does GovScheme AI work? How do I check eligibility?',
      a: 'You fill out a simple form. Our AI compares your details with scheme eligibility criteria and shows the best matches instantly.',
    },
    {
      q: 'What information about a scheme can I find?',
      a: 'You can see eligibility, benefits, documents required, application steps, official website links, and match percentage.',
    },
  ];

  return (
    <section style={styles.section}>
      <div style={styles.container}>

        {/* LEFT SIDE IMAGE SPACE */}
        <div style={styles.left}>
          <div style={styles.imagePlaceholder}>
            Your Custom Image Here
          </div>
        </div>

        {/* RIGHT SIDE CONTENT */}
        <div style={styles.right}>
          <p style={styles.smallTitle}>Frequently Asked Questions</p>

          <h2 style={styles.bigTitle}>
            Checkout our <br />
            knowledge base for <br />
            some of your answers!
          </h2>

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
                      transform:
                        openIndex === i ? 'rotate(180deg)' : 'rotate(0)',
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

          {/* VIEW MORE BUTTON */}
          <div style={{ marginTop: '35px' }}>
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

      </div>
    </section>
  );
};

const styles = {
  section: {
    background:
      'linear-gradient(135deg, #0f172a 0%, #111827 40%, #1e293b 100%)',
    padding: '80px 20px',
    color: 'white',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '60px',
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
    height: '400px',
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
  smallTitle: {
    color: '#94a3b8',
    fontSize: '16px',
    marginBottom: '10px',
  },
  bigTitle: {
    fontSize: '42px',
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: '40px',
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  faqItem: {
    borderBottom: '1px solid rgba(255,255,255,0.15)',
    paddingBottom: '15px',
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
  viewMoreBtn: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

export default FAQ;

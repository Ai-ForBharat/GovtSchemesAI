import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaArrowLeft, FaChevronDown } from 'react-icons/fa';

const FAQPage = () => {
  const { resetApp } = useApp();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: 'What is GovScheme AI?', a: 'GovScheme AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for, available in 12 Indian languages.' },
    { q: 'How will GovScheme AI help common citizens?', a: 'It eliminates the need to visit multiple government websites. Fill one form and instantly see all schemes you qualify for with benefits, documents, and apply links.' },
    { q: 'Can I apply for schemes through GovScheme AI?', a: 'We provide detailed information and direct links to official government portals where you can apply. We guide you to the right place.' },
    { q: 'How does the eligibility check work?', a: 'Fill the form with your details. Our AI compares your profile against eligibility criteria of all schemes and shows matching ones with a relevance score (0-100%).' },
    { q: 'What information about a scheme can I find?', a: 'Scheme name, description, eligibility criteria, benefits, required documents, how to apply, official website link, and your match percentage.' },
    { q: 'Is this service free?', a: 'Yes! GovScheme AI is 100% free. No registration, no fees, no hidden charges. It is built as a public service tool.' },
    { q: 'How many schemes are covered?', a: 'Currently we have 20+ schemes in our database covering Central and State government schemes. This is continuously expanding.' },
    { q: 'Which languages are supported?', a: 'English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, and Urdu — 12 languages total.' },
    { q: 'Is my data safe?', a: 'We do NOT store any personal data. Your form details are processed in real-time and not saved anywhere. Privacy is our priority.' },
    { q: 'What is the AI chatbot?', a: 'Our AI chatbot (bottom-right 🤖 icon) can answer questions about specific schemes, eligibility, documents required, and how to apply. Try it!' },
    { q: 'How accurate is the matching?', a: 'Our matching engine checks age, gender, state, income, category, occupation, and special criteria. Schemes with 80%+ match are highly relevant.' },
    { q: 'Can I use this on mobile?', a: 'Yes! The website is fully responsive and works on all devices — mobile, tablet, and desktop.' },
    { q: 'How do I report incorrect information?', a: 'Scheme information is sourced from official government websites. If you find any discrepancy, please verify on the official portal.' },
    { q: 'What if no schemes match my profile?', a: 'Try adjusting your details or browse all schemes through the Categories section. Some schemes have very specific criteria.' },
    { q: 'Who built this?', a: 'GovScheme AI was built for a hackathon with the goal of making government welfare schemes accessible to every Indian citizen using AI technology.' },
  ];

  return (
    <div style={styles.page}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={resetApp} style={styles.backBtn}><FaArrowLeft /> Back to Home</button>

        <h1 style={styles.title}>❓ Frequently Asked Questions</h1>
        <p style={styles.subtitle}>Everything you need to know about GovScheme AI</p>

        <div style={styles.faqList}>
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              style={styles.faqItem}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                style={{
                  ...styles.faqQ,
                  color: openIndex === i ? '#3b82f6' : '#1e293b',
                }}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span style={styles.qNum}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1 }}>{faq.q}</span>
                <FaChevronDown style={{
                  transition: 'transform 0.3s',
                  transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0)',
                  color: openIndex === i ? '#3b82f6' : '#94a3b8',
                  flexShrink: 0,
                }} />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p style={styles.faqA}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const styles = {
  page: { padding: '40px 24px', maxWidth: '800px', margin: '0 auto' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', background: '#f1f5f9', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', color: '#475569', fontFamily: 'Inter, sans-serif', marginBottom: '24px',
  },
  title: { fontSize: '36px', fontWeight: 900, color: '#1e293b', marginBottom: '8px' },
  subtitle: { fontSize: '16px', color: '#64748b', marginBottom: '32px' },
  faqList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  faqItem: {
    background: 'white', borderRadius: '14px',
    border: '1px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
  },
  faqQ: {
    width: '100%', padding: '18px 20px',
    background: 'none', border: 'none',
    display: 'flex', alignItems: 'center', gap: '14px',
    fontSize: '15px', fontWeight: 600,
    cursor: 'pointer', textAlign: 'left',
    fontFamily: 'Inter, sans-serif', lineHeight: 1.4,
  },
  qNum: {
    fontSize: '12px', fontWeight: 800, color: '#3b82f6',
    background: '#dbeafe', width: '28px', height: '28px',
    borderRadius: '8px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  faqA: {
    padding: '0 20px 18px 62px', fontSize: '14px',
    color: '#64748b', lineHeight: 1.7,
  },
};

export default FAQPage;
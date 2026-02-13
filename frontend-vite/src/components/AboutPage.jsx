import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaArrowLeft, FaRobot, FaLanguage, FaShieldAlt, FaUsers, FaHeart, FaBullseye, FaLightbulb } from 'react-icons/fa';

const AboutPage = () => {
  const { resetApp } = useApp();

  return (
    <div style={styles.page}>
      <motion.div style={styles.container} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <button onClick={resetApp} style={styles.backBtn}><FaArrowLeft /> Back to Home</button>

        <h1 style={styles.title}>🏛️ About GovScheme AI</h1>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}><FaBullseye style={{ color: '#3b82f6' }} /> Our Mission</h2>
          <p style={styles.text}>
            GovScheme AI is a platform that aims to offer <strong>one-stop search and discovery</strong> of
            Government schemes. We believe every Indian citizen deserves to know about the benefits
            the government has designed for them.
          </p>
          <p style={styles.text}>
            It provides an innovative, <strong>technology-based solution</strong> to discover scheme information
            based upon the eligibility of the citizen. No more visiting multiple websites or
            standing in long queues just to find which schemes you qualify for.
          </p>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}><FaLightbulb style={{ color: '#f97316' }} /> How It Works</h2>
          <ol style={styles.list}>
            <li>User fills a simple multi-step form with personal details</li>
            <li>Our AI matching engine analyzes the profile against 200+ schemes</li>
            <li>Each scheme receives a relevance score (0-100%)</li>
            <li>Results are displayed with full details and apply links</li>
            <li>Everything is available in 12 Indian languages</li>
            <li>AI chatbot helps answer follow-up questions</li>
          </ol>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}><FaRobot style={{ color: '#8b5cf6' }} /> Technology</h2>
          <div style={styles.techGrid}>
            {[
              { label: 'Frontend', value: 'React + Vite', icon: '⚛️' },
              { label: 'Backend', value: 'Python Flask', icon: '🐍' },
              { label: 'AI/ML', value: 'scikit-learn', icon: '🧠' },
              { label: 'Translation', value: 'Google Translate', icon: '🌐' },
              { label: 'Database', value: 'JSON (No Setup)', icon: '📦' },
              { label: 'Chatbot', value: 'TF-IDF + LogReg', icon: '🤖' },
            ].map(t => (
              <div key={t.label} style={styles.techItem}>
                <span style={{ fontSize: '24px' }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>{t.label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{t.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}><FaHeart style={{ color: '#ef4444' }} /> Key Features</h2>
          <div style={styles.featuresGrid}>
            {[
              { icon: <FaRobot />, title: 'AI Powered', desc: 'Smart matching engine with ML-based chatbot', color: '#3b82f6' },
              { icon: <FaLanguage />, title: '12 Languages', desc: 'Hindi, Tamil, Telugu, Bengali, and more', color: '#8b5cf6' },
              { icon: <FaShieldAlt />, title: '100% Free', desc: 'No registration, no fees, no hidden charges', color: '#22c55e' },
              { icon: <FaUsers />, title: 'For Everyone', desc: 'Farmers, students, women, elderly, disabled', color: '#f97316' },
            ].map(f => (
              <div key={f.title} style={styles.featureCard}>
                <div style={{ ...styles.featureIcon, background: `${f.color}15`, color: f.color }}>{f.icon}</div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{f.title}</h4>
                <p style={{ fontSize: '13px', color: '#64748b' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
};

const styles = {
  page: { padding: '40px 24px', maxWidth: '900px', margin: '0 auto' },
  container: { display: 'flex', flexDirection: 'column', gap: '24px' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', background: '#f1f5f9', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', color: '#475569', fontFamily: 'Inter, sans-serif',
    width: 'fit-content',
  },
  title: { fontSize: '36px', fontWeight: 900, color: '#1e293b' },
  card: {
    background: 'white', borderRadius: '20px', padding: '32px',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  sectionTitle: {
    fontSize: '20px', fontWeight: 700, color: '#1e293b',
    marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  text: { fontSize: '15px', color: '#475569', lineHeight: 1.8, marginBottom: '12px' },
  list: { paddingLeft: '20px', fontSize: '15px', color: '#475569', lineHeight: 2 },
  techGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px',
  },
  techItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px', background: '#f8faff', borderRadius: '12px', border: '1px solid #e2e8f0',
  },
  featuresGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
  },
  featureCard: {
    padding: '20px', background: '#f8faff', borderRadius: '14px',
    border: '1px solid #e2e8f0',
  },
  featureIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', marginBottom: '12px',
  },
};

export default AboutPage;
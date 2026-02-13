import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaLandmark, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CentralSchemes = () => {
  const { MINISTRIES } = useApp();
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? MINISTRIES : MINISTRIES.slice(0, 12);

  return (
    <section id="central" style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={styles.label}>🇮🇳 Central Government</span>
          <h2 style={styles.heading}>
            Explore schemes of <span style={{ color: '#1e40af' }}>Central Government</span>
          </h2>
        </motion.div>

        <div style={styles.grid}>
          {displayed.map((ministry, i) => (
            <motion.div
              key={ministry.name}
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(30,64,175,0.1)', borderColor: '#3b82f6' }}
            >
              <div style={styles.iconCircle}>
                <FaLandmark style={{ fontSize: '22px', color: '#1e40af' }} />
              </div>
              <h3 style={styles.ministryName}>{ministry.name}</h3>
              <span style={styles.schemeCount}>{ministry.count} Schemes</span>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <motion.button
            style={styles.viewBtn}
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showAll ? <><FaChevronUp /> Show Less</> : <><FaChevronDown /> View All Ministries</>}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: { padding: '80px 24px', background: 'white' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '50px' },
  label: {
    display: 'inline-block', background: '#dbeafe', color: '#1e40af',
    padding: '6px 20px', borderRadius: '50px', fontSize: '14px',
    fontWeight: 600, marginBottom: '16px',
  },
  heading: { fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#1e293b' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  card: {
    background: '#f8faff', borderRadius: '14px', padding: '20px',
    display: 'flex', alignItems: 'center', gap: '14px',
    border: '2px solid #e2e8f0', transition: 'all 0.3s ease', cursor: 'pointer',
  },
  iconCircle: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: '#dbeafe', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  ministryName: { fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3, flex: 1 },
  schemeCount: {
    fontSize: '11px', fontWeight: 700, color: '#3b82f6',
    background: '#dbeafe', padding: '4px 10px', borderRadius: '50px',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  viewBtn: {
    padding: '12px 30px', background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
    color: 'white', border: 'none', borderRadius: '50px',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: 'Inter, sans-serif',
  },
};

export default CentralSchemes;
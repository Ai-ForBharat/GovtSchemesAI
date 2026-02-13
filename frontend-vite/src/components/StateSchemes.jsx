import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const StateSchemes = () => {
  const { STATE_DATA } = useApp();
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? STATE_DATA : STATE_DATA.slice(0, 16);

  return (
    <section id="states" style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={styles.label}>🗺️ State & UT Schemes</span>
          <h2 style={styles.heading}>
            Explore schemes by <span style={{ color: '#f97316' }}>States & Union Territories</span>
          </h2>
        </motion.div>

        <div style={styles.grid}>
          {displayed.map((state, i) => (
            <motion.div
              key={state.name}
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(249,115,22,0.1)', borderColor: '#f97316' }}
            >
              <div style={styles.cardTop}>
                <div style={styles.stateIcon}>
                  <FaMapMarkerAlt style={{ color: '#f97316', fontSize: '18px' }} />
                </div>
                <h3 style={styles.stateName}>{state.name}</h3>
              </div>

              <div style={styles.statsRow}>
                {state.type === 'UT' ? (
                  <span style={{ ...styles.statBadge, background: '#fef3c7', color: '#92400e' }}>
                    {state.ut} UT
                  </span>
                ) : (
                  <span style={{ ...styles.statBadge, background: '#dcfce7', color: '#16a34a' }}>
                    {state.state} State
                  </span>
                )}
                <span style={{ ...styles.statBadge, background: '#dbeafe', color: '#1e40af' }}>
                  {state.central} Central
                </span>
              </div>
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
            {showAll ? <><FaChevronUp /> Show Less</> : <><FaChevronDown /> View All States</>}
          </motion.button>
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: { padding: '80px 24px', background: '#fffbf5' },
  container: { maxWidth: '1200px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '50px' },
  label: {
    display: 'inline-block', background: '#ffedd5', color: '#ea580c',
    padding: '6px 20px', borderRadius: '50px', fontSize: '14px',
    fontWeight: 600, marginBottom: '16px',
  },
  heading: { fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: '#1e293b' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  card: {
    background: 'white', borderRadius: '14px', padding: '20px',
    border: '2px solid #e2e8f0', transition: 'all 0.3s ease', cursor: 'pointer',
  },
  cardTop: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
  },
  stateIcon: {
    width: '42px', height: '42px', borderRadius: '10px',
    background: '#fff7ed', display: 'flex', alignItems: 'center',
    justifyContent: 'center', flexShrink: 0,
  },
  stateName: { fontSize: '14px', fontWeight: 700, color: '#1e293b', lineHeight: 1.3 },
  statsRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  statBadge: {
    padding: '4px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: 700,
  },
  viewBtn: {
    padding: '12px 30px', background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white', border: 'none', borderRadius: '50px',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: 'Inter, sans-serif',
  },
};

export default StateSchemes;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import SchemeCard from './SchemeCard';
import SchemeModal from './SchemeModal';
import { FaRedo, FaFilter } from 'react-icons/fa';

const Results = () => {
  const { results, totalMatches, resetApp } = useApp();
  const [filter, setFilter] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const filteredResults = filter === 'all'
    ? results
    : results.filter(s => s.type === filter);

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h2 style={styles.title}>📋 Your Eligible Schemes</h2>
          <p style={styles.count}>
            Found <strong style={{ color: '#3b82f6' }}>{totalMatches}</strong> schemes matching your profile
          </p>
        </div>
        <motion.button
          style={styles.resetBtn}
          onClick={resetApp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaRedo /> Search Again
        </motion.button>
      </motion.div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <FaFilter style={{ color: '#94a3b8', fontSize: '14px' }} />
        {[
          { key: 'all', label: 'All Schemes' },
          { key: 'central', label: '🇮🇳 Central' },
          { key: 'state', label: '🏛️ State' },
        ].map(f => (
          <motion.button
            key={f.key}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f.key)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {f.label}
            {f.key !== 'all' && (
              <span style={styles.filterCount}>
                {results.filter(s => f.key === 'all' || s.type === f.key).length}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {filteredResults.length > 0 ? (
          filteredResults.map((scheme, index) => (
            <SchemeCard
              key={scheme.id || index}
              scheme={scheme}
              index={index}
              onViewDetails={setSelectedScheme}
            />
          ))
        ) : (
          <div style={styles.empty}>
            <h3>😔 No schemes found for this filter</h3>
            <p>Try selecting a different filter</p>
          </div>
        )}
      </div>

      {selectedScheme && (
        <SchemeModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: 'clamp(24px, 5vw, 40px) clamp(12px, 3vw, 20px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: 'clamp(16px, 3vw, 24px)',
  },
  title: {
    fontSize: 'clamp(22px, 5vw, 28px)',
    fontWeight: 800,
    color: '#1e293b',
  },
  count: {
    color: '#64748b',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    marginTop: '4px',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: 'clamp(8px, 2vw, 10px) clamp(16px, 3vw, 24px)',
    background: 'white',
    border: '2px solid #3b82f6',
    color: '#3b82f6',
    borderRadius: '12px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(6px, 1.5vw, 10px)',
    marginBottom: 'clamp(20px, 4vw, 28px)',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: 'clamp(6px, 1.5vw, 8px) clamp(14px, 3vw, 20px)',
    border: '2px solid #e2e8f0',
    borderRadius: '50px',
    background: 'white',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    color: '#64748b',
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    borderColor: '#3b82f6',
  },
  filterCount: {
    background: 'rgba(255,255,255,0.2)',
    padding: '1px 8px',
    borderRadius: '50px',
    fontSize: 'clamp(10px, 2vw, 12px)',
    fontWeight: 700,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 80vw, 340px), 1fr))',
    gap: 'clamp(14px, 3vw, 20px)',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px) 20px',
    color: '#94a3b8',
  },
};

export default Results;
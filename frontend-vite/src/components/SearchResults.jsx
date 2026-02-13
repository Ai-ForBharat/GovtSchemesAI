import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import SchemeCard from './SchemeCard';
import SchemeModal from './SchemeModal';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';

const SearchResults = () => {
  const { searchQuery, searchResults, resetApp } = useApp();
  const [selectedScheme, setSelectedScheme] = useState(null);

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={resetApp} style={styles.backBtn}>
          <FaArrowLeft /> Back to Home
        </button>

        <div style={styles.header}>
          <FaSearch style={{ color: '#3b82f6', fontSize: '24px' }} />
          <div>
            <h2 style={styles.title}>Search Results for "{searchQuery}"</h2>
            <p style={styles.count}>{searchResults.length} schemes found</p>
          </div>
        </div>

        <div style={styles.grid}>
          {searchResults.length > 0 ? (
            searchResults.map((scheme, i) => (
              <SchemeCard
                key={scheme.id || i}
                scheme={{ ...scheme, match_score: 100 }}
                index={i}
                onViewDetails={setSelectedScheme}
              />
            ))
          ) : (
            <div style={styles.empty}>
              <h3>😔 No schemes found for "{searchQuery}"</h3>
              <p>Try different keywords like "farmer", "housing", "health"</p>
            </div>
          )}
        </div>
      </motion.div>

      {selectedScheme && (
        <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', background: '#f1f5f9', border: 'none',
    borderRadius: '10px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', color: '#475569', fontFamily: 'Inter, sans-serif',
    marginBottom: '24px',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px',
  },
  title: { fontSize: '24px', fontWeight: 800, color: '#1e293b' },
  count: { color: '#64748b', fontSize: '14px', marginTop: '2px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
  },
  empty: {
    gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', color: '#94a3b8',
  },
};

export default SearchResults;
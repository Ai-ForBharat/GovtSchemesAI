import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import SchemeCard from './SchemeCard';
import SchemeModal from './SchemeModal';
import {
  FaHome, FaSearch, FaFilter, FaTimes,
  FaSortAmountDown, FaCheckCircle
} from 'react-icons/fa';

const SearchResults = () => {
  const { searchQuery, searchResults, setCurrentView } = useApp();
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  const goHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredResults = (() => {
    let results = filter === 'all'
      ? searchResults
      : searchResults.filter(s => {
          const name = (s.name || '').toLowerCase();
          const desc = (s.description || '').toLowerCase();
          const combined = `${name} ${desc}`;

          const centralKeywords = ['pradhan mantri', 'pm ', 'national', 'central', 'bharat', 'india'];
          const isCentral = centralKeywords.some(kw => combined.includes(kw));

          if (filter === 'central') return isCentral;
          if (filter === 'state') return !isCentral;
          return true;
        });

    if (sortBy === 'name') {
      results = [...results].sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
    }

    return results;
  })();

  const centralCount = searchResults.filter(s => {
    const combined = `${(s.name || '')} ${(s.description || '')}`.toLowerCase();
    return ['pradhan mantri', 'pm ', 'national', 'central', 'bharat'].some(kw => combined.includes(kw));
  }).length;
  const stateCount = searchResults.length - centralCount;

  return (
    <section style={styles.fullPage}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />
      <div style={styles.bgDecor3} />

      <div style={styles.container}>

        {/* Back */}
        <motion.div
          style={styles.topNav}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={goHome}
            style={styles.backBtn}
            whileHover={{ scale: 1.05, background: '#1e293b' }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome /> Back to Home
          </motion.button>
        </motion.div>

        {/* Header Card */}
        <motion.div
          style={styles.headerCard}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div style={styles.headerLeft}>
            <motion.div
              style={styles.headerIcon}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
            >
              <FaSearch style={{ fontSize: '24px', color: '#22c55e' }} />
            </motion.div>
            <div>
              <h2 style={styles.title}>
                Search Results for "<span style={styles.titleHighlight}>{searchQuery}</span>"
              </h2>
              <p style={styles.count}>
                Found <strong style={styles.countHighlight}>{searchResults.length}</strong> schemes matching your search
              </p>
            </div>
          </div>

          <motion.button
            style={styles.newSearchBtn}
            onClick={goHome}
            whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(59,130,246,0.3)' }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSearch /> New Search
          </motion.button>
        </motion.div>

        {/* Stats Row */}
        {searchResults.length > 0 && (
          <motion.div
            style={styles.statsRow}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { label: 'Total Found', value: searchResults.length, icon: '📊', color: '#22c55e' },
              { label: 'Central', value: centralCount, icon: '🇮🇳', color: '#3b82f6' },
              { label: 'State', value: stateCount, icon: '🏛️', color: '#8b5cf6' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                style={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.03, borderColor: stat.color }}
              >
                <span style={styles.statIcon}>{stat.icon}</span>
                <span style={{ ...styles.statNum, color: stat.color }}>{stat.value}</span>
                <span style={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Filter + Sort Bar */}
        {searchResults.length > 0 && (
          <motion.div
            style={styles.filterBar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div style={styles.filterLeft}>
              <FaFilter style={{ color: '#64748b', fontSize: '12px' }} />
              <span style={styles.filterLabel}>Filter:</span>
              <div style={styles.filterBtns}>
                {[
                  { key: 'all', label: 'All', emoji: '📊', count: searchResults.length },
                  { key: 'central', label: 'Central', emoji: '🇮🇳', count: centralCount },
                  { key: 'state', label: 'State', emoji: '🏛️', count: stateCount },
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
                    {f.emoji} {f.label}
                    <span style={{
                      ...styles.filterCount,
                      ...(filter === f.key ? styles.filterCountActive : {}),
                    }}>
                      {f.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={styles.sortSection}>
              <FaSortAmountDown style={{ color: '#64748b', fontSize: '12px' }} />
              <select
                style={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="name">By Name</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Results Info */}
        {searchResults.length > 0 && (
          <motion.div
            style={styles.resultsInfo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span style={styles.resultsInfoText}>
              Showing <strong style={{ color: '#22c55e' }}>{filteredResults.length}</strong> of {searchResults.length} schemes
              {filter !== 'all' && (
                <span style={styles.activeFilterTag}>
                  {filter === 'central' ? '🇮🇳 Central' : '🏛️ State'}
                  <button
                    style={styles.clearFilterBtn}
                    onClick={() => setFilter('all')}
                  >
                    ✕
                  </button>
                </span>
              )}
            </span>
          </motion.div>
        )}

        {/* Search term pills */}
        {searchResults.length > 0 && (
          <motion.div
            style={styles.searchTermRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span style={styles.searchTermLabel}>Search:</span>
            <span style={styles.searchTermPill}>
              <FaSearch style={{ fontSize: '10px' }} />
              {searchQuery}
              <button style={styles.searchTermClear} onClick={goHome}>
                <FaTimes style={{ fontSize: '8px' }} />
              </button>
            </span>
          </motion.div>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div style={styles.grid}>
              {filteredResults.length > 0 ? (
                filteredResults.map((scheme, i) => (
                  <motion.div
                    key={scheme.id || i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * Math.min(i, 10) }}
                  >
                    <SchemeCard
                      scheme={{ ...scheme, match_score: scheme.match_score || 100 }}
                      index={i}
                      onViewDetails={setSelectedScheme}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  style={styles.empty}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div style={styles.emptyIcon}>
                    {filter !== 'all' ? (filter === 'central' ? '🇮🇳' : '🏛️') : '🔍'}
                  </div>
                  <h3 style={styles.emptyTitle}>
                    {filter !== 'all'
                      ? `No ${filter} schemes found`
                      : `No schemes found for "${searchQuery}"`}
                  </h3>
                  <p style={styles.emptyText}>
                    {filter !== 'all'
                      ? 'Try a different filter or search again'
                      : 'Try different keywords like "farmer", "housing", "health", "education"'}
                  </p>
                  <div style={styles.emptyActions}>
                    {filter !== 'all' && (
                      <motion.button
                        style={styles.emptyBtn}
                        onClick={() => setFilter('all')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Show All Results
                      </motion.button>
                    )}
                    <motion.button
                      style={styles.emptyBtnOutline}
                      onClick={goHome}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaSearch /> New Search
                    </motion.button>
                  </div>

                  {/* Suggestion chips */}
                  <div style={styles.suggestions}>
                    <span style={styles.suggestLabel}>Try searching:</span>
                    <div style={styles.suggestChips}>
                      {['Farmer', 'Student', 'Health', 'Housing', 'Education', 'Women'].map(s => (
                        <span key={s} style={styles.suggestChip}>{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        {filteredResults.length > 0 && (
          <motion.div
            style={styles.bottomCta}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <p style={styles.bottomCtaText}>
              Want personalized scheme recommendations based on your profile?
            </p>
            <motion.button
              style={styles.bottomCtaBtn}
              onClick={() => {
                setCurrentView('form');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(34,197,94,0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaCheckCircle /> Find Schemes for Me
            </motion.button>
          </motion.div>
        )}
      </div>

      {selectedScheme && (
        <SchemeModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </section>
  );
};

const styles = {
  fullPage: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #020617 0%, #0f172a 30%, #0f172a 70%, #020617 100%)',
    position: 'relative',
    overflow: 'hidden',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-200px',
    right: '-200px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '800px',
    height: '800px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
  },

  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: 'clamp(24px, 4vw, 40px) clamp(12px, 3vw, 20px)',
    position: 'relative',
    zIndex: 1,
  },

  /* Top Nav */
  topNav: {
    marginBottom: '20px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '50px',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease',
  },

  /* Header Card */
  headerCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: 'clamp(20px, 4vw, 28px)',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: 'clamp(16px, 3vw, 20px)',
    padding: 'clamp(20px, 4vw, 28px)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
    border: '2px solid rgba(34,197,94,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    fontSize: 'clamp(18px, 3.5vw, 24px)',
    fontWeight: 800,
    color: '#ffffff',
    margin: 0,
  },
  titleHighlight: {
    color: '#22c55e',
  },
  count: {
    color: '#94a3b8',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    marginTop: '4px',
  },
  countHighlight: {
    color: '#22c55e',
    fontSize: 'clamp(14px, 3vw, 18px)',
    fontWeight: 900,
  },
  newSearchBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },

  /* Stats */
  statsRow: {
    display: 'flex',
    gap: 'clamp(10px, 2vw, 16px)',
    marginBottom: 'clamp(20px, 4vw, 28px)',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: 'clamp(14px, 3vw, 20px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  statIcon: { fontSize: '20px' },
  statNum: {
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 900,
  },
  statLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#64748b',
    fontWeight: 600,
  },

  /* Filter Bar */
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'clamp(10px, 2vw, 16px)',
    marginBottom: 'clamp(8px, 2vw, 12px)',
    flexWrap: 'wrap',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)',
  },
  filterLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  filterBtns: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '6px 16px',
    border: '2px solid #1e293b',
    borderRadius: '50px',
    background: '#020617',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    color: '#94a3b8',
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    borderColor: '#22c55e',
    boxShadow: '0 4px 15px rgba(34,197,94,0.3)',
  },
  filterCount: {
    background: 'rgba(255,255,255,0.1)',
    padding: '1px 8px',
    borderRadius: '50px',
    fontSize: '10px',
    fontWeight: 700,
    color: '#64748b',
  },
  filterCountActive: {
    background: 'rgba(255,255,255,0.25)',
    color: '#ffffff',
  },
  sortSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sortSelect: {
    padding: '6px 12px',
    background: '#020617',
    border: '2px solid #1e293b',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    outline: 'none',
  },

  /* Results Info */
  resultsInfo: {
    marginBottom: '8px',
    paddingLeft: '4px',
  },
  resultsInfoText: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  activeFilterTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 12px',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    borderRadius: '50px',
    fontSize: '12px',
    color: '#22c55e',
    fontWeight: 600,
  },
  clearFilterBtn: {
    background: 'none',
    border: 'none',
    color: '#22c55e',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '0 2px',
    fontWeight: 700,
  },

  /* Search Term */
  searchTermRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: 'clamp(16px, 3vw, 24px)',
    paddingLeft: '4px',
  },
  searchTermLabel: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: 600,
  },
  searchTermPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 14px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.3)',
    borderRadius: '50px',
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: 600,
  },
  searchTermClear: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    padding: '0 2px',
    display: 'flex',
    alignItems: 'center',
  },

  /* Grid */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 80vw, 340px), 1fr))',
    gap: 'clamp(14px, 3vw, 20px)',
  },

  /* Empty */
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 'clamp(50px, 10vw, 80px) 20px',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '20px',
  },
  emptyIcon: {
    fontSize: '56px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: 'clamp(18px, 4vw, 22px)',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '8px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
    maxWidth: '400px',
    margin: '0 auto 24px',
    lineHeight: 1.6,
  },
  emptyActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  emptyBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  emptyBtnOutline: {
    padding: '12px 28px',
    background: 'transparent',
    color: '#94a3b8',
    border: '2px solid #1e293b',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  suggestions: {
    paddingTop: '20px',
    borderTop: '1px solid #1e293b',
  },
  suggestLabel: {
    fontSize: '12px',
    color: '#475569',
    fontWeight: 600,
    display: 'block',
    marginBottom: '10px',
  },
  suggestChips: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  suggestChip: {
    padding: '6px 16px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '50px',
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: 600,
    cursor: 'pointer',
  },

  /* Bottom CTA */
  bottomCta: {
    textAlign: 'center',
    marginTop: 'clamp(30px, 5vw, 50px)',
    padding: 'clamp(24px, 4vw, 36px)',
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '20px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  bottomCtaText: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: '#94a3b8',
    marginBottom: '16px',
  },
  bottomCtaBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
};

export default SearchResults;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import SchemeCard from './SchemeCard';
import SchemeModal from './SchemeModal';
import {
  FaHome, FaSearch, FaFilter, FaTimes,
  FaSortAmountDown, FaCheckCircle,
  FaChartBar, FaFlag, FaLandmark
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
          const combined = `${(s.name || '')} ${(s.description || '')}`.toLowerCase();
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
    <div style={styles.page}>

      {/* ── HERO ── */}
      <section style={styles.hero}>
        <div style={styles.heroDecor1} />
        <div style={styles.heroDecor2} />

        <div style={styles.heroContent}>
          <motion.button
            onClick={goHome}
            style={styles.backBtn}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, background: '#f3f4f6' }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome /> Back to Home
          </motion.button>

          <motion.div
            style={styles.heroIconCircle}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <FaSearch style={{ fontSize: '28px', color: '#f97316' }} />
          </motion.div>

          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ color: '#1a1a1a' }}>Results for "</span>
            <span style={{ color: '#f97316' }}>{searchQuery}</span>
            <span style={{ color: '#1a1a1a' }}>"</span>
          </motion.h1>

          <motion.p
            style={styles.heroSub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Found <strong style={{ color: '#f97316' }}>{searchResults.length}</strong> schemes matching your search
          </motion.p>

          <motion.button
            style={styles.heroCta}
            onClick={goHome}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <FaSearch /> New Search
          </motion.button>
        </div>
      </section>

      {/* ── STATS ── */}
      {searchResults.length > 0 && (
        <section style={styles.statsSection}>
          <div style={styles.statsInner}>
            <motion.div
              style={styles.statsRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { label: 'Total Found', value: searchResults.length, icon: <FaChartBar /> },
                { label: 'Central', value: centralCount, icon: <FaFlag /> },
                { label: 'State', value: stateCount, icon: <FaLandmark /> },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  style={styles.statCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ scale: 1.03, borderColor: 'rgba(249,115,22,0.3)' }}
                >
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <span style={styles.statNum}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── MAIN CONTENT ── */}
      <section style={styles.mainSection}>
        <div style={styles.mainDecor1} />
        <div style={styles.mainDecor2} />

        <div style={styles.mainInner}>

          {/* Filter Bar */}
          {searchResults.length > 0 && (
            <motion.div
              style={styles.filterBar}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div style={styles.filterLeft}>
                <FaFilter style={{ color: '#6b7280', fontSize: '12px' }} />
                <span style={styles.filterLabel}>Filter:</span>
                <div style={styles.filterBtns}>
                  {[
                    { key: 'all', label: 'All', icon: <FaChartBar style={{ fontSize: '11px' }} />, count: searchResults.length },
                    { key: 'central', label: 'Central', icon: <FaFlag style={{ fontSize: '11px' }} />, count: centralCount },
                    { key: 'state', label: 'State', icon: <FaLandmark style={{ fontSize: '11px' }} />, count: stateCount },
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
                      {f.icon} {f.label}
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
                <FaSortAmountDown style={{ color: '#6b7280', fontSize: '12px' }} />
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
              style={styles.resultsInfoRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span style={styles.resultsInfoText}>
                Showing <strong style={{ color: '#f97316' }}>{filteredResults.length}</strong> of {searchResults.length} schemes
                {filter !== 'all' && (
                  <span style={styles.activeFilterTag}>
                    {filter === 'central'
                      ? <><FaFlag style={{ fontSize: '10px' }} /> Central</>
                      : <><FaLandmark style={{ fontSize: '10px' }} /> State</>
                    }
                    <button style={styles.clearFilterBtn} onClick={() => setFilter('all')}>
                      <FaTimes style={{ fontSize: '8px' }} />
                    </button>
                  </span>
                )}
              </span>
              <span style={styles.searchPill}>
                <FaSearch style={{ fontSize: '10px' }} />
                {searchQuery}
                <button style={styles.searchPillClear} onClick={goHome}>
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
                      style={{ height: '100%' }}
                    >
                      <SchemeCard
                        scheme={scheme}
                        index={i}
                        onViewDetails={setSelectedScheme}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    style={styles.emptyCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div style={styles.emptyIconWrap}>
                      {filter !== 'all'
                        ? (filter === 'central'
                          ? <FaFlag style={{ fontSize: '48px', color: '#f97316' }} />
                          : <FaLandmark style={{ fontSize: '48px', color: '#f97316' }} />)
                        : <FaSearch style={{ fontSize: '48px', color: '#f97316' }} />
                      }
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
                          style={styles.primaryBtn}
                          onClick={() => setFilter('all')}
                          whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Show All Results
                        </motion.button>
                      )}
                      <motion.button
                        style={styles.secondaryBtn}
                        onClick={goHome}
                        whileHover={{ scale: 1.05, background: '#f3f4f6' }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaSearch /> New Search
                      </motion.button>
                    </div>

                    <div style={styles.suggestions}>
                      <span style={styles.suggestLabel}>Try searching:</span>
                      <div style={styles.suggestChips}>
                        {['Farmer', 'Student', 'Health', 'Housing', 'Education', 'Women'].map(s => (
                          <motion.span
                            key={s}
                            style={styles.suggestChip}
                            whileHover={{ scale: 1.05, borderColor: 'rgba(249,115,22,0.4)', color: '#f97316' }}
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      {filteredResults.length > 0 && (
        <section style={styles.ctaSection}>
          <div style={styles.ctaDecor1} />
          <div style={styles.ctaDecor2} />

          <motion.div
            style={styles.ctaContent}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={styles.ctaTitle}>
              Want <span style={{ color: '#f97316' }}>Personalized</span> Recommendations?
            </h2>
            <p style={styles.ctaSub}>
              Get scheme recommendations tailored to your profile and eligibility.
            </p>
            <div style={styles.ctaBtns}>
              <motion.button
                style={styles.primaryBtn}
                onClick={() => {
                  setCurrentView('form');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCheckCircle /> Find Schemes for Me
              </motion.button>
              <motion.button
                style={styles.secondaryBtn}
                onClick={goHome}
                whileHover={{ scale: 1.05, background: '#f3f4f6' }}
                whileTap={{ scale: 0.95 }}
              >
                <FaHome /> Go Home
              </motion.button>
            </div>
          </motion.div>
        </section>
      )}

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

  page: {
    fontFamily: 'Inter, sans-serif',
    background: '#ffffff',
    color: '#1a1a1a',
    minHeight: '100vh',
  },

  hero: {
    textAlign: 'center',
    padding: 'clamp(80px, 12vw, 130px) 20px clamp(50px, 6vw, 70px)',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', pointerEvents: 'none',
  },
  heroDecor2: {
    position: 'absolute', bottom: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)', pointerEvents: 'none',
  },
  heroContent: { position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px',
    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '50px',
    color: '#1a1a1a', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', marginBottom: '30px', transition: 'all 0.3s ease',
  },
  heroIconCircle: {
    width: '64px', height: '64px', borderRadius: '20px',
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
  },
  heroTitle: { fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, marginBottom: '14px', lineHeight: 1.15 },
  heroSub: { fontSize: 'clamp(15px, 2.5vw, 18px)', color: '#1a1a1a', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.7 },
  heroCta: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px',
    background: '#f97316', color: '#ffffff', border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },

  statsSection: { padding: '0 20px clamp(30px, 4vw, 50px)', background: '#ffffff' },
  statsInner: { maxWidth: '1200px', margin: '0 auto' },
  statsRow: { display: 'flex', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px',
    padding: 'clamp(18px, 3vw, 28px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease', cursor: 'default',
  },
  statIcon: { fontSize: '18px', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: '#f97316' },
  statLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1a1a1a', fontWeight: 600 },

  mainSection: {
    padding: 'clamp(40px, 6vw, 70px) 20px clamp(60px, 10vw, 100px)',
    background: '#f9fafb', position: 'relative', overflow: 'hidden',
  },
  mainDecor1: {
    position: 'absolute', top: '-100px', left: '-100px', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)', pointerEvents: 'none',
  },
  mainDecor2: {
    position: 'absolute', bottom: '-100px', right: '-100px', width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 70%)', pointerEvents: 'none',
  },
  mainInner: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 },

  filterBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 'clamp(10px, 2vw, 16px)', marginBottom: 'clamp(16px, 3vw, 24px)', flexWrap: 'wrap',
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px',
    padding: 'clamp(14px, 2.5vw, 20px) clamp(20px, 3vw, 28px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  filterLeft: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  filterLabel: { fontSize: '12px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px' },
  filterBtns: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#ffffff',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s ease', color: '#1a1a1a',
  },
  filterBtnActive: { background: 'rgba(249,115,22,0.08)', color: '#f97316', borderColor: '#f97316' },
  filterCount: {
    background: '#f3f4f6', padding: '2px 8px', borderRadius: '6px',
    fontSize: '10px', fontWeight: 700, color: '#1a1a1a', border: '1px solid #e5e7eb',
  },
  filterCountActive: { background: 'rgba(249,115,22,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' },
  sortSection: { display: 'flex', alignItems: 'center', gap: '8px' },
  sortSelect: {
    padding: '8px 14px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px',
    color: '#1a1a1a', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
    cursor: 'pointer', outline: 'none', transition: 'all 0.3s ease',
  },

  resultsInfoRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '10px', marginBottom: 'clamp(20px, 3vw, 28px)', paddingLeft: '4px',
  },
  resultsInfoText: {
    fontSize: 'clamp(13px, 2.5vw, 15px)', color: '#1a1a1a', fontWeight: 500,
    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', lineHeight: 1.8,
  },
  activeFilterTag: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px',
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)',
    borderRadius: '50px', fontSize: '11px', color: '#f97316', fontWeight: 600,
  },
  clearFilterBtn: {
    background: 'none', border: 'none', color: '#f97316', fontSize: '12px',
    cursor: 'pointer', padding: '0 2px', fontWeight: 700, display: 'flex', alignItems: 'center',
  },
  searchPill: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
    background: '#ffffff', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '50px',
    fontSize: '12px', color: '#f97316', fontWeight: 600, boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  },
  searchPillClear: {
    background: 'none', border: 'none', color: '#f97316',
    cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 80vw, 340px), 1fr))',
    gap: 'clamp(16px, 3vw, 24px)',
    alignItems: 'stretch',
  },

  emptyCard: {
    gridColumn: '1 / -1', textAlign: 'center', padding: 'clamp(50px, 10vw, 80px) 20px',
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  emptyIconWrap: { marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', lineHeight: 1.2 },
  emptyText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)', color: '#1a1a1a', maxWidth: '400px',
    margin: '0 auto 24px', lineHeight: 1.8,
  },
  emptyActions: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' },
  suggestions: { paddingTop: '24px', borderTop: '1px solid #e5e7eb' },
  suggestLabel: { fontSize: '12px', color: '#1a1a1a', fontWeight: 600, display: 'block', marginBottom: '12px' },
  suggestChips: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' },
  suggestChip: {
    padding: '8px 18px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '50px',
    fontSize: '12px', color: '#1a1a1a', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s ease',
  },

  primaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px',
    background: '#f97316', color: '#ffffff', border: 'none', borderRadius: '14px',
    fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  secondaryBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 36px',
    background: 'transparent', color: '#1a1a1a', border: '2px solid #e5e7eb', borderRadius: '14px',
    fontSize: '16px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
  },

  ctaSection: {
    padding: 'clamp(60px, 10vw, 100px) 20px', background: '#ffffff',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  },
  ctaDecor1: {
    position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '600px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 60%)', pointerEvents: 'none',
  },
  ctaDecor2: {
    position: 'absolute', bottom: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 70%)', pointerEvents: 'none',
  },
  ctaContent: { maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 },
  ctaTitle: { fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, color: '#1a1a1a', marginBottom: '12px', lineHeight: 1.2 },
  ctaSub: { fontSize: 'clamp(14px, 2.5vw, 16px)', color: '#1a1a1a', marginBottom: '28px', lineHeight: 1.7 },
  ctaBtns: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' },
};

export default SearchResults;
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  FaThList, FaMapMarkedAlt, FaLandmark,
  FaChevronDown, FaChevronUp, FaMapMarkerAlt,
  FaSearch, FaTimes, FaCheckCircle
} from 'react-icons/fa';

const SchemeExplorer = () => {
  const {
    CATEGORIES, MINISTRIES, STATE_DATA,
    activeExplorerTab, setActiveExplorerTab
  } = useApp();

  const activeTab = activeExplorerTab;
  const setActiveTab = setActiveExplorerTab;

  const [showAll, setShowAll] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const tabs = [
    { key: 'categories', label: 'Categories', icon: <FaThList />, color: '#22c55e' },
    { key: 'states', label: 'States/UTs', icon: <FaMapMarkedAlt />, color: '#3b82f6' },
    { key: 'central', label: 'Central Ministries', icon: <FaLandmark />, color: '#8b5cf6' },
  ];

  const getFilteredData = () => {
    const query = searchFilter.toLowerCase();
    if (activeTab === 'categories') {
      const filtered = CATEGORIES.filter(c => c.name.toLowerCase().includes(query));
      return showAll ? filtered : filtered.slice(0, 10);
    }
    if (activeTab === 'states') {
      const filtered = STATE_DATA.filter(s => s.name.toLowerCase().includes(query));
      return showAll ? filtered : filtered.slice(0, 12);
    }
    if (activeTab === 'central') {
      const filtered = MINISTRIES.filter(m => m.name.toLowerCase().includes(query));
      return showAll ? filtered : filtered.slice(0, 9);
    }
    return [];
  };

  const getTotalCount = () => {
    if (activeTab === 'categories') return CATEGORIES.length;
    if (activeTab === 'states') return STATE_DATA.length;
    if (activeTab === 'central') return MINISTRIES.length;
    return 0;
  };

  const getDefaultVisible = () => {
    if (activeTab === 'categories') return 10;
    if (activeTab === 'states') return 12;
    if (activeTab === 'central') return 9;
    return 10;
  };

  const filteredData = getFilteredData();
  const activeTabData = tabs.find(t => t.key === activeTab);

  return (
    <section id="scheme-explorer" style={styles.section}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />

      <div style={styles.container}>

        {/* HEADER */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span style={styles.label}>🔍 Explore Schemes</span>
          <h2 style={styles.heading}>
            Discover Government Schemes{' '}
            <span style={{ color: activeTabData.color }}>Your Way</span>
          </h2>
          <p style={styles.headerDesc}>
            Browse schemes by categories, states, or central ministries
          </p>
        </motion.div>

        {/* TABS + SEARCH */}
        <motion.div
          style={styles.tabsWrapper}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.key ? {
                    background: `linear-gradient(135deg, ${tab.color}, ${tab.color}cc)`,
                    color: '#ffffff',
                    borderColor: tab.color,
                    boxShadow: `0 4px 20px ${tab.color}30`,
                  } : {}),
                }}
                onClick={() => {
                  setActiveTab(tab.key);
                  setShowAll(false);
                  setSearchFilter('');
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span style={{
                  ...styles.tabCount,
                  background: activeTab === tab.key
                    ? 'rgba(255,255,255,0.2)'
                    : `${tab.color}15`,
                  color: activeTab === tab.key ? '#ffffff' : tab.color,
                }}>
                  {tab.key === 'categories' ? CATEGORIES.length :
                    tab.key === 'states' ? STATE_DATA.length : MINISTRIES.length}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Search */}
          <div style={styles.searchBar}>
            <FaSearch style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder={`Search ${activeTab === 'categories' ? 'categories' : activeTab === 'states' ? 'states' : 'ministries'}...`}
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setShowAll(true);
              }}
            />
            {searchFilter && (
              <motion.button
                onClick={() => { setSearchFilter(''); setShowAll(false); }}
                style={styles.clearSearch}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.8 }}
              >
                <FaTimes />
              </motion.button>
            )}
          </div>

          {/* Results count */}
          {searchFilter && (
            <motion.span
              style={styles.resultsCount}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Found <strong style={{ color: activeTabData.color }}>{filteredData.length}</strong> results
            </motion.span>
          )}
        </motion.div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >

            {/* CATEGORIES */}
            {activeTab === 'categories' && (
              <div style={styles.gridCategories}>
                {filteredData.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    style={styles.categoryCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{
                      y: -6,
                      boxShadow: `0 15px 40px ${cat.color}15`,
                      borderColor: `${cat.color}40`,
                    }}
                  >
                    <div style={{
                      ...styles.catIcon,
                      background: `${cat.color}10`,
                      border: `1px solid ${cat.color}20`,
                    }}>
                      <span style={{ fontSize: '28px' }}>{cat.icon}</span>
                    </div>
                    <h3 style={styles.catName}>{cat.name}</h3>
                    <div style={{
                      ...styles.catBadge,
                      background: `${cat.color}10`,
                      color: cat.color,
                      borderColor: `${cat.color}25`,
                    }}>
                      {cat.count} Schemes
                    </div>

                    {/* Bottom accent */}
                    <div style={{
                      ...styles.catAccent,
                      background: `linear-gradient(90deg, ${cat.color}, transparent)`,
                    }} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* STATES */}
            {activeTab === 'states' && (
              <div style={styles.gridStates}>
                {filteredData.map((state, i) => (
                  <motion.div
                    key={state.name}
                    style={styles.stateCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 12px 35px rgba(59,130,246,0.12)',
                      borderColor: 'rgba(59,130,246,0.4)',
                    }}
                  >
                    <div style={styles.stateTop}>
                      <div style={styles.stateIconBox}>
                        <FaMapMarkerAlt style={{ color: '#3b82f6', fontSize: '16px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={styles.stateName}>{state.name}</h3>
                        <span style={styles.stateType}>
                          {state.type === 'UT' ? '🏛️ Union Territory' : '📍 State'}
                        </span>
                      </div>
                    </div>
                    <div style={styles.stateStats}>
                      {state.type === 'UT' ? (
                        <span style={{
                          ...styles.statBadge,
                          background: 'rgba(245,158,11,0.1)',
                          color: '#f59e0b',
                          borderColor: 'rgba(245,158,11,0.25)',
                        }}>
                          {state.ut} UT Schemes
                        </span>
                      ) : (
                        <span style={{
                          ...styles.statBadge,
                          background: 'rgba(59,130,246,0.1)',
                          color: '#3b82f6',
                          borderColor: 'rgba(59,130,246,0.25)',
                        }}>
                          {state.state} State Schemes
                        </span>
                      )}
                      <span style={{
                        ...styles.statBadge,
                        background: 'rgba(34,197,94,0.1)',
                        color: '#22c55e',
                        borderColor: 'rgba(34,197,94,0.25)',
                      }}>
                        {state.central} Central
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* CENTRAL MINISTRIES */}
            {activeTab === 'central' && (
              <div style={styles.gridCentral}>
                {filteredData.map((ministry, i) => (
                  <motion.div
                    key={ministry.name}
                    style={styles.ministryCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{
                      y: -5,
                      boxShadow: '0 12px 35px rgba(139,92,246,0.12)',
                      borderColor: 'rgba(139,92,246,0.4)',
                    }}
                  >
                    <div style={styles.ministryIcon}>
                      <FaLandmark style={{ fontSize: '18px', color: '#8b5cf6' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={styles.ministryName}>{ministry.name}</h3>
                    </div>
                    <span style={styles.ministryCount}>{ministry.count} Schemes</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* NO RESULTS */}
            {filteredData.length === 0 && (
              <motion.div
                style={styles.noResults}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div style={styles.noResultsIcon}>🔍</div>
                <h3 style={styles.noResultsTitle}>No results found</h3>
                <p style={styles.noResultsText}>
                  No matches for "<strong>{searchFilter}</strong>". Try different keywords.
                </p>
                <motion.button
                  style={styles.noResultsBtn}
                  onClick={() => { setSearchFilter(''); setShowAll(false); }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear Search
                </motion.button>
              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* VIEW ALL / SHOW LESS */}
        {!searchFilter && getTotalCount() > getDefaultVisible() && (
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <motion.button
              style={{
                ...styles.viewAllBtn,
                background: `linear-gradient(135deg, ${activeTabData.color}, ${activeTabData.color}cc)`,
                boxShadow: `0 6px 20px ${activeTabData.color}30`,
              }}
              onClick={() => setShowAll(!showAll)}
              whileHover={{ scale: 1.05, boxShadow: `0 10px 30px ${activeTabData.color}40` }}
              whileTap={{ scale: 0.95 }}
            >
              {showAll ? (
                <><FaChevronUp /> Show Less</>
              ) : (
                <><FaChevronDown /> View All ({getTotalCount()})</>
              )}
            </motion.button>
          </div>
        )}

        {/* SUMMARY BAR */}
        <motion.div
          style={styles.summaryBar}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { num: '7,500+', label: 'Total Schemes', color: '#22c55e' },
            { num: '36', label: 'States & UTs', color: '#3b82f6' },
            { num: '22+', label: 'Ministries', color: '#8b5cf6' },
            { num: '15', label: 'Categories', color: '#f59e0b' },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <div style={styles.summaryDivider} />}
              <motion.div
                style={styles.summaryItem}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <span style={{ ...styles.summaryNum, color: item.color }}>{item.num}</span>
                <span style={styles.summaryLabel}>{item.label}</span>
              </motion.div>
            </React.Fragment>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: 'clamp(60px, 10vw, 100px) 24px',
    background: '#0f172a',
    position: 'relative',
    overflow: 'hidden',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-150px',
    right: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  /* Header */
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(32px, 5vw, 44px)',
  },
  label: {
    display: 'inline-block',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#22c55e',
    padding: '6px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  heading: {
    fontSize: 'clamp(26px, 4vw, 40px)',
    fontWeight: 800,
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: '12px',
  },
  headerDesc: {
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    color: '#64748b',
    fontWeight: 500,
  },

  /* Tabs */
  tabsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '32px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    background: '#020617',
    padding: '6px',
    borderRadius: '16px',
    border: '1px solid #1e293b',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '12px',
    border: '2px solid transparent',
    background: 'transparent',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Inter, sans-serif',
    color: '#94a3b8',
    whiteSpace: 'nowrap',
  },
  tabCount: {
    padding: '2px 10px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
  },

  /* Search */
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#020617',
    padding: '0 16px',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    width: '100%',
    maxWidth: '400px',
    transition: 'border-color 0.3s',
  },
  searchIcon: {
    color: '#475569',
    fontSize: '13px',
    flexShrink: 0,
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '13px',
    width: '100%',
    fontFamily: 'Inter, sans-serif',
    color: '#ffffff',
    background: 'transparent',
    padding: '12px 0',
  },
  clearSearch: {
    background: '#1e293b',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '10px',
    width: '22px',
    height: '22px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'Inter, sans-serif',
  },
  resultsCount: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 500,
  },

  /* Categories Grid */
  gridCategories: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: '14px',
  },
  categoryCard: {
    background: '#020617',
    borderRadius: '16px',
    padding: '24px 18px',
    textAlign: 'center',
    border: '1px solid #1e293b',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  catIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  catName: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '10px',
    lineHeight: 1.3,
    minHeight: '34px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
  },
  catAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '2px',
  },

  /* States Grid */
  gridStates: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '12px',
  },
  stateCard: {
    background: '#020617',
    borderRadius: '14px',
    padding: '16px',
    border: '1px solid #1e293b',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  stateTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  stateIconBox: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'rgba(59,130,246,0.1)',
    border: '1px solid rgba(59,130,246,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stateName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e2e8f0',
    lineHeight: 1.2,
  },
  stateType: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
    marginTop: '2px',
    display: 'block',
  },
  stateStats: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  statBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid',
  },

  /* Central Grid */
  gridCentral: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '12px',
  },
  ministryCard: {
    background: '#020617',
    borderRadius: '14px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid #1e293b',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  ministryIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ministryName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#e2e8f0',
    lineHeight: 1.3,
    margin: 0,
  },
  ministryCount: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#8b5cf6',
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.25)',
    padding: '4px 12px',
    borderRadius: '50px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },

  /* No Results */
  noResults: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px) 20px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '20px',
  },
  noResultsIcon: {
    fontSize: '44px',
    marginBottom: '12px',
  },
  noResultsTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '6px',
  },
  noResultsText: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '18px',
  },
  noResultsBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },

  /* View All Button */
  viewAllBtn: {
    padding: '14px 32px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'Inter, sans-serif',
  },

  /* Summary Bar */
  summaryBar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 'clamp(20px, 4vw, 40px)',
    marginTop: 'clamp(40px, 6vw, 60px)',
    padding: 'clamp(20px, 4vw, 28px) clamp(20px, 4vw, 36px)',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '20px',
    flexWrap: 'wrap',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  summaryNum: {
    fontSize: 'clamp(24px, 4vw, 30px)',
    fontWeight: 900,
  },
  summaryLabel: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  summaryDivider: {
    width: '1px',
    height: '36px',
    background: '#1e293b',
  },
};

export default SchemeExplorer;
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getRecommendations } from '../api/api';
import { toast } from 'react-toastify';
import SchemeCard from './SchemeCard';
import SchemeModal from './SchemeModal';
import {
  FaRedo, FaFilter, FaHome, FaSortAmountDown,
  FaChartBar, FaFlag, FaLandmark, FaEdit, FaTimes,
  FaUser, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt,
  FaUsers, FaRupeeSign, FaBriefcase, FaGraduationCap,
  FaHeart, FaSearch, FaTractor, FaUserGraduate,
  FaWheelchair, FaMosque, FaClipboardList, FaSave,
  FaChevronDown, FaChevronUp
} from 'react-icons/fa';

const Results = () => {
  const {
    results, totalMatches, resetApp, setCurrentView,
    userProfile, setResults, setTotalMatches, setUserProfile,
    language, STATES
  } = useApp();

  const [filter, setFilter] = useState('all');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [sortBy, setSortBy] = useState('default');
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState(userProfile || {});
  const [expandedSection, setExpandedSection] = useState('personal');

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpdateSearch = async () => {
    setIsUpdating(true);
    const payload = {
      ...editData,
      age: parseInt(editData.age),
      annual_income: parseInt(editData.annual_income),
      language,
    };

    try {
      const data = await getRecommendations(payload);
      if (data.success) {
        setResults(data.schemes);
        setTotalMatches(data.total_matches);
        setUserProfile(payload);
        setEditData(payload);
        setShowEditPanel(false);
        setFilter('all');
        setSortBy('default');
        toast.success(`Updated! Found ${data.total_matches} schemes for you!`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error('Error updating results. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = JSON.stringify(editData) !== JSON.stringify(userProfile);

  const classifiedResults = useMemo(() => {
    return results.map(scheme => {
      if (scheme.type === 'central' || scheme.type === 'state') return scheme;

      const name = (scheme.scheme_name || scheme.name || '').toLowerCase();
      const desc = (scheme.description || '').toLowerCase();
      const ministry = (scheme.ministry || scheme.department || '').toLowerCase();
      const level = (scheme.level || '').toLowerCase();

      const stateKeywords = [
        'state', 'pradesh', 'rajya', 'mukhyamantri', 'cm ',
        'chief minister', 'state government', 'state govt',
        'andhra', 'arunachal', 'assam', 'bihar', 'chhattisgarh',
        'goa', 'gujarat', 'haryana', 'himachal', 'jharkhand',
        'karnataka', 'kerala', 'madhya pradesh', 'maharashtra',
        'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha',
        'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana',
        'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
        'delhi', 'jammu', 'kashmir', 'ladakh', 'chandigarh',
        'puducherry', 'lakshadweep', 'andaman'
      ];

      const centralKeywords = [
        'pradhan mantri', 'pm ', 'pm-', 'national', 'central',
        'bharat', 'india', 'government of india', 'goi',
        'ministry of', 'union', 'centrally sponsored',
        'ayushman', 'jan dhan', 'mudra', 'ujjwala', 'swachh',
        'digital india', 'make in india', 'skill india',
        'atal', 'nehru', 'gandhi', 'indira', 'rajiv'
      ];

      const combined = `${name} ${desc} ${ministry} ${level}`;

      if (level === 'central' || level === 'national') return { ...scheme, type: 'central' };
      if (level === 'state') return { ...scheme, type: 'state' };

      const isCentral = centralKeywords.some(kw => combined.includes(kw));
      const isState = stateKeywords.some(kw => combined.includes(kw));

      if (isCentral && !isState) return { ...scheme, type: 'central' };
      if (isState && !isCentral) return { ...scheme, type: 'state' };
      if (isCentral && isState) return { ...scheme, type: 'central' };
      return { ...scheme, type: 'central' };
    });
  }, [results]);

  const filteredResults = useMemo(() => {
    let filtered = filter === 'all'
      ? classifiedResults
      : classifiedResults.filter(s => s.type === filter);

    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) =>
        (a.scheme_name || a.name || '').localeCompare(b.scheme_name || b.name || '')
      );
    }
    return filtered;
  }, [classifiedResults, filter, sortBy]);

  const centralCount = classifiedResults.filter(s => s.type === 'central').length;
  const stateCount = classifiedResults.filter(s => s.type === 'state').length;

  const goHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

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

          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span style={{ color: '#1a1a1a' }}>Your </span>
            <span style={{ color: '#f97316' }}>Eligible Schemes</span>
          </motion.h1>

          <motion.p
            style={styles.heroSub}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Found <strong style={{ color: '#f97316' }}>{totalMatches}</strong> schemes matching your profile
          </motion.p>

          <motion.div
            style={styles.heroActions}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              style={styles.heroCta}
              onClick={resetApp}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaRedo /> Search Again
            </motion.button>
            <motion.button
              style={styles.editProfileBtn}
              onClick={() => { setShowEditPanel(!showEditPanel); setEditData(userProfile || {}); }}
              whileHover={{ scale: 1.05, borderColor: '#f97316', color: '#f97316' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaEdit /> Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── EDIT PROFILE PANEL ── */}
      <AnimatePresence>
        {showEditPanel && (
          <motion.section
            style={styles.editSection}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <div style={styles.editInner}>
              <div style={styles.editCard}>
                {/* Edit Header */}
                <div style={styles.editHeader}>
                  <div style={styles.editHeaderLeft}>
                    <div style={styles.editIconCircle}>
                      <FaEdit style={{ fontSize: '18px', color: '#f97316' }} />
                    </div>
                    <div>
                      <h3 style={styles.editTitle}>Edit Your Profile</h3>
                      <p style={styles.editSubtitle}>
                        Modify your details below and update to get refined results
                      </p>
                    </div>
                  </div>
                  <motion.button
                    style={styles.editCloseBtn}
                    onClick={() => setShowEditPanel(false)}
                    whileHover={{ scale: 1.1, background: '#f3f4f6' }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTimes />
                  </motion.button>
                </div>

                {/* Personal Section */}
                <div style={styles.editAccordion}>
                  <motion.button
                    style={styles.accordionHeader}
                    onClick={() => toggleSection('personal')}
                    whileHover={{ background: '#f9fafb' }}
                  >
                    <div style={styles.accordionHeaderLeft}>
                      <FaUser style={{ color: '#f97316', fontSize: '14px' }} />
                      <span style={styles.accordionTitle}>Personal Information</span>
                    </div>
                    {expandedSection === 'personal' ? <FaChevronUp style={{ color: '#6b7280', fontSize: '12px' }} /> : <FaChevronDown style={{ color: '#6b7280', fontSize: '12px' }} />}
                  </motion.button>

                  <AnimatePresence>
                    {expandedSection === 'personal' && (
                      <motion.div
                        style={styles.accordionContent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={styles.editRow}>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaUser style={styles.editLabelIcon} /> Name</label>
                            <input style={styles.editInput} name="name" value={editData.name || ''} onChange={handleEditChange} placeholder="Full name" />
                          </div>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaBirthdayCake style={styles.editLabelIcon} /> Age</label>
                            <input style={styles.editInput} type="number" name="age" value={editData.age || ''} onChange={handleEditChange} placeholder="Age" min="0" max="120" />
                          </div>
                        </div>
                        <div style={styles.editRow}>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaVenusMars style={styles.editLabelIcon} /> Gender</label>
                            <select style={styles.editInput} name="gender" value={editData.gender || ''} onChange={handleEditChange}>
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaMapMarkerAlt style={styles.editLabelIcon} /> State</label>
                            <select style={styles.editInput} name="state" value={editData.state || ''} onChange={handleEditChange}>
                              <option value="">Select State</option>
                              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={styles.editGroup}>
                          <label style={styles.editLabel}><FaUsers style={styles.editLabelIcon} /> Category</label>
                          <select style={styles.editInput} name="category" value={editData.category || ''} onChange={handleEditChange}>
                            <option value="">Select</option>
                            <option value="general">General</option>
                            <option value="obc">OBC</option>
                            <option value="sc">SC</option>
                            <option value="st">ST</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Economic Section */}
                <div style={styles.editAccordion}>
                  <motion.button
                    style={styles.accordionHeader}
                    onClick={() => toggleSection('economic')}
                    whileHover={{ background: '#f9fafb' }}
                  >
                    <div style={styles.accordionHeaderLeft}>
                      <FaRupeeSign style={{ color: '#f97316', fontSize: '14px' }} />
                      <span style={styles.accordionTitle}>Economic Information</span>
                    </div>
                    {expandedSection === 'economic' ? <FaChevronUp style={{ color: '#6b7280', fontSize: '12px' }} /> : <FaChevronDown style={{ color: '#6b7280', fontSize: '12px' }} />}
                  </motion.button>

                  <AnimatePresence>
                    {expandedSection === 'economic' && (
                      <motion.div
                        style={styles.accordionContent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={styles.editRow}>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaRupeeSign style={styles.editLabelIcon} /> Annual Income (₹)</label>
                            <input style={styles.editInput} type="number" name="annual_income" value={editData.annual_income || ''} onChange={handleEditChange} placeholder="e.g. 200000" min="0" />
                          </div>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaBriefcase style={styles.editLabelIcon} /> Occupation</label>
                            <select style={styles.editInput} name="occupation" value={editData.occupation || ''} onChange={handleEditChange}>
                              <option value="">Select</option>
                              <option value="farmer">Farmer</option>
                              <option value="student">Student</option>
                              <option value="employed">Employed</option>
                              <option value="self_employed">Self-Employed</option>
                              <option value="unemployed">Unemployed</option>
                              <option value="daily_wage">Daily Wage Worker</option>
                              <option value="homemaker">Homemaker</option>
                              <option value="retired">Retired</option>
                            </select>
                          </div>
                        </div>
                        <label style={styles.editCheckbox}>
                          <input type="checkbox" name="is_bpl" checked={editData.is_bpl || false} onChange={handleEditChange} style={styles.editCheckboxInput} />
                          <FaClipboardList style={{ color: '#f97316', fontSize: '13px', flexShrink: 0 }} />
                          BPL Card Holder
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Additional Section */}
                <div style={styles.editAccordion}>
                  <motion.button
                    style={styles.accordionHeader}
                    onClick={() => toggleSection('additional')}
                    whileHover={{ background: '#f9fafb' }}
                  >
                    <div style={styles.accordionHeaderLeft}>
                      <FaGraduationCap style={{ color: '#f97316', fontSize: '14px' }} />
                      <span style={styles.accordionTitle}>Additional Details</span>
                    </div>
                    {expandedSection === 'additional' ? <FaChevronUp style={{ color: '#6b7280', fontSize: '12px' }} /> : <FaChevronDown style={{ color: '#6b7280', fontSize: '12px' }} />}
                  </motion.button>

                  <AnimatePresence>
                    {expandedSection === 'additional' && (
                      <motion.div
                        style={styles.accordionContent}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div style={styles.editRow}>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaGraduationCap style={styles.editLabelIcon} /> Education</label>
                            <select style={styles.editInput} name="education" value={editData.education || ''} onChange={handleEditChange}>
                              <option value="">Select</option>
                              <option value="none">No Formal Education</option>
                              <option value="primary">Primary (1-5)</option>
                              <option value="secondary">Secondary (6-10)</option>
                              <option value="higher_secondary">Higher Secondary</option>
                              <option value="graduate">Graduate</option>
                              <option value="post_graduate">Post Graduate</option>
                            </select>
                          </div>
                          <div style={styles.editGroup}>
                            <label style={styles.editLabel}><FaHeart style={styles.editLabelIcon} /> Marital Status</label>
                            <select style={styles.editInput} name="marital_status" value={editData.marital_status || ''} onChange={handleEditChange}>
                              <option value="">Select</option>
                              <option value="single">Single</option>
                              <option value="married">Married</option>
                              <option value="widowed">Widowed</option>
                              <option value="divorced">Divorced</option>
                            </select>
                          </div>
                        </div>

                        <div style={styles.editCheckboxGrid}>
                          {[
                            { name: 'is_farmer', icon: <FaTractor />, text: 'Farmer' },
                            { name: 'is_student', icon: <FaUserGraduate />, text: 'Student' },
                            { name: 'disability', icon: <FaWheelchair />, text: 'Disability' },
                            { name: 'is_minority', icon: <FaMosque />, text: 'Minority' },
                          ].map(item => (
                            <label key={item.name} style={styles.editCheckbox}>
                              <input type="checkbox" name={item.name} checked={editData[item.name] || false} onChange={handleEditChange} style={styles.editCheckboxInput} />
                              <span style={{ color: '#f97316', fontSize: '13px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>{item.icon}</span>
                              {item.text}
                            </label>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Update Actions */}
                <div style={styles.editActions}>
                  {hasChanges && (
                    <motion.span
                      style={styles.changesBadge}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      Unsaved changes
                    </motion.span>
                  )}
                  <div style={styles.editBtns}>
                    <motion.button
                      style={styles.editCancelBtn}
                      onClick={() => { setShowEditPanel(false); setEditData(userProfile || {}); }}
                      whileHover={{ scale: 1.02, background: '#f3f4f6' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      style={{
                        ...styles.editUpdateBtn,
                        opacity: hasChanges && !isUpdating ? 1 : 0.5,
                        cursor: hasChanges && !isUpdating ? 'pointer' : 'not-allowed',
                      }}
                      onClick={hasChanges && !isUpdating ? handleUpdateSearch : undefined}
                      whileHover={hasChanges && !isUpdating ? { scale: 1.02, boxShadow: '0 8px 25px rgba(249,115,22,0.4)' } : {}}
                      whileTap={hasChanges && !isUpdating ? { scale: 0.98 } : {}}
                    >
                      {isUpdating ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'flex' }}
                          >
                            <FaRedo />
                          </motion.span>
                          Updating...
                        </>
                      ) : (
                        <><FaSave /> Update & Search</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── STATS ── */}
      <section style={styles.statsSection}>
        <div style={styles.statsInner}>
          <motion.div
            style={styles.statsRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: 'Total Schemes', value: totalMatches, icon: <FaChartBar /> },
              { label: 'Central Govt', value: centralCount, icon: <FaFlag /> },
              { label: 'State Govt', value: stateCount, icon: <FaLandmark /> },
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

      {/* ── MAIN CONTENT ── */}
      <section style={styles.mainSection}>
        <div style={styles.mainDecor1} />
        <div style={styles.mainDecor2} />

        <div style={styles.mainInner}>

          {/* Filter Bar */}
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
                  { key: 'all', label: 'All', icon: <FaChartBar style={{ fontSize: '11px' }} />, count: classifiedResults.length },
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
                <option value="default">Default Order</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </motion.div>

          {/* Results Info */}
          <motion.div
            style={styles.resultsInfoRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span style={styles.resultsInfoText}>
              Showing <strong style={{ color: '#f97316' }}>{filteredResults.length}</strong> of {classifiedResults.length} schemes
              {filter !== 'all' && (
                <span style={styles.activeFilterTag}>
                  {filter === 'central'
                    ? <><FaFlag style={{ fontSize: '10px' }} /> Central Government</>
                    : <><FaLandmark style={{ fontSize: '10px' }} /> State Government</>
                  }
                  <button style={styles.clearFilterBtn} onClick={() => setFilter('all')}>✕</button>
                </span>
              )}
            </span>
          </motion.div>

          {/* === CLASSIFIED SECTIONS VIEW === */}
          {filter === 'all' ? (
            <>
              {centralCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionHeaderLeft}>
                      <div style={styles.sectionIconCircle}>
                        <FaFlag style={{ fontSize: '18px', color: '#f97316' }} />
                      </div>
                      <div>
                        <h3 style={styles.sectionTitle}>Central Government Schemes</h3>
                        <p style={styles.sectionSubtitle}>
                          {centralCount} scheme{centralCount !== 1 ? 's' : ''} from Government of India
                        </p>
                      </div>
                    </div>
                    <motion.button
                      style={styles.viewAllBtn}
                      onClick={() => setFilter('central')}
                      whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(249,115,22,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All →
                    </motion.button>
                  </div>

                  <div style={styles.grid}>
                    {classifiedResults.filter(s => s.type === 'central').map((scheme, index) => (
                      <motion.div
                        key={scheme.id || `central-${index}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * Math.min(index, 6) }}
                      >
                        <SchemeCard scheme={scheme} index={index} onViewDetails={setSelectedScheme} />
                      </motion.div>
                    ))}
                  </div>
                  <div style={styles.sectionDivider} />
                </motion.div>
              )}

              {stateCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div style={styles.sectionHeader}>
                    <div style={styles.sectionHeaderLeft}>
                      <div style={styles.sectionIconCircle}>
                        <FaLandmark style={{ fontSize: '18px', color: '#f97316' }} />
                      </div>
                      <div>
                        <h3 style={styles.sectionTitle}>State Government Schemes</h3>
                        <p style={styles.sectionSubtitle}>
                          {stateCount} scheme{stateCount !== 1 ? 's' : ''} from your State Government
                        </p>
                      </div>
                    </div>
                    <motion.button
                      style={styles.viewAllBtn}
                      onClick={() => setFilter('state')}
                      whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(249,115,22,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View All →
                    </motion.button>
                  </div>

                  <div style={styles.grid}>
                    {classifiedResults.filter(s => s.type === 'state').map((scheme, index) => (
                      <motion.div
                        key={scheme.id || `state-${index}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * Math.min(index, 6) }}
                      >
                        <SchemeCard scheme={scheme} index={index} onViewDetails={setSelectedScheme} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {centralCount === 0 && stateCount === 0 && (
                <motion.div style={styles.emptyCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={styles.emptyIconWrap}><FaChartBar style={{ fontSize: '48px', color: '#f97316' }} /></div>
                  <h3 style={styles.emptyTitle}>No schemes found</h3>
                  <p style={styles.emptyText}>Try editing your profile or searching with different details</p>
                  <div style={styles.emptyActions}>
                    <motion.button style={styles.primaryBtn} onClick={() => setShowEditPanel(true)} whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }} whileTap={{ scale: 0.95 }}>
                      <FaEdit /> Edit Profile
                    </motion.button>
                    <motion.button style={styles.secondaryBtn} onClick={resetApp} whileHover={{ scale: 1.05, background: '#f3f4f6' }} whileTap={{ scale: 0.95 }}>
                      <FaRedo /> Start Over
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={filter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {filteredResults.length > 0 ? (
                  <div style={styles.grid}>
                    {filteredResults.map((scheme, index) => (
                      <motion.div key={scheme.id || `${filter}-${index}`} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * Math.min(index, 10) }}>
                        <SchemeCard scheme={scheme} index={index} onViewDetails={setSelectedScheme} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div style={styles.emptyCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div style={styles.emptyIconWrap}>
                      {filter === 'central' ? <FaFlag style={{ fontSize: '48px', color: '#f97316' }} /> : <FaLandmark style={{ fontSize: '48px', color: '#f97316' }} />}
                    </div>
                    <h3 style={styles.emptyTitle}>No {filter === 'central' ? 'Central' : 'State'} Government schemes found</h3>
                    <p style={styles.emptyText}>
                      {filter === 'central'
                        ? 'No central government schemes matched your profile. Check state schemes instead.'
                        : 'No state government schemes matched your profile. Check central schemes instead.'}
                    </p>
                    <div style={styles.emptyActions}>
                      <motion.button style={styles.primaryBtn} onClick={() => setFilter('all')} whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }} whileTap={{ scale: 0.95 }}>
                        Show All Schemes
                      </motion.button>
                      <motion.button style={styles.secondaryBtn} onClick={() => setFilter(filter === 'central' ? 'state' : 'central')} whileHover={{ scale: 1.05, background: '#f3f4f6' }} whileTap={{ scale: 0.95 }}>
                        View {filter === 'central' ? <><FaLandmark style={{ fontSize: '12px' }} /> State</> : <><FaFlag style={{ fontSize: '12px' }} /> Central</>} Schemes
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      {classifiedResults.length > 0 && (
        <section style={styles.ctaSection}>
          <div style={styles.ctaDecor1} />
          <div style={styles.ctaDecor2} />
          <motion.div style={styles.ctaContent} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={styles.ctaTitle}>
              Not Finding What You <span style={{ color: '#f97316' }}>Need</span>?
            </h2>
            <p style={styles.ctaSub}>
              Edit your profile details or start a fresh search for better results.
            </p>
            <div style={styles.ctaBtns}>
              <motion.button
                style={styles.primaryBtn}
                onClick={() => { setShowEditPanel(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEdit /> Edit Profile
              </motion.button>
              <motion.button style={styles.secondaryBtn} onClick={resetApp} whileHover={{ scale: 1.05, background: '#f3f4f6' }} whileTap={{ scale: 0.95 }}>
                <FaRedo /> Start Over
              </motion.button>
              <motion.button style={styles.secondaryBtn} onClick={goHome} whileHover={{ scale: 1.05, background: '#f3f4f6' }} whileTap={{ scale: 0.95 }}>
                <FaHome /> Go Home
              </motion.button>
            </div>
          </motion.div>
        </section>
      )}

      {selectedScheme && (
        <SchemeModal scheme={selectedScheme} onClose={() => setSelectedScheme(null)} />
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

  /* ── Hero ── */
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
  heroTitle: { fontSize: 'clamp(30px, 5vw, 48px)', fontWeight: 900, marginBottom: '14px', lineHeight: 1.15 },
  heroSub: { fontSize: 'clamp(15px, 2.5vw, 18px)', color: '#1a1a1a', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.7 },
  heroActions: { display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' },
  heroCta: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px',
    background: '#f97316', color: '#ffffff', border: 'none', borderRadius: '14px',
    fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
  },
  editProfileBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '14px 32px',
    background: 'transparent', color: '#1a1a1a', border: '2px solid #e5e7eb',
    borderRadius: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
  },

  /* ── Edit Panel ── */
  editSection: { background: '#f9fafb', overflow: 'hidden', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' },
  editInner: { maxWidth: '800px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) 20px' },
  editCard: {
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px',
    padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  editHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: '24px', gap: '12px',
  },
  editHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  editIconCircle: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  editTitle: { fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: 800, color: '#1a1a1a', margin: 0 },
  editSubtitle: { fontSize: '13px', color: '#6b7280', marginTop: '4px' },
  editCloseBtn: {
    width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #e5e7eb',
    background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '14px', color: '#1a1a1a', transition: 'all 0.3s ease', flexShrink: 0,
  },

  /* Accordion */
  editAccordion: {
    border: '1px solid #e5e7eb', borderRadius: '14px', marginBottom: '12px', overflow: 'hidden',
  },
  accordionHeader: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', background: '#ffffff', border: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', transition: 'all 0.2s ease',
  },
  accordionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  accordionTitle: { fontSize: '14px', fontWeight: 700, color: '#1a1a1a' },
  accordionContent: { padding: '0 18px 18px', overflow: 'hidden' },

  /* Edit form fields */
  editRow: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px', marginBottom: '12px',
  },
  editGroup: { marginBottom: '4px' },
  editLabel: {
    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
    fontWeight: 600, marginBottom: '6px', color: '#1a1a1a',
  },
  editLabelIcon: { color: '#f97316', fontSize: '12px' },
  editInput: {
    width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '10px',
    fontSize: '13px', fontFamily: 'Inter, sans-serif', background: '#f9fafb', color: '#1a1a1a',
    transition: 'all 0.3s ease', outline: 'none', boxSizing: 'border-box',
  },
  editCheckboxGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px',
  },
  editCheckbox: {
    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
    border: '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer',
    fontSize: '12px', fontWeight: 500, background: '#f9fafb', color: '#1a1a1a',
    transition: 'all 0.3s ease',
  },
  editCheckboxInput: { width: '16px', height: '16px', accentColor: '#f97316', flexShrink: 0 },

  /* Edit Actions */
  editActions: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap', gap: '12px',
  },
  changesBadge: {
    display: 'inline-flex', alignItems: 'center', padding: '4px 14px',
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
    borderRadius: '50px', fontSize: '11px', color: '#f97316', fontWeight: 600,
  },
  editBtns: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  editCancelBtn: {
    padding: '10px 24px', background: '#ffffff', color: '#1a1a1a',
    border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '13px',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
  },
  editUpdateBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 24px',
    background: '#f97316', color: '#ffffff', border: 'none', borderRadius: '10px',
    fontSize: '13px', fontWeight: 700, fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
  },

  /* ── Stats ── */
  statsSection: { padding: '0 20px clamp(30px, 4vw, 50px)', background: '#ffffff' },
  statsInner: { maxWidth: '1100px', margin: '0 auto' },
  statsRow: { display: 'flex', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' },
  statCard: {
    flex: 1, minWidth: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px',
    padding: 'clamp(18px, 3vw, 28px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease', cursor: 'default',
  },
  statIcon: { fontSize: '18px', color: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 900, color: '#f97316' },
  statLabel: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#1a1a1a', fontWeight: 600 },

  /* ── Main Section ── */
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
  mainInner: { maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 },

  /* ── Filter Bar ── */
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
    padding: '8px 16px', border: '1px solid #e5e7eb', borderRadius: '50px', background: '#ffffff',
    fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.3s ease', color: '#1a1a1a',
  },
  filterBtnActive: {
    background: '#f97316', color: '#ffffff', borderColor: '#f97316',
    boxShadow: '0 4px 15px rgba(249,115,22,0.3)',
  },
  filterCount: {
    background: '#f3f4f6', padding: '2px 8px', borderRadius: '50px',
    fontSize: '10px', fontWeight: 700, color: '#1a1a1a', border: '1px solid #e5e7eb',
  },
  filterCountActive: {
    background: 'rgba(255,255,255,0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)',
  },
  sortSection: { display: 'flex', alignItems: 'center', gap: '8px' },
  sortSelect: {
    padding: '8px 14px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px',
    color: '#1a1a1a', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
    cursor: 'pointer', outline: 'none', transition: 'all 0.3s ease',
  },

  /* ── Results Info ── */
  resultsInfoRow: {
    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
    marginBottom: 'clamp(20px, 3vw, 28px)', paddingLeft: '4px',
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
  clearFilterBtn: { background: 'none', border: 'none', color: '#f97316', fontSize: '12px', cursor: 'pointer', padding: '0 2px', fontWeight: 700 },

  /* ── Section Headers ── */
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 'clamp(16px, 3vw, 20px)', marginTop: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(16px, 3vw, 24px)', background: '#ffffff', border: '1px solid #e5e7eb',
    borderRadius: '16px', flexWrap: 'wrap', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  sectionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
  sectionIconCircle: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  sectionTitle: { fontSize: 'clamp(16px, 3.5vw, 20px)', fontWeight: 800, color: '#1a1a1a', margin: 0 },
  sectionSubtitle: { fontSize: 'clamp(12px, 2.5vw, 13px)', color: '#6b7280', marginTop: '2px' },
  viewAllBtn: {
    padding: '8px 18px', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)',
    borderRadius: '50px', color: '#f97316', fontSize: '13px', fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.3s ease',
  },
  sectionDivider: { height: '1px', background: '#e5e7eb', margin: 'clamp(24px, 5vw, 40px) 0' },

  /* ── Grid ── */
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(280px, 80vw, 340px), 1fr))',
    gap: 'clamp(14px, 3vw, 20px)',
  },

  /* ── Empty State ── */
  emptyCard: {
    gridColumn: '1 / -1', textAlign: 'center', padding: 'clamp(50px, 10vw, 80px) 20px',
    background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  emptyIconWrap: { marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 800, color: '#1a1a1a', marginBottom: '8px', lineHeight: 1.2 },
  emptyText: { fontSize: 'clamp(14px, 2.5vw, 16px)', color: '#1a1a1a', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.8 },
  emptyActions: { display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' },

  /* ── Shared Buttons ── */
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

  /* ── CTA Section ── */
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

export default Results;
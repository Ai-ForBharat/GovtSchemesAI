import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaInfoCircle, FaGift, FaBuilding,
  FaFileAlt, FaClipboardList, FaChartBar,
  FaExternalLinkAlt, FaCheckCircle, FaChevronRight,
  FaShieldAlt, FaCopy
} from 'react-icons/fa';

const SchemeModal = ({ scheme, onClose }) => {
  if (!scheme) return null;

  const score = scheme.match_score || 0;
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const scoreLabel = score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Low Match';
  const isCenter = scheme.type === 'central';

  const copyName = () => {
    navigator.clipboard.writeText(scheme.name);
  };

  return (
    <AnimatePresence>
      <motion.div
        style={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          style={styles.modal}
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent */}
          <div style={{
            ...styles.topAccent,
            background: `linear-gradient(90deg, ${scoreColor}, ${isCenter ? '#3b82f6' : '#8b5cf6'}, transparent)`,
          }} />

          {/* Close Button */}
          <motion.button
            style={styles.closeBtn}
            onClick={onClose}
            whileHover={{ scale: 1.1, background: '#1e293b' }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>

          {/* Header */}
          <div style={styles.headerSection}>
            <div style={styles.badgeRow}>
              <span style={{
                ...styles.typeBadge,
                background: isCenter ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
                color: isCenter ? '#3b82f6' : '#8b5cf6',
                borderColor: isCenter ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)',
              }}>
                {isCenter ? '🇮🇳 Central Government' : '🏛️ State Government'}
              </span>

              {scheme.category && (
                <span style={{
                  ...styles.categoryBadge,
                  background: `${scoreColor}10`,
                  color: scoreColor,
                  borderColor: `${scoreColor}30`,
                }}>
                  {(scheme.category || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              )}
            </div>

            <div style={styles.titleRow}>
              <h2 style={styles.title}>{scheme.name}</h2>
              <motion.button
                style={styles.copyBtn}
                onClick={copyName}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Copy scheme name"
              >
                <FaCopy />
              </motion.button>
            </div>

            {scheme.name_en && scheme.name_en !== scheme.name && (
              <p style={styles.nameEn}>({scheme.name_en})</p>
            )}
          </div>

          {/* Score Card */}
          <div style={{
            ...styles.scoreCard,
            borderColor: `${scoreColor}30`,
          }}>
            <div style={styles.scoreLeft}>
              <div style={styles.scoreCircleWrapper}>
                <svg width="64" height="64" style={styles.scoreSvg}>
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="4" />
                  <circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={scoreColor}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 163.4} 163.4`}
                    transform="rotate(-90 32 32)"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div style={styles.scoreInner}>
                  <span style={{ ...styles.scoreNum, color: scoreColor }}>{score}</span>
                  <span style={{ ...styles.scorePercent, color: scoreColor }}>%</span>
                </div>
              </div>
            </div>

            <div style={styles.scoreRight}>
              <span style={{ ...styles.scoreLabel, color: scoreColor }}>{scoreLabel}</span>
              <div style={styles.scoreBarTrack}>
                <motion.div
                  style={{
                    ...styles.scoreBarFill,
                    background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}80)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div style={styles.scoreDetails}>
                <span style={styles.scoreDetailItem}>
                  <FaCheckCircle style={{ color: '#22c55e', fontSize: '10px' }} /> Eligibility verified
                </span>
                <span style={styles.scoreDetailItem}>
                  <FaShieldAlt style={{ color: '#3b82f6', fontSize: '10px' }} /> Official scheme
                </span>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div style={styles.sectionsWrapper}>

            <Section
              icon={<FaInfoCircle />}
              iconColor="#3b82f6"
              title="Description"
            >
              <p style={styles.sectionText}>{scheme.description}</p>
            </Section>

            <Section
              icon={<FaGift />}
              iconColor="#22c55e"
              title="Benefits"
            >
              <p style={styles.sectionText}>{scheme.benefits}</p>
            </Section>

            <Section
              icon={<FaBuilding />}
              iconColor="#f59e0b"
              title="Ministry / Department"
            >
              <p style={styles.sectionText}>{scheme.ministry || 'Government of India'}</p>
            </Section>

            <Section
              icon={<FaFileAlt />}
              iconColor="#8b5cf6"
              title="Documents Required"
            >
              <div style={styles.docsList}>
                {(scheme.documents || ['Check official website']).map((doc, i) => (
                  <div key={i} style={styles.docItem}>
                    <FaChevronRight style={{ color: '#8b5cf6', fontSize: '9px', flexShrink: 0, marginTop: '5px' }} />
                    <span style={styles.docText}>{doc}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              icon={<FaClipboardList />}
              iconColor="#ec4899"
              title="How to Apply"
            >
              <p style={styles.sectionText}>{scheme.how_to_apply || 'Visit the official website to apply'}</p>
            </Section>

          </div>

          {/* Divider */}
          <div style={styles.divider} />

          {/* Apply Button */}
          <motion.a
            href={scheme.apply_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.applyBtn}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(34,197,94,0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <FaExternalLinkAlt style={{ fontSize: '14px' }} />
            Apply Now on Official Website
          </motion.a>

          {/* Footer note */}
          <p style={styles.footerNote}>
            <FaShieldAlt style={{ fontSize: '10px', color: '#475569' }} />
            Information sourced from official government portals
          </p>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Section = ({ icon, iconColor, title, children }) => (
  <div style={sectionStyles.wrapper}>
    <div style={sectionStyles.header}>
      <div style={{
        ...sectionStyles.iconBox,
        background: `${iconColor}10`,
        border: `1px solid ${iconColor}25`,
        color: iconColor,
      }}>
        {icon}
      </div>
      <h4 style={sectionStyles.title}>{title}</h4>
    </div>
    <div style={sectionStyles.content}>
      {children}
    </div>
  </div>
);

const sectionStyles = {
  wrapper: {
    marginBottom: '16px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '14px',
    padding: '16px',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    flexShrink: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e2e8f0',
    margin: 0,
  },
  content: {
    paddingLeft: '42px',
  },
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  modal: {
    background: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '24px',
    maxWidth: '620px',
    width: '100%',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '0',
    position: 'relative',
    boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
    fontFamily: 'Inter, sans-serif',
  },

  topAccent: {
    height: '4px',
    width: '100%',
    borderRadius: '24px 24px 0 0',
  },

  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #1e293b',
    background: '#020617',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#94a3b8',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },

  /* Header */
  headerSection: {
    padding: '24px 28px 0',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  typeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 14px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    border: '1px solid',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 700,
    border: '1px solid',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  title: {
    fontSize: 'clamp(18px, 3.5vw, 22px)',
    fontWeight: 800,
    color: '#ffffff',
    marginBottom: '4px',
    lineHeight: 1.3,
    flex: 1,
    margin: 0,
  },
  copyBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#020617',
    border: '1px solid #1e293b',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: '2px',
    transition: 'all 0.2s ease',
  },
  nameEn: {
    color: '#64748b',
    fontSize: '13px',
    margin: '4px 0 0 0',
    fontStyle: 'italic',
  },

  /* Score Card */
  scoreCard: {
    margin: '20px 28px 0',
    padding: '18px',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  scoreLeft: {},
  scoreCircleWrapper: {
    position: 'relative',
    width: '64px',
    height: '64px',
  },
  scoreSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  scoreInner: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontSize: '20px',
    fontWeight: 900,
  },
  scorePercent: {
    fontSize: '11px',
    fontWeight: 700,
    marginTop: '2px',
  },
  scoreRight: {
    flex: 1,
  },
  scoreLabel: {
    fontSize: '14px',
    fontWeight: 700,
    display: 'block',
    marginBottom: '8px',
  },
  scoreBarTrack: {
    width: '100%',
    height: '6px',
    background: '#1e293b',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '3px',
  },
  scoreDetails: {
    display: 'flex',
    gap: '14px',
    flexWrap: 'wrap',
  },
  scoreDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },

  /* Sections wrapper */
  sectionsWrapper: {
    padding: '20px 28px 0',
  },

  sectionText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: 0,
  },

  /* Documents */
  docsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  docItem: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  docText: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.5,
  },

  /* Divider */
  divider: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #1e293b, transparent)',
    margin: '20px 28px',
  },

  /* Apply Button */
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    margin: '0 28px',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 20px rgba(34,197,94,0.25)',
    transition: 'all 0.3s ease',
  },

  /* Footer note */
  footerNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#475569',
    padding: '14px 28px 20px',
    margin: 0,
    textAlign: 'center',
  },
};

export default SchemeModal;
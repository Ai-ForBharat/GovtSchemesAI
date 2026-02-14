import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaInfoCircle, FaGift, FaBuilding,
  FaFileAlt, FaClipboardList,
  FaExternalLinkAlt, FaChevronRight,
  FaShieldAlt, FaCopy, FaCheckCircle, FaFlag
} from 'react-icons/fa';

const SchemeModal = ({ scheme, onClose }) => {
  if (!scheme) return null;

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
          <div style={styles.topAccent} />

          {/* Close Button */}
          <motion.button
            style={styles.closeBtn}
            onClick={onClose}
            whileHover={{ scale: 1.1, background: '#f3f4f6' }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimes />
          </motion.button>

          {/* Header */}
          <div style={styles.headerSection}>
            <div style={styles.badgeRow}>
              <span style={{
                ...styles.typeBadge,
                background: isCenter ? 'rgba(249,115,22,0.08)' : '#f9fafb',
                color: isCenter ? '#f97316' : '#1a1a1a',
                borderColor: isCenter ? 'rgba(249,115,22,0.2)' : '#e5e7eb',
              }}>
                {isCenter ? (
                  <><FaFlag style={{ fontSize: '11px' }} /> Central Government</>
                ) : (
                  <><FaBuilding style={{ fontSize: '11px' }} /> State Government</>
                )}
              </span>

              {scheme.category && (
                <span style={styles.categoryBadge}>
                  {(scheme.category || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              )}
            </div>

            <div style={styles.titleRow}>
              <h2 style={styles.title}>{scheme.name}</h2>
              <motion.button
                style={styles.copyBtn}
                onClick={copyName}
                whileHover={{ scale: 1.1, borderColor: 'rgba(249,115,22,0.3)' }}
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

          {/* Verified Badge */}
          <div style={styles.verifiedCard}>
            <div style={styles.verifiedLeft}>
              <FaCheckCircle style={{ color: '#f97316', fontSize: '14px' }} />
              <span style={styles.verifiedText}>Verified Official Scheme</span>
            </div>
            <div style={styles.verifiedRight}>
              <FaShieldAlt style={{ color: '#1a1a1a', fontSize: '12px' }} />
              <span style={styles.verifiedText}>Government Portal</span>
            </div>
          </div>

          {/* Sections */}
          <div style={styles.sectionsWrapper}>

            <Section icon={<FaInfoCircle />} title="Description">
              <p style={styles.sectionText}>
                {scheme.description || 'No description available. Please visit the official website for more details.'}
              </p>
            </Section>

            <Section icon={<FaGift />} title="Benefits">
              <p style={styles.sectionText}>
                {scheme.benefits || 'Visit the official website for detailed benefits information.'}
              </p>
            </Section>

            <Section icon={<FaBuilding />} title="Ministry / Department">
              <p style={styles.sectionText}>{scheme.ministry || 'Government of India'}</p>
            </Section>

            <Section icon={<FaFileAlt />} title="Documents Required">
              <div style={styles.docsList}>
                {(scheme.documents || ['Check official website for required documents']).map((doc, i) => (
                  <div key={i} style={styles.docItem}>
                    <FaChevronRight style={{ color: '#f97316', fontSize: '9px', flexShrink: 0, marginTop: '5px' }} />
                    <span style={styles.docText}>{doc}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={<FaClipboardList />} title="How to Apply">
              <p style={styles.sectionText}>
                {scheme.how_to_apply || 'Visit the official website to apply for this scheme.'}
              </p>
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
            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(249,115,22,0.4)', background: '#ea580c' }}
            whileTap={{ scale: 0.98 }}
          >
            <FaExternalLinkAlt style={{ fontSize: '14px' }} />
            Apply Now on Official Website
          </motion.a>

          {/* Footer note */}


        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const Section = ({ icon, title, children }) => (
  <div style={sectionStyles.wrapper}>
    <div style={sectionStyles.header}>
      <div style={sectionStyles.iconBox}>
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
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
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
    background: 'rgba(249,115,22,0.08)',
    border: '1px solid rgba(249,115,22,0.2)',
    color: '#f97316',
  },
  title: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1a1a1a',
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
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },

  modal: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    maxWidth: '620px',
    width: '100%',
    maxHeight: '88vh',
    overflowY: 'auto',
    padding: '0',
    position: 'relative',
    boxShadow: '0 25px 80px rgba(0,0,0,0.15), 0 0 0 1px #e5e7eb',
    fontFamily: 'Inter, sans-serif',
  },

  topAccent: {
    height: '4px',
    width: '100%',
    borderRadius: '24px 24px 0 0',
    background: 'linear-gradient(90deg, #f97316, #1a1a1a, transparent)',
  },

  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    color: '#1a1a1a',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },

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
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#1a1a1a',
  },

  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  title: {
    fontSize: 'clamp(18px, 3.5vw, 22px)',
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: '4px',
    lineHeight: 1.3,
    flex: 1,
    margin: 0,
  },
  copyBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#6b7280',
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
    color: '#6b7280',
    fontSize: '13px',
    margin: '4px 0 0 0',
    fontStyle: 'italic',
  },

  verifiedCard: {
    margin: '20px 28px 0',
    padding: '14px 18px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  verifiedLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  verifiedRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  verifiedText: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#1a1a1a',
  },

  sectionsWrapper: {
    padding: '20px 28px 0',
  },

  sectionText: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.7,
    margin: 0,
  },

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
    color: '#6b7280',
    lineHeight: 1.5,
  },

  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '20px 28px',
  },

  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px 28px',
    background: '#f97316',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
    margin: '0 28px',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 20px rgba(249,115,22,0.25)',
    transition: 'all 0.3s ease',
  },

  footerNote: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '11px',
    color: '#6b7280',
    padding: '14px 28px 20px',
    margin: 0,
    textAlign: 'center',
  },
};

export default SchemeModal;
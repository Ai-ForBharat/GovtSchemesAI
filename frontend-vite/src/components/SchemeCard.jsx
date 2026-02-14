import React from 'react';
import { motion } from 'framer-motion';
import {
  FaCheckCircle, FaChevronRight,
  FaRupeeSign, FaFileAlt
} from 'react-icons/fa';

const SchemeCard = ({ scheme, index, onViewDetails }) => {
  const formatCategory = (cat) => {
    if (!cat) return 'General';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const isCenter = scheme.type === 'central';

  return (
    <motion.div
      style={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.08, duration: 0.4 }}
      whileHover={{
        y: -6,
        borderColor: 'rgba(249,115,22,0.3)',
        boxShadow: '0 20px 50px rgba(249,115,22,0.08)',
      }}
    >
      {/* Accent line top */}
      <div style={styles.accentLine} />

      {/* Top Row */}
      <div style={styles.top}>
        <div style={styles.topLeft}>
          <span style={{
            ...styles.typeBadge,
            background: isCenter ? 'rgba(249,115,22,0.08)' : '#f9fafb',
            color: isCenter ? '#f97316' : '#1a1a1a',
            borderColor: isCenter ? 'rgba(249,115,22,0.2)' : '#e5e7eb',
          }}>
            {isCenter ? '🇮🇳 Central' : '🏛️ State'}
          </span>

          <span style={styles.categoryTag}>
            {formatCategory(scheme.category)}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 style={styles.title}>{scheme.name}</h3>

      {/* Description */}
      <p style={styles.description}>{scheme.description}</p>

      {/* Benefits */}
      <div style={styles.benefits}>
        {scheme.benefits ? (
          <>
            <div style={styles.benefitsHeader}>
              <FaRupeeSign style={{ color: '#f97316', fontSize: '12px' }} />
              <strong style={styles.benefitsLabel}>Benefits</strong>
            </div>
            <p style={styles.benefitsText}>{scheme.benefits}</p>
          </>
        ) : (
          <>
            <div style={styles.benefitsHeader}>
              <FaRupeeSign style={{ color: '#f97316', fontSize: '12px' }} />
              <strong style={styles.benefitsLabel}>Benefits</strong>
            </div>
            <p style={styles.benefitsText}>Visit official website for details</p>
          </>
        )}
      </div>

      {/* Spacer to push bottom content down */}
      <div style={styles.spacer} />

      {/* Quick Info */}
      <div style={styles.quickInfo}>
        {scheme.documents && (
          <div style={styles.quickInfoItem}>
            <FaFileAlt style={{ color: '#6b7280', fontSize: '11px' }} />
            <span style={styles.quickInfoText}>
              {Array.isArray(scheme.documents) ? scheme.documents.length : '—'} Documents
            </span>
          </div>
        )}
        <div style={styles.quickInfoItem}>
          <FaCheckCircle style={{ color: '#f97316', fontSize: '11px' }} />
          <span style={styles.quickInfoText}>Verified</span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Bottom - Full Width Button */}
      <div style={styles.bottom}>
        <motion.button
          style={styles.detailBtn}
          onClick={() => onViewDetails(scheme)}
          whileHover={{
            scale: 1.02,
            boxShadow: '0 8px 25px rgba(249,115,22,0.35)',
            background: '#ea580c',
          }}
          whileTap={{ scale: 0.98 }}
        >
          View Details <FaChevronRight style={{ fontSize: '12px' }} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '18px',
    padding: '0',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
    height: '100%',
    minHeight: '420px',
  },

  accentLine: {
    height: '3px',
    width: '100%',
    background: 'linear-gradient(90deg, #f97316, #1a1a1a, transparent)',
    flexShrink: 0,
  },

  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 0',
    gap: '12px',
    flexShrink: 0,
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  typeBadge: {
    padding: '4px 12px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    border: '1px solid',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    width: 'fit-content',
  },
  categoryTag: {
    padding: '3px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: 600,
    border: '1px solid #e5e7eb',
    background: '#f9fafb',
    color: '#1a1a1a',
    display: 'inline-block',
    width: 'fit-content',
  },

  title: {
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    fontWeight: 700,
    color: '#1a1a1a',
    lineHeight: 1.3,
    padding: '14px 20px 0',
    margin: 0,
    flexShrink: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '40px',
  },

  description: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: 1.6,
    padding: '8px 20px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    margin: 0,
    flexShrink: 0,
    minHeight: '62px',
  },

  benefits: {
    margin: '14px 20px 0',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '12px 14px',
    flexShrink: 0,
    minHeight: '60px',
  },
  benefitsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px',
  },
  benefitsLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#f97316',
  },
  benefitsText: {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: 1.5,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  spacer: {
    flex: 1,
  },

  quickInfo: {
    display: 'flex',
    gap: '12px',
    padding: '12px 20px 0',
    flexShrink: 0,
  },
  quickInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  quickInfoText: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: 500,
  },

  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '14px 20px 0',
    flexShrink: 0,
  },

  bottom: {
    padding: '14px 20px 18px',
    flexShrink: 0,
  },

  detailBtn: {
    width: '100%',
    padding: '14px 24px',
    background: '#f97316',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease',
  },
};

export default SchemeCard;
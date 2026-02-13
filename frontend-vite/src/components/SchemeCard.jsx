import React from 'react';
import { motion } from 'framer-motion';
import {
  FaExternalLinkAlt, FaCheckCircle, FaChevronRight,
  FaRupeeSign, FaFileAlt
} from 'react-icons/fa';

const SchemeCard = ({ scheme, index, onViewDetails }) => {
  const score = scheme.match_score || 0;

  const getScoreColor = () => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Low';
  };

  const formatCategory = (cat) => {
    if (!cat) return 'General';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const scoreColor = getScoreColor();
  const isCenter = scheme.type === 'central';

  return (
    <motion.div
      style={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.08, duration: 0.4 }}
      whileHover={{
        y: -6,
        borderColor: `${scoreColor}40`,
        boxShadow: `0 20px 50px ${scoreColor}10`,
      }}
    >
      {/* Accent line top */}
      <div style={{
        ...styles.accentLine,
        background: `linear-gradient(90deg, ${scoreColor}, ${isCenter ? '#3b82f6' : '#8b5cf6'}, transparent)`,
      }} />

      {/* Top Row */}
      <div style={styles.top}>
        <div style={styles.topLeft}>
          <span style={{
            ...styles.typeBadge,
            background: isCenter ? 'rgba(59,130,246,0.1)' : 'rgba(139,92,246,0.1)',
            color: isCenter ? '#3b82f6' : '#8b5cf6',
            borderColor: isCenter ? 'rgba(59,130,246,0.25)' : 'rgba(139,92,246,0.25)',
          }}>
            {isCenter ? '🇮🇳 Central' : '🏛️ State'}
          </span>

          <span style={{
            ...styles.categoryTag,
            background: `${scoreColor}10`,
            color: scoreColor,
            borderColor: `${scoreColor}25`,
          }}>
            {formatCategory(scheme.category)}
          </span>
        </div>

        {/* Score */}
        <div style={styles.scoreWrapper}>
          <div style={{
            ...styles.scoreCircle,
            borderColor: `${scoreColor}40`,
            background: `${scoreColor}08`,
          }}>
            {/* Progress ring */}
            <svg width="56" height="56" style={styles.scoreSvg}>
              <circle
                cx="28" cy="28" r="23"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3"
              />
              <circle
                cx="28" cy="28" r="23"
                fill="none"
                stroke={scoreColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 144.5} 144.5`}
                transform="rotate(-90 28 28)"
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            </svg>
            <div style={styles.scoreInner}>
              <span style={{ ...styles.scoreNum, color: scoreColor }}>
                {score}
              </span>
              <span style={{ ...styles.scorePercent, color: scoreColor }}>%</span>
            </div>
          </div>
          <span style={{ ...styles.scoreLabel, color: scoreColor }}>
            {getScoreLabel()}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 style={styles.title}>{scheme.name}</h3>

      {/* Description */}
      <p style={styles.description}>{scheme.description}</p>

      {/* Benefits */}
      {scheme.benefits && (
        <div style={styles.benefits}>
          <div style={styles.benefitsHeader}>
            <FaRupeeSign style={{ color: '#22c55e', fontSize: '12px' }} />
            <strong style={styles.benefitsLabel}>Benefits</strong>
          </div>
          <p style={styles.benefitsText}>{scheme.benefits}</p>
        </div>
      )}

      {/* Quick Info */}
      <div style={styles.quickInfo}>
        {scheme.documents && (
          <div style={styles.quickInfoItem}>
            <FaFileAlt style={{ color: '#64748b', fontSize: '11px' }} />
            <span style={styles.quickInfoText}>
              {Array.isArray(scheme.documents) ? scheme.documents.length : '—'} Documents
            </span>
          </div>
        )}
        <div style={styles.quickInfoItem}>
          <FaCheckCircle style={{ color: '#22c55e', fontSize: '11px' }} />
          <span style={styles.quickInfoText}>Verified</span>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Bottom */}
      <div style={styles.bottom}>
        <div style={styles.bottomLeft}>
          {/* Match bar */}
          <div style={styles.matchBarTrack}>
            <motion.div
              style={{
                ...styles.matchBarFill,
                background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}80)`,
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
            />
          </div>
          <span style={styles.matchText}>{score}% match</span>
        </div>

        <motion.button
          style={styles.detailBtn}
          onClick={() => onViewDetails(scheme)}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 6px 20px rgba(34,197,94,0.3)',
          }}
          whileTap={{ scale: 0.95 }}
        >
          Details <FaChevronRight style={{ fontSize: '10px' }} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const styles = {
  card: {
    background: '#0f172a',
    borderRadius: '18px',
    padding: '0',
    border: '1px solid #1e293b',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: 'Inter, sans-serif',
  },

  /* Accent line */
  accentLine: {
    height: '3px',
    width: '100%',
  },

  /* Top */
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '20px 20px 0',
    gap: '12px',
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
    border: '1px solid',
    display: 'inline-block',
    width: 'fit-content',
  },

  /* Score */
  scoreWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  scoreCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreSvg: {
    position: 'absolute',
    top: '-1px',
    left: '-1px',
  },
  scoreInner: {
    display: 'flex',
    alignItems: 'baseline',
    zIndex: 1,
  },
  scoreNum: {
    fontSize: '18px',
    fontWeight: 900,
  },
  scorePercent: {
    fontSize: '10px',
    fontWeight: 700,
  },
  scoreLabel: {
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  /* Title */
  title: {
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    fontWeight: 700,
    color: '#ffffff',
    lineHeight: 1.3,
    padding: '14px 20px 0',
    margin: 0,
  },

  /* Description */
  description: {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.6,
    padding: '8px 20px 0',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    flex: 1,
    margin: 0,
  },

  /* Benefits */
  benefits: {
    margin: '14px 20px 0',
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '12px 14px',
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
    color: '#22c55e',
  },
  benefitsText: {
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: 1.5,
    margin: 0,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },

  /* Quick info */
  quickInfo: {
    display: 'flex',
    gap: '12px',
    padding: '12px 20px 0',
  },
  quickInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  quickInfoText: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: 500,
  },

  /* Divider */
  divider: {
    height: '1px',
    background: '#1e293b',
    margin: '14px 20px 0',
  },

  /* Bottom */
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px 18px',
    gap: '12px',
  },
  bottomLeft: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  matchBarTrack: {
    width: '100%',
    height: '4px',
    background: '#1e293b',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  matchBarFill: {
    height: '100%',
    borderRadius: '2px',
  },
  matchText: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: 600,
  },

  detailBtn: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
    transition: 'all 0.3s ease',
  },
};

export default SchemeCard;
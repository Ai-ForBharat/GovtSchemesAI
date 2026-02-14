import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaShieldAlt, FaLanguage, FaRobot,
  FaCheckCircle, FaArrowRight, FaUsers,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const slides = [
  {
    image: '',
    title: 'PM Kisan Samman Nidhi',
    desc: '₹6,000 per year for farmers',
    tag: 'Agriculture',
    color: '#f97316',
  },
  {
    image: '',
    title: 'Ayushman Bharat Yojana',
    desc: '₹5 Lakh health cover per family',
    tag: 'Healthcare',
    color: '#3b82f6',
  },
  {
    image: '',
    title: 'PM Awas Yojana',
    desc: 'Affordable housing for all',
    tag: 'Housing',
    color: '#8b5cf6',
  },
  {
    image: '',
    title: 'PM Ujjwala Yojana',
    desc: 'Free LPG connections for BPL families',
    tag: 'Energy',
    color: '#f59e0b',
  },
  {
    image: '',
    title: 'Skill India Mission',
    desc: 'Free skill training & certification',
    tag: 'Education',
    color: '#ec4899',
  },
  {
    image: '',
    title: 'PM Mudra Yojana',
    desc: 'Loans up to ₹10 Lakh for businesses',
    tag: 'Finance',
    color: '#14b8a6',
  },
  {
    image: '',
    title: 'Jan Dhan Yojana',
    desc: 'Zero-balance bank accounts for all',
    tag: 'Banking',
    color: '#f97316',
  },
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const { setCurrentView } = useApp();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToForm = () => {
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section style={styles.wrapper}>
      <div style={styles.bgDecor1} />
      <div style={styles.bgDecor2} />
      <div style={styles.bgDecor3} />

      {/* IMAGE CAROUSEL */}
      <div style={styles.imageSection}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
            style={styles.imageSlide}
          >
            <div style={{
              ...styles.imagePlaceholder,
              borderColor: `${slides[current].color}20`,
            }}>
              <div style={styles.slideOverlay}>
                <motion.div
                  style={{
                    ...styles.slideTag,
                    background: `${slides[current].color}10`,
                    borderColor: `${slides[current].color}30`,
                    color: slides[current].color,
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {slides[current].tag}
                </motion.div>
                <motion.h3
                  style={styles.slideTitle}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {slides[current].title}
                </motion.h3>
                <motion.p
                  style={styles.slideDesc}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {slides[current].desc}
                </motion.p>
              </div>

              <div style={{
                ...styles.cornerGlow,
                background: `radial-gradient(circle, ${slides[current].color}08 0%, transparent 70%)`,
              }} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <motion.button
          style={{ ...styles.navBtn, left: 'clamp(12px, 3vw, 30px)' }}
          onClick={prevSlide}
          whileHover={{ scale: 1.1, background: '#f3f4f6' }}
          whileTap={{ scale: 0.95 }}
        >
          <FaChevronLeft />
        </motion.button>
        <motion.button
          style={{ ...styles.navBtn, right: 'clamp(12px, 3vw, 30px)' }}
          onClick={nextSlide}
          whileHover={{ scale: 1.1, background: '#f3f4f6' }}
          whileTap={{ scale: 0.95 }}
        >
          <FaChevronRight />
        </motion.button>

        {/* Dots */}
        <div style={styles.dots}>
          {slides.map((slide, i) => (
            <motion.button
              key={i}
              style={{
                ...styles.dot,
                ...(current === i
                  ? { ...styles.dotActive, background: slide.color }
                  : {}),
              }}
              onClick={() => setCurrent(i)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <motion.div
            style={{
              ...styles.progressBar,
              background: slides[current].color,
            }}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
            key={current}
          />
        </div>
      </div>

      {/* TEXT SECTION */}
      <div style={styles.hero}>
        <div style={styles.content}>

          <motion.div
            style={styles.badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            Powered by AI • Made for India
          </motion.div>

          <motion.h1
            style={styles.heading}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find Government Schemes
            <br />
            <span style={styles.headingHighlight}>
              You Actually Deserve
            </span>
          </motion.h1>

          <motion.p
            style={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Enter your details and our AI instantly matches you with eligible
            Central & State government schemes — in your preferred language.
          </motion.p>

          {/* Trust row */}
          <motion.div
            style={styles.trustRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {[
              'No registration required',
              'Instant results',
              'Verified schemes',
            ].map((item, i) => (
              <span key={i} style={styles.trustItem}>
                <FaCheckCircle style={{ color: '#f97316', fontSize: '12px' }} />
                {item}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <div style={styles.statsRow}>
            {[
              { num: '200+', label: 'Schemes', color: '#f97316' },
              { num: '36', label: 'States & UTs', color: '#3b82f6' },
              { num: '12', label: 'Languages', color: '#8b5cf6' },
              { num: '10L+', label: 'Users', color: '#f59e0b' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                style={styles.stat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.05, borderColor: stat.color }}
              >
                <span style={{ ...styles.statNum, color: stat.color }}>{stat.num}</span>
                <span style={styles.statLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            style={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              style={styles.ctaBtn}
              onClick={goToForm}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSearch /> Find My Schemes
              <FaArrowRight style={{ fontSize: '14px' }} />
            </motion.button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            style={styles.features}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[
              { icon: <FaShieldAlt />, text: '100% Free', color: '#f97316' },
              { icon: <FaLanguage />, text: 'Multilingual', color: '#3b82f6' },
              { icon: <FaRobot />, text: 'AI Powered', color: '#8b5cf6' },
              { icon: <FaUsers />, text: 'For All Citizens', color: '#f59e0b' },
            ].map((f, i) => (
              <motion.span
                key={i}
                style={styles.featurePill}
                whileHover={{ scale: 1.05, borderColor: f.color }}
              >
                <span style={{ color: f.color }}>{f.icon}</span> {f.text}
              </motion.span>
            ))}
          </motion.div>

          {/* Powered by */}
          <motion.div
            style={styles.poweredBy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <span style={styles.poweredByText}>Powered by</span>
            <div style={styles.poweredByLogos}>
              {['Digital India', 'MeitY', 'NIC'].map((name, i) => (
                <span key={i} style={styles.poweredByBadge}>{name}</span>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const styles = {
  wrapper: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },

  bgDecor1: {
    position: 'absolute',
    top: '-200px',
    right: '-200px',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgDecor2: {
    position: 'absolute',
    bottom: '-150px',
    left: '-150px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  bgDecor3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  /* IMAGE CAROUSEL */
  imageSection: {
    width: '100%',
    height: 'clamp(350px, 50vw, 500px)',
    position: 'relative',
    background: '#f9fafb',
    paddingTop: '72px',
  },
  imageSlide: {
    width: '100%',
    height: '100%',
    background: '#f9fafb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  imagePlaceholder: {
    width: '92%',
    maxWidth: '1100px',
    height: '88%',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.06)',
    transition: 'border-color 0.5s ease',
  },

  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '24px',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },

  cornerGlow: {
    position: 'absolute',
    top: '-50%',
    right: '-30%',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 0,
  },

  slideOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    textAlign: 'center',
    zIndex: 1,
    position: 'relative',
  },
  slideTag: {
    padding: '5px 16px',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid',
  },
  slideTitle: {
    fontSize: 'clamp(22px, 4vw, 36px)',
    fontWeight: 800,
    color: '#1a1a1a',
    margin: 0,
    lineHeight: 1.2,
  },
  slideDesc: {
    fontSize: 'clamp(13px, 2.5vw, 16px)',
    color: '#6b7280',
    margin: 0,
    fontWeight: 500,
  },

  /* Nav */
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    color: '#6b7280',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 5,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },

  /* Dots */
  dots: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '6px',
    zIndex: 5,
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#d1d5db',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  },
  dotActive: {
    width: '24px',
    borderRadius: '4px',
    height: '8px',
  },

  /* Progress */
  progressTrack: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '3px',
    background: '#e5e7eb',
    zIndex: 5,
  },
  progressBar: {
    height: '100%',
    borderRadius: '0 2px 2px 0',
  },

  /* TEXT SECTION */
  hero: {
    background: '#ffffff',
    padding: 'clamp(50px, 8vw, 80px) 24px clamp(60px, 8vw, 100px)',
    textAlign: 'center',
    color: '#1a1a1a',
    position: 'relative',
    zIndex: 1,
  },
  content: {
    maxWidth: '850px',
    margin: '0 auto',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(249,115,22,0.08)',
    border: '1px solid rgba(249,115,22,0.2)',
    padding: '8px 20px',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: 600,
    marginBottom: '24px',
    color: '#f97316',
  },
  heading: {
    fontSize: 'clamp(30px, 6vw, 56px)',
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: '18px',
    color: '#1a1a1a',
  },
  headingHighlight: {
    color: '#f97316',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    maxWidth: '600px',
    margin: '0 auto 20px',
    lineHeight: 1.7,
    color: '#6b7280',
  },

  trustRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(12px, 3vw, 24px)',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 500,
  },

  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(10px, 2vw, 16px)',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: 'clamp(12px, 2vw, 18px) clamp(16px, 3vw, 24px)',
    borderRadius: '16px',
    minWidth: 'clamp(80px, 15vw, 110px)',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  statNum: {
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 900,
  },
  statLabel: {
    fontSize: '11px',
    textTransform: 'uppercase',
    color: '#9ca3af',
    fontWeight: 600,
    letterSpacing: '0.3px',
  },

  ctaRow: {
    marginBottom: '24px',
  },
  ctaBtn: {
    padding: '18px 44px',
    fontSize: 'clamp(15px, 2.5vw, 17px)',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'Inter, sans-serif',
    boxShadow: '0 6px 25px rgba(249,115,22,0.25)',
  },

  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '28px',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#1a1a1a',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },

  poweredBy: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  poweredByText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  poweredByLogos: {
    display: 'flex',
    gap: '8px',
  },
  poweredByBadge: {
    padding: '4px 12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#9ca3af',
  },
};

export default Hero;
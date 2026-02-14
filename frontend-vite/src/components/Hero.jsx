import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaCheckCircle, FaArrowRight,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';

import banner1 from '../assets/Pradhanmantri-Mudra-Yojna.png';
import banner2 from '../assets/banner2.png';
import banner4 from '../assets/banner4.png';
import banner5 from '../assets/banner5.png';
import bannerNSP from '../assets/NSP-myscheme-Web-Dark.png';
import bannerPMAY from '../assets/PMAY-U-Banner.png';

const slides = [
  { image: banner1, color: '#f97316' },
  { image: banner2, color: '#3b82f6' },
  { image: banner4, color: '#8b5cf6' },
  { image: banner5, color: '#f59e0b' },
  { image: bannerNSP, color: '#ec4899' },
  { image: bannerPMAY, color: '#14b8a6' },
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={styles.imageSlide}
          >
            <img
              src={slides[current].image}
              alt="Government Scheme Banner"
              style={styles.actualImage}
            />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        <motion.button
          style={{ ...styles.navBtn, left: '16px' }}
          onClick={prevSlide}
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.95)' }}
          whileTap={{ scale: 0.95 }}
        >
          <FaChevronLeft />
        </motion.button>
        <motion.button
          style={{ ...styles.navBtn, right: '16px' }}
          onClick={nextSlide}
          whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.95)' }}
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
      </div>

      {/* TEXT SECTION */}
      <div style={styles.hero}>
        <div style={styles.content}>

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

          {/* CTA */}
          <motion.div
            style={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
    height: 'clamp(300px, 45vw, 520px)',
    position: 'relative',
    background: '#f9fafb',
    paddingTop: '72px',
    overflow: 'hidden',
  },
  imageSlide: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },

  /* Nav */
  navBtn: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.85)',
    border: 'none',
    color: '#1a1a1a',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 5,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    backdropFilter: 'blur(8px)',
  },

  /* Dots */
  dots: {
    position: 'absolute',
    bottom: '16px',
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
    background: 'rgba(255,255,255,0.5)',
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

  ctaRow: {
    marginBottom: '0',
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
};

export default Hero;
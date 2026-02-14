import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  FaHome,
  FaCheckCircle, FaSearch,
  FaMapMarkerAlt
} from 'react-icons/fa';

const AboutPage = () => {
  const { setCurrentView } = useApp();

  const goHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={styles.page}>

      {/* HERO SECTION */}
      <section style={styles.hero}>
        <div style={styles.heroBgDecor1} />
        <div style={styles.heroBgDecor2} />

        <div style={styles.heroContent}>
          <motion.button
            onClick={goHome}
            style={styles.backHomeBtn}
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
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span style={styles.heroTitleBlack}>About</span>{' '}
            <span style={styles.heroTitleHighlight}>Saarthi AI</span>
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Empowering every Indian citizen to discover and access government
            schemes they truly deserve.
          </motion.p>
        </div>
      </section>

      {/* VISION + MISSION SECTION */}
      <section style={styles.section}>
        <div style={styles.sectionInner}>
          <div style={styles.grid}>

            <motion.div
              style={styles.imageBoxWrapper}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div style={styles.imageBoxGlow} />
              <div style={styles.imageBox}>
                <div style={styles.frameContent}>

                  <div style={styles.frameTopBar}>
                    <div style={styles.frameDots}>
                      <span style={{ ...styles.frameDot, background: '#ef4444' }} />
                      <span style={{ ...styles.frameDot, background: '#f59e0b' }} />
                      <span style={{ ...styles.frameDot, background: '#22c55e' }} />
                    </div>
                    <span style={styles.frameUrl}>saarthi.ai</span>
                  </div>

                  <div style={styles.mockContent}>
                    <div style={styles.mockTitle}>Saarthi AI</div>
                    <div style={styles.mockSubtitle}>Find schemes you deserve</div>

                    <div style={styles.mockStats}>
                      {[
                        { num: '200+', label: 'Schemes' },
                        { num: '36', label: 'States' },
                        { num: '12', label: 'Languages' },
                      ].map((s, i) => (
                        <motion.div
                          key={i}
                          style={styles.mockStatItem}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + i * 0.15 }}
                        >
                          <span style={styles.mockStatNum}>{s.num}</span>
                          <span style={styles.mockStatLabel}>{s.label}</span>
                        </motion.div>
                      ))}
                    </div>

                    <div style={styles.mockChecklist}>
                      {[
                        'AI-powered scheme matching',
                        'Multi-language support',
                        'Real-time eligibility check',
                      ].map((item, i) => (
                        <motion.div
                          key={i}
                          style={styles.mockCheckItem}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.7 + i * 0.1 }}
                        >
                          <FaCheckCircle style={{ color: '#f97316', fontSize: '12px', flexShrink: 0 }} />
                          <span style={styles.mockCheckText}>{item}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    style={styles.floatingBadge1}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <FaMapMarkerAlt style={{ fontSize: '10px' }} /> 36 States
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT - VISION & MISSION */}
            <motion.div
              style={styles.rightContent}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 style={styles.sectionHeading}>
                What Drives <span style={{ color: '#f97316' }}>Us</span> ?
              </h2>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h3 style={styles.vmTitle}>Our Vision</h3>
                <p style={styles.vmText}>
                  Our vision is to make citizens lives easier by bridging the gap
                  between government schemes and the people who need them most.
                </p>
              </motion.div>

              <div style={styles.divider} />

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <h3 style={styles.vmTitle}>Our Mission</h3>
                <p style={styles.vmText}>
                  Our mission is to streamline the government-user interface
                  for government schemes and benefits.
                </p>
                <p style={styles.vmText}>
                  Reduce time and effort required to find and avail
                  a government scheme.
                </p>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ABOUT DESCRIPTION SECTION */}
      <section style={styles.darkSection}>
        <div style={styles.darkSectionDecor1} />
        <div style={styles.darkSectionDecor2} />

        <div style={styles.contentWrapper}>
          <motion.div
            style={styles.textColumn}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={styles.darkSectionTitle}>
              One Platform, <span style={{ color: '#f97316' }}>Endless Possibilities</span>
            </h2>

            <div style={styles.storyCard}>
              <div style={styles.storyDot} />
              <p style={styles.bigText}>
                Saarthi AI is a National Platform that aims to offer one-stop search
                and discovery of the Government schemes.
              </p>
            </div>

            <div style={styles.storyCard}>
              <div style={{ ...styles.storyDot, background: '#3b82f6' }} />
              <p style={styles.bigText}>
                It provides an innovative, technology-based solution to discover
                scheme information based upon the eligibility of the citizen.
              </p>
            </div>

            <div style={styles.storyCard}>
              <div style={{ ...styles.storyDot, background: '#8b5cf6' }} />
              <p style={styles.bigText}>
                The platform helps the citizen to find the right Government schemes
                for them. It also guides on how to apply for different Government schemes.
                Thus no need to visit multiple Government websites.
              </p>
            </div>
          </motion.div>

          {/* HOW IT WORKS MINI IMAGE */}
          <motion.div
            style={styles.illustrationWrapper}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={styles.illustrationGlow} />
            <div style={styles.illustrationBox}>
              <div style={styles.frameContent}>

                <div style={styles.frameTopBar}>
                  <div style={styles.frameDots}>
                    <span style={{ ...styles.frameDot, background: '#ef4444' }} />
                    <span style={{ ...styles.frameDot, background: '#f59e0b' }} />
                    <span style={{ ...styles.frameDot, background: '#22c55e' }} />
                  </div>
                  <span style={styles.frameUrl}>saarthi.ai</span>
                </div>

                <div style={styles.howItWorksContent}>
                  <div style={styles.howItWorksTitle}>How It Works</div>
                  <div style={styles.howItWorksSubtitle}>3 simple steps to find your schemes</div>

                  <div style={styles.stepsContainer}>
                    {[
                      { step: '01', text: 'Enter your details', color: '#f97316', desc: 'Fill in your basic info' },
                      { step: '02', text: 'AI matches schemes', color: '#3b82f6', desc: 'Smart algorithm finds matches' },
                      { step: '03', text: 'Get eligible schemes', color: '#8b5cf6', desc: 'View & apply instantly' },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        style={styles.stepCard}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                      >
                        <div style={{ ...styles.stepNumCircle, color: item.color, borderColor: `${item.color}40` }}>
                          {item.step}
                        </div>
                        <div style={styles.stepInfo}>
                          <span style={styles.stepText}>{item.text}</span>
                          <span style={styles.stepDesc}>{item.desc}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
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
            Ready to Find Your <span style={{ color: '#f97316' }}>Schemes</span>?
          </h2>
          <div style={styles.ctaBtns}>
            <motion.button
              style={styles.ctaPrimaryBtn}
              onClick={() => setCurrentView('form')}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSearch /> Find My Schemes
            </motion.button>
            <motion.button
              style={styles.ctaSecondaryBtn}
              onClick={goHome}
              whileHover={{ scale: 1.05, background: '#f3f4f6' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHome /> Go Home
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

const styles = {
  page: {
    fontFamily: 'Inter, sans-serif',
    background: '#ffffff',
    color: '#1a1a1a',
  },

  hero: {
    textAlign: 'center',
    padding: 'clamp(80px, 12vw, 140px) 20px clamp(60px, 8vw, 100px)',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  heroBgDecor1: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBgDecor2: {
    position: 'absolute',
    bottom: '-60px',
    left: '-60px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    margin: '0 auto',
  },
  backHomeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '50px',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginBottom: '30px',
    transition: 'all 0.3s ease',
  },
  heroTitle: {
    fontSize: 'clamp(36px, 6vw, 56px)',
    fontWeight: 900,
    marginBottom: '16px',
    lineHeight: 1.15,
  },
  heroTitleBlack: {
    color: '#1a1a1a',
  },
  heroTitleHighlight: {
    color: '#f97316',
  },
  heroSubtitle: {
    fontSize: 'clamp(15px, 2.5vw, 18px)',
    color: '#4b5563',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.7,
  },

  section: {
    padding: 'clamp(60px, 10vw, 100px) 20px',
    background: '#f9fafb',
  },
  sectionInner: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeading: {
    fontSize: 'clamp(26px, 4vw, 36px)',
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: '32px',
    lineHeight: 1.2,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(40px, 6vw, 80px)',
    alignItems: 'center',
  },

  imageBoxWrapper: {
    position: 'relative',
  },
  imageBoxGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  imageBox: {
    width: '100%',
    maxWidth: '450px',
    height: '420px',
    borderRadius: '20px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 0 0 1px #e5e7eb',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },
  frameContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  frameTopBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f3f4f6',
  },
  frameDots: {
    display: 'flex',
    gap: '6px',
  },
  frameDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'block',
  },
  frameUrl: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: 500,
    background: '#ffffff',
    padding: '3px 12px',
    borderRadius: '6px',
    flex: 1,
    textAlign: 'center',
  },
  mockContent: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  mockTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#f97316',
  },
  mockSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
  mockStats: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  mockStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px 16px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    minWidth: '70px',
  },
  mockStatNum: {
    fontSize: '18px',
    fontWeight: 900,
    color: '#f97316',
  },
  mockStatLabel: {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  mockChecklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
    width: '100%',
    paddingLeft: '8px',
  },
  mockCheckItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  mockCheckText: {
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: 500,
  },
  floatingBadge1: {
    position: 'absolute',
    top: '80px',
    right: '-8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    background: '#ffffff',
    border: '1px solid rgba(249,115,22,0.3)',
    borderRadius: '50px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#f97316',
    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
    zIndex: 2,
  },

  rightContent: {
    paddingLeft: '8px',
  },
  vmTitle: {
    fontSize: 'clamp(18px, 3vw, 22px)',
    fontWeight: 700,
    color: '#f97316',
    marginBottom: '10px',
  },
  vmText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    color: '#4b5563',
    lineHeight: 1.85,
    marginBottom: '12px',
  },
  divider: {
    width: '50px',
    height: '2px',
    background: '#e5e7eb',
    margin: '24px 0',
    borderRadius: '1px',
  },

  darkSection: {
    padding: 'clamp(80px, 12vw, 120px) 20px',
    background: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  darkSectionDecor1: {
    position: 'absolute',
    top: '-100px',
    left: '-100px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  darkSectionDecor2: {
    position: 'absolute',
    bottom: '-100px',
    right: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  darkSectionTitle: {
    fontSize: 'clamp(26px, 4vw, 36px)',
    fontWeight: 800,
    color: '#1a1a1a',
    marginBottom: '40px',
    lineHeight: 1.2,
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'clamp(50px, 8vw, 100px)',
    position: 'relative',
    zIndex: 1,
  },
  textColumn: {},
  storyCard: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px',
    padding: '16px 20px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
  },
  storyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#f97316',
    marginTop: '8px',
    flexShrink: 0,
  },
  bigText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    color: '#333333',
    lineHeight: 1.8,
    margin: 0,
  },

  illustrationWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  illustrationBox: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '20px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    boxShadow: '0 25px 80px rgba(0,0,0,0.08), 0 0 0 1px #e5e7eb',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 1,
  },
  howItWorksContent: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
  },
  howItWorksTitle: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#f97316',
  },
  howItWorksSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
    marginBottom: '6px',
  },
  stepsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
  },
  stepNumCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '14px',
    fontWeight: 900,
    border: '1px solid',
  },
  stepInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  stepText: {
    fontSize: '13px',
    color: '#1a1a1a',
    fontWeight: 600,
  },
  stepDesc: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: 500,
  },

  ctaSection: {
    padding: 'clamp(60px, 10vw, 100px) 20px',
    background: '#ffffff',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaDecor1: {
    position: 'absolute',
    top: '-80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  ctaDecor2: {
    position: 'absolute',
    bottom: '-80px',
    right: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  ctaContent: {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 5vw, 40px)',
    fontWeight: 900,
    color: '#1a1a1a',
    marginBottom: '28px',
    lineHeight: 1.2,
  },
  ctaBtns: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  ctaPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  ctaSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 36px',
    background: 'transparent',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease',
  },
};

export default AboutPage;
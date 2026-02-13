import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaArrowLeft, FaBullseye, FaEye } from 'react-icons/fa';

const AboutPage = () => {
  const { resetApp } = useApp();

  return (
    <div style={styles.page}>

      {/* HERO SECTION */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>About Us</h1>
        <p style={styles.breadcrumb}>Home  ›  About Us</p>
      </div>

      {/* VISION + MISSION SECTION */}
      <div style={styles.section}>
        <div style={styles.grid}>

          {/* LEFT IMAGE PLACEHOLDER */}
          <motion.div
            style={styles.imageBox}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* Decorative frame only */}
          </motion.div>

          {/* RIGHT CONTENT */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div style={styles.visionBlock}>
              <FaEye style={styles.icon} />
              <div>
                <h3 style={styles.heading}>Our Vision</h3>
                <p style={styles.text}>
                  Our vision is to make citizens' lives easier.
                </p>
              </div>
            </div>

            <div style={styles.visionBlock}>
              <FaBullseye style={styles.icon} />
              <div>
                <h3 style={styles.heading}>Our Mission</h3>
                <p style={styles.text}>
                  Our mission is to streamline the government-user interface 
                  for government schemes and benefits.
                </p>
                <p style={styles.text}>
                  Reduce time and effort required to find and avail 
                  a government scheme.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ABOUT DESCRIPTION SECTION */}
      <div style={styles.darkSection}>
        <div style={styles.contentWrapper}>
          <div style={styles.textColumn}>
            <p style={styles.bigText}>
              myScheme is a National Platform that aims to offer one-stop search 
              and discovery of the Government schemes.
            </p>

            <p style={styles.bigText}>
              It provides an innovative, technology-based solution to discover 
              scheme information based upon the eligibility of the citizen.
            </p>

            <p style={styles.bigText}>
              The platform helps the citizen to find the right Government schemes 
              for them. It also guides on how to apply for different Government schemes. 
              Thus no need to visit multiple Government websites.
            </p>
          </div>

          <div style={styles.illustrationBox}>
            {/* optional illustration placeholder */}
          </div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          <Feature
            title="Eligibility Check"
            desc="You can check your eligibility for schemes using different criteria and personal attribute"
          />
          <Feature
            title="Scheme Finder"
            desc="Fast and easy searching with filter based drill downs for various Government Schemes"
          />
          <Feature
            title="Scheme in detail"
            desc="Deep dive into dedicated scheme pages for fine grained scheme details before you apply"
          />
        </div>
      </div>

      <button onClick={resetApp} style={styles.backBtn}>
        <FaArrowLeft /> Back to Home
      </button>

    </div>
  );
};

const Feature = ({ title, desc }) => (
  <div style={styles.featureCard}>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDesc}>{desc}</p>
  </div>
);

const styles = {
  page: {
    fontFamily: 'Inter, sans-serif',
    background: '#0f172a',
    color: 'white'
  },

  hero: {
    textAlign: 'center',
    padding: '100px 20px 60px',
    background: 'linear-gradient(180deg,#0f172a,#111827)',
  },

  heroTitle: {
    fontSize: '48px',
    fontWeight: 800,
    marginBottom: '10px'
  },

  breadcrumb: {
    color: '#22c55e',
    fontSize: '14px'
  },

  section: {
    padding: '80px 20px'
  },

  grid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center'
  },

  imageBox: {
    height: '350px',
    borderRadius: '20px',
    background: '#1f2937',
    border: '2px solid #334155',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },

  visionBlock: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px'
  },

  icon: {
    fontSize: '28px',
    color: '#22c55e',
    marginTop: '5px'
  },

  heading: {
    fontSize: '24px',
    fontWeight: 700,
    marginBottom: '10px'
  },

  text: {
    color: '#cbd5e1',
    lineHeight: 1.8,
    fontSize: '16px'
  },

  darkSection: {
    padding: '100px 20px',
    background: '#111827'
  },

  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px'
  },

  bigText: {
    fontSize: '18px',
    color: '#e5e7eb',
    lineHeight: 1.9,
    marginBottom: '24px'
  },

  illustrationBox: {
    background: '#1f2937',
    borderRadius: '20px',
    height: '300px'
  },

  featuresSection: {
    padding: '80px 20px',
    background: '#0f172a'
  },

  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
    gap: '40px'
  },

  featureCard: {
    textAlign: 'center',
    padding: '30px',
  },

  featureTitle: {
    fontSize: '22px',
    fontWeight: 700,
    marginBottom: '12px'
  },

  featureDesc: {
    color: '#cbd5e1',
    lineHeight: 1.8
  },

  backBtn: {
    margin: '40px auto 80px',
    display: 'block',
    padding: '12px 28px',
    background: '#22c55e',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer'
  }
};

export default AboutPage;

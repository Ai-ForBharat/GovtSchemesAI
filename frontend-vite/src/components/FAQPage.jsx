import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import {
  FaChevronDown, FaHome,
  FaCheckCircle, FaSearch, FaArrowRight
} from 'react-icons/fa';

const FAQPage = () => {
  const { setCurrentView } = useApp();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'What is Saarthi AI?',
      a: 'Saarthi AI is an AI-powered platform that helps Indian citizens discover government schemes they are eligible for, available in 12+ Indian languages. It acts as your personal guide to navigate the complex landscape of government welfare programs.',
    },
    {
      q: 'How will Saarthi AI help common citizens?',
      a: 'It eliminates the need to visit multiple government websites. Fill one simple form and instantly see all schemes you qualify for with benefits, documents, and apply links. No more confusion about which schemes exist or whether you are eligible.',
    },
    {
      q: 'Can I apply for schemes through Saarthi AI?',
      a: 'We provide detailed information and direct links to official government portals where you can apply. While we don\'t process applications directly, we guide you step-by-step through the entire application process on the official website.',
    },
    {
      q: 'How does the eligibility check work?',
      a: 'Our AI compares your profile details such as age, income, location, occupation, caste category, and other parameters against scheme eligibility criteria. It then shows matching schemes with a relevance score so you know which ones are the best fit for you.',
    },
    {
      q: 'What information about a scheme can I find?',
      a: 'For each scheme, you can view complete eligibility criteria, benefits and entitlements, required documents, step-by-step application process, official website links, helpline numbers, and your match percentage.',
    },
    {
      q: 'Is this service free?',
      a: 'Yes! Saarthi AI is completely free to use. There are no hidden charges, no premium features, and no subscription fees. Our mission is to make government schemes accessible to every citizen of India.',
    },
    {
      q: 'How many schemes are available?',
      a: 'We currently cover 200+ schemes from Central and State governments across all 36 States and Union Territories. Our database is continuously updated as new schemes are launched or existing ones are modified.',
    },
    {
      q: 'Which languages are supported?',
      a: 'We support 12+ Indian languages including Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, and Urdu. We are working on adding more regional languages soon.',
    },
    {
      q: 'Is my personal data safe?',
      a: 'Absolutely. We do not store any personal information on our servers. Your data is used only for real-time scheme matching and is never shared with third parties. We follow strict data privacy guidelines to protect your information.',
    },
    {
      q: 'What documents are needed to apply?',
      a: 'Document requirements vary per scheme. Common documents include Aadhaar card, income certificate, caste certificate, domicile certificate, bank passbook, passport-size photos, and educational certificates. Each scheme page lists all required documents specifically.',
    },
    {
      q: 'Can I check eligibility for my family members?',
      a: 'Yes! You can fill the form multiple times with different details to check eligibility for any family member including parents, spouse, children, or siblings. Each search is independent and free.',
    },
    {
      q: 'How accurate is the AI matching?',
      a: 'Our AI uses multiple eligibility parameters including age, income, location, occupation, education, gender, and category to provide highly accurate matches. The confidence score shown for each scheme reflects how closely your profile matches the eligibility criteria.',
    },
    {
      q: 'Do you cover both Central and State government schemes?',
      a: 'Yes, we cover schemes from both the Central Government and all State Governments. This includes major schemes like PM Awas Yojana, Ayushman Bharat, PM Kisan, as well as state-specific schemes from every state and union territory.',
    },
    {
      q: 'How often is the scheme database updated?',
      a: 'Our team updates the scheme database regularly. New schemes are added within days of their official announcement. Existing scheme details like eligibility criteria, benefits, and deadlines are also updated as and when the government makes changes.',
    },
    {
      q: 'Can I use Saarthi AI on my mobile phone?',
      a: 'Yes, Saarthi AI is fully responsive and works perfectly on all devices including smartphones, tablets, laptops, and desktops. You can access it from any modern web browser without needing to download any app.',
    },
    {
      q: 'What if I don\'t know my exact income or other details?',
      a: 'You can provide approximate values for fields like income. Our AI will still match you with relevant schemes. For the most accurate results, we recommend providing details as close to your actual situation as possible.',
    },
    {
      q: 'Are there schemes for senior citizens?',
      a: 'Yes, there are numerous schemes specifically designed for senior citizens including pension schemes like IGNOAPS, health insurance under Ayushman Bharat, railway concessions, and various state-level welfare programs. Simply enter your age and other details to find all applicable schemes.',
    },
    {
      q: 'Are there schemes for students and youth?',
      a: 'Absolutely! There are many schemes for students and youth including scholarships like Post Matric Scholarship, PM Vidya Lakshmi, skill development programs under PMKVY, startup funding through Startup India, and education loans at subsidized rates.',
    },
    {
      q: 'What schemes are available for farmers?',
      a: 'Farmers can benefit from schemes like PM Kisan Samman Nidhi, PM Fasal Bima Yojana, Kisan Credit Card, soil health card scheme, and various state-level agricultural schemes. Our platform covers all major farming-related welfare programs.',
    },
    {
      q: 'Are there schemes specifically for women?',
      a: 'Yes, there are many schemes for women including Beti Bachao Beti Padhao, Mahila Shakti Kendra, Ujjwala Yojana, Maternity Benefit Programme, Women Helpline Scheme, and various skill training and entrepreneurship programs designed for women.',
    },
    {
      q: 'Can I find schemes for starting a business?',
      a: 'Yes! We cover entrepreneurship and business schemes like Startup India, MUDRA Loan, Stand Up India, PM Employment Generation Programme, and various state-level business support schemes. These provide funding, training, and mentorship for aspiring entrepreneurs.',
    },
    {
      q: 'What are housing schemes available?',
      a: 'Major housing schemes include PM Awas Yojana (both Urban and Rural), interest subsidy schemes for home loans, and various state housing board schemes. These provide financial assistance for building or purchasing affordable homes.',
    },
    {
      q: 'Are there health insurance schemes?',
      a: 'Yes, major health schemes include Ayushman Bharat PM-JAY which provides health cover of Rs 5 lakh per family, state health insurance schemes, and specialized health programs for specific conditions. Enter your details to find which health schemes you qualify for.',
    },
    {
      q: 'How do I know if a scheme deadline has passed?',
      a: 'Each scheme listing on our platform includes information about application deadlines where applicable. Some schemes are open throughout the year while others have specific application windows. We keep this information updated regularly.',
    },
    {
      q: 'Can I save my results for later?',
      a: 'Currently, you can take a screenshot or bookmark your results page. We are working on adding a save and share feature that will allow you to download your matched schemes as a PDF or share them via WhatsApp and other platforms.',
    },
    {
      q: 'What if I face issues while applying on the government portal?',
      a: 'Each scheme page includes the official helpline number and contact details. You can also visit your nearest Common Service Centre (CSC) or Jan Seva Kendra for assistance with online applications. We provide all necessary guidance to help you through the process.',
    },
    {
      q: 'Do I need to create an account to use Saarthi AI?',
      a: 'No, you do not need to create any account or sign up. Simply visit the website, fill in your details, and get instant results. We believe in keeping things simple and accessible for everyone.',
    },
    {
      q: 'How is Saarthi AI different from other government scheme portals?',
      a: 'Unlike other portals that list schemes without personalization, Saarthi AI uses artificial intelligence to match schemes specifically to your profile. It supports multiple languages, provides a simple one-form experience, and shows results with match scores so you know exactly which schemes are most relevant to you.',
    },
    {
      q: 'Can persons with disabilities find relevant schemes?',
      a: 'Yes, there are several schemes for persons with disabilities including disability pension, ADIP scheme for assistive devices, scholarship schemes, skill training programs, and reservation benefits in various government schemes. Enter your details to find all applicable schemes.',
    },
    {
      q: 'Are there schemes for BPL (Below Poverty Line) families?',
      a: 'Yes, many government schemes are specifically designed for BPL families including subsidized food through PDS, free housing under PM Awas Yojana, free health insurance under Ayushman Bharat, free LPG connection under Ujjwala Yojana, and various other welfare programs.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    return searchQuery === '' ||
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div style={styles.page}>

      {/* HERO HEADER */}
      <section style={styles.hero}>
        <div style={styles.heroBgDecor1} />
        <div style={styles.heroBgDecor2} />
        <div style={styles.heroBgDecor3} />

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
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Frequently Asked{' '}
            <span style={styles.heroTitleHighlight}>Questions</span>
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Find answers to common questions about Saarthi AI,
            eligibility checks, and how to apply for government schemes.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            style={styles.searchBar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <FaSearch style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                style={styles.searchClear}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section style={styles.mainSection}>
        <div style={{
          ...styles.contentContainer,
          ...(isMobile ? styles.contentContainerMobile : {}),
        }}>

          {/* LEFT SIDE */}
          <motion.div
            style={{
              ...styles.left,
              ...(isMobile ? styles.leftMobile : {}),
            }}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              style={styles.illustrationCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div style={styles.illustrationGlow} />

              <div style={styles.illustrationContent}>
                <div style={styles.frameTopBar}>
                  <div style={styles.frameDots}>
                    <span style={{ ...styles.frameDot, background: '#ef4444' }} />
                    <span style={{ ...styles.frameDot, background: '#f59e0b' }} />
                    <span style={{ ...styles.frameDot, background: '#22c55e' }} />
                  </div>
                  <span style={styles.frameUrl}>saarthi.ai</span>
                </div>

                <div style={styles.illustrationMain}>
                  <motion.div
                    style={styles.illustrationIcon}
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <img
                      src="/faq.svg"
                      alt="FAQ"
                      style={{ width: '120px', height: '120px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </motion.div>
                  <div style={styles.illustrationTitle}>Need More Help?</div>
                  <div style={styles.illustrationSub}>
                    Our AI assistant can answer specific questions about schemes
                  </div>

                  <div style={styles.illustrationFeatures}>
                    {['Instant answers', 'Scheme details', 'Eligibility info', '200+ schemes covered', 'Multi-language support'].map((item, i) => (
                      <div key={i} style={styles.illustrationFeature}>
                        <FaCheckCircle style={{ color: '#f97316', fontSize: '10px', flexShrink: 0 }} />
                        <span style={styles.illustrationFeatureText}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    style={styles.findSchemesBtn}
                    onClick={() => setCurrentView('form')}
                    whileHover={{ scale: 1.05, boxShadow: '0 8px 25px rgba(249,115,22,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Find My Schemes <FaArrowRight style={{ fontSize: '11px' }} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE FAQ */}
          <motion.div
            style={styles.right}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div style={styles.faqList}>
              <AnimatePresence mode="wait">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, i) => (
                    <motion.div
                      key={faq.q}
                      style={{
                        ...styles.faqItem,
                        ...(openIndex === i ? styles.faqItemActive : {}),
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: i * 0.03 }}
                      layout
                    >
                      <button
                        style={styles.question}
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                      >
                        <span style={styles.questionText}>{faq.q}</span>
                        <motion.div
                          style={styles.chevronWrapper}
                          animate={{ rotate: openIndex === i ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown style={{
                            fontSize: '12px',
                            color: openIndex === i ? '#f97316' : '#9ca3af',
                          }} />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {openIndex === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <p style={styles.answer}>{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    style={styles.emptyState}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 style={styles.emptyTitle}>No questions found</h3>
                    <p style={styles.emptyText}>
                      Try a different search term
                    </p>
                    <motion.button
                      style={styles.emptyBtn}
                      onClick={() => setSearchQuery('')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Show All Questions
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* BOTTOM CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaDecor1} />
        <motion.div
          style={styles.ctaContent}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={styles.ctaTitle}>
            Still have <span style={{ color: '#f97316' }}>questions</span>?
          </h2>
          <p style={styles.ctaText}>
            Can't find what you're looking for? Start finding your eligible schemes now.
          </p>
          <div style={styles.ctaBtns}>
            <motion.button
              style={styles.ctaPrimaryBtn}
              onClick={() => setCurrentView('form')}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249,115,22,0.3)' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSearch style={{ fontSize: '14px' }} /> Find My Schemes
            </motion.button>
            <motion.button
              style={styles.ctaSecondaryBtn}
              onClick={goHome}
              whileHover={{ scale: 1.05, background: '#f3f4f6' }}
              whileTap={{ scale: 0.95 }}
            >
              <FaHome style={{ fontSize: '14px' }} /> Go Home
            </motion.button>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

const styles = {
  page: {
    background: '#ffffff',
    minHeight: '100vh',
    color: '#1a1a1a',
    fontFamily: 'Inter, sans-serif',
  },

  hero: {
    position: 'relative',
    background: '#ffffff',
    padding: 'clamp(80px, 12vw, 140px) 20px clamp(40px, 6vw, 60px)',
    textAlign: 'center',
    overflow: 'hidden',
  },
  heroBgDecor1: {
    position: 'absolute',
    top: '-120px',
    right: '-120px',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBgDecor2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  heroBgDecor3: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.03) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '700px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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
    marginBottom: '32px',
    transition: 'all 0.3s ease',
  },
  heroTitle: {
    fontSize: 'clamp(32px, 6vw, 50px)',
    fontWeight: 900,
    marginBottom: '14px',
    lineHeight: 1.15,
    color: '#1a1a1a',
  },
  heroTitleHighlight: {
    color: '#f97316',
  },
  heroSubtitle: {
    fontSize: 'clamp(14px, 2.5vw, 17px)',
    color: '#6b7280',
    maxWidth: '550px',
    margin: '0 auto 28px',
    lineHeight: 1.7,
  },

  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '480px',
    width: '100%',
    margin: '0 auto',
    padding: '12px 18px',
    background: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    transition: 'all 0.3s ease',
  },
  searchIcon: {
    color: '#9ca3af',
    fontSize: '14px',
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    color: '#1a1a1a',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
  },
  searchClear: {
    background: '#e5e7eb',
    border: 'none',
    color: '#6b7280',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    fontWeight: 700,
  },

  mainSection: {
    background: '#f9fafb',
    padding: 'clamp(40px, 6vw, 60px) 20px clamp(60px, 8vw, 100px)',
  },
  contentContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: 'clamp(30px, 4vw, 50px)',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  contentContainerMobile: {
    flexDirection: 'column-reverse',
  },

  left: {
    width: '300px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'sticky',
    top: '100px',
  },
  leftMobile: {
    position: 'relative',
    top: 'auto',
    width: '100%',
    flexShrink: 1,
  },

  illustrationCard: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '18px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
  },
  illustrationGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  illustrationContent: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },

  frameTopBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#f3f4f6',
    borderRadius: '18px 18px 0 0',
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

  illustrationMain: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  illustrationIcon: { fontSize: '36px' },
  illustrationTitle: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#f97316',
  },
  illustrationSub: {
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: '8px',
  },
  illustrationFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    marginBottom: '12px',
  },
  illustrationFeature: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  illustrationFeatureText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 500,
  },
  findSchemesBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    width: '100%',
    justifyContent: 'center',
  },

  right: {
    flex: 1,
    minWidth: '320px',
  },

  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  faqItem: {
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '4px',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
  },
  faqItemActive: {
    borderColor: 'rgba(249,115,22,0.3)',
    boxShadow: '0 4px 20px rgba(249,115,22,0.06)',
  },

  question: {
    width: '100%',
    background: 'none',
    border: 'none',
    color: '#1a1a1a',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(14px, 3vw, 18px)',
    cursor: 'pointer',
    textAlign: 'left',
    gap: '12px',
    fontFamily: 'Inter, sans-serif',
  },
  questionText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    fontWeight: 600,
    color: '#1a1a1a',
    lineHeight: 1.4,
    flex: 1,
  },
  chevronWrapper: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  answer: {
    color: '#4b5563',
    fontSize: 'clamp(13px, 2.5vw, 14px)',
    lineHeight: 1.7,
    padding: '0 clamp(14px, 3vw, 18px) clamp(14px, 3vw, 18px)',
    margin: 0,
  },

  emptyState: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px) 20px',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#1a1a1a',
    marginBottom: '6px',
  },
  emptyText: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '18px',
  },
  emptyBtn: {
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50px',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
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
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(249,115,22,0.04) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  ctaContent: {
    maxWidth: '550px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  ctaTitle: {
    fontSize: 'clamp(26px, 5vw, 38px)',
    fontWeight: 900,
    color: '#1a1a1a',
    marginBottom: '12px',
    lineHeight: 1.2,
  },
  ctaText: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    color: '#6b7280',
    marginBottom: '24px',
    lineHeight: 1.7,
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
    padding: '16px 34px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  ctaSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 34px',
    background: 'transparent',
    color: '#6b7280',
    border: '2px solid #e5e7eb',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.3s ease',
  },
};

export default FAQPage;
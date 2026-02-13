import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { getRecommendations } from '../api/api';
import { toast } from 'react-toastify';
import {
  FaUser, FaBirthdayCake, FaVenusMars, FaMapMarkerAlt,
  FaUsers, FaRupeeSign, FaBriefcase, FaGraduationCap,
  FaHeart, FaArrowRight, FaArrowLeft, FaSearch,
  FaTractor, FaUserGraduate, FaWheelchair, FaMosque
} from 'react-icons/fa';

const UserForm = () => {
  const {
    language, setResults, setUserProfile,
    setCurrentView, setTotalMatches, STATES
  } = useApp();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: '', state: '',
    category: '', annual_income: '', occupation: '',
    education: '', marital_status: '',
    is_bpl: false, is_farmer: false, is_student: false,
    disability: false, is_minority: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!formData.name || !formData.age || !formData.gender || !formData.state || !formData.category) {
        toast.error('Please fill all fields');
        return false;
      }
      if (formData.age < 0 || formData.age > 120) {
        toast.error('Enter a valid age');
        return false;
      }
    }
    if (s === 2) {
      if (!formData.annual_income || !formData.occupation) {
        toast.error('Please fill income and occupation');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentView('loading');

    const payload = {
      ...formData,
      age: parseInt(formData.age),
      annual_income: parseInt(formData.annual_income),
      language,
    };

    try {
      const data = await getRecommendations(payload);
      if (data.success) {
        setResults(data.schemes);
        setTotalMatches(data.total_matches);
        setUserProfile(payload);
        setCurrentView('results');
        toast.success(`Found ${data.total_matches} schemes for you!`);
      }
    } catch (error) {
      toast.error('Error connecting to server. Is backend running?');
      setCurrentView('home');
    }
  };

  return (
    <section id="form-section" style={styles.section}>
      <motion.div
        style={styles.container}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 style={styles.title}>
          <FaUser style={{ color: '#22c55e' }} /> Enter Your Details
        </h2>
        <p style={styles.subtitle}>
          Fill your information to find matching government schemes
        </p>

        {/* Progress */}
        <div style={styles.progress}>
          {['Personal', 'Economic', 'Additional'].map((label, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{
                ...styles.progressLine,
                background: step > i ? '#22c55e' : '#e2e8f0'
              }} />}
              <div style={styles.progressStep}>
                <div style={{
                  ...styles.progressDot,
                  background: step > i ? '#22c55e' : step === i + 1 ? '#22c55e' : '#e2e8f0',
                  color: step >= i + 1 ? 'white' : '#94a3b8',
                }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  fontWeight: step === i + 1 ? 700 : 500,
                  color: step === i + 1 ? '#22c55e' : '#94a3b8',
                }}>{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">

            {/* ===== STEP 1 ===== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={styles.stepTitle}>👤 Personal Information</h3>

                <div style={styles.group}>
                  <label style={styles.label}><FaUser style={styles.labelIcon} /> Full Name</label>
                  <input style={styles.input} name="name" value={formData.name}
                    onChange={handleChange} placeholder="Enter your full name" required />
                </div>

                <div style={styles.row}>
                  <div style={styles.group}>
                    <label style={styles.label}><FaBirthdayCake style={{ ...styles.labelIcon, color: '#16a34a' }} /> Age</label>
                    <input style={styles.input} type="number" name="age" value={formData.age}
                      onChange={handleChange} placeholder="Your age" min="0" max="120" required />
                  </div>
                  <div style={styles.group}>
                    <label style={styles.label}><FaVenusMars style={{ ...styles.labelIcon, color: '#ec4899' }} /> Gender</label>
                    <select style={styles.input} name="gender" value={formData.gender} onChange={handleChange} required>
                      <option value="">Select Gender</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                      <option value="other">🧑 Other</option>
                    </select>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.group}>
                    <label style={styles.label}><FaMapMarkerAlt style={{ ...styles.labelIcon, color: '#ef4444' }} /> State</label>
                    <select style={styles.input} name="state" value={formData.state} onChange={handleChange} required>
                      <option value="">Select State</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={styles.group}>
                    <label style={styles.label}><FaUsers style={{ ...styles.labelIcon, color: '#8b5cf6' }} /> Category</label>
                    <select style={styles.input} name="category" value={formData.category} onChange={handleChange} required>
                      <option value="">Select Category</option>
                      <option value="general">General</option>
                      <option value="obc">OBC</option>
                      <option value="sc">SC</option>
                      <option value="st">ST</option>
                    </select>
                  </div>
                </div>

                <motion.button type="button" onClick={nextStep} style={styles.nextBtn}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Next <FaArrowRight />
                </motion.button>
              </motion.div>
            )}

            {/* ===== STEP 2 ===== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={styles.stepTitle}>💰 Economic Information</h3>

                <div style={styles.group}>
                  <label style={styles.label}><FaRupeeSign style={{ ...styles.labelIcon, color: '#22c55e' }} /> Annual Family Income (₹)</label>
                  <input style={styles.input} type="number" name="annual_income" value={formData.annual_income}
                    onChange={handleChange} placeholder="e.g. 200000" min="0" required />
                  <small style={styles.hint}>Enter total yearly family income</small>
                </div>

                <div style={styles.group}>
                  <label style={styles.label}><FaBriefcase style={{ ...styles.labelIcon, color: '#16a34a' }} /> Occupation</label>
                  <select style={styles.input} name="occupation" value={formData.occupation} onChange={handleChange} required>
                    <option value="">Select Occupation</option>
                    <option value="farmer">🌾 Farmer</option>
                    <option value="student">🎓 Student</option>
                    <option value="employed">💼 Employed</option>
                    <option value="self_employed">🏪 Self-Employed</option>
                    <option value="unemployed">🔍 Unemployed</option>
                    <option value="daily_wage">🔨 Daily Wage Worker</option>
                    <option value="homemaker">🏠 Homemaker</option>
                    <option value="retired">👴 Retired</option>
                  </select>
                </div>

                <label style={styles.checkbox}>
                  <input type="checkbox" name="is_bpl" checked={formData.is_bpl}
                    onChange={handleChange} style={styles.checkboxInput} />
                  📋 BPL (Below Poverty Line) Card Holder
                </label>

                <div style={styles.btnRow}>
                  <motion.button type="button" onClick={prevStep} style={styles.backBtn}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FaArrowLeft /> Back
                  </motion.button>
                  <motion.button type="button" onClick={nextStep} style={{ ...styles.nextBtn, flex: 1 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Next <FaArrowRight />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ===== STEP 3 ===== */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={styles.stepTitle}>📋 Additional Information</h3>

                <div style={styles.row}>
                  <div style={styles.group}>
                    <label style={styles.label}><FaGraduationCap style={{ ...styles.labelIcon, color: '#8b5cf6' }} /> Education</label>
                    <select style={styles.input} name="education" value={formData.education} onChange={handleChange}>
                      <option value="">Select Level</option>
                      <option value="none">No Formal Education</option>
                      <option value="primary">Primary (1-5)</option>
                      <option value="secondary">Secondary (6-10)</option>
                      <option value="higher_secondary">Higher Secondary</option>
                      <option value="graduate">Graduate</option>
                      <option value="post_graduate">Post Graduate</option>
                    </select>
                  </div>
                  <div style={styles.group}>
                    <label style={styles.label}><FaHeart style={{ ...styles.labelIcon, color: '#ef4444' }} /> Marital Status</label>
                    <select style={styles.input} name="marital_status" value={formData.marital_status} onChange={handleChange}>
                      <option value="">Select Status</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                {[
                  { name: 'is_farmer', icon: <FaTractor />, text: 'I am a Farmer / Own Agricultural Land' },
                  { name: 'is_student', icon: <FaUserGraduate />, text: 'I am currently a Student' },
                  { name: 'disability', icon: <FaWheelchair />, text: 'Person with Disability' },
                  { name: 'is_minority', icon: <FaMosque />, text: 'Minority Community' },
                ].map(item => (
                  <label key={item.name} style={styles.checkbox}>
                    <input type="checkbox" name={item.name} checked={formData[item.name]}
                      onChange={handleChange} style={styles.checkboxInput} />
                    {item.icon} {item.text}
                  </label>
                ))}

                <div style={styles.btnRow}>
                  <motion.button type="button" onClick={prevStep} style={styles.backBtn}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <FaArrowLeft /> Back
                  </motion.button>
                  <motion.button type="submit" style={styles.submitBtn}
                    whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(34,197,94,0.4)' }}
                    whileTap={{ scale: 0.98 }}>
                    <FaSearch /> Find My Schemes
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </motion.div>
    </section>
  );
};

const styles = {
  section: {
    maxWidth: '680px',
    margin: '-50px auto 40px',
    padding: '0 clamp(12px, 3vw, 20px)',
    position: 'relative',
    zIndex: 10,
  },

  /* 🔥 DARK CARD */
  container: {
    background: '#0f172a', // dark navy
    borderRadius: 'clamp(16px, 3vw, 20px)',
    padding: 'clamp(24px, 5vw, 40px)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
    border: '1px solid #1e293b',
  },

  title: {
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: 800,
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '4px',
  },

  subtitle: {
    color: '#94a3b8',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    marginBottom: 'clamp(20px, 4vw, 28px)',
  },

  progress: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 'clamp(20px, 4vw, 30px)',
  },

  progressStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
  },

  progressDot: {
    width: 'clamp(30px, 5vw, 36px)',
    height: 'clamp(30px, 5vw, 36px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    transition: 'all 0.3s ease',
  },

  progressLine: {
    width: 'clamp(30px, 8vw, 60px)',
    height: '3px',
    borderRadius: '10px',
    marginBottom: '22px',
    marginLeft: '4px',
    marginRight: '4px',
    transition: 'all 0.3s ease',
  },

  stepTitle: {
    fontSize: 'clamp(16px, 3vw, 18px)',
    fontWeight: 700,
    marginBottom: 'clamp(14px, 3vw, 20px)',
    color: '#ffffff',
  },

  group: {
    marginBottom: 'clamp(14px, 3vw, 18px)',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 600,
    marginBottom: '6px',
    color: '#e2e8f0',
  },

  labelIcon: {
    color: '#22c55e',
    fontSize: '14px',
  },

  /* 🔥 DARK INPUTS */
  input: {
    width: '100%',
    padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 16px)',
    border: '2px solid #1e293b',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontFamily: 'Inter, sans-serif',
    background: '#020617',
    color: '#ffffff',
    transition: 'all 0.3s ease',
    outline: 'none',
    boxSizing: 'border-box',
  },

  hint: {
    color: '#94a3b8',
    fontSize: 'clamp(10px, 2vw, 12px)',
    marginTop: '4px',
    display: 'block',
  },

  row: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 'clamp(10px, 2vw, 15px)',
  },

  /* 🔥 DARK CHECKBOX CARDS */
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 18px)',
    border: '2px solid #1e293b',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    marginBottom: 'clamp(8px, 1.5vw, 10px)',
    cursor: 'pointer',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    fontWeight: 500,
    transition: 'all 0.3s ease',
    background: '#020617',
    color: '#e2e8f0',
  },

  checkboxInput: {
    width: '18px',
    height: '18px',
    accentColor: '#22c55e',
    flexShrink: 0,
  },

  btnRow: {
    display: 'flex',
    gap: 'clamp(8px, 2vw, 12px)',
    marginTop: 'clamp(10px, 2vw, 15px)',
    flexWrap: 'wrap',
  },

  nextBtn: {
    width: '100%',
    padding: 'clamp(12px, 2.5vw, 14px) 24px',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    border: 'none',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    marginTop: '10px',
  },

  backBtn: {
    padding: 'clamp(12px, 2.5vw, 14px) clamp(16px, 3vw, 24px)',
    background: '#1e293b',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    fontSize: 'clamp(13px, 2.5vw, 15px)',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },

  submitBtn: {
    flex: 1,
    padding: 'clamp(14px, 3vw, 16px) 24px',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: 'white',
    border: 'none',
    borderRadius: 'clamp(10px, 2vw, 12px)',
    fontSize: 'clamp(14px, 3vw, 16px)',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
    minWidth: '180px',
  },
};

export default UserForm;
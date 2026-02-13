import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

const Categories = () => {
  const { CATEGORIES } = useApp();

  return (
    <section id="categories" style={styles.section}>
      <div style={styles.container}>
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span style={styles.label}>Browse by Category</span>
          <h2 style={styles.heading}>
            Find schemes based on <span style={{ color: '#3b82f6' }}>categories</span>
          </h2>
        </motion.div>

        <div style={styles.grid}>
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              style={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{
                y: -6,
                boxShadow: `0 12px 30px ${cat.color}25`,
                borderColor: cat.color,
              }}
            >
              <div style={{ ...styles.iconBox, background: `${cat.color}15` }}>
                <span style={{ fontSize: '32px' }}>{cat.icon}</span>
              </div>
              <h3 style={styles.catName}>{cat.name}</h3>
              <div style={{ ...styles.countBadge, background: `${cat.color}15`, color: cat.color }}>
                {cat.count} Schemes
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const styles = {
  section: {
    padding: '80px 24px',
    background: '#f8faff',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  label: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#3b82f6',
    padding: '6px 20px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '16px',
  },
  heading: {
    fontSize: 'clamp(26px, 4vw, 38px)',
    fontWeight: 800,
    color: '#1e293b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '18px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px 20px',
    textAlign: 'center',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  iconBox: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px',
  },
  catName: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '10px',
    lineHeight: 1.3,
  },
  countBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '50px',
    fontSize: '12px',
    fontWeight: 700,
  },
};

export default Categories;
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendChatMessage } from '../api/api';
import { FaTimes, FaPaperPlane, FaRobot, FaMicrophone } from 'react-icons/fa';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const suggestions = [
    "Tell me about DPIIT Internship Scheme",
    "Eligibility criteria for Pradhan Mantri Awas Yojana",
    "Application process of Kisan Credit Scheme",
    "Schemes for students?"
  ];

  const handleSend = async (text = input) => {
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userMsg);
      setMessages(prev => [
        ...prev,
        { text: data.response || "Sorry, I couldn't process that.", sender: 'bot' }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { text: "Server error. Please try again.", sender: 'bot' }
      ]);
    }

    setLoading(false);
  };

  return (
    <motion.div
      style={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        style={styles.modal}
        initial={{ scale: 0.9, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.logo}>
            <FaRobot />
            <span>myScheme</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        {/* WELCOME BOX */}
        {messages.length === 0 && (
          <div style={styles.welcomeBox}>
            <h2>myScheme</h2>
            <p>
              myScheme is a National Platform that aims to offer one-stop search
              and discovery of Government schemes.
            </p>
            <p>
              Hi! I am your assistant, here to help you find eligible government
              schemes and provide information on eligibility, documents and more.
            </p>
          </div>
        )}

        {/* MESSAGES */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.message,
                ...(msg.sender === 'user' ? styles.userMsg : styles.botMsg),
              }}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div style={styles.botMsg}>Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTIONS */}
        {messages.length === 0 && (
          <div style={styles.suggestions}>
            {suggestions.map((s, i) => (
              <button
                key={i}
                style={styles.suggestionBtn}
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BAR */}
        <div style={styles.inputBar}>
          <input
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type something..."
            disabled={loading}
          />

          <button style={styles.iconBtn}>
            <FaMicrophone />
          </button>

          <button
            style={styles.sendBtn}
            onClick={() => handleSend()}
            disabled={loading}
          >
            <FaPaperPlane />
          </button>
        </div>

        {/* FOOTER NOTE */}
        <div style={styles.footer}>
          *myScheme assistant can make mistakes. Consider checking important information.
        </div>

      </motion.div>
    </motion.div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },

  modal: {
    width: '650px',
    maxHeight: '90vh',
    background: '#ffffff',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    fontFamily: 'Inter, sans-serif',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: 700,
    fontSize: '18px',
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
  },

  welcomeBox: {
    padding: '20px',
    background: '#f3f4f6',
    borderRadius: '12px',
    margin: '16px',
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  message: {
    padding: '10px 14px',
    borderRadius: '12px',
    maxWidth: '75%',
    fontSize: '14px',
  },

  botMsg: {
    background: '#f3f4f6',
    alignSelf: 'flex-start',
  },

  userMsg: {
    background: '#2563eb',
    color: 'white',
    alignSelf: 'flex-end',
  },

  suggestions: {
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  suggestionBtn: {
    background: '#f3f4f6',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
  },

  inputBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    gap: '8px',
    borderTop: '1px solid #e5e7eb',
  },

  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '20px',
    border: '1px solid #d1d5db',
    outline: 'none',
  },

  iconBtn: {
    background: '#f3f4f6',
    border: 'none',
    padding: '8px',
    borderRadius: '50%',
    cursor: 'pointer',
  },

  sendBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '50%',
    cursor: 'pointer',
  },

  footer: {
    fontSize: '11px',
    color: '#6b7280',
    padding: '8px 16px 14px',
  },
};

export default ChatBot;

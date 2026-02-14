import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendChatMessage } from '../api/api';
import { FaTimes, FaPaperPlane, FaMicrophone } from 'react-icons/fa';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      text: "Hi! I am your assistant, here to help you find eligible government schemes and provide information on eligibility, documents and more.",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      style={styles.chatWindow}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
    >

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>
          <div>
            <span style={styles.logoText}>Saarthi AI</span>
            <span style={styles.statusDot}>● Online</span>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <FaTimes />
        </button>
      </div>

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
            <div style={{
              ...(msg.sender === 'user' ? styles.userBubble : styles.botBubble),
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.message, ...styles.botMsg }}>
            <div style={styles.botBubble}>
              <div style={styles.typingDots}>
                <span style={styles.dot}>●</span>
                <span style={{ ...styles.dot, animationDelay: '0.2s' }}>●</span>
                <span style={{ ...styles.dot, animationDelay: '0.4s' }}>●</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

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

        <button style={styles.iconBtn} title="Voice input">
          <FaMicrophone />
        </button>

        <button
          style={{
            ...styles.sendBtn,
            opacity: input.trim() ? 1 : 0.5,
          }}
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          <FaPaperPlane />
        </button>
      </div>

      {/* FOOTER NOTE */}
      <div style={styles.footer}>
        *Saarthi AI assistant can make mistakes. Consider checking important information.
      </div>

    </motion.div>
  );
};

const styles = {
  chatWindow: {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '400px',
    maxWidth: 'calc(100vw - 32px)',
    height: '580px',
    maxHeight: 'calc(100vh - 120px)',
    background: '#ffffff',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 0 0 1px #e5e7eb',
    border: '1px solid #e5e7eb',
    fontFamily: 'Inter, sans-serif',
    zIndex: 2000,
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #e5e7eb',
    background: '#ffffff',
    flexShrink: 0,
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoText: {
    fontWeight: 700,
    fontSize: '16px',
    color: '#f97316',
    display: 'block',
  },

  statusDot: {
    fontSize: '10px',
    color: '#22c55e',
    fontWeight: 500,
  },

  closeBtn: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6b7280',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },

  message: {
    display: 'flex',
    gap: '8px',
    maxWidth: '85%',
  },

  botMsg: {
    alignSelf: 'flex-start',
  },

  userMsg: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },

  botBubble: {
    padding: '10px 14px',
    borderRadius: '4px 12px 12px 12px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    color: '#1a1a1a',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  userBubble: {
    padding: '10px 14px',
    borderRadius: '12px 4px 12px 12px',
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: '#ffffff',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  typingDots: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    padding: '2px 0',
  },

  dot: {
    fontSize: '14px',
    color: '#9ca3af',
    animation: 'pulse 1s infinite',
  },

  inputBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    gap: '8px',
    borderTop: '1px solid #e5e7eb',
    background: '#ffffff',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    outline: 'none',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    background: '#f9fafb',
    color: '#1a1a1a',
  },

  iconBtn: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  sendBtn: {
    background: 'linear-gradient(135deg, #f97316, #ea580c)',
    color: 'white',
    border: 'none',
    padding: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  footer: {
    fontSize: '10px',
    color: '#9ca3af',
    padding: '6px 12px 10px',
    textAlign: 'center',
    background: '#ffffff',
    flexShrink: 0,
  },
};

export default ChatBot;
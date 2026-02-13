import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { sendChatMessage } from '../api/api';
import { FaTimes, FaPaperPlane, FaRobot } from 'react-icons/fa';

const ChatBot = ({ onClose }) => {
  const { language, userProfile } = useApp();
  const [messages, setMessages] = useState([
    { text: "Namaste! 🙏 I'm your GovScheme AI Assistant. Ask me anything about Indian government schemes!", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setLoading(true);

    try {
      const data = await sendChatMessage(userMsg, language, userProfile);
      setMessages(prev => [...prev, {
        text: data.response || "Sorry, I couldn't process that.",
        sender: 'bot'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot'
      }]);
    }

    setLoading(false);
  };

  return (
    <motion.div
      style={styles.window}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaRobot style={{ fontSize: '20px' }} />
          <div>
            <h3 style={{ fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: 700, margin: 0 }}>GovScheme AI</h3>
            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', opacity: 0.8 }}>Ask me anything</span>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>
          <FaTimes />
        </button>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.message,
              ...(msg.sender === 'user' ? styles.userMsg : styles.botMsg),
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{msg.text}</p>
          </motion.div>
        ))}
        {loading && (
          <div style={{ ...styles.message, ...styles.botMsg }}>
            <p style={{ margin: 0 }}>Thinking... 🤔</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about any scheme..."
          disabled={loading}
        />
        <motion.button
          style={styles.sendBtn}
          onClick={handleSend}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          disabled={loading}
        >
          <FaPaperPlane />
        </motion.button>
      </div>
    </motion.div>
  );
};

const styles = {
  window: {
    position: 'fixed',
    bottom: 'clamp(80px, 12vw, 95px)',
    right: 'clamp(12px, 3vw, 25px)',
    width: 'clamp(300px, 85vw, 380px)',
    height: 'clamp(400px, 65vh, 520px)',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 10px 50px rgba(0,0,0,0.15)',
    zIndex: 1500,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 20px)',
    background: 'linear-gradient(135deg, #1e40af, #4338ca)',
    color: 'white',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: 'clamp(10px, 2vw, 16px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#fafbff',
  },
  message: {
    maxWidth: '85%',
    padding: 'clamp(10px, 2vw, 12px) clamp(12px, 2.5vw, 16px)',
    borderRadius: '16px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    lineHeight: 1.5,
  },
  botMsg: {
    background: '#f1f5f9',
    color: '#1e293b',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: '4px',
  },
  userMsg: {
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    alignSelf: 'flex-end',
    borderBottomRightRadius: '4px',
  },
  inputBar: {
    display: 'flex',
    padding: 'clamp(8px, 2vw, 12px)',
    gap: '8px',
    borderTop: '1px solid #e2e8f0',
    background: 'white',
  },
  input: {
    flex: 1,
    padding: 'clamp(8px, 2vw, 12px) clamp(12px, 2.5vw, 18px)',
    border: '2px solid #e2e8f0',
    borderRadius: '50px',
    fontSize: 'clamp(12px, 2.5vw, 14px)',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    background: '#fafbff',
  },
  sendBtn: {
    width: 'clamp(38px, 7vw, 44px)',
    height: 'clamp(38px, 7vw, 44px)',
    borderRadius: '50%',
    border: 'none',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    fontFamily: 'Inter, sans-serif',
    flexShrink: 0,
  },
};

export default ChatBot;
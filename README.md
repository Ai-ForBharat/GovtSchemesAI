# 🏛️ GovScheme AI - Indian Government Scheme Recommender

<div align="center">

![GovScheme AI](https://img.shields.io/badge/GovScheme-AI-blue?style=for-the-badge&logo=government)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=for-the-badge&logo=python)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-black?style=for-the-badge&logo=flask)
![ML](https://img.shields.io/badge/ML-scikit--learn-orange?style=for-the-badge&logo=scikit-learn)

**An AI-powered platform that recommends eligible Indian Government Schemes  
(Central + State) based on user profile — in 12 Indian languages.**

[Live Demo](#) • [Video Demo](#) • [Presentation](#)

</div>

---

## 📌 Problem Statement

> **70% of Indian citizens are unaware of government schemes they are eligible for.**

- 1000+ schemes across Central & State governments  
- Complex eligibility criteria confuse common people  
- Language barriers prevent access  
- No single platform to check all eligible schemes at once  

---

## 💡 Our Solution

**GovScheme AI** — A smart web application where citizens:

1. Fill a simple form with personal details  
2. AI analyzes their profile against 200+ schemes  
3. Shows matching schemes with relevance scores (0-100%)  
4. Translates everything into their preferred language  
5. AI Chatbot answers follow-up questions  

```
┌─────────────────────────────────────────────────┐
│ User fills form → AI matches schemes            │
│            ↓                   ↓                │
│  Personalized         Available in 12 languages │
│  recommendations       Indian languages         │
│            ↓                   ↓                │
│  Apply directly        AI chatbot helps         │
│  via official links    with questions           │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React + Vite)                                    │
│                                                             │
│ Language Selector | Multi-Step Form | Results | AI Chatbot │
│                                                             │
│                Axios API Calls                              │
└─────────────────────────┬───────────────────────────────────┘
                          │
                      REST API (JSON)
                          │
┌─────────────────────────┴───────────────────────────────────┐
│ BACKEND (Python Flask)                                      │
│                                                             │
│ POST /api/recommend → Matching Engine + Scoring             │
│ POST /api/chat      → AI Chatbot (Local ML)                 │
│ GET  /api/schemes   → All Schemes Data                      │
│ GET  /api/languages → Supported Languages                   │
│                                                             │
│ Core Modules:                                               │
│ - matching_engine.py (Hard Filters)                         │
│ - scoring.py (Weighted Scoring System)                      │
│ - chatbot.py (TF-IDF + Logistic Regression)                 │
│ - schemes.json (Database - 20 schemes)                      │
│ - utils.py (Translation Layer)                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow

```
STEP 1: User opens website
STEP 2: Selects preferred language (12 options)
STEP 3: Fills 3-step form
STEP 4: Clicks "Find My Schemes"
STEP 5: Frontend sends POST request to backend
STEP 6: Backend processes data
STEP 7: Returns matched schemes + scores
STEP 8: Frontend displays scheme cards
STEP 9: User interacts with AI Chatbot
```

---

## 🤖 AI/ML Model Details

### Model Type: Text Classification (Intent Recognition)

### Dataset
- 97 training sentences  
- 20 intent categories  

Example:
```
"tell me about pm kisan" → pm_kisan
"how to apply" → how_to_apply
```

### Feature Extraction
- TF-IDF Vectorizer  
- Unigrams + Bigrams  
- Vocabulary size ~186  

### Classifier
- Logistic Regression  
- Multi-class classification  
- Training accuracy ~100%  

### Prediction Flow
```
User: "tell me about farmer schemes"
↓
TF-IDF vector
↓
Model predicts: farmer_schemes (91%)
↓
Response generated + translated
```

---

## 🎯 Scheme Matching Algorithm

### Hard Filters (Pass/Fail)
- State match  
- Gender eligibility  
- Age range  

### Soft Scoring (0–100 points)

| Criteria | Points |
|----------|--------|
| Age Match | 15 |
| Gender Match | 15 |
| State Match | 20 |
| Category Match | 15 |
| Income Eligibility | 15 |
| Occupation Match | 10 |
| Special Criteria | 10 |

**Result Classification:**

- 🟢 ≥80% → High Match  
- 🟡 60–79% → Medium Match  
- 🔴 30–59% → Low Match  
- ❌ <30% → Not shown  

---

## 📁 Project Structure

```
AI For Bharat/
│
├── README.md
├── requirements.txt
│
├── backend/
│   ├── app.py
│   ├── matching_engine.py
│   ├── scoring.py
│   ├── data_loader.py
│   ├── chatbot.py
│   ├── train_model.py
│   ├── utils.py
│   ├── schemes.json
│   ├── chat_dataset.json
│   └── trained_model.pkl
│
├── frontend-vite/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│
└── frontend/
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|------------|
| Frontend | React 18 + Vite |
| Backend | Python Flask |
| AI/ML | scikit-learn |
| Matching | Custom Python Algorithm |
| Translation | deep-translator |
| Database | JSON |
| HTTP Client | Axios |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+  
- Node.js 18+  
- npm  
- Git (optional)

---

### Setup Instructions

```bash
# Clone project
git clone https://github.com/yourusername/govscheme-ai.git
cd govscheme-ai

# Install Python dependencies
pip install -r requirements.txt

# Train chatbot model (one-time)
cd backend
python train_model.py

# Start backend server
python app.py
```

Open new terminal:

```bash
cd frontend-vite
npm install
npm install axios react-router-dom react-icons react-toastify framer-motion
npm run dev
```

Visit:

```
http://localhost:3000
```

🎉 App is running!

---

## 🌐 API Documentation

**Base URL:** `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|------------|
| GET | / | Health check |
| POST | /api/recommend | Get scheme recommendations |
| POST | /api/chat | Chat with AI bot |
| GET | /api/schemes | Get all schemes |
| GET | /api/languages | Supported languages |

---

## 🌍 Supported Languages

English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu

---

## 🔮 Future Enhancements

- Add 500+ more schemes  
- Voice input support  
- PDF download of recommendations  
- WhatsApp sharing  
- SMS notifications  
- Aadhaar auto-fill  
- Mobile App (React Native)  
- Admin panel  

---







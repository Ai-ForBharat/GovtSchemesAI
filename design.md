# Saarthi AI – System Design Document

## Project Overview

**Product Name:** Saarthi AI  
**Category:** AI-powered citizen assistance platform  
**Version:** 1.0  
**Date:** February 15, 2026  

---

# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│ Web App (PWA) │ Mobile App │ WhatsApp Bot │ Admin Panel       │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│ Authentication │ Rate Limiting │ Request Routing │ Load Balance│
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                       APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│ User Service │ Scheme Service │ Chat Service │ Recommendation  │
│ Profile Mgmt │ Search Engine  │ NLP Engine   │ Eligibility     │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                         AI ENGINE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│ Recommendation │ NLP/NLU │ Translation │ Intent Detection      │
│ Eligibility ML │ Chatbot LLM │ Ranking Algo │ Entity Extract   │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│ PostgreSQL │ Elasticsearch │ Redis Cache │ Vector DB           │
│ User/Schemes │ Search Index │ Sessions │ Embeddings            │
└─────────────────────────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend

```yaml
Web Application:
  Framework: React 18 with TypeScript
  UI Library: Chakra UI / Material-UI
  State Management: Zustand / Redux Toolkit
  PWA: Workbox for offline support
  Build Tool: Vite

Mobile Application:
  Framework: React Native / Flutter
  State Management: Provider / Bloc
  Local Storage: SQLite

Admin Dashboard:
  Framework: React with TypeScript
  UI: Ant Design / Material-UI
  Charts: Recharts / Chart.js
```

## Backend

```yaml
API Framework: FastAPI (Python 3.11+)
Authentication: JWT + OAuth2
API Documentation: OpenAPI/Swagger
Background Jobs: Celery + Redis
Task Queue: Redis Queue (RQ)
WebSocket: FastAPI WebSocket support
```

## AI/ML Stack

```yaml
NLP/NLU:
  - spaCy for entity extraction
  - Hugging Face Transformers
  - Sentence Transformers for embeddings

LLM Integration:
  - OpenAI GPT-4 / GPT-3.5
  - Google Gemini API
  - Local LLM: Llama 2 (fallback)

Translation:
  - Google Cloud Translation API
  - IndicTrans for Indian languages
  - Bhashini API (Government of India)

Vector Search:
  - Pinecone / Weaviate
  - FAISS for local embeddings
```

## Database & Storage

```yaml
Primary Database: PostgreSQL 15+
Search Engine: Elasticsearch 8.x
Cache: Redis 7.x
Vector Database: Pinecone / Weaviate
Object Storage: AWS S3 / MinIO
```

## Infrastructure

```yaml
Cloud Provider: AWS / Google Cloud
Container: Docker
Orchestration: Kubernetes / AWS ECS
CDN: CloudFront / Cloudflare
Monitoring: Prometheus + Grafana
Logging: ELK Stack
```

---

# Component Architecture

## 1. User Profile Service

```python
class UserProfileService:
    """Manages user profile and preferences"""
    
    def create_profile(self, user_data: dict) -> UserProfile:
        """Create new user profile"""
        pass
    
    def update_profile(self, user_id: str, updates: dict) -> UserProfile:
        """Update existing profile"""
        pass
    
    def get_eligibility_params(self, user_id: str) -> dict:
        """Extract eligibility parameters from profile"""
        return {
            'age': user.age,
            'income': user.income_range,
            'occupation': user.occupation,
            'category': user.category,
            'state': user.state,
            'district': user.district
        }
```

## 2. Scheme Recommendation Engine

```python
class SchemeRecommendationEngine:
    """AI-powered scheme recommendation system"""
    
    def __init__(self):
        self.eligibility_checker = EligibilityChecker()
        self.ranking_model = RankingModel()
        self.vector_store = VectorStore()
    
    def recommend_schemes(
        self, 
        user_profile: dict, 
        top_k: int = 10
    ) -> List[SchemeRecommendation]:
        """
        Generate personalized scheme recommendations
        
        Steps:
        1. Filter schemes by hard eligibility criteria
        2. Calculate relevance scores
        3. Rank by composite score
        4. Return top K recommendations
        """
        eligible_schemes = self.eligibility_checker.filter_eligible(user_profile)
        
        scored_schemes = []
        for scheme in eligible_schemes:
            score = self._calculate_relevance_score(user_profile, scheme)
            scored_schemes.append((scheme, score))
        
        ranked = sorted(scored_schemes, key=lambda x: x[1], reverse=True)
        return ranked[:top_k]
    
    def _calculate_relevance_score(self, user_profile: dict, scheme: Scheme) -> float:
        """
        Composite scoring:
        - Eligibility confidence: 40%
        - Benefit amount: 30%
        - Application ease: 20%
        - Popularity: 10%
        """
        pass
```
## 3. Eligibility Verification Engine
```python
class EligibilityChecker:
    """Rule-based eligibility verification"""
    
    def check_eligibility(
        self, 
        user_profile: dict, 
        scheme: Scheme
    ) -> EligibilityResult:
        """
        Check if user is eligible for scheme
        Returns: eligible (bool), confidence (float), reasons (list)
        """
        rules = scheme.eligibility_rules
        results = []
        
        for rule in rules:
            result = self._evaluate_rule(user_profile, rule)
            results.append(result)
        
        eligible = all(r.passed for r in results)
        confidence = self._calculate_confidence(results)
        
        return EligibilityResult(
            eligible=eligible,
            confidence=confidence,
            passed_criteria=[r for r in results if r.passed],
            failed_criteria=[r for r in results if not r.passed],
            explanation=self._generate_explanation(results)
        )
    
    def _evaluate_rule(self, profile: dict, rule: Rule) -> RuleResult:
        """Evaluate single eligibility rule"""
        if rule.type == 'age_range':
            return self._check_age_range(profile['age'], rule.params)
        elif rule.type == 'income_limit':
            return self._check_income(profile['income'], rule.params)
        elif rule.type == 'category':
            return self._check_category(profile['category'], rule.params)
        # ... more rule types
```

## 4. Conversational AI Service
``` python
class ConversationalAIService:
    """Chatbot service with NLP capabilities"""
    
    def __init__(self):
        self.intent_classifier = IntentClassifier()
        self.entity_extractor = EntityExtractor()
        self.llm_client = LLMClient()
        self.context_manager = ConversationContextManager()
    
    async def process_message(
        self, 
        user_id: str, 
        message: str, 
        language: str = 'en'
    ) -> ChatResponse:
        """
        Process user message and generate response
        
        Flow:
        1. Translate to English if needed
        2. Extract intent and entities
        3. Retrieve relevant context
        4. Generate response using LLM
        5. Translate back to user language
        """
        # Get conversation context
        context = self.context_manager.get_context(user_id)
        
        # Translate if needed
        if language != 'en':
            message_en = await self.translate(message, language, 'en')
        else:
            message_en = message
        
        # Extract intent and entities
        intent = self.intent_classifier.classify(message_en)
        entities = self.entity_extractor.extract(message_en)
        
        # Handle based on intent
        if intent == 'scheme_search':
            response = await self._handle_scheme_search(
                entities, context
            )
        elif intent == 'eligibility_check':
            response = await self._handle_eligibility_check(
                entities, context
            )
        elif intent == 'general_query':
            response = await self._handle_general_query(
                message_en, context
            )
        
        # Translate response back
        if language != 'en':
            response_text = await self.translate(
                response.text, 'en', language
            )
        else:
            response_text = response.text
        
        # Update context
        self.context_manager.update_context(
            user_id, message, response_text
        )
        
        return ChatResponse(
            text=response_text,
            intent=intent,
            suggestions=response.suggestions,
            schemes=response.schemes
        )
```
## 5. Multilingual Translation Service
``` python
class TranslationService:
    """Handles multilingual translation"""
    
    SUPPORTED_LANGUAGES = [
        'en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml', 'pa'
    ]
    
    def __init__(self):
        self.bhashini_client = BhashiniAPIClient()
        self.google_translate = GoogleTranslateClient()
        self.cache = RedisCache()
    
    async def translate(
        self, 
        text: str, 
        source_lang: str, 
        target_lang: str
    ) -> str:
        """Translate text with caching"""
        
        # Check cache
        cache_key = f"trans:{source_lang}:{target_lang}:{hash(text)}"
        cached = await self.cache.get(cache_key)
        if cached:
            return cached
        
        # Try Bhashini first (for Indian languages)
        if self._is_indian_language(source_lang, target_lang):
            try:
                result = await self.bhashini_client.translate(
                    text, source_lang, target_lang
                )
                await self.cache.set(cache_key, result, ttl=86400)
                return result
            except Exception as e:
                logger.warning(f"Bhashini failed: {e}")
        
        # Fallback to Google Translate
        result = await self.google_translate.translate(
            text, source_lang, target_lang
        )
        await self.cache.set(cache_key, result, ttl=86400)
        return result
```





---

# Scalability Strategy

```yaml
Application Tier:
  - Kubernetes pods with auto-scaling
  - Stateless API design
  - Load balancing with NGINX/ALB

Database Tier:
  - Read replicas for queries
  - Connection pooling (PgBouncer)
  - Partitioning by state/region

Cache Tier:
  - Redis cluster
  - Distributed caching
  - Session management
```
## Database Schema
``` sql
-- Users and Profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(20),
    income_range VARCHAR(50),
    occupation VARCHAR(100),
    category VARCHAR(50), -- General, SC, ST, OBC, etc.
    state VARCHAR(100),
    district VARCHAR(100),
    education_level VARCHAR(50),
    marital_status VARCHAR(20),
    disability_status BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Schemes
CREATE TABLE schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_code VARCHAR(100) UNIQUE NOT NULL,
    name_en TEXT NOT NULL,
    name_hi TEXT,
    description_en TEXT,
    description_hi TEXT,
    ministry VARCHAR(255),
    department VARCHAR(255),
    scheme_type VARCHAR(50), -- Central, State, District
    category VARCHAR(100), -- Education, Health, Agriculture, etc.
    benefits JSONB,
    eligibility_rules JSONB NOT NULL,
    required_documents JSONB,
    application_process JSONB,
    official_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    state VARCHAR(100), -- NULL for central schemes
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheme_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    benefits TEXT,
    UNIQUE(scheme_id, language_code)
);

-- Eligibility Rules (structured)
CREATE TABLE eligibility_criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID REFERENCES schemes(id) ON DELETE CASCADE,
    criterion_type VARCHAR(50) NOT NULL, -- age, income, category, etc.
    operator VARCHAR(20), -- >=, <=, ==, IN, etc.
    value JSONB NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0
);

-- User Interactions
CREATE TABLE user_scheme_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    scheme_id UUID REFERENCES schemes(id),
    interaction_type VARCHAR(50), -- viewed, bookmarked, applied
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100),
    language VARCHAR(5),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Recommendations
CREATE TABLE scheme_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    scheme_id UUID REFERENCES schemes(id),
    relevance_score FLOAT,
    eligibility_confidence FLOAT,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin and Analytics
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE scheme_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID REFERENCES schemes(id),
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(50), -- created, updated, deleted
    changes JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_schemes_category ON schemes(category);
CREATE INDEX idx_schemes_state ON schemes(state);
CREATE INDEX idx_schemes_active ON schemes(is_active);
CREATE INDEX idx_user_profiles_state ON user_profiles(state);
CREATE INDEX idx_interactions_user ON user_scheme_interactions(user_id);
CREATE INDEX idx_conversations_user ON chat_conversations(user_id);
```

## API Endpoints

``` yaml
POST /api/v1/auth/register:
  description: Register new user
  request: { phone_number, preferred_language }
  response: { user_id, access_token }

POST /api/v1/auth/login:
  description: User login
  request: { phone_number, otp }
  response: { access_token, refresh_token }

POST /api/v1/auth/verify-otp:
  description: Verify OTP
  request: { phone_number, otp }
  response: { verified, access_token }
```
## User Profile
``` yaml
GET /api/v1/profile:
  description: Get user profile
  response: { profile_data }

POST /api/v1/profile:
  description: Create/update profile
  request: { age, income_range, occupation, category, state, district }
  response: { profile_id, updated_fields }

GET /api/v1/profile/eligibility-params:
  description: Get eligibility parameters
  response: { age, income, occupation, category, location }
```
## Scheme Discovery
``` yaml
GET /api/v1/schemes/recommendations:
  description: Get personalized recommendations
  parameters: { limit, offset }
  response: { 
    schemes: [{ 
      id, name, description, benefits, 
      relevance_score, eligibility_status 
    }],
    total_count
  }

GET /api/v1/schemes/search:
  description: Search schemes
  parameters: { query, category, state, limit }
  response: { schemes: [], total_count }

GET /api/v1/schemes/{scheme_id}:
  description: Get scheme details
  response: { 
    scheme_data, 
    eligibility_criteria, 
    required_documents,
    application_steps 
  }

POST /api/v1/schemes/{scheme_id}/check-eligibility:
  description: Check eligibility for specific scheme
  request: { user_profile }
  response: { 
    eligible, 
    confidence, 
    passed_criteria, 
    failed_criteria,
    explanation 
  }
```
## Chatbot
``` yaml
POST /api/v1/chat/message:
  description: Send message to chatbot
  request: { message, language, session_id }
  response: { 
    response_text, 
    intent, 
    suggested_schemes,
    follow_up_questions 
  }

GET /api/v1/chat/history:
  description: Get chat history
  parameters: { session_id, limit }
  response: { conversations: [] }

POST /api/v1/chat/translate:
  description: Translate text
  request: { text, source_lang, target_lang }
  response: { translated_text }
```
## Admin
``` yaml
POST /api/v1/admin/schemes:
  description: Create new scheme
  request: { scheme_data }
  response: { scheme_id }

PUT /api/v1/admin/schemes/{scheme_id}:
  description: Update scheme
  request: { updates }
  response: { updated_scheme }

DELETE /api/v1/admin/schemes/{scheme_id}:
  description: Delete/deactivate scheme
  response: { success }

GET /api/v1/admin/analytics:
  description: Get platform analytics
  response: { 
    total_users, 
    active_schemes, 
    recommendations_generated,
    chat_interactions 
  }
```
## Data Flow Diagrams

## Recommendation Flow
``` text
User Profile → Eligibility Filter → Relevance Scoring → 
Ranking Algorithm → Top K Selection → Response
```
## Chat Flow
``` text
User Message → Language Detection → Translation (if needed) →
Intent Classification → Entity Extraction → Context Retrieval →
LLM Processing → Response Generation → Translation → User
```
## Eligibility Check Flow
``` text
User Profile + Scheme Rules → Rule Evaluation Engine →
Confidence Calculation → Explanation Generation → Result
```
---

# Success Metrics & KPIs

## Technical Metrics
- API response time < 2 seconds (P95)
- Recommendation accuracy > 85%
- Chat intent classification > 90%
- System uptime > 99.5%

## Business Metrics
- User retention rate
- Schemes discovered per user
- Eligibility check success rate
- User satisfaction score (NPS)

## AI Model Metrics
- Recommendation relevance score
- Translation accuracy (BLEU score)
- Intent classification F1 score
- Eligibility prediction accuracy

---

**Document Version:** 1.0  
**Last Updated:** February 15, 2026
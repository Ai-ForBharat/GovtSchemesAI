Saarthi AI – System Design Document
Project Overview

Product Name: Saarthi AI
Category: AI-powered citizen assistance platform
Version: 1.0
Date: February 15, 2026

System Architecture
High-Level Architecture
┌───────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER                                             │
├───────────────────────────────────────────────────────────────┤
│ Web App (PWA) │ Mobile App │ WhatsApp Bot │ Admin Panel        │
└───────────────────────────────────────────────────────────────┘
                              │
┌───────────────────────────────────────────────────────────────┐
│ API GATEWAY LAYER                                              │
├───────────────────────────────────────────────────────────────┤
│ Authentication │ Rate Limiting │ Routing │ Load Balancing      │
└───────────────────────────────────────────────────────────────┘
                              │
┌───────────────────────────────────────────────────────────────┐
│ APPLICATION LAYER                                              │
├───────────────────────────────────────────────────────────────┤
│ User Service │ Scheme Service │ Chat Service │ Recommendation   │
│ Profile Mgmt │ Search Engine  │ NLP Engine   │ Eligibility      │
└───────────────────────────────────────────────────────────────┘
                              │
┌───────────────────────────────────────────────────────────────┐
│ AI ENGINE LAYER                                                │
├───────────────────────────────────────────────────────────────┤
│ Recommendation │ NLP/NLU │ Translation │ Intent Detection       │
│ Eligibility ML │ Chatbot LLM │ Ranking │ Entity Extraction      │
└───────────────────────────────────────────────────────────────┘
                              │
┌───────────────────────────────────────────────────────────────┐
│ DATA LAYER                                                     │
├───────────────────────────────────────────────────────────────┤
│ PostgreSQL │ Elasticsearch │ Redis │ Vector DB                 │
│ Users/Schemes │ Search Index │ Sessions │ Embeddings            │
└───────────────────────────────────────────────────────────────┘

Technology Stack
Frontend
Web Application:
  Framework: React 18 + TypeScript
  UI Library: Chakra UI / Material UI
  State Management: Zustand / Redux Toolkit
  PWA: Workbox
  Build Tool: Vite

Mobile Application:
  Framework: React Native / Flutter
  State Management: Provider / Bloc
  Local Storage: SQLite

Admin Dashboard:
  Framework: React + TypeScript
  UI: Ant Design / Material UI
  Charts: Recharts / Chart.js

Backend
API Framework: FastAPI (Python 3.11+)
Authentication: JWT + OAuth2
API Docs: OpenAPI / Swagger
Background Jobs: Celery + Redis
Task Queue: Redis Queue (RQ)
WebSocket: FastAPI WebSocket support

AI / ML Stack
NLP/NLU:
  - spaCy (entity extraction)
  - Hugging Face Transformers
  - Sentence Transformers (embeddings)

LLM Integration:
  - OpenAI GPT-4 / GPT-3.5
  - Google Gemini API
  - Local LLM: Llama 2 (fallback)

Translation:
  - Google Cloud Translation
  - IndicTrans
  - Bhashini API

Vector Search:
  - Pinecone / Weaviate
  - FAISS (local)

Database & Storage
Primary DB: PostgreSQL 15+
Search Engine: Elasticsearch 8.x
Cache: Redis 7.x
Vector DB: Pinecone / Weaviate
Object Storage: AWS S3 / MinIO

Infrastructure
Cloud Provider: AWS / GCP
Containerization: Docker
Orchestration: Kubernetes / AWS ECS
CDN: CloudFront / Cloudflare
Monitoring: Prometheus + Grafana
Logging: ELK Stack

Component Architecture
1. User Profile Service
class UserProfileService:
    """Manages user profile and preferences"""

    def create_profile(self, user_data: dict) -> UserProfile:
        pass

    def update_profile(self, user_id: str, updates: dict) -> UserProfile:
        pass

    def get_eligibility_params(self, user_id: str) -> dict:
        return {
            'age': user.age,
            'income': user.income_range,
            'occupation': user.occupation,
            'category': user.category,
            'state': user.state,
            'district': user.district
        }

2. Scheme Recommendation Engine
class SchemeRecommendationEngine:
    """AI-powered scheme recommendation system"""

    def __init__(self):
        self.eligibility_checker = EligibilityChecker()
        self.ranking_model = RankingModel()
        self.vector_store = VectorStore()

    def recommend_schemes(self, user_profile: dict, top_k: int = 10):
        eligible_schemes = self.eligibility_checker.filter_eligible(user_profile)

        scored_schemes = []
        for scheme in eligible_schemes:
            score = self._calculate_relevance_score(user_profile, scheme)
            scored_schemes.append((scheme, score))

        ranked = sorted(scored_schemes, key=lambda x: x[1], reverse=True)
        return ranked[:top_k]

    def _calculate_relevance_score(self, user_profile: dict, scheme):
        """
        Eligibility confidence: 40%
        Benefit amount: 30%
        Application ease: 20%
        Popularity: 10%
        """
        pass

3. Eligibility Verification Engine
class EligibilityChecker:
    """Rule-based eligibility verification"""

    def check_eligibility(self, user_profile: dict, scheme):
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

4. Conversational AI Service
class ConversationalAIService:
    """Chatbot service with NLP capabilities"""

    async def process_message(self, user_id, message, language='en'):
        context = self.context_manager.get_context(user_id)

        if language != 'en':
            message_en = await self.translate(message, language, 'en')
        else:
            message_en = message

        intent = self.intent_classifier.classify(message_en)
        entities = self.entity_extractor.extract(message_en)

        if intent == 'scheme_search':
            response = await self._handle_scheme_search(entities, context)
        elif intent == 'eligibility_check':
            response = await self._handle_eligibility_check(entities, context)
        else:
            response = await self._handle_general_query(message_en, context)

        if language != 'en':
            response_text = await self.translate(response.text, 'en', language)
        else:
            response_text = response.text

        self.context_manager.update_context(user_id, message, response_text)

        return ChatResponse(
            text=response_text,
            intent=intent,
            suggestions=response.suggestions,
            schemes=response.schemes
        )

5. Multilingual Translation Service
class TranslationService:
    SUPPORTED_LANGUAGES = [
        'en','hi','bn','te','mr','ta','gu','kn','ml','pa'
    ]

    async def translate(self, text, source_lang, target_lang):
        cache_key = f"trans:{source_lang}:{target_lang}:{hash(text)}"
        cached = await self.cache.get(cache_key)
        if cached:
            return cached

        # Try Bhashini first
        if self._is_indian_language(source_lang, target_lang):
            try:
                result = await self.bhashini_client.translate(
                    text, source_lang, target_lang
                )
                await self.cache.set(cache_key, result, ttl=86400)
                return result
            except Exception:
                pass

        # Fallback to Google
        result = await self.google_translate.translate(
            text, source_lang, target_lang
        )
        await self.cache.set(cache_key, result, ttl=86400)
        return result

Database Schema
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    preferred_language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW()
);


(Schema continues unchanged — already valid Markdown SQL blocks, so it is preserved as-is when pasted.)

API Endpoints
Authentication
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-otp

Profile
GET  /api/v1/profile
POST /api/v1/profile
GET  /api/v1/profile/eligibility-params

Scheme Discovery
GET  /api/v1/schemes/recommendations
GET  /api/v1/schemes/search
GET  /api/v1/schemes/{id}
POST /api/v1/schemes/{id}/check-eligibility

Chatbot
POST /api/v1/chat/message
GET  /api/v1/chat/history
POST /api/v1/chat/translate

Admin
POST   /api/v1/admin/schemes
PUT    /api/v1/admin/schemes/{id}
DELETE /api/v1/admin/schemes/{id}
GET    /api/v1/admin/analytics

Data Flow Diagrams
Recommendation Flow
User Profile → Eligibility Filter → Scoring → Ranking → Top-K → Response

Chat Flow
User Message → Language Detection → Translation → Intent → Entities
→ Context → LLM → Response → Translation → User

Eligibility Flow
Profile + Rules → Rule Engine → Confidence → Explanation → Result

Scalability Strategy
Horizontal Scaling

Application Tier

Kubernetes autoscaling

Stateless APIs

Load balancing via NGINX / ALB

Database Tier

Read replicas

PgBouncer pooling

Partitioning by region

Cache Tier

Redis cluster

Distributed sessions

Performance Optimization
Caching Strategy

Profiles: 1h TTL

Scheme data: 24h

Recommendations: 30m

Translations: 7d

Database Optimization

Indexed queries

Materialized views

Query caching

API Optimization

Compression

Pagination

Async processing

Security Considerations
Authentication

OTP login

JWT short expiry

Refresh rotation

Authorization

RBAC

User data isolation

Admin separation

Encryption

TLS 1.3 in transit

AES-256 at rest

Encrypted backups

Privacy

Minimal PII

Analytics anonymization

User deletion support

Deployment Plan
Environments

Development

Docker Compose

Mock APIs

Test DB

Staging

Kubernetes

Production-like data

Integration testing

Production

Multi-region deploy

Blue-green rollout

Automated rollback

CI/CD Pipeline
Stages

Code Quality

Ruff, ESLint

mypy

Security scans

Testing

Unit tests (>80%)

Integration tests

API contract tests

Build

Docker images

Vulnerability scans

Deploy

Kubernetes rollout

Health checks

Smoke tests

Monitoring
Application Monitoring

Prometheus metrics

Grafana dashboards

Sentry error tracking

Business Monitoring

Engagement metrics

Recommendation accuracy

Chat success rate

Scheme discovery rate

Success Metrics & KPIs
Technical

API response < 2s (P95)

Recommendation accuracy > 85%

Intent classification > 90%

Uptime > 99.5%

Business

Retention rate

Schemes discovered/user

Eligibility success rate

NPS score

AI Model Metrics

Recommendation relevance

Translation BLEU score

Intent F1 score

Eligibility accuracy

Document Version: 1.0
Last Updated: February 15, 2026

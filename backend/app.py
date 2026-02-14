"""
GovScheme AI - Main Flask Application (Enhanced v3.0)
=====================================================
Features:
  - Request logging & analytics tracking
  - Rate limiting per IP
  - Input sanitization & security
  - Scheme search endpoint with pagination
  - Bulk eligibility check
  - Trending/popular schemes tracking
  - User feedback collection
  - Error handling middleware
  - Response caching for performance
  - Health monitoring with uptime stats
  - API versioning ready
"""

import os
import time
import uuid
import logging
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict

from flask import Flask, request, jsonify, g
from flask_cors import CORS

from data_loader import DataLoader
from matching_engine import MatchingEngine
from chatbot import GovSchemeBot
from utils import (
    translate_schemes,
    translate_text,
    validate_user_input,
    get_supported_languages,
    format_currency,
    INDIAN_STATES
)

# ──────────────────────────────────────────────
# APP CONFIGURATION
# ──────────────────────────────────────────────

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Session-ID"]
    }
})

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('GovSchemeAI')


# ──────────────────────────────────────────────
# ANALYTICS & TRACKING
# ──────────────────────────────────────────────

class Analytics:
    """Tracks usage patterns, popular schemes, and API metrics"""

    def __init__(self):
        self.start_time = datetime.now()
        self.request_count = 0
        self.endpoint_hits = defaultdict(int)
        self.scheme_views = defaultdict(int)
        self.scheme_recommendations = defaultdict(int)
        self.search_queries = []
        self.category_interest = defaultdict(int)
        self.state_interest = defaultdict(int)
        self.language_usage = defaultdict(int)
        self.errors = []
        self.chat_messages_count = 0
        self.recommendation_requests = 0
        self.feedback_scores = []
        self.daily_active_sessions = set()
        self.hourly_requests = defaultdict(int)

    def track_request(self, endpoint, session_id=None):
        self.request_count += 1
        self.endpoint_hits[endpoint] += 1
        hour_key = datetime.now().strftime('%Y-%m-%d %H:00')
        self.hourly_requests[hour_key] += 1
        if session_id:
            self.daily_active_sessions.add(session_id)

    def track_scheme_view(self, scheme_id):
        self.scheme_views[scheme_id] += 1

    def track_recommendations(self, scheme_ids):
        for sid in scheme_ids:
            self.scheme_recommendations[sid] += 1
        self.recommendation_requests += 1

    def track_search(self, query):
        self.search_queries.append({
            "query": query,
            "timestamp": datetime.now().isoformat()
        })
        # Keep only last 500 searches
        if len(self.search_queries) > 500:
            self.search_queries = self.search_queries[-500:]

    def track_category(self, category):
        self.category_interest[category] += 1

    def track_state(self, state):
        self.state_interest[state] += 1

    def track_language(self, language):
        self.language_usage[language] += 1

    def track_chat(self):
        self.chat_messages_count += 1

    def track_error(self, endpoint, error_msg):
        self.errors.append({
            "endpoint": endpoint,
            "error": str(error_msg),
            "timestamp": datetime.now().isoformat()
        })
        if len(self.errors) > 200:
            self.errors = self.errors[-200:]

    def track_feedback(self, score):
        self.feedback_scores.append(score)

    def get_uptime(self):
        delta = datetime.now() - self.start_time
        days = delta.days
        hours, remainder = divmod(delta.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{days}d {hours}h {minutes}m {seconds}s"

    def get_summary(self):
        avg_feedback = (
            round(sum(self.feedback_scores) / len(self.feedback_scores), 2)
            if self.feedback_scores else None
        )
        return {
            "uptime": self.get_uptime(),
            "started_at": self.start_time.isoformat(),
            "total_requests": self.request_count,
            "total_chats": self.chat_messages_count,
            "total_recommendations": self.recommendation_requests,
            "active_sessions_today": len(self.daily_active_sessions),
            "top_endpoints": dict(
                sorted(self.endpoint_hits.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            "top_viewed_schemes": dict(
                sorted(self.scheme_views.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            "top_recommended_schemes": dict(
                sorted(self.scheme_recommendations.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            "category_interest": dict(self.category_interest),
            "state_interest": dict(
                sorted(self.state_interest.items(), key=lambda x: x[1], reverse=True)[:10]
            ),
            "language_usage": dict(self.language_usage),
            "recent_errors_count": len(self.errors),
            "average_feedback": avg_feedback,
            "total_feedback": len(self.feedback_scores)
        }

    def get_trending_schemes(self, limit=10):
        """Get schemes with highest combined views + recommendations"""
        combined = defaultdict(int)
        for sid, count in self.scheme_views.items():
            combined[sid] += count
        for sid, count in self.scheme_recommendations.items():
            combined[sid] += count * 2  # recommendations weighted higher
        sorted_schemes = sorted(combined.items(), key=lambda x: x[1], reverse=True)
        return sorted_schemes[:limit]


# ──────────────────────────────────────────────
# RATE LIMITER
# ──────────────────────────────────────────────

class RateLimiter:
    """Simple in-memory rate limiter per IP"""

    def __init__(self, max_requests=60, window_seconds=60):
        self.max_requests = max_requests
        self.window = window_seconds
        self.requests = defaultdict(list)

    def is_allowed(self, identifier):
        now = time.time()
        # Clean old entries
        self.requests[identifier] = [
            t for t in self.requests[identifier]
            if now - t < self.window
        ]
        if len(self.requests[identifier]) >= self.max_requests:
            return False
        self.requests[identifier].append(now)
        return True

    def get_remaining(self, identifier):
        now = time.time()
        self.requests[identifier] = [
            t for t in self.requests[identifier]
            if now - t < self.window
        ]
        return max(0, self.max_requests - len(self.requests[identifier]))


# ──────────────────────────────────────────────
# RESPONSE CACHE
# ──────────────────────────────────────────────

class SimpleCache:
    """Lightweight in-memory cache with TTL"""

    def __init__(self, default_ttl=300):
        self.cache = {}
        self.default_ttl = default_ttl

    def get(self, key):
        if key in self.cache:
            entry = self.cache[key]
            if time.time() < entry['expires']:
                return entry['data']
            else:
                del self.cache[key]
        return None

    def set(self, key, data, ttl=None):
        self.cache[key] = {
            'data': data,
            'expires': time.time() + (ttl or self.default_ttl)
        }

    def invalidate(self, pattern=None):
        if pattern:
            keys_to_delete = [k for k in self.cache if pattern in k]
            for k in keys_to_delete:
                del self.cache[k]
        else:
            self.cache.clear()

    def stats(self):
        now = time.time()
        active = sum(1 for v in self.cache.values() if now < v['expires'])
        return {"total_keys": len(self.cache), "active_keys": active}


# ──────────────────────────────────────────────
# INPUT SANITIZER
# ──────────────────────────────────────────────

class InputSanitizer:
    """Cleans and validates incoming data"""

    MAX_MESSAGE_LENGTH = 1000
    MAX_FIELD_LENGTH = 200

    @classmethod
    def sanitize_string(cls, value, max_length=None):
        if not isinstance(value, str):
            return value
        max_len = max_length or cls.MAX_FIELD_LENGTH
        # Strip whitespace, limit length
        cleaned = value.strip()[:max_len]
        # Remove potential script injections
        dangerous = ['<script', 'javascript:', 'onclick', 'onerror', '<iframe', 'eval(']
        for pattern in dangerous:
            cleaned = cleaned.replace(pattern, '')
        return cleaned

    @classmethod
    def sanitize_chat_message(cls, message):
        if not message:
            return ""
        return cls.sanitize_string(message, cls.MAX_MESSAGE_LENGTH)

    @classmethod
    def sanitize_user_data(cls, data):
        if not isinstance(data, dict):
            return data
        sanitized = {}
        for key, value in data.items():
            clean_key = cls.sanitize_string(str(key), 50)
            if isinstance(value, str):
                sanitized[clean_key] = cls.sanitize_string(value)
            elif isinstance(value, (int, float, bool)):
                sanitized[clean_key] = value
            elif isinstance(value, dict):
                sanitized[clean_key] = cls.sanitize_user_data(value)
            elif isinstance(value, list):
                sanitized[clean_key] = [
                    cls.sanitize_string(v) if isinstance(v, str) else v
                    for v in value[:50]
                ]
            else:
                sanitized[clean_key] = value
        return sanitized


# ──────────────────────────────────────────────
# INITIALIZATION
# ──────────────────────────────────────────────

print("=" * 55)
print("🚀 Starting GovScheme AI v3.0...")
print("=" * 55)

data_loader = DataLoader()
all_schemes = data_loader.get_all_schemes()

matcher = MatchingEngine(all_schemes)
chatbot = GovSchemeBot(schemes=all_schemes)

analytics = Analytics()
rate_limiter = RateLimiter(max_requests=100, window_seconds=60)
cache = SimpleCache(default_ttl=300)
sanitizer = InputSanitizer()

print(f"📊 Loaded {len(all_schemes)} schemes")
print(f"🤖 Chatbot ready: {chatbot.is_ready}")
print(f"🛡️  Rate limiter: 100 req/min per IP")
print(f"💾 Cache TTL: 300s")
print("=" * 55)
print("✅ All systems ready!\n")


# ──────────────────────────────────────────────
# MIDDLEWARE
# ──────────────────────────────────────────────

@app.before_request
def before_request():
    """Runs before every request"""
    g.start_time = time.time()
    g.request_id = str(uuid.uuid4())[:8]

    # Get client identifier
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr) or 'unknown'
    g.client_ip = client_ip

    # Rate limiting (skip for health check)
    if request.path != '/' and request.path != '/api/health':
        if not rate_limiter.is_allowed(client_ip):
            logger.warning(f"Rate limit exceeded for {client_ip}")
            return jsonify({
                "error": "Rate limit exceeded",
                "message": "Too many requests. Please wait a moment.",
                "retry_after": 60
            }), 429


@app.after_request
def after_request(response):
    """Runs after every request - logging & headers"""
    # Calculate response time
    duration = round((time.time() - g.get('start_time', time.time())) * 1000, 2)

    # Add useful headers
    response.headers['X-Request-ID'] = g.get('request_id', 'unknown')
    response.headers['X-Response-Time'] = f"{duration}ms"
    response.headers['X-RateLimit-Remaining'] = str(
        rate_limiter.get_remaining(g.get('client_ip', 'unknown'))
    )

    # Track analytics
    session_id = request.headers.get('X-Session-ID')
    analytics.track_request(request.path, session_id)

    # Log request
    logger.info(
        f"[{g.get('request_id', '?')}] {request.method} {request.path} "
        f"→ {response.status_code} ({duration}ms)"
    )

    return response


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "error": "Not found",
        "message": "The requested endpoint does not exist.",
        "available_endpoints": [
            "GET  /",
            "GET  /api/health",
            "POST /api/recommend",
            "POST /api/chat",
            "POST /api/chat/reset",
            "GET  /api/chat/info",
            "GET  /api/schemes",
            "GET  /api/schemes/<id>",
            "GET  /api/schemes/search",
            "GET  /api/schemes/trending",
            "POST /api/eligibility/check",
            "POST /api/feedback",
            "GET  /api/languages",
            "GET  /api/states",
            "GET  /api/categories",
            "GET  /api/stats",
            "GET  /api/analytics"
        ]
    }), 404


@app.errorhandler(500)
def internal_error(error):
    analytics.track_error(request.path, str(error))
    logger.error(f"Internal error on {request.path}: {error}")
    return jsonify({
        "error": "Internal server error",
        "message": "Something went wrong. Please try again.",
        "request_id": g.get('request_id', 'unknown')
    }), 500


@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        "error": "Method not allowed",
        "message": f"{request.method} is not supported for {request.path}"
    }), 405


# ──────────────────────────────────────────────
# HEALTH & STATUS ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/', methods=['GET'])
def home():
    """Health check + API overview"""
    return jsonify({
        "status": "running",
        "app": "GovScheme AI",
        "version": "3.0",
        "uptime": analytics.get_uptime(),
        "total_schemes": len(all_schemes),
        "chatbot_ready": chatbot.is_ready,
        "total_requests_served": analytics.request_count,
        "endpoints": {
            "core": [
                "POST /api/recommend → Get scheme recommendations",
                "POST /api/chat → Chat with AI assistant",
                "GET  /api/schemes → Browse all schemes",
                "GET  /api/schemes/<id> → Scheme details",
            ],
            "search": [
                "GET  /api/schemes/search?q=query → Search schemes",
                "GET  /api/schemes/trending → Popular schemes",
            ],
            "chat_management": [
                "POST /api/chat/reset → Reset conversation",
                "GET  /api/chat/info → Session details",
            ],
            "utilities": [
                "POST /api/eligibility/check → Bulk eligibility check",
                "POST /api/feedback → Submit feedback",
                "GET  /api/languages → Supported languages",
                "GET  /api/states → Indian states list",
                "GET  /api/categories → Scheme categories",
            ],
            "monitoring": [
                "GET  /api/health → Detailed health check",
                "GET  /api/stats → Quick statistics",
                "GET  /api/analytics → Full analytics dashboard",
            ]
        }
    })


@app.route('/api/health', methods=['GET'])
def health_check():
    """Detailed health check for monitoring"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime": analytics.get_uptime(),
        "components": {
            "data_loader": {
                "status": "ok" if all_schemes else "error",
                "schemes_loaded": len(all_schemes)
            },
            "matching_engine": {
                "status": "ok",
                "min_score_threshold": 30
            },
            "chatbot": {
                "status": "ok" if chatbot.is_ready else "degraded",
                "ml_model_loaded": chatbot.is_ready,
                "schemes_indexed": len(chatbot.schemes) if chatbot.schemes else 0
            },
            "cache": cache.stats(),
            "rate_limiter": {
                "max_requests_per_minute": rate_limiter.max_requests
            }
        },
        "recent_errors": len(analytics.errors)
    })


# ──────────────────────────────────────────────
# ⭐ CORE: SCHEME RECOMMENDATION
# ──────────────────────────────────────────────

@app.route('/api/recommend', methods=['POST'])
def recommend_schemes():
    """
    ⭐ MAIN ENDPOINT
    Receives user profile → Returns matched schemes

    Expected JSON body:
    {
        "age": 25,
        "gender": "male",
        "state": "Bihar",
        "category": "obc",
        "annual_income": 150000,
        "occupation": "farmer",
        "is_bpl": false,
        "is_farmer": true,
        "language": "en"
    }
    """
    try:
        user_data = request.json

        if not user_data:
            return jsonify({
                "error": "No data received",
                "message": "Please send user profile as JSON body"
            }), 400

        # Sanitize input
        user_data = sanitizer.sanitize_user_data(user_data)

        # Validate
        errors = validate_user_input(user_data)
        if errors:
            return jsonify({
                "error": "Validation failed",
                "details": errors,
                "message": "Please fix the errors and try again"
            }), 400

        language = user_data.get('language', 'en')

        # Track analytics
        analytics.track_language(language)
        if user_data.get('state'):
            analytics.track_state(user_data['state'])

        # Check cache
        cache_key = f"recommend:{hash(str(sorted(user_data.items())))}"
        cached = cache.get(cache_key)
        if cached and language == 'en':
            cached['from_cache'] = True
            return jsonify(cached)

        # Find matches
        matched_schemes = matcher.find_matches(user_data)

        # Track which schemes were recommended
        scheme_ids = [s.get('id', '') for s in matched_schemes]
        analytics.track_recommendations(scheme_ids)

        # Translate if needed
        if language != 'en':
            matched_schemes = translate_schemes(matched_schemes, language)

        # Build response
        response_data = {
            "success": True,
            "total_matches": len(matched_schemes),
            "schemes": matched_schemes,
            "user_summary": {
                "state": user_data.get('state'),
                "age": user_data.get('age'),
                "gender": user_data.get('gender'),
                "category": user_data.get('category'),
                "occupation": user_data.get('occupation'),
                "annual_income": user_data.get('annual_income'),
                "language": language
            },
            "tips": _get_recommendation_tips(user_data, matched_schemes),
            "request_id": g.get('request_id'),
            "from_cache": False
        }

        # Cache English results
        if language == 'en':
            cache.set(cache_key, response_data, ttl=180)

        return jsonify(response_data)

    except Exception as e:
        analytics.track_error('/api/recommend', str(e))
        logger.error(f"Recommendation error: {e}")
        return jsonify({
            "error": "Processing failed",
            "message": "Unable to process your request. Please try again.",
            "request_id": g.get('request_id')
        }), 500


def _get_recommendation_tips(user_data, schemes):
    """Generate helpful tips based on results"""
    tips = []

    if len(schemes) == 0:
        tips.append("No exact matches found. Try broadening your criteria.")
        tips.append("Some schemes have age or income limits. Check if your details are correct.")

    elif len(schemes) < 5:
        tips.append("Try checking schemes from other categories too.")

    if user_data.get('is_bpl') and not any(
        s.get('match_score', 0) > 80 for s in schemes
    ):
        tips.append("Ensure your BPL certificate is up to date for maximum benefits.")

    if not user_data.get('occupation'):
        tips.append("Adding your occupation could help find more relevant schemes.")

    if not user_data.get('category'):
        tips.append("Specifying your social category (SC/ST/OBC/General) may unlock additional schemes.")

    high_match = [s for s in schemes if s.get('match_score', 0) >= 80]
    if high_match:
        tips.append(f"You have {len(high_match)} strong matches (80%+). Apply to these first!")

    return tips


# ──────────────────────────────────────────────
# 🤖 CHATBOT ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    AI Chatbot endpoint with session tracking

    Expected JSON body:
    {
        "message": "Tell me about PM-KISAN",
        "language": "en",
        "context": {"occupation": "farmer"},
        "session_id": "optional-session-id"
    }
    """
    try:
        data = request.json

        if not data:
            return jsonify({"error": "No data received"}), 400

        message = sanitizer.sanitize_chat_message(data.get('message', ''))
        language = data.get('language', 'en')
        context = sanitizer.sanitize_user_data(data.get('context', {}))

        # Session management
        session_id = (
            data.get('session_id') or
            request.headers.get('X-Session-ID') or
            request.remote_addr or
            'default'
        )
        context['session_id'] = session_id

        if not message.strip():
            return jsonify({
                "error": "Empty message",
                "message": "Please type your question"
            }), 400

        if len(message) > 1000:
            return jsonify({
                "error": "Message too long",
                "message": "Please keep your message under 1000 characters"
            }), 400

        # Track analytics
        analytics.track_chat()
        analytics.track_language(language)

        # Get response
        response = chatbot.get_response(message, context, language)

        # Build enriched response
        user_info = chatbot.memory.get_user_info(session_id)
        last_schemes = chatbot.memory.get_last_schemes(session_id)

        return jsonify({
            "success": True,
            "response": response,
            "session_id": session_id,
            "detected_info": user_info,
            "schemes_in_context": len(last_schemes),
            "turn_number": chatbot.memory.get_turn_count(session_id),
            "request_id": g.get('request_id')
        })

    except Exception as e:
        analytics.track_error('/api/chat', str(e))
        logger.error(f"Chat error: {e}")
        return jsonify({
            "success": False,
            "response": "Sorry, I encountered an error. Please try again.",
            "error_id": g.get('request_id')
        })


@app.route('/api/chat/reset', methods=['POST'])
def reset_chat():
    """Reset chat session and clear memory"""
    try:
        data = request.json or {}
        session_id = (
            data.get('session_id') or
            request.headers.get('X-Session-ID') or
            request.remote_addr or
            'default'
        )
        chatbot.memory.clear_session(session_id)
        return jsonify({
            "success": True,
            "message": "Chat session reset successfully",
            "session_id": session_id
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/chat/info', methods=['GET'])
def chat_info():
    """Get current chat session details"""
    session_id = (
        request.args.get('session_id') or
        request.headers.get('X-Session-ID') or
        request.remote_addr or
        'default'
    )
    user_info = chatbot.memory.get_user_info(session_id)
    turn_count = chatbot.memory.get_turn_count(session_id)
    last_schemes = chatbot.memory.get_last_schemes(session_id)

    return jsonify({
        "session_id": session_id,
        "user_info": user_info,
        "turn_count": turn_count,
        "schemes_in_context": len(last_schemes),
        "last_intent": chatbot.memory.get_last_intent(session_id)
    })


# ──────────────────────────────────────────────
# 📋 SCHEME ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/schemes', methods=['GET'])
def get_all_schemes():
    """
    Get all schemes with filtering and pagination

    Query params:
      ?category=health
      ?type=central
      ?state=Bihar
      ?gender=female
      ?page=1
      ?per_page=10
      ?sort=name|category
      ?language=hi
    """
    # Parse filters
    category = request.args.get('category')
    scheme_type = request.args.get('type')
    state = request.args.get('state')
    gender = request.args.get('gender')
    language = request.args.get('language', 'en')

    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    per_page = min(per_page, 100)  # Cap at 100

    # Sort
    sort_by = request.args.get('sort', 'name')

    # Check cache
    cache_key = f"schemes:{category}:{scheme_type}:{state}:{gender}:{page}:{per_page}:{sort_by}"
    cached = cache.get(cache_key)
    if cached and language == 'en':
        return jsonify(cached)

    # Start with all schemes
    schemes = data_loader.get_all_schemes()

    # Apply filters
    if category:
        schemes = [s for s in schemes if s.get('category', '').lower() == category.lower()]
        analytics.track_category(category)

    if scheme_type:
        schemes = [s for s in schemes if s.get('type', '').lower() == scheme_type.lower()]

    if state:
        schemes = [
            s for s in schemes
            if s.get('eligibility', {}).get('states') == 'all' or
               state in s.get('eligibility', {}).get('states', [])
        ]
        analytics.track_state(state)

    if gender:
        schemes = [
            s for s in schemes
            if s.get('eligibility', {}).get('gender', 'all') in ['all', gender.lower()]
        ]

    # Sort
    if sort_by == 'category':
        schemes.sort(key=lambda x: x.get('category', ''))
    else:
        schemes.sort(key=lambda x: x.get('name', ''))

    # Pagination
    total = len(schemes)
    total_pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, total_pages))
    start = (page - 1) * per_page
    end = start + per_page
    paginated = schemes[start:end]

    # Translate if needed
    if language != 'en':
        paginated = translate_schemes(paginated, language)
        analytics.track_language(language)

    response_data = {
        "success": True,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1,
        "schemes": paginated,
        "filters_applied": {
            "category": category,
            "type": scheme_type,
            "state": state,
            "gender": gender
        }
    }

    if language == 'en':
        cache.set(cache_key, response_data, ttl=300)

    return jsonify(response_data)


@app.route('/api/schemes/search', methods=['GET'])
def search_schemes():
    """
    🔍 Full-text search across schemes

    Query params:
      ?q=farmer loan
      ?limit=10
      ?language=en
    """
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 50)
    language = request.args.get('language', 'en')

    if not query:
        return jsonify({
            "error": "Missing query",
            "message": "Use ?q=your+search+query"
        }), 400

    if len(query) < 2:
        return jsonify({
            "error": "Query too short",
            "message": "Search query must be at least 2 characters"
        }), 400

    # Track search
    analytics.track_search(query)

    # Use chatbot's scheme searcher if available
    if chatbot.searcher:
        results = chatbot.searcher.search(query, max_results=limit)
    else:
        # Basic fallback search
        query_lower = query.lower()
        results = [
            s for s in all_schemes
            if query_lower in s.get('name', '').lower() or
               query_lower in s.get('description', '').lower()
        ][:limit]

    if language != 'en':
        results = translate_schemes(results, language)

    return jsonify({
        "success": True,
        "query": query,
        "total_results": len(results),
        "schemes": results
    })


@app.route('/api/schemes/trending', methods=['GET'])
def trending_schemes():
    """📈 Get trending/popular schemes based on views & recommendations"""
    limit = request.args.get('limit', 10, type=int)
    limit = min(limit, 30)

    trending = analytics.get_trending_schemes(limit)
    schemes_list = []

    for scheme_id, score in trending:
        scheme = data_loader.get_scheme_by_id(scheme_id)
        if scheme:
            scheme_copy = scheme.copy()
            scheme_copy['popularity_score'] = score
            scheme_copy['view_count'] = analytics.scheme_views.get(scheme_id, 0)
            scheme_copy['recommendation_count'] = analytics.scheme_recommendations.get(scheme_id, 0)
            schemes_list.append(scheme_copy)

    # If no analytics data yet, return featured schemes
    if not schemes_list:
        schemes_list = all_schemes[:limit]
        for i, s in enumerate(schemes_list):
            s_copy = s.copy()
            s_copy['popularity_score'] = 0
            s_copy['featured'] = True
            schemes_list[i] = s_copy

    return jsonify({
        "success": True,
        "total": len(schemes_list),
        "schemes": schemes_list,
        "note": "Popularity based on views and recommendations" if trending else "Showing featured schemes"
    })


@app.route('/api/schemes/<scheme_id>', methods=['GET'])
def get_scheme_detail(scheme_id):
    """Get full details of a specific scheme"""
    language = request.args.get('language', 'en')

    # Track view
    analytics.track_scheme_view(scheme_id)

    scheme = data_loader.get_scheme_by_id(scheme_id)
    if not scheme:
        return jsonify({
            "error": "Scheme not found",
            "message": f"No scheme found with ID: {scheme_id}",
            "suggestion": "Use GET /api/schemes to browse available schemes"
        }), 404

    scheme_data = scheme.copy()

    # Add popularity info
    scheme_data['view_count'] = analytics.scheme_views.get(scheme_id, 0)
    scheme_data['recommendation_count'] = analytics.scheme_recommendations.get(scheme_id, 0)

    # Find related schemes (same category)
    related = [
        {"id": s['id'], "name": s['name']}
        for s in all_schemes
        if s.get('category') == scheme.get('category') and s['id'] != scheme_id
    ][:5]
    scheme_data['related_schemes'] = related

    # Translate if needed
    if language != 'en':
        scheme_data['name_en'] = scheme_data.get('name', '')
        scheme_data['name'] = translate_text(scheme_data.get('name', ''), language)
        scheme_data['description'] = translate_text(scheme_data.get('description', ''), language)
        scheme_data['benefits'] = translate_text(scheme_data.get('benefits', ''), language)
        scheme_data['how_to_apply'] = translate_text(scheme_data.get('how_to_apply', ''), language)

    return jsonify({
        "success": True,
        "scheme": scheme_data
    })


# ──────────────────────────────────────────────
# 🔍 ELIGIBILITY CHECK ENDPOINT
# ──────────────────────────────────────────────

@app.route('/api/eligibility/check', methods=['POST'])
def check_eligibility():
    """
    Check eligibility for specific scheme(s)

    Expected JSON body:
    {
        "user_profile": {
            "age": 25,
            "gender": "male",
            "state": "Bihar",
            "category": "obc",
            "annual_income": 150000
        },
        "scheme_ids": ["pm-kisan", "ayushman-bharat"]   // optional
    }
    """
    try:
        data = request.json
        if not data or not data.get('user_profile'):
            return jsonify({
                "error": "Missing user_profile in request body"
            }), 400

        user_profile = sanitizer.sanitize_user_data(data['user_profile'])
        scheme_ids = data.get('scheme_ids', [])

        # If specific schemes requested
        if scheme_ids:
            results = []
            for sid in scheme_ids[:20]:  # Max 20 at once
                scheme = data_loader.get_scheme_by_id(sid)
                if not scheme:
                    results.append({
                        "scheme_id": sid,
                        "found": False,
                        "eligible": False,
                        "reason": "Scheme not found"
                    })
                    continue

                elig = scheme.get('eligibility', {})
                eligible = matcher._pass_hard_filters(user_profile, elig)

                score = 0
                if eligible:
                    score = matcher.scorer.calculate_score(user_profile, elig)

                reasons = _get_eligibility_reasons(user_profile, elig)

                results.append({
                    "scheme_id": sid,
                    "scheme_name": scheme.get('name', ''),
                    "found": True,
                    "eligible": eligible,
                    "match_score": score if eligible else 0,
                    "reasons": reasons
                })

            return jsonify({
                "success": True,
                "results": results,
                "user_profile": user_profile
            })

        # If no specific schemes, return all eligible
        matched = matcher.find_matches(user_profile)
        return jsonify({
            "success": True,
            "total_eligible": len(matched),
            "schemes": matched,
            "user_profile": user_profile
        })

    except Exception as e:
        analytics.track_error('/api/eligibility/check', str(e))
        logger.error(f"Eligibility check error: {e}")
        return jsonify({"error": str(e)}), 500


def _get_eligibility_reasons(user, elig):
    """Get human-readable eligibility breakdown"""
    reasons = []

    # Age check
    min_age = elig.get('min_age')
    max_age = elig.get('max_age')
    user_age = int(user.get('age', 0))
    if min_age or max_age:
        age_range = f"{min_age or 'any'}-{max_age or 'any'}"
        if (min_age and user_age < min_age) or (max_age and user_age > max_age):
            reasons.append(f"❌ Age {user_age} outside range ({age_range})")
        else:
            reasons.append(f"✅ Age {user_age} within range ({age_range})")

    # Gender check
    gender_req = elig.get('gender', 'all')
    if gender_req != 'all':
        if user.get('gender', '').lower() == gender_req.lower():
            reasons.append(f"✅ Gender matches ({gender_req})")
        else:
            reasons.append(f"❌ Gender mismatch (requires {gender_req})")

    # State check
    states = elig.get('states', 'all')
    if states != 'all':
        if user.get('state', '') in states:
            reasons.append(f"✅ State {user.get('state')} is eligible")
        else:
            reasons.append(f"❌ State {user.get('state', 'N/A')} not in eligible list")
    else:
        reasons.append("✅ Available in all states")

    # Income check
    max_income = elig.get('max_income')
    if max_income:
        user_income = int(user.get('annual_income', 0))
        if user_income <= max_income:
            reasons.append(f"✅ Income ₹{user_income:,} within limit (₹{max_income:,})")
        else:
            reasons.append(f"❌ Income ₹{user_income:,} exceeds limit (₹{max_income:,})")

    # Category check
    categories = elig.get('category')
    if categories:
        user_cat = user.get('category', '').lower()
        if user_cat in [c.lower() for c in categories]:
            reasons.append(f"✅ Category {user_cat.upper()} is eligible")
        else:
            reasons.append(f"❌ Category {user_cat.upper() or 'N/A'} not eligible "
                         f"(requires {', '.join(c.upper() for c in categories)})")

    return reasons


# ──────────────────────────────────────────────
# 📝 FEEDBACK ENDPOINT
# ──────────────────────────────────────────────

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    """
    Collect user feedback

    Expected JSON body:
    {
        "rating": 4,              // 1-5
        "scheme_id": "pm-kisan",  // optional
        "comment": "Very helpful", // optional
        "session_id": "abc123"    // optional
    }
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400

        rating = data.get('rating')
        if not rating or not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
            return jsonify({
                "error": "Invalid rating",
                "message": "Rating must be a number between 1 and 5"
            }), 400

        comment = sanitizer.sanitize_string(data.get('comment', ''), 500)
        scheme_id = data.get('scheme_id', '')
        session_id = data.get('session_id', '')

        analytics.track_feedback(rating)

        feedback_entry = {
            "rating": rating,
            "comment": comment,
            "scheme_id": scheme_id,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "ip": g.get('client_ip', 'unknown')
        }

        logger.info(f"Feedback received: {rating}/5 - {comment[:50]}")

        return jsonify({
            "success": True,
            "message": "Thank you for your feedback! 🙏",
            "feedback": {
                "rating": rating,
                "average_rating": round(
                    sum(analytics.feedback_scores) / len(analytics.feedback_scores), 2
                ) if analytics.feedback_scores else rating
            }
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ──────────────────────────────────────────────
# 📊 REFERENCE DATA ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/languages', methods=['GET'])
def get_languages():
    """Get list of supported languages"""
    return jsonify({
        "success": True,
        "total": len(get_supported_languages()),
        "languages": get_supported_languages()
    })


@app.route('/api/states', methods=['GET'])
def get_states():
    """Get list of Indian states and UTs"""
    # Group by type
    states = [s for s in INDIAN_STATES if s not in [
        'Delhi', 'Puducherry', 'Chandigarh',
        'Andaman and Nicobar Islands',
        'Dadra and Nagar Haveli and Daman and Diu',
        'Lakshadweep', 'Ladakh', 'Jammu and Kashmir'
    ]]
    uts = [s for s in INDIAN_STATES if s not in states]

    return jsonify({
        "success": True,
        "total": len(INDIAN_STATES),
        "states": sorted(states),
        "union_territories": sorted(uts),
        "all": sorted(INDIAN_STATES)
    })


@app.route('/api/categories', methods=['GET'])
def get_categories():
    """Get scheme categories with counts"""
    categories = data_loader.get_categories()
    category_data = []

    category_emojis = {
        'agriculture': '🌾', 'health': '🏥', 'education': '🎓',
        'housing': '🏠', 'finance': '💰', 'women': '👩',
        'pension': '👴', 'insurance': '🛡️', 'employment': '💼',
        'sanitation': '🚰', 'social': '🤝', 'rural': '🏘️'
    }

    for cat in categories:
        count = len([
            s for s in all_schemes
            if s.get('category', '').lower() == cat.lower()
        ])
        category_data.append({
            "name": cat,
            "display_name": cat.title(),
            "emoji": category_emojis.get(cat.lower(), '📋'),
            "scheme_count": count,
            "interest_count": analytics.category_interest.get(cat, 0)
        })

    # Sort by scheme count descending
    category_data.sort(key=lambda x: x['scheme_count'], reverse=True)

    return jsonify({
        "success": True,
        "total": len(category_data),
        "categories": category_data
    })


# ──────────────────────────────────────────────
# 📈 ANALYTICS ENDPOINTS
# ──────────────────────────────────────────────

@app.route('/api/stats', methods=['GET'])
def quick_stats():
    """Quick statistics overview"""
    return jsonify({
        "success": True,
        "stats": {
            "total_schemes": len(all_schemes),
            "categories": len(data_loader.get_categories()),
            "total_requests": analytics.request_count,
            "total_chats": analytics.chat_messages_count,
            "total_recommendations": analytics.recommendation_requests,
            "active_sessions": len(analytics.daily_active_sessions),
            "uptime": analytics.get_uptime(),
            "chatbot_status": "active" if chatbot.is_ready else "fallback"
        }
    })


@app.route('/api/analytics', methods=['GET'])
def full_analytics():
    """Full analytics dashboard data"""
    return jsonify({
        "success": True,
        "analytics": analytics.get_summary(),
        "cache_stats": cache.stats()
    })


# ──────────────────────────────────────────────
# 🚀 SERVER START
# ──────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() == 'true'

    print(f"\n{'=' * 55}")
    print(f"🌐 GovScheme AI Server v3.0")
    print(f"📡 Running on http://0.0.0.0:{port}")
    print(f"🔧 Debug mode: {debug}")
    print(f"{'=' * 55}\n")

    app.run(
        debug=debug,
        host='0.0.0.0',
        port=port
    )
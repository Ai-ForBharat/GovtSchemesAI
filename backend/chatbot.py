"""
🤖 Enhanced GovScheme AI Chatbot
Features:
  - Trained ML model for intent classification
  - Scheme database search (finds real schemes from schemes.json)
  - Conversation memory (remembers context within a session)
  - Smart entity extraction (detects states, categories, ages from messages)
  - Follow-up question handling
  - Detailed scheme info on demand
  - Eligibility checker via chat
  - Multi-language support
"""

import pickle
import os
import random
import re
import json
from difflib import SequenceMatcher


class ConversationMemory:
    """Tracks conversation history and extracted user info"""

    def __init__(self, max_history=20):
        self.max_history = max_history
        # session_id → history
        self.sessions = {}

    def get_session(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "history": [],
                "user_info": {},
                "last_schemes_shown": [],
                "last_intent": None,
                "turn_count": 0
            }
        return self.sessions[session_id]

    def add_turn(self, session_id, user_msg, bot_response, intent=None):
        session = self.get_session(session_id)
        session["history"].append({
            "user": user_msg,
            "bot": bot_response,
            "intent": intent
        })
        session["turn_count"] += 1
        session["last_intent"] = intent

        # Keep history bounded
        if len(session["history"]) > self.max_history:
            session["history"] = session["history"][-self.max_history:]

    def update_user_info(self, session_id, info_dict):
        session = self.get_session(session_id)
        session["user_info"].update(info_dict)

    def set_last_schemes(self, session_id, schemes):
        session = self.get_session(session_id)
        session["last_schemes_shown"] = schemes

    def get_user_info(self, session_id):
        return self.get_session(session_id)["user_info"]

    def get_last_schemes(self, session_id):
        return self.get_session(session_id)["last_schemes_shown"]

    def get_last_intent(self, session_id):
        return self.get_session(session_id)["last_intent"]

    def get_turn_count(self, session_id):
        return self.get_session(session_id)["turn_count"]

    def clear_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]


class SchemeSearcher:
    """Searches scheme database intelligently"""

    def __init__(self, schemes):
        self.schemes = schemes
        self._build_search_index()

    def _build_search_index(self):
        """Pre-build keyword index for fast search"""
        self.keyword_index = {}
        self.name_map = {}

        for scheme in self.schemes:
            scheme_id = scheme.get('id', '')
            name = scheme.get('name', '').lower()
            desc = scheme.get('description', '').lower()
            category = scheme.get('category', '').lower()
            benefits = scheme.get('benefits', '').lower() if isinstance(scheme.get('benefits'), str) else ''

            self.name_map[scheme_id] = scheme

            # Extract meaningful words
            all_text = f"{name} {desc} {category} {benefits}"
            words = set(re.findall(r'[a-z]{3,}', all_text))

            for word in words:
                if word not in self.keyword_index:
                    self.keyword_index[word] = []
                self.keyword_index[word].append(scheme_id)

    def search(self, query, max_results=5):
        """Search schemes by query string"""
        query_lower = query.lower().strip()
        scores = {}

        # 1. Direct name matching (highest priority)
        for scheme in self.schemes:
            name = scheme.get('name', '').lower()
            scheme_id = scheme.get('id', '')

            # Exact or near-exact name match
            similarity = SequenceMatcher(None, query_lower, name).ratio()
            if similarity > 0.5:
                scores[scheme_id] = scores.get(scheme_id, 0) + similarity * 100

            # Check if query words appear in name
            query_words = query_lower.split()
            for word in query_words:
                if len(word) >= 3 and word in name:
                    scores[scheme_id] = scores.get(scheme_id, 0) + 30

        # 2. Keyword index matching
        query_words = re.findall(r'[a-z]{3,}', query_lower)
        for word in query_words:
            if word in self.keyword_index:
                for scheme_id in self.keyword_index[word]:
                    scores[scheme_id] = scores.get(scheme_id, 0) + 10

            # Partial word matching
            for indexed_word, scheme_ids in self.keyword_index.items():
                if (word in indexed_word or indexed_word in word) and len(word) >= 4:
                    for scheme_id in scheme_ids:
                        scores[scheme_id] = scores.get(scheme_id, 0) + 5

        # 3. Category-based matching
        category_keywords = {
            'agriculture': ['farm', 'kisan', 'crop', 'agriculture', 'farming', 'farmer'],
            'health': ['health', 'hospital', 'medical', 'doctor', 'ayushman', 'treatment'],
            'education': ['education', 'school', 'college', 'student', 'scholarship', 'study'],
            'housing': ['house', 'housing', 'home', 'awas', 'shelter', 'building'],
            'finance': ['loan', 'money', 'bank', 'credit', 'mudra', 'finance', 'business'],
            'women': ['women', 'woman', 'girl', 'female', 'mahila', 'beti'],
            'pension': ['pension', 'retirement', 'old age', 'senior', 'elderly'],
            'insurance': ['insurance', 'bima', 'cover', 'protection'],
            'employment': ['job', 'employment', 'work', 'skill', 'training', 'rozgar'],
            'sanitation': ['toilet', 'sanitation', 'swachh', 'clean', 'water']
        }

        for category, keywords in category_keywords.items():
            if any(kw in query_lower for kw in keywords):
                for scheme in self.schemes:
                    if scheme.get('category', '').lower() == category:
                        scores[scheme['id']] = scores.get(scheme['id'], 0) + 20

        # Sort by score and return top results
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        results = []
        for scheme_id in sorted_ids[:max_results]:
            if scores[scheme_id] >= 10:  # minimum relevance threshold
                scheme = self.name_map.get(scheme_id)
                if scheme:
                    result = scheme.copy()
                    result['search_score'] = scores[scheme_id]
                    results.append(result)

        return results

    def get_by_category(self, category):
        """Get all schemes in a category"""
        return [s for s in self.schemes if s.get('category', '').lower() == category.lower()]

    def get_by_id(self, scheme_id):
        """Get a single scheme by ID"""
        return self.name_map.get(scheme_id)

    def get_for_user_profile(self, user_info):
        """Get schemes matching extracted user info"""
        results = []
        for scheme in self.schemes:
            elig = scheme.get('eligibility', {})
            match = True

            # Check state
            if user_info.get('state'):
                states = elig.get('states', 'all')
                if states != 'all' and user_info['state'] not in states:
                    match = False

            # Check gender
            if user_info.get('gender') and match:
                gender_req = elig.get('gender', 'all')
                if gender_req != 'all' and user_info['gender'].lower() != gender_req.lower():
                    match = False

            # Check age
            if user_info.get('age') and match:
                age = int(user_info['age'])
                min_age = elig.get('min_age')
                max_age = elig.get('max_age')
                if min_age and age < min_age:
                    match = False
                if max_age and age > max_age:
                    match = False

            if match:
                results.append(scheme)

        return results[:10]


class EntityExtractor:
    """Extracts useful entities from user messages"""

    STATES_LOWER = {
        'andhra pradesh': 'Andhra Pradesh', 'arunachal pradesh': 'Arunachal Pradesh',
        'assam': 'Assam', 'bihar': 'Bihar', 'chhattisgarh': 'Chhattisgarh',
        'goa': 'Goa', 'gujarat': 'Gujarat', 'haryana': 'Haryana',
        'himachal pradesh': 'Himachal Pradesh', 'jharkhand': 'Jharkhand',
        'karnataka': 'Karnataka', 'kerala': 'Kerala',
        'madhya pradesh': 'Madhya Pradesh', 'maharashtra': 'Maharashtra',
        'manipur': 'Manipur', 'meghalaya': 'Meghalaya', 'mizoram': 'Mizoram',
        'nagaland': 'Nagaland', 'odisha': 'Odisha', 'punjab': 'Punjab',
        'rajasthan': 'Rajasthan', 'sikkim': 'Sikkim', 'tamil nadu': 'Tamil Nadu',
        'telangana': 'Telangana', 'tripura': 'Tripura',
        'uttar pradesh': 'Uttar Pradesh', 'uttarakhand': 'Uttarakhand',
        'west bengal': 'West Bengal', 'delhi': 'Delhi',
        'jammu and kashmir': 'Jammu and Kashmir', 'ladakh': 'Ladakh',
        'puducherry': 'Puducherry', 'chandigarh': 'Chandigarh',
        'up': 'Uttar Pradesh', 'mp': 'Madhya Pradesh', 'hp': 'Himachal Pradesh',
        'ap': 'Andhra Pradesh', 'jk': 'Jammu and Kashmir', 'wb': 'West Bengal',
        'tn': 'Tamil Nadu', 'uk': 'Uttarakhand'
    }

    OCCUPATION_KEYWORDS = {
        'farmer': ['farmer', 'farming', 'kisan', 'agriculture', 'crop', 'kheti'],
        'student': ['student', 'studying', 'college', 'school', 'university', 'padhai'],
        'business': ['business', 'entrepreneur', 'shop', 'startup', 'self-employed', 'vyapar'],
        'labour': ['labour', 'labor', 'worker', 'daily wage', 'mazdoor', 'construction'],
        'unemployed': ['unemployed', 'jobless', 'no job', 'berozgar', 'looking for work'],
        'housewife': ['housewife', 'homemaker', 'grihini']
    }

    CATEGORY_KEYWORDS = {
        'sc': ['sc', 'scheduled caste', 'dalit'],
        'st': ['st', 'scheduled tribe', 'tribal', 'adivasi'],
        'obc': ['obc', 'other backward class', 'backward'],
        'general': ['general', 'unreserved'],
        'minority': ['minority', 'muslim', 'christian', 'sikh', 'buddhist', 'jain', 'parsi']
    }

    @classmethod
    def extract(cls, message):
        """Extract all entities from a message"""
        msg_lower = message.lower()
        entities = {}

        # Extract age
        age_patterns = [
            r'i am (\d{1,3}) years? old',
            r'my age is (\d{1,3})',
            r'age[:\s]+(\d{1,3})',
            r'(\d{1,3}) years? old',
            r'i\'m (\d{1,3})',
            r'(\d{2}) year'
        ]
        for pattern in age_patterns:
            match = re.search(pattern, msg_lower)
            if match:
                age = int(match.group(1))
                if 0 < age < 120:
                    entities['age'] = age
                    break

        # Extract state
        for state_key, state_val in cls.STATES_LOWER.items():
            if state_key in msg_lower:
                entities['state'] = state_val
                break

        # Extract gender
        gender_patterns = {
            'male': [r'\bmale\b', r'\bman\b', r'\bboy\b', r'\bpurush\b'],
            'female': [r'\bfemale\b', r'\bwoman\b', r'\bgirl\b', r'\bmahila\b', r'\blady\b', r'\bstri\b']
        }
        for gender, patterns in gender_patterns.items():
            for pattern in patterns:
                if re.search(pattern, msg_lower):
                    entities['gender'] = gender
                    break

        # Extract occupation
        for occupation, keywords in cls.OCCUPATION_KEYWORDS.items():
            if any(kw in msg_lower for kw in keywords):
                entities['occupation'] = occupation
                break

        # Extract category
        for category, keywords in cls.CATEGORY_KEYWORDS.items():
            if any(re.search(r'\b' + kw + r'\b', msg_lower) for kw in keywords):
                entities['category'] = category
                break

        # Extract income indicators
        income_patterns = [
            (r'income[:\s]+(?:rs\.?|₹)?\s*(\d[\d,]*)', 'exact'),
            (r'(?:rs\.?|₹)\s*(\d[\d,]*)\s*(?:per month|monthly|pm)', 'monthly'),
            (r'(?:rs\.?|₹)\s*(\d[\d,]*)\s*(?:per year|yearly|annual|pa)', 'yearly'),
            (r'(\d[\d,]*)\s*(?:per month|monthly|pm)', 'monthly'),
            (r'(\d[\d,]*)\s*(?:per year|yearly|annual|pa)', 'yearly'),
        ]
        for pattern, income_type in income_patterns:
            match = re.search(pattern, msg_lower)
            if match:
                amount = int(match.group(1).replace(',', ''))
                if income_type == 'monthly':
                    amount *= 12
                entities['annual_income'] = amount
                break

        # Extract boolean flags
        bpl_keywords = ['bpl', 'below poverty', 'garib', 'poor', 'poverty line']
        if any(kw in msg_lower for kw in bpl_keywords):
            entities['is_bpl'] = True

        disability_keywords = ['disabled', 'disability', 'handicap', 'divyang', 'physically challenged']
        if any(kw in msg_lower for kw in disability_keywords):
            entities['disability'] = True

        return entities


class GovSchemeBot:
    """Enhanced chatbot with scheme awareness and conversation memory"""

    def __init__(self, schemes=None):
        self.model = None
        self.vectorizer = None
        self.intents = []
        self.is_ready = False
        self.memory = ConversationMemory()
        self.schemes = schemes or []
        self.searcher = None
        self.extractor = EntityExtractor()

        self.load_model()
        self._load_schemes_if_needed()

    def _load_schemes_if_needed(self):
        """Load schemes from JSON if not passed during init"""
        if not self.schemes:
            try:
                file_path = os.path.join(os.path.dirname(__file__), 'schemes.json')
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    self.schemes = data.get('schemes', [])
                print(f"✅ Chatbot loaded {len(self.schemes)} schemes for search")
            except Exception as e:
                print(f"⚠️  Chatbot couldn't load schemes: {e}")
                self.schemes = []

        if self.schemes:
            self.searcher = SchemeSearcher(self.schemes)

    def load_model(self):
        """Load the trained model from .pkl file"""
        model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')

        if not os.path.exists(model_path):
            print("⚠️  trained_model.pkl not found!")
            print("   Run: python train_model.py")
            print("   Chatbot will use enhanced fallback mode.\n")
            return

        try:
            with open(model_path, 'rb') as f:
                data = pickle.load(f)

            self.model = data['model']
            self.vectorizer = data['vectorizer']
            self.intents = data['intents']
            self.is_ready = True
            print("✅ Chatbot model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading model: {e}")

    def get_response(self, user_message, context=None, language='en'):
        """
        Main entry point - get chatbot response
        Now with memory, entity extraction, and scheme search
        """
        if not user_message.strip():
            return "Please type your question about government schemes."

        session_id = context.get('session_id', 'default') if context else 'default'

        # Extract entities from current message
        extracted = self.extractor.extract(user_message)
        if extracted:
            self.memory.update_user_info(session_id, extracted)
            print(f"   📋 Extracted entities: {extracted}")

        # Merge context with extracted info
        full_context = {**(context or {}), **self.memory.get_user_info(session_id)}

        # Check for special commands first
        special_response = self._handle_special_commands(user_message, session_id, full_context)
        if special_response:
            response = special_response
        # Try scheme-specific search
        elif self._is_scheme_query(user_message):
            response = self._handle_scheme_query(user_message, session_id, full_context)
        # Try numbered selection (user picks from a list)
        elif self._is_selection(user_message, session_id):
            response = self._handle_selection(user_message, session_id)
        # Use ML model
        elif self.is_ready:
            response = self._predict_response(user_message, session_id, full_context)
        # Fallback
        else:
            response = self._enhanced_fallback(user_message, full_context)

        # Save conversation turn
        self.memory.add_turn(session_id, user_message, response,
                            intent=self.memory.get_last_intent(session_id))

        # Translate if needed
        if language != 'en':
            try:
                from utils import translate_text
                response = translate_text(response, language)
            except Exception:
                pass

        return response

    def _handle_special_commands(self, message, session_id, context):
        """Handle special commands like 'reset', 'my info', 'help'"""
        msg_lower = message.lower().strip()

        # Reset conversation
        if msg_lower in ['reset', 'start over', 'clear', 'new chat']:
            self.memory.clear_session(session_id)
            return ("🔄 Conversation reset! Let's start fresh.\n\n"
                    "I'm GovScheme AI. I can help you:\n"
                    "• Find government schemes for you\n"
                    "• Explain scheme details and benefits\n"
                    "• Guide you on how to apply\n"
                    "• Check your eligibility\n\n"
                    "What would you like to know? 😊")

        # Show collected user info
        if msg_lower in ['my info', 'my profile', 'what do you know about me']:
            user_info = self.memory.get_user_info(session_id)
            if not user_info:
                return ("I don't have any information about you yet.\n"
                        "You can tell me your age, state, occupation, etc., "
                        "and I'll find relevant schemes!")
            return self._format_user_info(user_info)

        # Help command
        if msg_lower in ['help', 'what can you do', 'commands', 'menu']:
            return self._get_help_message()

        # List all categories
        if msg_lower in ['categories', 'show categories', 'all categories', 'types of schemes']:
            return self._list_categories()

        # Compare schemes
        if msg_lower.startswith('compare '):
            return self._compare_schemes(message)

        return None

    def _is_scheme_query(self, message):
        """Check if user is asking about a specific scheme or searching"""
        msg_lower = message.lower()
        scheme_indicators = [
            'tell me about', 'what is', 'explain', 'details of',
            'information about', 'info about', 'describe',
            'schemes for', 'scheme for', 'yojana for', 'yojana',
            'pm-', 'pm ', 'pradhan mantri', 'mukhyamantri',
            'find scheme', 'search scheme', 'show scheme',
            'list scheme', 'which scheme', 'best scheme',
            'eligible for which', 'which schemes can i',
            'recommend', 'suggest'
        ]
        return any(indicator in msg_lower for indicator in scheme_indicators)

    def _handle_scheme_query(self, message, session_id, context):
        """Handle queries about specific schemes"""
        msg_lower = message.lower()

        # Check if asking for personal recommendations
        if any(w in msg_lower for w in ['for me', 'eligible', 'i can get', 'recommend', 'suggest',
                                         'which scheme', 'my scheme']):
            return self._personal_recommendations(session_id, context)

        # Search in scheme database
        if self.searcher:
            results = self.searcher.search(message)

            if results:
                # Single strong match - give full details
                if len(results) == 1 or results[0].get('search_score', 0) > 80:
                    return self._format_scheme_detail(results[0])

                # Multiple matches - list them
                self.memory.set_last_schemes(session_id, results)
                return self._format_scheme_list(results)

        # Category-based search
        for category in ['agriculture', 'health', 'education', 'housing', 'finance',
                        'women', 'pension', 'insurance', 'employment', 'sanitation']:
            if category in msg_lower or category[:4] in msg_lower:
                if self.searcher:
                    cat_schemes = self.searcher.get_by_category(category)
                    if cat_schemes:
                        self.memory.set_last_schemes(session_id, cat_schemes[:5])
                        return self._format_scheme_list(cat_schemes[:5],
                                                       header=f"📂 {category.title()} Schemes")

        return None

    def _is_selection(self, message, session_id):
        """Check if user is selecting from a numbered list"""
        msg = message.strip()
        last_schemes = self.memory.get_last_schemes(session_id)

        if not last_schemes:
            return False

        # Check for number selection
        if msg.isdigit():
            num = int(msg)
            return 1 <= num <= len(last_schemes)

        # Check for "tell me more about #2" type messages
        match = re.search(r'(?:number|#|option|no\.?)\s*(\d+)', msg.lower())
        if match:
            num = int(match.group(1))
            return 1 <= num <= len(last_schemes)

        # Check for "first one", "second one", etc
        ordinals = {'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5}
        for word, num in ordinals.items():
            if word in msg.lower() and num <= len(last_schemes):
                return True

        return False

    def _handle_selection(self, message, session_id):
        """Handle user selecting from a list"""
        last_schemes = self.memory.get_last_schemes(session_id)
        msg = message.strip().lower()

        index = None

        if message.strip().isdigit():
            index = int(message.strip()) - 1

        match = re.search(r'(?:number|#|option|no\.?)\s*(\d+)', msg)
        if match:
            index = int(match.group(1)) - 1

        ordinals = {'first': 0, 'second': 1, 'third': 2, 'fourth': 3, 'fifth': 4}
        for word, idx in ordinals.items():
            if word in msg:
                index = idx
                break

        if index is not None and 0 <= index < len(last_schemes):
            return self._format_scheme_detail(last_schemes[index])

        return "Please select a valid number from the list above."

    def _predict_response(self, message, session_id, context):
        """Use trained model to predict intent and return response"""
        message_vec = self.vectorizer.transform([message.lower().strip()])
        predicted_tag = self.model.predict(message_vec)[0]
        confidence = max(self.model.predict_proba(message_vec)[0])

        print(f"   🤖 Query: '{message}' → Intent: {predicted_tag} ({confidence:.0%})")

        # Update session intent
        session = self.memory.get_session(session_id)
        session["last_intent"] = predicted_tag

        if confidence < 0.25:
            # Very low confidence → try scheme search first
            if self.searcher:
                results = self.searcher.search(message, max_results=3)
                if results:
                    self.memory.set_last_schemes(session_id, results)
                    return self._format_scheme_list(
                        results,
                        header="🔍 I found these related schemes"
                    )
            return self._low_confidence_response(context)

        # Find matching intent
        for intent in self.intents:
            if intent['tag'] == predicted_tag:
                response = random.choice(intent['responses'])

                # Enrich response based on intent type
                response = self._enrich_response(response, predicted_tag, message, context, session_id)

                return response

        return self._enhanced_fallback(message, context)

    def _enrich_response(self, base_response, intent_tag, message, context, session_id):
        """Add extra information to base response based on intent"""

        # If asking about eligibility, add personalized info
        if intent_tag == 'eligibility' and context:
            base_response += self._add_context_info(context)

        # If asking about a category, append real schemes
        category_intents = {
            'agriculture_schemes': 'agriculture',
            'health_schemes': 'health',
            'education_schemes': 'education',
            'housing_schemes': 'housing',
            'finance_schemes': 'finance',
            'women_schemes': 'women',
            'pension_schemes': 'pension',
        }

        if intent_tag in category_intents and self.searcher:
            category = category_intents[intent_tag]
            schemes = self.searcher.get_by_category(category)
            if schemes:
                self.memory.set_last_schemes(session_id, schemes[:5])
                base_response += "\n\n📋 **Available schemes:**\n"
                for i, s in enumerate(schemes[:5], 1):
                    base_response += f"{i}. {s.get('name', 'Unknown')}\n"
                base_response += "\n👉 Reply with a number to see full details!"

        # If asking about application process, add helpful links
        if intent_tag in ['how_to_apply', 'application']:
            base_response += "\n\n🔗 **Useful portals:**\n"
            base_response += "• services.india.gov.in - Central schemes\n"
            base_response += "• umang.gov.in - UMANG App\n"
            base_response += "• csc.gov.in - Find nearest CSC center\n"

        # If asking about documents, be more specific based on context
        if intent_tag == 'documents' and context:
            occ = context.get('occupation', '')
            if occ == 'farmer':
                base_response += "\n\n🌾 **For farmer schemes also keep:**\n"
                base_response += "• Land ownership records (khatauni)\n"
                base_response += "• Kisan Credit Card (if available)\n"
            elif occ == 'student':
                base_response += "\n\n🎓 **For student schemes also keep:**\n"
                base_response += "• Previous marksheet\n"
                base_response += "• Enrollment/admission letter\n"
                base_response += "• Institution verification letter\n"

        return base_response

    def _personal_recommendations(self, session_id, context):
        """Give personalized recommendations based on collected info"""
        user_info = self.memory.get_user_info(session_id)
        merged = {**context, **user_info}

        if not merged.get('age') and not merged.get('state') and not merged.get('occupation'):
            return ("I'd love to recommend schemes for you! But first, tell me about yourself:\n\n"
                    "• What is your age?\n"
                    "• Which state are you from?\n"
                    "• What is your occupation?\n"
                    "• Are you male or female?\n\n"
                    "You can tell me all at once, like:\n"
                    "\"I am a 25 year old farmer from Bihar\"\n\n"
                    "Or fill the form above for the best results! 😊")

        if self.searcher:
            results = self.searcher.get_for_user_profile(merged)
            if results:
                self.memory.set_last_schemes(session_id, results[:8])
                header = "🎯 Based on your profile, here are matching schemes"
                response = self._format_scheme_list(results[:8], header=header)

                # Show what info we used
                response += "\n\n📊 **Your profile I used:**\n"
                if merged.get('age'):
                    response += f"• Age: {merged['age']}\n"
                if merged.get('state'):
                    response += f"• State: {merged['state']}\n"
                if merged.get('occupation'):
                    response += f"• Occupation: {merged['occupation']}\n"
                if merged.get('gender'):
                    response += f"• Gender: {merged['gender']}\n"
                if merged.get('category'):
                    response += f"• Category: {merged['category'].upper()}\n"

                response += "\n💡 *Tell me more about yourself for better results, or fill the form above!*"
                return response

        return ("Based on what I know, I couldn't find specific matches. "
                "Please fill the recommendation form above for accurate results!")

    def _format_scheme_detail(self, scheme):
        """Format a single scheme with full details"""
        name = scheme.get('name', 'Unknown Scheme')
        desc = scheme.get('description', 'No description available')
        benefits = scheme.get('benefits', 'Not specified')
        how_to_apply = scheme.get('how_to_apply', 'Visit the official website')
        category = scheme.get('category', 'General')
        scheme_type = scheme.get('type', 'Central')
        url = scheme.get('url', '')

        elig = scheme.get('eligibility', {})

        response = f"📋 **{name}**\n"
        response += f"{'=' * 40}\n\n"
        response += f"📝 **Description:** {desc}\n\n"
        response += f"🏷️ **Category:** {category.title()} | **Type:** {scheme_type.title()}\n\n"
        response += f"✅ **Benefits:** {benefits}\n\n"

        # Eligibility details
        response += "📊 **Eligibility:**\n"
        if elig.get('min_age') or elig.get('max_age'):
            age_str = ""
            if elig.get('min_age'):
                age_str += f"Min: {elig['min_age']}"
            if elig.get('max_age'):
                age_str += f" Max: {elig['max_age']}"
            response += f"  • Age: {age_str}\n"
        if elig.get('gender') and elig['gender'] != 'all':
            response += f"  • Gender: {elig['gender'].title()}\n"
        if elig.get('states') and elig['states'] != 'all':
            states_str = ', '.join(elig['states'][:5])
            if len(elig['states']) > 5:
                states_str += f" +{len(elig['states'])-5} more"
            response += f"  • States: {states_str}\n"
        if elig.get('max_income'):
            response += f"  • Max Income: ₹{elig['max_income']:,}/year\n"
        if elig.get('category'):
            response += f"  • Category: {', '.join(elig['category']).upper()}\n"
        if elig.get('occupation'):
            response += f"  • Occupation: {', '.join(elig['occupation']).title()}\n"

        response += f"\n📝 **How to Apply:** {how_to_apply}\n"

        if url:
            response += f"\n🔗 **Official Link:** {url}\n"

        response += "\n💬 Ask me anything else about this scheme or type 'help' for options!"

        return response

    def _format_scheme_list(self, schemes, header="📋 Here are the matching schemes"):
        """Format multiple schemes as a numbered list"""
        response = f"{header}:\n\n"

        for i, scheme in enumerate(schemes, 1):
            name = scheme.get('name', 'Unknown')
            desc = scheme.get('description', '')
            # Truncate description
            short_desc = (desc[:80] + '...') if len(desc) > 80 else desc
            category = scheme.get('category', '')

            response += f"**{i}. {name}**\n"
            response += f"   📝 {short_desc}\n"
            if category:
                response += f"   🏷️ {category.title()}\n"
            if scheme.get('match_score'):
                response += f"   ⭐ Match: {scheme['match_score']}%\n"
            response += "\n"

        response += "👉 **Reply with a number (1-{}) to see full details!**".format(len(schemes))
        return response

    def _format_user_info(self, user_info):
        """Format collected user information"""
        response = "📊 **Here's what I know about you:**\n\n"

        field_labels = {
            'age': '🎂 Age',
            'state': '📍 State',
            'gender': '👤 Gender',
            'occupation': '💼 Occupation',
            'category': '🏷️ Category',
            'annual_income': '💰 Annual Income',
            'is_bpl': '📋 BPL Status',
            'disability': '♿ Disability',
            'is_farmer': '🌾 Farmer',
            'is_student': '🎓 Student'
        }

        for key, label in field_labels.items():
            if key in user_info:
                value = user_info[key]
                if key == 'annual_income':
                    value = f"₹{value:,}"
                elif isinstance(value, bool):
                    value = "Yes" if value else "No"
                elif isinstance(value, str):
                    value = value.title()
                response += f"{label}: {value}\n"

        response += "\n💡 Tell me more to get better recommendations!"
        response += "\nOr type 'recommend' for personalized scheme suggestions."
        return response

    def _list_categories(self):
        """List all scheme categories"""
        if self.searcher:
            categories = set()
            for scheme in self.schemes:
                cat = scheme.get('category', '')
                if cat:
                    categories.add(cat)

            response = "📂 **Available Scheme Categories:**\n\n"
            category_emojis = {
                'agriculture': '🌾', 'health': '🏥', 'education': '🎓',
                'housing': '🏠', 'finance': '💰', 'women': '👩',
                'pension': '👴', 'insurance': '🛡️', 'employment': '💼',
                'sanitation': '🚰', 'social': '🤝', 'rural': '🏘️'
            }

            for cat in sorted(categories):
                emoji = category_emojis.get(cat, '📋')
                count = len(self.searcher.get_by_category(cat))
                response += f"{emoji} **{cat.title()}** - {count} schemes\n"

            response += "\n👉 Type a category name to see its schemes!"
            return response

        return "Categories are not available right now."

    def _compare_schemes(self, message):
        """Compare two schemes side by side"""
        # Extract scheme names from message
        msg = message.lower().replace('compare ', '')
        parts = re.split(r'\band\b|\bvs\b|\bwith\b|,', msg)

        if len(parts) < 2 or not self.searcher:
            return ("To compare schemes, type:\n"
                    "**compare [scheme 1] and [scheme 2]**\n\n"
                    "Example: compare PM-KISAN and Ayushman Bharat")

        scheme1_results = self.searcher.search(parts[0].strip(), max_results=1)
        scheme2_results = self.searcher.search(parts[1].strip(), max_results=1)

        if not scheme1_results or not scheme2_results:
            return "I couldn't find one or both schemes. Please check the names."

        s1, s2 = scheme1_results[0], scheme2_results[0]

        response = "⚖️ **Scheme Comparison**\n"
        response += "=" * 40 + "\n\n"

        fields = [
            ('Name', 'name'),
            ('Category', 'category'),
            ('Type', 'type'),
            ('Benefits', 'benefits'),
            ('How to Apply', 'how_to_apply')
        ]

        for label, key in fields:
            v1 = str(s1.get(key, 'N/A'))
            v2 = str(s2.get(key, 'N/A'))
            if len(v1) > 60:
                v1 = v1[:60] + '...'
            if len(v2) > 60:
                v2 = v2[:60] + '...'
            response += f"**{label}:**\n"
            response += f"  1️⃣ {v1}\n"
            response += f"  2️⃣ {v2}\n\n"

        response += "👉 Reply **1** or **2** for full details of either scheme."
        self.memory.set_last_schemes('default', [s1, s2])
        return response

    def _get_help_message(self):
        """Return comprehensive help message"""
        turn_count = self.memory.get_turn_count('default')

        response = "🆘 **GovScheme AI - Help**\n"
        response += "=" * 35 + "\n\n"
        response += "Here's everything I can do:\n\n"

        response += "🔍 **Search Schemes:**\n"
        response += "  • \"Tell me about PM-KISAN\"\n"
        response += "  • \"Schemes for farmers\"\n"
        response += "  • \"Health schemes in Bihar\"\n\n"

        response += "🎯 **Get Recommendations:**\n"
        response += "  • \"I am a 25 year old farmer from UP\"\n"
        response += "  • \"Recommend schemes for me\"\n"
        response += "  • \"Which schemes am I eligible for?\"\n\n"

        response += "📝 **Scheme Details:**\n"
        response += "  • \"How to apply for Ayushman Bharat?\"\n"
        response += "  • \"Documents needed for PM-KISAN\"\n"
        response += "  • \"Benefits of Mudra Yojana\"\n\n"

        response += "⚖️ **Compare Schemes:**\n"
        response += "  • \"Compare PM-KISAN and Ayushman Bharat\"\n\n"

        response += "📊 **Other Commands:**\n"
        response += "  • **categories** - See all scheme categories\n"
        response += "  • **my info** - See your collected profile\n"
        response += "  • **reset** - Start fresh conversation\n"
        response += "  • **help** - Show this message\n\n"

        response += "💡 **Tip:** Fill the recommendation form above for the most accurate results!"

        if turn_count == 0:
            response += "\n\n👋 Let's start! What would you like to know?"

        return response

    def _add_context_info(self, context):
        """Add personalized info based on user profile"""
        info = "\n\n📊 **Based on your profile:**\n"
        added = False

        if context.get('is_farmer') or context.get('occupation') == 'farmer':
            info += "🌾 You may be eligible for PM-KISAN and Fasal Bima Yojana\n"
            added = True

        if context.get('is_bpl'):
            info += "📋 As BPL, check Ayushman Bharat and Ujjwala Yojana\n"
            added = True

        if context.get('occupation') == 'student':
            info += "🎓 Check National Scholarship Portal for student schemes\n"
            added = True

        age = context.get('age', 0)
        if isinstance(age, str):
            age = int(age) if age.isdigit() else 0
        if 18 <= age <= 40:
            info += "👤 You're eligible for Atal Pension Yojana\n"
            added = True
        elif age >= 60:
            info += "👴 Check senior citizen pension schemes\n"
            added = True

        if context.get('category') in ['sc', 'st']:
            info += "📝 SC/ST schemes: Stand Up India, special scholarships\n"
            added = True
        elif context.get('category') == 'obc':
            info += "📝 OBC schemes: Post-matric scholarships, special credit\n"
            added = True

        if context.get('gender') == 'female':
            info += "👩 Women schemes: Beti Bachao, Mahila Samridhi, Ujjwala\n"
            added = True

        if context.get('disability'):
            info += "♿ Disability schemes: ADIP, DDRS, special scholarships\n"
            added = True

        return info if added else ""

    def _low_confidence_response(self, context):
        """When model isn't confident enough"""
        response = "🤔 I'm not sure about that specific query.\n\n"
        response += "Here's what I can help with:\n\n"
        response += "• 🔍 Search for specific schemes by name\n"
        response += "• 📂 Browse schemes by category (health, education, etc.)\n"
        response += "• 🎯 Get personalized recommendations\n"
        response += "• 📝 Know how to apply for any scheme\n"
        response += "• 📄 Documents required for schemes\n"
        response += "• ⚖️ Compare two schemes\n\n"
        response += "💡 **Try:** \"schemes for farmers\" or \"tell me about PM-KISAN\"\n"
        response += "Or fill the form above for personalized recommendations! 😊"

        if context:
            extra = self._add_context_info(context)
            if extra:
                response += extra

        return response

    def _enhanced_fallback(self, message, context):
        """Enhanced keyword fallback when model not available"""
        msg_lower = message.lower()

        # Greetings
        if any(w in msg_lower for w in ['hi', 'hello', 'hey', 'namaste', 'namaskar']):
            greetings = [
                "Namaste! 🙏 I'm GovScheme AI. I can help you find government schemes!\n\nTry asking:\n• \"Schemes for farmers\"\n• \"Tell me about PM-KISAN\"\n• \"I am 25 years old from Bihar\"",
                "Hello! 👋 Welcome to GovScheme AI!\n\nI can search 100+ government schemes for you. What would you like to know?",
                "Hey there! 🙏 I'm your government scheme assistant.\n\nAsk me about any scheme or tell me about yourself for personalized recommendations!"
            ]
            return random.choice(greetings)

        # Farewells
        if any(w in msg_lower for w in ['bye', 'goodbye', 'thanks', 'thank you', 'dhanyavad']):
            farewells = [
                "Thank you for using GovScheme AI! 🙏\nVisit official websites to apply for schemes.\nJai Hind! 🇮🇳",
                "Glad I could help! 😊\nRemember to check eligibility on official portals.\nGoodbye! 🙏",
                "Dhanyavad! 🙏 All the best with your applications!\nCome back anytime you need help. 🇮🇳"
            ]
            return random.choice(farewells)

        # Try scheme search if searcher is available
        if self.searcher:
            results = self.searcher.search(message, max_results=3)
            if results:
                return self._format_scheme_list(
                    results,
                    header="🔍 I found these schemes that might be relevant"
                )

        # Keyword-based fallback
        keyword_responses = {
            ('kisan', 'farmer', 'farming', 'kheti'): (
                "🌾 **Farmer Schemes:**\n\n"
                "1. **PM-KISAN**: ₹6,000/year direct transfer\n"
                "2. **PM Fasal Bima**: Crop insurance at low premium\n"
                "3. **Kisan Credit Card**: Easy farm credit\n"
                "4. **Soil Health Card**: Free soil testing\n\n"
                "Ask about any specific scheme for details!"
            ),
            ('apply', 'how to', 'registration', 'register'): (
                "📝 **How to Apply for Schemes:**\n\n"
                "1️⃣ **Online**: Visit the scheme's official website\n"
                "2️⃣ **CSC Center**: Go to nearest Common Service Centre\n"
                "3️⃣ **Bank**: Many schemes through your bank branch\n"
                "4️⃣ **UMANG App**: Download from Play Store/App Store\n"
                "5️⃣ **DigiLocker**: For document verification\n\n"
                "📱 Keep Aadhaar & bank details ready!"
            ),
            ('document', 'papers', 'documents', 'dastavez'): (
                "📄 **Common Documents Required:**\n\n"
                "• Aadhaar Card (mandatory)\n"
                "• Bank Account Passbook\n"
                "• Income Certificate\n"
                "• Caste Certificate (if applicable)\n"
                "• Passport Size Photos\n"
                "• Residence Proof\n"
                "• Ration Card\n"
                "• Mobile Number (linked to Aadhaar)\n\n"
                "📍 Get certificates from Tehsil/Block office"
            ),
            ('health', 'ayushman', 'hospital', 'medical', 'ilaj'): (
                "🏥 **Health Schemes:**\n\n"
                "• **Ayushman Bharat (PMJAY)**: ₹5 Lakh free health cover\n"
                "• **Jan Aushadhi**: Medicines at 50-90% cheaper\n"
                "• **Janani Suraksha**: Cash for institutional delivery\n\n"
                "📞 Helpline: 14555 | 🌐 pmjay.gov.in"
            ),
            ('loan', 'mudra', 'business', 'vyapar'): (
                "💰 **Business & Loan Schemes:**\n\n"
                "• **PM Mudra**: Up to ₹10 Lakh without collateral\n"
                "  - Shishu: Up to ₹50,000\n"
                "  - Kishore: ₹50K - ₹5 Lakh\n"
                "  - Tarun: ₹5L - ₹10 Lakh\n"
                "• **Stand Up India**: ₹10L - ₹1Cr for SC/ST/Women\n"
                "• **Startup India**: Tax benefits + easy compliance\n\n"
                "🏦 Apply at any bank branch!"
            ),
            ('pension', 'old age', 'retire', 'budhapa'): (
                "👴 **Pension Schemes:**\n\n"
                "• **Atal Pension Yojana**: ₹1,000-5,000/month after 60\n"
                "  Age: 18-40 | Premium: ₹42-1,454/month\n"
                "• **PM Vaya Vandana**: Senior citizen pension (60+)\n"
                "• **IGNOAPS**: Old age pension for BPL (60+)\n\n"
                "🏦 Join at any bank or post office"
            ),
            ('scholarship', 'student', 'education', 'padhai'): (
                "🎓 **Education & Scholarship Schemes:**\n\n"
                "• **National Scholarship Portal**: All scholarships in one place\n"
                "• **PM Vidyalakshmi**: Education loans\n"
                "• **Pre & Post Matric Scholarship**: For SC/ST/OBC\n"
                "• **INSPIRE Scholarship**: For science students\n\n"
                "🌐 scholarships.gov.in | vidyalakshmi.co.in"
            ),
            ('women', 'woman', 'mahila', 'girl', 'beti'): (
                "👩 **Women Empowerment Schemes:**\n\n"
                "• **Beti Bachao Beti Padhao**: Girl child welfare\n"
                "• **Ujjwala Yojana**: Free LPG connection\n"
                "• **Mahila Samridhi Yojana**: Savings scheme\n"
                "• **Sukanya Samriddhi**: Girl child savings (8%+ interest)\n"
                "• **Stand Up India**: Business loans for women\n\n"
                "💪 Empowering women, empowering India!"
            ),
            ('house', 'housing', 'awas', 'ghar'): (
                "🏠 **Housing Schemes:**\n\n"
                "• **PM Awas Yojana (Urban)**: ₹2.67L subsidy on home loan\n"
                "• **PM Awas Yojana (Rural)**: ₹1.2-1.3L for pucca house\n"
                "• **Interest subsidy**: Up to 6.5% on home loans\n\n"
                "🌐 pmaymis.gov.in | pmayg.nic.in"
            )
        }

        for keywords, response in keyword_responses.items():
            if any(w in msg_lower for w in keywords):
                return response

        # Default fallback
        return (
            "I can help with government schemes! Try:\n\n"
            "🔍 **Search:** \"Tell me about PM-KISAN\"\n"
            "📂 **Browse:** \"Schemes for farmers\" or \"health schemes\"\n"
            "🎯 **Personal:** \"I am a 30 year old farmer from UP\"\n"
            "📝 **Apply:** \"How to apply for Ayushman Bharat\"\n"
            "⚖️ **Compare:** \"Compare PM-KISAN and Mudra\"\n\n"
            "Or type **help** for all options! 😊"
        )


# Standalone testing
if __name__ == '__main__':
    bot = GovSchemeBot()
    print("\n🤖 Enhanced Chatbot Test Mode")
    print("Commands: help, reset, my info, categories, quit\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            print("Goodbye! 🙏")
            break
        response = bot.get_response(user_input, context={'session_id': 'test'})
        print(f"\nBot: {response}\n")
"""
Utility Functions v3.0 - Enhanced Helper Library
=================================================
Features:
  - Translation with caching & batch processing
  - Auto language detection from text
  - Comprehensive input validation with sanitization
  - Indian currency formatting (precise Lakh/Crore)
  - Date/age calculation utilities
  - State & district data with metadata
  - Phone number & Aadhaar validation
  - Text cleaning & normalization
  - Response formatting helpers
  - Error message generator
  - Scheme URL validator
  - Performance tracked translation
  - Hinglish text detection
  - Common Indian name patterns
"""

import re
import time
import logging
import hashlib
from datetime import datetime, date
from collections import defaultdict
from functools import lru_cache

logger = logging.getLogger('GovSchemeAI.Utils')

# ──────────────────────────────────────────────────
# LANGUAGE SUPPORT
# ──────────────────────────────────────────────────

SUPPORTED_LANGUAGES = {
    'en': 'english',
    'hi': 'hindi',
    'ta': 'tamil',
    'te': 'telugu',
    'bn': 'bengali',
    'mr': 'marathi',
    'gu': 'gujarati',
    'kn': 'kannada',
    'ml': 'malayalam',
    'pa': 'punjabi',
    'or': 'odia',
    'ur': 'urdu',
    'as': 'assamese',
    'sa': 'sanskrit',
    'ne': 'nepali',
    'sd': 'sindhi',
    'ks': 'kashmiri',
    'doi': 'dogri',
    'mai': 'maithili',
    'sat': 'santali',
    'kok': 'konkani',
    'mni': 'manipuri',
    'bo': 'bodo'
}

LANGUAGE_DETAILS = [
    {"code": "en", "name": "English", "native": "English", "script": "Latin", "region": "All India"},
    {"code": "hi", "name": "Hindi", "native": "हिंदी", "script": "Devanagari", "region": "North/Central India"},
    {"code": "ta", "name": "Tamil", "native": "தமிழ்", "script": "Tamil", "region": "Tamil Nadu, Puducherry"},
    {"code": "te", "name": "Telugu", "native": "తెలుగు", "script": "Telugu", "region": "Andhra Pradesh, Telangana"},
    {"code": "bn", "name": "Bengali", "native": "বাংলা", "script": "Bengali", "region": "West Bengal, Tripura"},
    {"code": "mr", "name": "Marathi", "native": "मराठी", "script": "Devanagari", "region": "Maharashtra, Goa"},
    {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "script": "Gujarati", "region": "Gujarat, Dadra & Nagar Haveli"},
    {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "script": "Kannada", "region": "Karnataka"},
    {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "script": "Malayalam", "region": "Kerala, Lakshadweep"},
    {"code": "pa", "name": "Punjabi", "native": "ਪੰਜਾਬੀ", "script": "Gurmukhi", "region": "Punjab, Chandigarh"},
    {"code": "or", "name": "Odia", "native": "ଓଡ଼ିଆ", "script": "Odia", "region": "Odisha"},
    {"code": "ur", "name": "Urdu", "native": "اردو", "script": "Nastaliq", "region": "Jammu & Kashmir, Telangana"},
    {"code": "as", "name": "Assamese", "native": "অসমীয়া", "script": "Bengali", "region": "Assam"},
    {"code": "ne", "name": "Nepali", "native": "नेपाली", "script": "Devanagari", "region": "Sikkim, West Bengal"},
    {"code": "sd", "name": "Sindhi", "native": "سنڌي", "script": "Arabic/Devanagari", "region": "Gujarat, Maharashtra"},
    {"code": "sa", "name": "Sanskrit", "native": "संस्कृतम्", "script": "Devanagari", "region": "Classical"},
]

# State to primary language mapping
STATE_LANGUAGES = {
    'Andhra Pradesh': 'te', 'Arunachal Pradesh': 'en', 'Assam': 'as',
    'Bihar': 'hi', 'Chhattisgarh': 'hi', 'Goa': 'kok',
    'Gujarat': 'gu', 'Haryana': 'hi', 'Himachal Pradesh': 'hi',
    'Jharkhand': 'hi', 'Karnataka': 'kn', 'Kerala': 'ml',
    'Madhya Pradesh': 'hi', 'Maharashtra': 'mr', 'Manipur': 'mni',
    'Meghalaya': 'en', 'Mizoram': 'en', 'Nagaland': 'en',
    'Odisha': 'or', 'Punjab': 'pa', 'Rajasthan': 'hi',
    'Sikkim': 'ne', 'Tamil Nadu': 'ta', 'Telangana': 'te',
    'Tripura': 'bn', 'Uttar Pradesh': 'hi', 'Uttarakhand': 'hi',
    'West Bengal': 'bn', 'Delhi': 'hi', 'Jammu and Kashmir': 'ur',
    'Ladakh': 'hi', 'Puducherry': 'ta', 'Chandigarh': 'hi',
}


# ──────────────────────────────────────────────────
# TRANSLATION ENGINE
# ──────────────────────────────────────────────────

class TranslationCache:
    """In-memory cache for translations to avoid repeated API calls"""

    def __init__(self, max_size=2000):
        self.cache = {}
        self.max_size = max_size
        self.hits = 0
        self.misses = 0
        self.errors = 0
        self.total_time_ms = 0
        self.translations_done = 0

    def _make_key(self, text, target_lang):
        """Create cache key from text + language"""
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()[:12]
        return f"{target_lang}:{text_hash}"

    def get(self, text, target_lang):
        key = self._make_key(text, target_lang)
        if key in self.cache:
            self.hits += 1
            return self.cache[key]
        self.misses += 1
        return None

    def set(self, text, target_lang, translated):
        key = self._make_key(text, target_lang)
        self.cache[key] = translated

        # Evict oldest entries if too large
        if len(self.cache) > self.max_size:
            keys = list(self.cache.keys())
            for old_key in keys[:len(keys) // 4]:
                del self.cache[old_key]

    def get_stats(self):
        total = self.hits + self.misses
        hit_rate = round(self.hits / total * 100, 1) if total > 0 else 0
        avg_time = round(
            self.total_time_ms / self.translations_done, 2
        ) if self.translations_done > 0 else 0

        return {
            "cached_entries": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": f"{hit_rate}%",
            "translations_done": self.translations_done,
            "errors": self.errors,
            "avg_time_ms": avg_time,
            "total_time_ms": round(self.total_time_ms, 2)
        }

    def clear(self):
        self.cache.clear()
        logger.info("Translation cache cleared")


# Global translation cache
_translation_cache = TranslationCache()


def translate_text(text, target_lang, source_lang='en'):
    """
    Translate text to target language with caching

    Args:
        text: text to translate
        target_lang: target language code (e.g., 'hi', 'ta')
        source_lang: source language code (default: 'en')

    Returns:
        Translated text or original on failure
    """
    if not text or not text.strip():
        return text

    if target_lang == source_lang:
        return text

    if target_lang not in SUPPORTED_LANGUAGES:
        logger.warning(f"Unsupported language: {target_lang}")
        return text

    # Check cache
    cached = _translation_cache.get(text, target_lang)
    if cached is not None:
        return cached

    # Translate
    start_time = time.time()
    try:
        from deep_translator import GoogleTranslator

        # Split long texts (Google Translate has 5000 char limit)
        if len(text) > 4500:
            translated = _translate_long_text(text, target_lang, source_lang)
        else:
            translated = GoogleTranslator(
                source=source_lang,
                target=target_lang
            ).translate(text)

        elapsed = (time.time() - start_time) * 1000
        _translation_cache.total_time_ms += elapsed
        _translation_cache.translations_done += 1

        if translated:
            _translation_cache.set(text, target_lang, translated)
            return translated

        return text

    except ImportError:
        logger.error("deep_translator not installed. Run: pip install deep-translator")
        return text

    except Exception as e:
        _translation_cache.errors += 1
        elapsed = (time.time() - start_time) * 1000
        _translation_cache.total_time_ms += elapsed
        logger.error(f"Translation error ({target_lang}): {e}")
        return text


def _translate_long_text(text, target_lang, source_lang='en'):
    """Translate text longer than 4500 chars by splitting at sentence boundaries"""
    from deep_translator import GoogleTranslator

    # Split by sentences
    sentences = re.split(r'(?<=[.!?।])\s+', text)
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < 4500:
            current_chunk += " " + sentence
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = sentence

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    # Translate each chunk
    translated_chunks = []
    translator = GoogleTranslator(source=source_lang, target=target_lang)

    for chunk in chunks:
        try:
            result = translator.translate(chunk)
            translated_chunks.append(result if result else chunk)
        except Exception:
            translated_chunks.append(chunk)

    return " ".join(translated_chunks)


def translate_batch(texts, target_lang, source_lang='en'):
    """
    Translate multiple texts efficiently

    Args:
        texts: list of strings
        target_lang: target language code

    Returns:
        List of translated strings
    """
    if target_lang == source_lang:
        return texts

    results = []
    for text in texts:
        results.append(translate_text(text, target_lang, source_lang))

    return results


def translate_schemes(schemes, target_lang, fields=None):
    """
    Translate list of schemes to target language

    Args:
        schemes: list of scheme dicts
        target_lang: target language code
        fields: specific fields to translate (default: name, description, benefits, how_to_apply)

    Returns:
        List of translated scheme dicts
    """
    if target_lang == 'en':
        return schemes

    translate_fields = fields or ['name', 'description', 'benefits', 'how_to_apply']

    translated = []
    for scheme in schemes:
        t_scheme = scheme.copy()

        for field in translate_fields:
            original = scheme.get(field, '')
            if original and isinstance(original, str):
                t_scheme[field] = translate_text(original, target_lang)
                # Keep original English version
                t_scheme[f'{field}_en'] = original

        translated.append(t_scheme)

    logger.info(f"Translated {len(translated)} schemes to {target_lang}")
    return translated


def translate_scheme_single(scheme, target_lang):
    """Translate a single scheme dict"""
    if target_lang == 'en':
        return scheme

    return translate_schemes([scheme], target_lang)[0]


def get_supported_languages():
    """Return detailed list of supported languages"""
    return LANGUAGE_DETAILS


def get_language_for_state(state):
    """Get the primary language for a given Indian state"""
    return STATE_LANGUAGES.get(state, 'hi')


def get_translation_stats():
    """Get translation cache statistics"""
    return _translation_cache.get_stats()


def clear_translation_cache():
    """Clear the translation cache"""
    _translation_cache.clear()


# ──────────────────────────────────────────────────
# LANGUAGE DETECTION
# ──────────────────────────────────────────────────

# Unicode ranges for Indian scripts
SCRIPT_RANGES = {
    'hi': (0x0900, 0x097F),   # Devanagari
    'bn': (0x0980, 0x09FF),   # Bengali
    'pa': (0x0A00, 0x0A7F),   # Gurmukhi
    'gu': (0x0A80, 0x0AFF),   # Gujarati
    'or': (0x0B00, 0x0B7F),   # Odia
    'ta': (0x0B80, 0x0BFF),   # Tamil
    'te': (0x0C00, 0x0C7F),   # Telugu
    'kn': (0x0C80, 0x0CFF),   # Kannada
    'ml': (0x0D00, 0x0D7F),   # Malayalam
    'ur': (0x0600, 0x06FF),   # Arabic (Urdu)
}

HINGLISH_INDICATORS = [
    'kya', 'hai', 'kaise', 'mujhe', 'batao', 'chahiye',
    'kahan', 'kaun', 'kitna', 'yojana', 'sarkar', 'paisa',
    'sarkari', 'nahi', 'hoga', 'milega', 'karo', 'liye',
    'aur', 'bhi', 'mera', 'tera', 'uska', 'hamara',
    'abhi', 'kab', 'woh', 'yeh', 'isko', 'usko'
]


def detect_language(text):
    """
    Detect the language of input text

    Returns:
        dict with language code, confidence, and script info
    """
    if not text or not text.strip():
        return {"code": "en", "confidence": 0, "script": "unknown"}

    # Count characters in each script
    script_counts = defaultdict(int)
    total_chars = 0

    for char in text:
        code_point = ord(char)
        for lang, (start, end) in SCRIPT_RANGES.items():
            if start <= code_point <= end:
                script_counts[lang] += 1
                break
        if char.isalpha():
            total_chars += 1

    # If Indian script characters found
    if script_counts:
        best_lang = max(script_counts, key=script_counts.get)
        confidence = round(script_counts[best_lang] / max(total_chars, 1) * 100)
        return {
            "code": best_lang,
            "confidence": min(confidence, 100),
            "script": SUPPORTED_LANGUAGES.get(best_lang, 'unknown'),
            "is_indian_script": True
        }

    # Check for Hinglish (Hindi written in English script)
    words = text.lower().split()
    hinglish_count = sum(1 for w in words if w in HINGLISH_INDICATORS)

    if hinglish_count >= 2 or (len(words) > 0 and hinglish_count / len(words) > 0.3):
        return {
            "code": "hi",
            "confidence": min(hinglish_count * 20, 80),
            "script": "latin_hinglish",
            "is_indian_script": False,
            "is_hinglish": True
        }

    # Default to English
    return {
        "code": "en",
        "confidence": 70,
        "script": "latin",
        "is_indian_script": False
    }


def is_hinglish(text):
    """Quick check if text is Hinglish"""
    result = detect_language(text)
    return result.get('is_hinglish', False)


# ──────────────────────────────────────────────────
# INDIAN STATES & TERRITORIES
# ──────────────────────────────────────────────────

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
    "Chandigarh", "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
]

STATES_ONLY = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

UNION_TERRITORIES = [
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
    "Chandigarh", "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
]

# State metadata
STATE_METADATA = {
    'Andhra Pradesh': {'code': 'AP', 'capital': 'Amaravati', 'region': 'South'},
    'Arunachal Pradesh': {'code': 'AR', 'capital': 'Itanagar', 'region': 'Northeast'},
    'Assam': {'code': 'AS', 'capital': 'Dispur', 'region': 'Northeast'},
    'Bihar': {'code': 'BR', 'capital': 'Patna', 'region': 'East'},
    'Chhattisgarh': {'code': 'CG', 'capital': 'Raipur', 'region': 'Central'},
    'Goa': {'code': 'GA', 'capital': 'Panaji', 'region': 'West'},
    'Gujarat': {'code': 'GJ', 'capital': 'Gandhinagar', 'region': 'West'},
    'Haryana': {'code': 'HR', 'capital': 'Chandigarh', 'region': 'North'},
    'Himachal Pradesh': {'code': 'HP', 'capital': 'Shimla', 'region': 'North'},
    'Jharkhand': {'code': 'JH', 'capital': 'Ranchi', 'region': 'East'},
    'Karnataka': {'code': 'KA', 'capital': 'Bengaluru', 'region': 'South'},
    'Kerala': {'code': 'KL', 'capital': 'Thiruvananthapuram', 'region': 'South'},
    'Madhya Pradesh': {'code': 'MP', 'capital': 'Bhopal', 'region': 'Central'},
    'Maharashtra': {'code': 'MH', 'capital': 'Mumbai', 'region': 'West'},
    'Manipur': {'code': 'MN', 'capital': 'Imphal', 'region': 'Northeast'},
    'Meghalaya': {'code': 'ML', 'capital': 'Shillong', 'region': 'Northeast'},
    'Mizoram': {'code': 'MZ', 'capital': 'Aizawl', 'region': 'Northeast'},
    'Nagaland': {'code': 'NL', 'capital': 'Kohima', 'region': 'Northeast'},
    'Odisha': {'code': 'OD', 'capital': 'Bhubaneswar', 'region': 'East'},
    'Punjab': {'code': 'PB', 'capital': 'Chandigarh', 'region': 'North'},
    'Rajasthan': {'code': 'RJ', 'capital': 'Jaipur', 'region': 'West'},
    'Sikkim': {'code': 'SK', 'capital': 'Gangtok', 'region': 'Northeast'},
    'Tamil Nadu': {'code': 'TN', 'capital': 'Chennai', 'region': 'South'},
    'Telangana': {'code': 'TS', 'capital': 'Hyderabad', 'region': 'South'},
    'Tripura': {'code': 'TR', 'capital': 'Agartala', 'region': 'Northeast'},
    'Uttar Pradesh': {'code': 'UP', 'capital': 'Lucknow', 'region': 'North'},
    'Uttarakhand': {'code': 'UK', 'capital': 'Dehradun', 'region': 'North'},
    'West Bengal': {'code': 'WB', 'capital': 'Kolkata', 'region': 'East'},
    'Delhi': {'code': 'DL', 'capital': 'New Delhi', 'region': 'North'},
    'Jammu and Kashmir': {'code': 'JK', 'capital': 'Srinagar', 'region': 'North'},
    'Ladakh': {'code': 'LA', 'capital': 'Leh', 'region': 'North'},
    'Puducherry': {'code': 'PY', 'capital': 'Puducherry', 'region': 'South'},
    'Chandigarh': {'code': 'CH', 'capital': 'Chandigarh', 'region': 'North'},
    'Andaman and Nicobar Islands': {'code': 'AN', 'capital': 'Port Blair', 'region': 'Islands'},
    'Dadra and Nagar Haveli and Daman and Diu': {'code': 'DD', 'capital': 'Daman', 'region': 'West'},
    'Lakshadweep': {'code': 'LD', 'capital': 'Kavaratti', 'region': 'Islands'},
}

# State abbreviation to full name mapping
STATE_ABBREVIATIONS = {v['code']: k for k, v in STATE_METADATA.items()}
STATE_ABBREVIATIONS.update({
    'UP': 'Uttar Pradesh', 'MP': 'Madhya Pradesh', 'HP': 'Himachal Pradesh',
    'AP': 'Andhra Pradesh', 'WB': 'West Bengal', 'TN': 'Tamil Nadu',
    'JK': 'Jammu and Kashmir', 'UK': 'Uttarakhand', 'J&K': 'Jammu and Kashmir',
})

# Common misspellings
STATE_CORRECTIONS = {
    'utter pradesh': 'Uttar Pradesh', 'uttar pradsh': 'Uttar Pradesh',
    'maharastra': 'Maharashtra', 'mahrashtra': 'Maharashtra',
    'karnatka': 'Karnataka', 'kerla': 'Kerala', 'keral': 'Kerala',
    'tamilnadu': 'Tamil Nadu', 'tamil naду': 'Tamil Nadu',
    'gujrat': 'Gujarat', 'gujrath': 'Gujarat',
    'rajastan': 'Rajasthan', 'rajsthan': 'Rajasthan',
    'madhya pradsh': 'Madhya Pradesh', 'mp': 'Madhya Pradesh',
    'chhatisgarh': 'Chhattisgarh', 'chatisgarh': 'Chhattisgarh',
    'jharkand': 'Jharkhand', 'jharkhnd': 'Jharkhand',
    'telengana': 'Telangana', 'telangna': 'Telangana',
    'himachal': 'Himachal Pradesh', 'uttrakhand': 'Uttarakhand',
    'uttaranchal': 'Uttarakhand', 'orrisa': 'Odisha', 'orissa': 'Odisha',
    'dilli': 'Delhi', 'new delhi': 'Delhi',
    'bengal': 'West Bengal', 'west bangal': 'West Bengal',
    'panjab': 'Punjab', 'punjab': 'Punjab',
    'andhra': 'Andhra Pradesh', 'assam': 'Assam',
    'bengaluru': 'Karnataka', 'mumbai': 'Maharashtra',
    'chennai': 'Tamil Nadu', 'kolkata': 'West Bengal',
    'hyderabad': 'Telangana', 'lucknow': 'Uttar Pradesh',
    'jaipur': 'Rajasthan', 'patna': 'Bihar',
    'bhopal': 'Madhya Pradesh', 'chandigarh': 'Chandigarh',
}


def resolve_state(input_text):
    """
    Resolve state from various input formats:
    - Full name
    - Abbreviation (UP, MP, etc.)
    - Common misspelling
    - City name to state

    Returns:
        Correct state name or None
    """
    if not input_text:
        return None

    cleaned = input_text.strip()

    # Exact match
    if cleaned in INDIAN_STATES:
        return cleaned

    # Case-insensitive exact match
    for state in INDIAN_STATES:
        if state.lower() == cleaned.lower():
            return state

    # Abbreviation
    upper = cleaned.upper()
    if upper in STATE_ABBREVIATIONS:
        return STATE_ABBREVIATIONS[upper]

    # Common misspelling / city name
    lower = cleaned.lower()
    if lower in STATE_CORRECTIONS:
        return STATE_CORRECTIONS[lower]

    # Partial match
    for state in INDIAN_STATES:
        if lower in state.lower() or state.lower() in lower:
            return state

    return None


def get_state_metadata(state_name):
    """Get metadata for a state"""
    return STATE_METADATA.get(state_name)


def get_states_by_region(region):
    """Get all states in a region (North, South, East, West, Central, Northeast, Islands)"""
    return [
        state for state, meta in STATE_METADATA.items()
        if meta.get('region', '').lower() == region.lower()
    ]


# ──────────────────────────────────────────────────
# INPUT VALIDATION
# ──────────────────────────────────────────────────

class ValidationResult:
    """Structured validation result"""

    def __init__(self):
        self.errors = []
        self.warnings = []
        self.sanitized_data = {}
        self.is_valid = True

    def add_error(self, field, message):
        self.errors.append({"field": field, "message": message})
        self.is_valid = False

    def add_warning(self, field, message):
        self.warnings.append({"field": field, "message": message})

    def to_dict(self):
        return {
            "is_valid": self.is_valid,
            "errors": self.errors,
            "warnings": self.warnings,
            "error_count": len(self.errors),
            "warning_count": len(self.warnings)
        }


def validate_user_input(data):
    """
    Comprehensive user input validation with sanitization

    Args:
        data: dict with user form data

    Returns:
        List of error strings (empty = valid) — backward compatible
    """
    result = validate_user_input_detailed(data)
    return [e['message'] for e in result.errors]


def validate_user_input_detailed(data):
    """
    Detailed validation returning structured result

    Args:
        data: dict with user form data

    Returns:
        ValidationResult object
    """
    result = ValidationResult()

    if not isinstance(data, dict):
        result.add_error('data', 'Input must be a JSON object')
        return result

    # ── AGE VALIDATION ──
    age = data.get('age')
    if age is None or age == '':
        result.add_error('age', 'Age is required')
    else:
        try:
            age_int = int(age)
            if age_int < 0:
                result.add_error('age', 'Age cannot be negative')
            elif age_int == 0:
                result.add_error('age', 'Age must be greater than 0')
            elif age_int > 120:
                result.add_error('age', 'Age seems invalid (max: 120)')
            elif age_int < 5:
                result.add_warning('age', 'Very young age. Schemes may be limited.')
            elif age_int > 100:
                result.add_warning('age', 'Very high age. Please verify.')
            result.sanitized_data['age'] = age_int
        except (ValueError, TypeError):
            result.add_error('age', 'Age must be a valid number')

    # ── GENDER VALIDATION ──
    gender = data.get('gender', '').strip().lower()
    valid_genders = ['male', 'female', 'transgender', 'other']
    if not gender:
        result.add_error('gender', 'Gender is required')
    elif gender not in valid_genders:
        result.add_error('gender', f'Gender must be one of: {", ".join(valid_genders)}')
    else:
        result.sanitized_data['gender'] = gender

    # ── STATE VALIDATION ──
    state = data.get('state', '').strip()
    if not state:
        result.add_error('state', 'State is required')
    else:
        resolved = resolve_state(state)
        if resolved:
            result.sanitized_data['state'] = resolved
            if resolved != state:
                result.add_warning('state', f"Auto-corrected to '{resolved}'")
        else:
            result.add_error('state', f"'{state}' is not a valid Indian state/UT")

    # ── INCOME VALIDATION ──
    income = data.get('annual_income')
    if income is None and income != 0:
        result.add_error('annual_income', 'Annual income is required')
    else:
        try:
            income_int = int(income)
            if income_int < 0:
                result.add_error('annual_income', 'Income cannot be negative')
            elif income_int > 100000000:  # 10 crore
                result.add_warning('annual_income', 'Very high income. Please verify.')
            result.sanitized_data['annual_income'] = income_int
        except (ValueError, TypeError):
            result.add_error('annual_income', 'Income must be a valid number')

    # ── CATEGORY VALIDATION ──
    category = data.get('category', '').strip().lower()
    valid_categories = ['general', 'obc', 'sc', 'st', 'minority', 'ews']
    if category and category not in valid_categories:
        result.add_warning(
            'category',
            f"Unknown category '{category}'. Expected: {', '.join(valid_categories)}"
        )
    if category:
        result.sanitized_data['category'] = category

    # ── OCCUPATION VALIDATION ──
    occupation = data.get('occupation', '').strip().lower()
    valid_occupations = [
        'farmer', 'student', 'business', 'labour', 'unemployed',
        'housewife', 'teacher', 'doctor', 'engineer', 'artisan',
        'government', 'private', 'self-employed', 'retired', 'other'
    ]
    if occupation and occupation not in valid_occupations:
        result.add_warning(
            'occupation',
            f"Uncommon occupation '{occupation}'. Consider: {', '.join(valid_occupations[:8])}"
        )
    if occupation:
        result.sanitized_data['occupation'] = occupation

    # ── BOOLEAN FIELDS ──
    for bool_field in ['is_bpl', 'is_farmer', 'is_student', 'disability']:
        value = data.get(bool_field)
        if value is not None:
            if isinstance(value, str):
                result.sanitized_data[bool_field] = value.lower() in ('true', '1', 'yes')
            elif isinstance(value, bool):
                result.sanitized_data[bool_field] = value
            elif isinstance(value, (int, float)):
                result.sanitized_data[bool_field] = bool(value)

    # ── LANGUAGE VALIDATION ──
    language = data.get('language', 'en').strip().lower()
    if language not in SUPPORTED_LANGUAGES:
        result.add_warning('language', f"Language '{language}' may not be supported")
    result.sanitized_data['language'] = language

    # ── PHONE VALIDATION (optional field) ──
    phone = data.get('phone', '').strip()
    if phone:
        if validate_phone(phone):
            result.sanitized_data['phone'] = sanitize_phone(phone)
        else:
            result.add_warning('phone', 'Phone number format appears invalid')

    # ── AADHAAR VALIDATION (optional field) ──
    aadhaar = data.get('aadhaar', '').strip()
    if aadhaar:
        if validate_aadhaar(aadhaar):
            result.sanitized_data['aadhaar'] = sanitize_aadhaar(aadhaar)
        else:
            result.add_warning('aadhaar', 'Aadhaar number format appears invalid')

    return result


# ──────────────────────────────────────────────────
# DOCUMENT VALIDATION HELPERS
# ──────────────────────────────────────────────────

def validate_phone(phone):
    """Validate Indian phone number"""
    if not phone:
        return False
    cleaned = re.sub(r'[\s\-\(\)\+]', '', str(phone))

    # Indian mobile: 10 digits starting with 6-9
    if re.match(r'^[6-9]\d{9}$', cleaned):
        return True

    # With country code
    if re.match(r'^91[6-9]\d{9}$', cleaned):
        return True

    # With +91
    if re.match(r'^0?91[6-9]\d{9}$', cleaned):
        return True

    return False


def sanitize_phone(phone):
    """Clean phone number to standard 10-digit format"""
    cleaned = re.sub(r'[\s\-\(\)\+]', '', str(phone))
    if len(cleaned) == 12 and cleaned.startswith('91'):
        return cleaned[2:]
    if len(cleaned) == 13 and cleaned.startswith('091'):
        return cleaned[3:]
    if len(cleaned) == 10:
        return cleaned
    return cleaned


def validate_aadhaar(aadhaar):
    """Validate Aadhaar number format (12 digits, not starting with 0 or 1)"""
    if not aadhaar:
        return False
    cleaned = re.sub(r'[\s\-]', '', str(aadhaar))
    return bool(re.match(r'^[2-9]\d{11}$', cleaned))


def sanitize_aadhaar(aadhaar):
    """Clean and mask Aadhaar for display (XXXX-XXXX-1234)"""
    cleaned = re.sub(r'[\s\-]', '', str(aadhaar))
    if len(cleaned) == 12:
        return f"XXXX-XXXX-{cleaned[-4:]}"
    return aadhaar


def validate_pincode(pincode):
    """Validate Indian PIN code (6 digits, first digit 1-9)"""
    if not pincode:
        return False
    cleaned = str(pincode).strip()
    return bool(re.match(r'^[1-9]\d{5}$', cleaned))


def validate_pan(pan):
    """Validate PAN card format (ABCDE1234F)"""
    if not pan:
        return False
    cleaned = str(pan).strip().upper()
    return bool(re.match(r'^[A-Z]{5}\d{4}[A-Z]$', cleaned))


def validate_ifsc(ifsc):
    """Validate IFSC code format (ABCD0123456)"""
    if not ifsc:
        return False
    cleaned = str(ifsc).strip().upper()
    return bool(re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', cleaned))


def validate_email(email):
    """Basic email validation"""
    if not email:
        return False
    return bool(re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', str(email).strip()))


# ──────────────────────────────────────────────────
# CURRENCY FORMATTING
# ──────────────────────────────────────────────────

def format_currency(amount, style='short'):
    """
    Format number to Indian currency style

    Args:
        amount: numeric amount
        style: 'short' (₹1.5L), 'full' (₹1,50,000), 'words' (One Lakh Fifty Thousand)

    Returns:
        Formatted string
    """
    if amount is None:
        return "N/A"

    try:
        amount = int(amount)
    except (ValueError, TypeError):
        return "N/A"

    if amount < 0:
        return f"-{format_currency(abs(amount), style)}"

    if style == 'full':
        return _format_indian_number(amount)

    if style == 'words':
        return _amount_to_words(amount)

    # Short style (default)
    if amount >= 10000000:
        value = amount / 10000000
        return f"₹{value:.1f} Cr" if value != int(value) else f"₹{int(value)} Cr"
    elif amount >= 100000:
        value = amount / 100000
        return f"₹{value:.1f} L" if value != int(value) else f"₹{int(value)} L"
    elif amount >= 1000:
        value = amount / 1000
        return f"₹{value:.1f}K" if value != int(value) else f"₹{int(value)}K"
    else:
        return f"₹{amount}"


def _format_indian_number(number):
    """Format number with Indian comma system (₹1,23,45,678)"""
    num_str = str(abs(number))
    sign = '-' if number < 0 else ''

    if len(num_str) <= 3:
        return f"{sign}₹{num_str}"

    last_three = num_str[-3:]
    remaining = num_str[:-3]

    # Add commas every 2 digits for remaining
    parts = []
    while len(remaining) > 2:
        parts.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    if remaining:
        parts.insert(0, remaining)

    formatted = ','.join(parts) + ',' + last_three
    return f"{sign}₹{formatted}"


def _amount_to_words(amount):
    """Convert amount to Indian number words"""
    if amount == 0:
        return "Zero Rupees"

    crore = amount // 10000000
    remainder = amount % 10000000
    lakh = remainder // 100000
    remainder = remainder % 100000
    thousand = remainder // 1000
    remainder = remainder % 1000

    parts = []
    if crore > 0:
        parts.append(f"{crore} Crore")
    if lakh > 0:
        parts.append(f"{lakh} Lakh")
    if thousand > 0:
        parts.append(f"{thousand} Thousand")
    if remainder > 0:
        parts.append(f"{remainder}")

    return "₹" + " ".join(parts)


def parse_income_string(text):
    """
    Parse income from various text formats

    Handles: "1.5 lakh", "2L", "50000", "5 lpa", "10k/month", etc.

    Returns:
        Annual income as integer or None
    """
    if not text:
        return None

    text = str(text).lower().strip()

    # Remove currency symbols
    text = re.sub(r'[₹$rs\.]+', '', text).strip()

    # Direct number
    if text.replace(',', '').isdigit():
        return int(text.replace(',', ''))

    # Crore
    match = re.match(r'([\d.]+)\s*(?:cr|crore)', text)
    if match:
        return int(float(match.group(1)) * 10000000)

    # Lakh
    match = re.match(r'([\d.]+)\s*(?:l|lakh|lac|lpa)', text)
    if match:
        return int(float(match.group(1)) * 100000)

    # Thousand
    match = re.match(r'([\d.]+)\s*(?:k|thousand|hazar)', text)
    if match:
        return int(float(match.group(1)) * 1000)

    # Monthly to annual
    match = re.match(r'([\d,]+)\s*(?:pm|per\s*month|monthly|/month)', text)
    if match:
        monthly = int(match.group(1).replace(',', ''))
        return monthly * 12

    # Plain number with possible commas
    match = re.match(r'([\d,]+)', text)
    if match:
        return int(match.group(1).replace(',', ''))

    return None


# ──────────────────────────────────────────────────
# TEXT UTILITIES
# ──────────────────────────────────────────────────

def sanitize_text(text, max_length=500):
    """
    Clean and sanitize user input text

    Removes:
    - HTML/script tags
    - Excessive whitespace
    - Control characters
    - Potential XSS
    """
    if not text:
        return ""

    if not isinstance(text, str):
        text = str(text)

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove script injections
    dangerous = [
        '<script', 'javascript:', 'onclick', 'onerror',
        '<iframe', 'eval(', 'document.', 'window.',
        'alert(', 'prompt(', 'confirm('
    ]
    for pattern in dangerous:
        text = text.replace(pattern, '')
        text = text.replace(pattern.upper(), '')

    # Remove control characters (keep newlines and tabs)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # Trim
    text = text.strip()[:max_length]

    return text


def normalize_name(name):
    """Normalize a person's name"""
    if not name:
        return ""
    # Title case, remove extra spaces
    return ' '.join(name.strip().split()).title()


def mask_sensitive(text, mask_char='X'):
    """Mask sensitive information in text"""
    if not text:
        return text

    # Mask Aadhaar-like numbers (12 digits)
    text = re.sub(
        r'\b(\d{4})\s*(\d{4})\s*(\d{4})\b',
        f'{mask_char * 4}-{mask_char * 4}-\\3',
        text
    )

    # Mask phone numbers
    text = re.sub(
        r'\b([6-9]\d{2})\d{4}(\d{3})\b',
        f'\\1{mask_char * 4}\\2',
        text
    )

    # Mask PAN
    text = re.sub(
        r'\b([A-Z]{3})[A-Z]{2}\d{4}[A-Z]\b',
        f'\\1{mask_char * 2}{mask_char * 4}{mask_char}',
        text
    )

    return text


def truncate_text(text, max_length=100, suffix='...'):
    """Truncate text to max length with suffix"""
    if not text or len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)].rstrip() + suffix


def extract_numbers(text):
    """Extract all numbers from text"""
    if not text:
        return []
    return [int(n) for n in re.findall(r'\d+', str(text))]


# ──────────────────────────────────────────────────
# DATE & AGE UTILITIES
# ──────────────────────────────────────────────────

def calculate_age(birth_date):
    """
    Calculate age from birth date

    Args:
        birth_date: date object, datetime, or string (YYYY-MM-DD, DD/MM/YYYY)

    Returns:
        Age in years as integer
    """
    if not birth_date:
        return None

    if isinstance(birth_date, str):
        birth_date = parse_date(birth_date)
        if not birth_date:
            return None

    if isinstance(birth_date, datetime):
        birth_date = birth_date.date()

    today = date.today()
    age = today.year - birth_date.year

    # Adjust if birthday hasn't occurred this year
    if (today.month, today.day) < (birth_date.month, birth_date.day):
        age -= 1

    return max(0, age)


def parse_date(date_string):
    """Parse date from various Indian formats"""
    if not date_string:
        return None

    formats = [
        '%Y-%m-%d',      # 2024-01-15
        '%d-%m-%Y',      # 15-01-2024
        '%d/%m/%Y',      # 15/01/2024
        '%Y/%m/%d',      # 2024/01/15
        '%d-%m-%y',      # 15-01-24
        '%d/%m/%y',      # 15/01/24
        '%d %b %Y',      # 15 Jan 2024
        '%d %B %Y',      # 15 January 2024
        '%B %d, %Y',     # January 15, 2024
    ]

    for fmt in formats:
        try:
            return datetime.strptime(date_string.strip(), fmt).date()
        except ValueError:
            continue

    return None


def get_age_group(age):
    """Categorize age into groups"""
    if age is None:
        return 'unknown'
    age = int(age)
    if age < 6:
        return 'infant'
    elif age < 14:
        return 'child'
    elif age < 18:
        return 'minor'
    elif age < 25:
        return 'youth'
    elif age < 40:
        return 'adult'
    elif age < 60:
        return 'middle_age'
    else:
        return 'senior_citizen'


def is_senior_citizen(age):
    """Check if person qualifies as senior citizen (60+)"""
    return age is not None and int(age) >= 60


def is_minor(age):
    """Check if person is a minor (< 18)"""
    return age is not None and int(age) < 18


# ──────────────────────────────────────────────────
# RESPONSE FORMATTING
# ──────────────────────────────────────────────────

def format_scheme_card(scheme):
    """Format a scheme as a text card for display"""
    name = scheme.get('name', 'Unknown')
    desc = truncate_text(scheme.get('description', ''), 120)
    category = scheme.get('category', '').title()
    scheme_type = scheme.get('type', '').title()
    score = scheme.get('match_score')
    benefits = truncate_text(scheme.get('benefits', ''), 100)

    card = f"📋 **{name}**\n"
    card += f"🏷️ {category} | {scheme_type}\n"

    if score is not None:
        stars = '⭐' * (score // 20)
        card += f"Match: {score}% {stars}\n"

    if desc:
        card += f"📝 {desc}\n"

    if benefits:
        card += f"✅ {benefits}\n"

    return card


def format_error_response(error_type, message, details=None):
    """Create standardized error response"""
    response = {
        "success": False,
        "error": error_type,
        "message": message,
        "timestamp": datetime.now().isoformat()
    }

    if details:
        response["details"] = details

    return response


def format_success_response(data, message="Success"):
    """Create standardized success response"""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }


# ──────────────────────────────────────────────────
# SCHEME HELPERS
# ──────────────────────────────────────────────────

def validate_url(url):
    """Validate if URL is properly formatted"""
    if not url:
        return False
    pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )
    return bool(pattern.match(url))


def is_government_url(url):
    """Check if URL is an Indian government website"""
    if not url:
        return False
    gov_domains = [
        '.gov.in', '.nic.in', '.india.gov.in',
        'pmjay.gov.in', 'pmkisan.gov.in', 'nrega.nic.in',
        'scholarships.gov.in', 'umang.gov.in', 'digilocker.gov.in',
        'jan-dhan', 'mudra.org.in'
    ]
    url_lower = url.lower()
    return any(domain in url_lower for domain in gov_domains)


IMPORTANT_HELPLINES = {
    'general': {'number': '1800-111-555', 'name': 'Government Scheme Helpline'},
    'ayushman': {'number': '14555', 'name': 'Ayushman Bharat Helpline'},
    'pm_kisan': {'number': '155261', 'name': 'PM-KISAN Helpline'},
    'mudra': {'number': '1800-180-1111', 'name': 'Mudra Yojana Helpline'},
    'women': {'number': '181', 'name': 'Women Helpline'},
    'child': {'number': '1098', 'name': 'Childline'},
    'senior': {'number': '14567', 'name': 'Elder Helpline'},
    'disability': {'number': '1800-572-6012', 'name': 'Disability Helpline'},
    'consumer': {'number': '1800-114-000', 'name': 'Consumer Helpline'},
    'rti': {'number': '1800-110-001', 'name': 'RTI Helpline'},
    'labour': {'number': '14434', 'name': 'Labour Helpline (Shramik Helpline)'},
    'farmer': {'number': '1800-180-1551', 'name': 'Kisan Call Centre'},
    'education': {'number': '1800-111-265', 'name': 'Education Helpline'},
    'csc': {'number': '1800-121-3468', 'name': 'CSC Helpline'},
}

USEFUL_PORTALS = {
    'umang': {'url': 'https://umang.gov.in', 'name': 'UMANG App'},
    'digilocker': {'url': 'https://digilocker.gov.in', 'name': 'DigiLocker'},
    'services': {'url': 'https://services.india.gov.in', 'name': 'National Portal'},
    'scholarship': {'url': 'https://scholarships.gov.in', 'name': 'National Scholarship Portal'},
    'mygov': {'url': 'https://mygov.in', 'name': 'MyGov'},
    'edistrict': {'url': 'https://edistrict.up.gov.in', 'name': 'e-District'},
    'pmjay': {'url': 'https://pmjay.gov.in', 'name': 'Ayushman Bharat'},
    'pmkisan': {'url': 'https://pmkisan.gov.in', 'name': 'PM-KISAN'},
    'jandhan': {'url': 'https://pmjdy.gov.in', 'name': 'Jan Dhan Yojana'},
}


def get_helpline(category='general'):
    """Get helpline number for a category"""
    return IMPORTANT_HELPLINES.get(category.lower(), IMPORTANT_HELPLINES['general'])


def get_portal(name):
    """Get portal details"""
    return USEFUL_PORTALS.get(name.lower())


def get_all_helplines():
    """Get all available helplines"""
    return IMPORTANT_HELPLINES


def get_all_portals():
    """Get all useful portals"""
    return USEFUL_PORTALS


# ──────────────────────────────────────────────────
# STANDALONE TESTING
# ──────────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 Utils Module Test Suite")
    print("=" * 60)

    # Test currency formatting
    print("\n💰 Currency Formatting:")
    test_amounts = [500, 15000, 250000, 1500000, 75000000, 0, None]
    for amt in test_amounts:
        short = format_currency(amt, 'short')
        full = format_currency(amt, 'full')
        words = format_currency(amt, 'words')
        print(f"   {str(amt):>12} → {short:>10} | {full:>15} | {words}")

    # Test income parsing
    print("\n📊 Income Parsing:")
    test_incomes = ['1.5 lakh', '2L', '50000', '25k/month', '3 crore', '₹80,000', '5 lpa']
    for inc in test_incomes:
        parsed = parse_income_string(inc)
        formatted = format_currency(parsed) if parsed else 'N/A'
        print(f"   '{inc}' → {parsed} → {formatted}")

    # Test state resolution
    print("\n📍 State Resolution:")
    test_states = ['UP', 'maharastra', 'Tamil Nadu', 'dilli', 'bengaluru', 'mp', 'gujrat']
    for s in test_states:
        resolved = resolve_state(s)
        meta = get_state_metadata(resolved) if resolved else None
        region = meta['region'] if meta else '?'
        print(f"   '{s}' → {resolved} ({region})")

    # Test validation
    print("\n✅ Input Validation:")
    test_data = {
        'age': 25,
        'gender': 'male',
        'state': 'UP',
        'annual_income': 150000,
        'category': 'obc',
        'phone': '9876543210',
        'aadhaar': '234567890123'
    }
    result = validate_user_input_detailed(test_data)
    print(f"   Valid: {result.is_valid}")
    print(f"   Errors: {result.errors}")
    print(f"   Warnings: {result.warnings}")
    print(f"   Sanitized state: {result.sanitized_data.get('state')}")

    # Test document validation
    print("\n📄 Document Validation:")
    print(f"   Phone '9876543210': {validate_phone('9876543210')}")
    print(f"   Phone '12345': {validate_phone('12345')}")
    print(f"   Aadhaar '234567890123': {validate_aadhaar('234567890123')}")
    print(f"   Aadhaar '123456': {validate_aadhaar('123456')}")
    print(f"   PAN 'ABCDE1234F': {validate_pan('ABCDE1234F')}")
    print(f"   PIN '110001': {validate_pincode('110001')}")
    print(f"   IFSC 'SBIN0001234': {validate_ifsc('SBIN0001234')}")

    # Test language detection
    print("\n🌐 Language Detection:")
    test_texts = [
        "Tell me about PM KISAN",
        "मुझे पीएम किसान के बारे में बताएं",
        "mujhe yojana batao kaise apply kare",
        "আমি স্কলারশিপ চাই",
        "నాకు పథకాల గురించి చెప్పండి"
    ]
    for text in test_texts:
        detected = detect_language(text)
        print(f"   '{text[:40]}...' → {detected['code']} ({detected['confidence']}%)")

    # Test age utilities
    print("\n🎂 Age Utilities:")
    print(f"   Age group 5: {get_age_group(5)}")
    print(f"   Age group 25: {get_age_group(25)}")
    print(f"   Age group 65: {get_age_group(65)}")
    print(f"   Senior citizen 65: {is_senior_citizen(65)}")
    print(f"   Minor 15: {is_minor(15)}")

    # Test text sanitization
    print("\n🔒 Text Sanitization:")
    dirty = "Hello <script>alert('xss')</script> World   extra   spaces"
    clean = sanitize_text(dirty)
    print(f"   Dirty: {dirty}")
    print(f"   Clean: {clean}")

    # Test masking
    print("\n🔐 Sensitive Data Masking:")
    sensitive = "My Aadhaar is 2345 6789 0123 and phone is 9876543210"
    masked = mask_sensitive(sensitive)
    print(f"   Original: {sensitive}")
    print(f"   Masked: {masked}")

    # Helplines
    print("\n📞 Helplines:")
    for key in ['general', 'farmer', 'ayushman', 'women']:
        h = get_helpline(key)
        print(f"   {h['name']}: {h['number']}")

    print(f"\n✅ All tests complete!")
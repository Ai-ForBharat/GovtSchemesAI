"""
Data Loader v3.0 - Enhanced Scheme Data Manager
================================================
Features:
  - Multi-source loading (JSON + hot-reload support)
  - Data validation & integrity checks
  - Fast lookup indexes (by ID, category, state, type)
  - Advanced filtering with multi-criteria support
  - Full-text search across scheme fields
  - Statistics & summary generation
  - Schema validation for each scheme entry
  - Duplicate detection
  - Data export capabilities
  - Auto-repair for missing fields
  - Logging throughout
"""

import json
import os
import re
import time
import logging
from datetime import datetime
from collections import defaultdict
from copy import deepcopy
from difflib import SequenceMatcher

logger = logging.getLogger('GovSchemeAI.DataLoader')


class SchemaValidator:
    """Validates individual scheme entries against expected structure"""

    REQUIRED_FIELDS = ['id', 'name']

    EXPECTED_FIELDS = {
        'id': str,
        'name': str,
        'description': str,
        'category': str,
        'type': str,
        'benefits': str,
        'how_to_apply': str,
        'url': str,
        'eligibility': dict
    }

    ELIGIBILITY_FIELDS = {
        'min_age': (int, float, type(None)),
        'max_age': (int, float, type(None)),
        'gender': str,
        'states': (str, list),
        'category': (list, type(None)),
        'max_income': (int, float, type(None)),
        'occupation': (list, type(None)),
        'is_bpl': (bool, type(None)),
        'is_farmer': (bool, type(None)),
        'is_student': (bool, type(None)),
        'disability': (bool, type(None))
    }

    VALID_CATEGORIES = [
        'agriculture', 'health', 'education', 'housing', 'finance',
        'women', 'pension', 'insurance', 'employment', 'sanitation',
        'social', 'rural', 'urban', 'skill', 'food', 'energy', 'other'
    ]

    VALID_TYPES = ['central', 'state', 'both']
    VALID_GENDERS = ['all', 'male', 'female', 'transgender']

    @classmethod
    def validate(cls, scheme, index=0):
        """
        Validate a single scheme entry
        Returns: (is_valid, errors, warnings)
        """
        errors = []
        warnings = []

        # Check required fields
        for field in cls.REQUIRED_FIELDS:
            if not scheme.get(field):
                errors.append(f"Scheme #{index}: Missing required field '{field}'")

        # Check field types
        for field, expected_type in cls.EXPECTED_FIELDS.items():
            if field in scheme and scheme[field] is not None:
                if not isinstance(scheme[field], expected_type):
                    warnings.append(
                        f"Scheme '{scheme.get('id', '?')}': "
                        f"Field '{field}' expected {expected_type.__name__}, "
                        f"got {type(scheme[field]).__name__}"
                    )

        # Validate ID format (no spaces, lowercase recommended)
        scheme_id = scheme.get('id', '')
        if scheme_id and ' ' in scheme_id:
            warnings.append(f"Scheme '{scheme_id}': ID contains spaces")

        # Validate category
        category = scheme.get('category', '')
        if category and category.lower() not in cls.VALID_CATEGORIES:
            warnings.append(
                f"Scheme '{scheme_id}': Unknown category '{category}'. "
                f"Valid: {', '.join(cls.VALID_CATEGORIES)}"
            )

        # Validate type
        scheme_type = scheme.get('type', '')
        if scheme_type and scheme_type.lower() not in cls.VALID_TYPES:
            warnings.append(
                f"Scheme '{scheme_id}': Unknown type '{scheme_type}'. "
                f"Valid: {', '.join(cls.VALID_TYPES)}"
            )

        # Validate eligibility
        elig = scheme.get('eligibility', {})
        if isinstance(elig, dict):
            # Age validation
            min_age = elig.get('min_age')
            max_age = elig.get('max_age')

            if min_age is not None:
                if not isinstance(min_age, (int, float)) or min_age < 0:
                    errors.append(f"Scheme '{scheme_id}': Invalid min_age: {min_age}")
                elif min_age > 120:
                    warnings.append(f"Scheme '{scheme_id}': min_age {min_age} seems too high")

            if max_age is not None:
                if not isinstance(max_age, (int, float)) or max_age < 0:
                    errors.append(f"Scheme '{scheme_id}': Invalid max_age: {max_age}")
                elif max_age > 120:
                    warnings.append(f"Scheme '{scheme_id}': max_age {max_age} seems too high")

            if min_age is not None and max_age is not None:
                if min_age > max_age:
                    errors.append(
                        f"Scheme '{scheme_id}': min_age ({min_age}) > max_age ({max_age})"
                    )

            # Gender validation
            gender = elig.get('gender', 'all')
            if gender not in cls.VALID_GENDERS:
                warnings.append(f"Scheme '{scheme_id}': Unknown gender '{gender}'")

            # States validation
            states = elig.get('states', 'all')
            if isinstance(states, list) and len(states) == 0:
                warnings.append(f"Scheme '{scheme_id}': Empty states list")

            # Income validation
            max_income = elig.get('max_income')
            if max_income is not None:
                if not isinstance(max_income, (int, float)) or max_income < 0:
                    errors.append(f"Scheme '{scheme_id}': Invalid max_income: {max_income}")

        # Check for empty description
        if not scheme.get('description'):
            warnings.append(f"Scheme '{scheme_id}': Missing description")

        is_valid = len(errors) == 0
        return is_valid, errors, warnings


class DataLoader:
    """
    Enhanced Data Loader with indexing, validation, and advanced queries
    """

    def __init__(self, file_path=None, auto_validate=True):
        """
        Initialize DataLoader

        Args:
            file_path: Path to schemes.json (default: same directory)
            auto_validate: Run validation on load (default: True)
        """
        self.schemes = []
        self.file_path = file_path or os.path.join(
            os.path.dirname(__file__), 'schemes.json'
        )

        # Indexes for fast lookup
        self._index_by_id = {}
        self._index_by_category = defaultdict(list)
        self._index_by_type = defaultdict(list)
        self._index_by_state = defaultdict(list)
        self._all_states_schemes = []  # schemes available in all states

        # Metadata
        self._load_time = None
        self._file_size = 0
        self._validation_report = {}
        self._is_loaded = False

        # Load data
        self.load_schemes(validate=auto_validate)

    # ──────────────────────────────────────────
    # DATA LOADING
    # ──────────────────────────────────────────

    def load_schemes(self, validate=True):
        """Load all schemes from JSON file with validation"""
        start_time = time.time()

        try:
            if not os.path.exists(self.file_path):
                logger.error(f"❌ File not found: {self.file_path}")
                print(f"❌ schemes.json not found at: {self.file_path}")
                self.schemes = []
                self._is_loaded = False
                return False

            self._file_size = os.path.getsize(self.file_path)

            with open(self.file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)

            raw_schemes = data.get('schemes', [])

            if not raw_schemes:
                logger.warning("⚠️ No schemes found in JSON file")
                print("⚠️ schemes.json is empty or has no 'schemes' key")
                self.schemes = []
                self._is_loaded = False
                return False

            # Auto-repair missing fields
            self.schemes = [self._repair_scheme(s, i) for i, s in enumerate(raw_schemes)]

            # Validate if requested
            if validate:
                self._validate_all()

            # Detect duplicates
            self._check_duplicates()

            # Build indexes
            self._build_indexes()

            load_time = round((time.time() - start_time) * 1000, 2)
            self._load_time = datetime.now()
            self._is_loaded = True

            file_size_kb = round(self._file_size / 1024, 1)
            logger.info(
                f"✅ Loaded {len(self.schemes)} schemes "
                f"({file_size_kb} KB, {load_time}ms)"
            )
            print(
                f"✅ Loaded {len(self.schemes)} schemes successfully "
                f"({file_size_kb} KB in {load_time}ms)"
            )
            return True

        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parse error: {e}")
            print(f"❌ Error parsing schemes.json: {e}")
            self.schemes = []
            self._is_loaded = False
            return False

        except Exception as e:
            logger.error(f"❌ Unexpected error loading schemes: {e}")
            print(f"❌ Unexpected error: {e}")
            self.schemes = []
            self._is_loaded = False
            return False

    def reload(self):
        """Hot-reload schemes from file (useful for updates without restart)"""
        logger.info("🔄 Reloading scheme data...")
        print("🔄 Reloading scheme data...")

        old_count = len(self.schemes)
        success = self.load_schemes(validate=True)

        if success:
            new_count = len(self.schemes)
            diff = new_count - old_count
            diff_str = f"+{diff}" if diff > 0 else str(diff)
            logger.info(f"✅ Reload complete: {new_count} schemes ({diff_str})")
            print(f"✅ Reload complete: {new_count} schemes ({diff_str} change)")
        else:
            logger.error("❌ Reload failed")

        return success

    def _repair_scheme(self, scheme, index):
        """Auto-fill missing fields with defaults"""
        repaired = scheme.copy()

        # Ensure ID exists
        if not repaired.get('id'):
            repaired['id'] = f"scheme-{index + 1}"
            logger.warning(f"Auto-generated ID for scheme #{index}: {repaired['id']}")

        # Ensure name exists
        if not repaired.get('name'):
            repaired['name'] = f"Unnamed Scheme #{index + 1}"

        # Default fields
        defaults = {
            'description': '',
            'category': 'other',
            'type': 'central',
            'benefits': '',
            'how_to_apply': '',
            'url': '',
            'eligibility': {}
        }

        for field, default_val in defaults.items():
            if field not in repaired:
                repaired[field] = default_val

        # Ensure eligibility is a dict
        if not isinstance(repaired.get('eligibility'), dict):
            repaired['eligibility'] = {}

        # Default eligibility fields
        elig_defaults = {
            'gender': 'all',
            'states': 'all'
        }
        for field, default_val in elig_defaults.items():
            if field not in repaired['eligibility']:
                repaired['eligibility'][field] = default_val

        return repaired

    # ──────────────────────────────────────────
    # VALIDATION
    # ──────────────────────────────────────────

    def _validate_all(self):
        """Validate all schemes and generate report"""
        total_errors = []
        total_warnings = []
        valid_count = 0

        for i, scheme in enumerate(self.schemes):
            is_valid, errors, warnings = SchemaValidator.validate(scheme, i)
            if is_valid:
                valid_count += 1
            total_errors.extend(errors)
            total_warnings.extend(warnings)

        self._validation_report = {
            'total_schemes': len(self.schemes),
            'valid': valid_count,
            'invalid': len(self.schemes) - valid_count,
            'errors': total_errors,
            'warnings': total_warnings,
            'validated_at': datetime.now().isoformat()
        }

        # Print summary
        if total_errors:
            print(f"⚠️  Validation: {len(total_errors)} errors found")
            for err in total_errors[:5]:
                print(f"   ❌ {err}")
            if len(total_errors) > 5:
                print(f"   ... and {len(total_errors) - 5} more errors")

        if total_warnings:
            logger.info(f"Validation: {len(total_warnings)} warnings")

        if not total_errors:
            logger.info(f"✅ All {valid_count} schemes passed validation")

    def _check_duplicates(self):
        """Detect duplicate scheme IDs"""
        seen_ids = {}
        duplicates = []

        for i, scheme in enumerate(self.schemes):
            sid = scheme.get('id', '')
            if sid in seen_ids:
                duplicates.append({
                    'id': sid,
                    'first_index': seen_ids[sid],
                    'duplicate_index': i
                })
            else:
                seen_ids[sid] = i

        if duplicates:
            logger.warning(f"⚠️ Found {len(duplicates)} duplicate scheme IDs")
            for dup in duplicates:
                print(f"   ⚠️ Duplicate ID: '{dup['id']}' at index {dup['first_index']} and {dup['duplicate_index']}")

        return duplicates

    def get_validation_report(self):
        """Return the validation report"""
        return self._validation_report

    # ──────────────────────────────────────────
    # INDEXING
    # ──────────────────────────────────────────

    def _build_indexes(self):
        """Build fast lookup indexes"""
        start = time.time()

        self._index_by_id.clear()
        self._index_by_category.clear()
        self._index_by_type.clear()
        self._index_by_state.clear()
        self._all_states_schemes.clear()

        for scheme in self.schemes:
            sid = scheme.get('id', '')

            # ID index
            self._index_by_id[sid] = scheme

            # Category index
            category = scheme.get('category', 'other').lower()
            self._index_by_category[category].append(scheme)

            # Type index
            scheme_type = scheme.get('type', 'central').lower()
            self._index_by_type[scheme_type].append(scheme)

            # State index
            states = scheme.get('eligibility', {}).get('states', 'all')
            if states == 'all':
                self._all_states_schemes.append(scheme)
            elif isinstance(states, list):
                for state in states:
                    self._index_by_state[state].append(scheme)

        build_time = round((time.time() - start) * 1000, 2)
        logger.info(
            f"📇 Indexes built in {build_time}ms: "
            f"{len(self._index_by_id)} IDs, "
            f"{len(self._index_by_category)} categories, "
            f"{len(self._index_by_state)} states"
        )

    # ──────────────────────────────────────────
    # BASIC GETTERS (Index-powered)
    # ──────────────────────────────────────────

    def get_all_schemes(self):
        """Return all schemes"""
        return self.schemes

    def get_scheme_by_id(self, scheme_id):
        """Find a specific scheme by ID (O(1) lookup)"""
        return self._index_by_id.get(scheme_id)

    def get_schemes_by_category(self, category):
        """Filter schemes by category (indexed)"""
        return self._index_by_category.get(category.lower(), [])

    def get_schemes_by_type(self, scheme_type):
        """Filter by central or state (indexed)"""
        return self._index_by_type.get(scheme_type.lower(), [])

    def get_schemes_by_state(self, state):
        """Get schemes applicable to a state (indexed)"""
        state_specific = self._index_by_state.get(state, [])
        # Combine state-specific + all-states schemes
        return self._all_states_schemes + state_specific

    def get_categories(self):
        """Get all unique categories"""
        return sorted(self._index_by_category.keys())

    def get_types(self):
        """Get all unique scheme types"""
        return sorted(self._index_by_type.keys())

    # ──────────────────────────────────────────
    # ADVANCED FILTERING
    # ──────────────────────────────────────────

    def filter_schemes(self, **kwargs):
        """
        Multi-criteria filtering

        Usage:
            loader.filter_schemes(
                category='health',
                state='Bihar',
                gender='female',
                min_age=18,
                max_age=40,
                max_income=300000,
                occupation='farmer',
                is_bpl=True,
                scheme_type='central',
                has_url=True
            )
        """
        results = self.schemes.copy()

        # Category filter
        category = kwargs.get('category')
        if category:
            results = [
                s for s in results
                if s.get('category', '').lower() == category.lower()
            ]

        # Type filter
        scheme_type = kwargs.get('scheme_type') or kwargs.get('type')
        if scheme_type:
            results = [
                s for s in results
                if s.get('type', '').lower() == scheme_type.lower()
            ]

        # State filter
        state = kwargs.get('state')
        if state:
            results = [
                s for s in results
                if s.get('eligibility', {}).get('states') == 'all' or
                state in (s.get('eligibility', {}).get('states') or [])
            ]

        # Gender filter
        gender = kwargs.get('gender')
        if gender:
            results = [
                s for s in results
                if s.get('eligibility', {}).get('gender', 'all') in ['all', gender.lower()]
            ]

        # Age filter (user's age must fall in scheme's range)
        user_age = kwargs.get('age') or kwargs.get('user_age')
        if user_age is not None:
            user_age = int(user_age)
            filtered = []
            for s in results:
                elig = s.get('eligibility', {})
                min_a = elig.get('min_age')
                max_a = elig.get('max_age')
                # Include if no age restriction or user falls in range
                if min_a is None and max_a is None:
                    filtered.append(s)
                elif min_a is not None and max_a is not None:
                    if min_a <= user_age <= max_a:
                        filtered.append(s)
                elif min_a is not None and user_age >= min_a:
                    filtered.append(s)
                elif max_a is not None and user_age <= max_a:
                    filtered.append(s)
            results = filtered

        # Income filter
        max_income = kwargs.get('max_income') or kwargs.get('annual_income')
        if max_income is not None:
            max_income = int(max_income)
            results = [
                s for s in results
                if s.get('eligibility', {}).get('max_income') is None or
                max_income <= s['eligibility']['max_income']
            ]

        # Occupation filter
        occupation = kwargs.get('occupation')
        if occupation:
            results = [
                s for s in results
                if not s.get('eligibility', {}).get('occupation') or
                occupation.lower() in [
                    o.lower() for o in s['eligibility']['occupation']
                ]
            ]

        # Social category filter
        social_category = kwargs.get('social_category') or kwargs.get('caste_category')
        if social_category:
            results = [
                s for s in results
                if not s.get('eligibility', {}).get('category') or
                social_category.lower() in [
                    c.lower() for c in s['eligibility']['category']
                ]
            ]

        # BPL filter
        is_bpl = kwargs.get('is_bpl')
        if is_bpl is not None:
            results = [
                s for s in results
                if s.get('eligibility', {}).get('is_bpl') is None or
                s['eligibility']['is_bpl'] == is_bpl
            ]

        # Has URL filter
        has_url = kwargs.get('has_url')
        if has_url is not None:
            if has_url:
                results = [s for s in results if s.get('url')]
            else:
                results = [s for s in results if not s.get('url')]

        return results

    def get_schemes_for_profile(self, profile):
        """
        Shortcut: get schemes for a complete user profile dict

        Args:
            profile: dict with keys like age, gender, state, etc.
        """
        return self.filter_schemes(
            state=profile.get('state'),
            gender=profile.get('gender'),
            age=profile.get('age'),
            max_income=profile.get('annual_income'),
            occupation=profile.get('occupation'),
            social_category=profile.get('category'),
            is_bpl=profile.get('is_bpl')
        )

    # ──────────────────────────────────────────
    # SEARCH
    # ──────────────────────────────────────────

    def search(self, query, fields=None, limit=20):
        """
        Full-text search across scheme fields

        Args:
            query: search string
            fields: list of fields to search (default: name, description, benefits)
            limit: max results

        Returns:
            List of schemes sorted by relevance
        """
        if not query or not query.strip():
            return []

        query_lower = query.lower().strip()
        query_words = query_lower.split()

        search_fields = fields or ['name', 'description', 'benefits', 'category']

        scored_results = []

        for scheme in self.schemes:
            score = 0

            for field in search_fields:
                value = str(scheme.get(field, '')).lower()

                if not value:
                    continue

                # Exact match in field (highest score)
                if query_lower in value:
                    score += 50
                    # Bonus for match in name
                    if field == 'name':
                        score += 30

                # Individual word matches
                for word in query_words:
                    if len(word) < 2:
                        continue
                    if word in value:
                        score += 10
                        if field == 'name':
                            score += 15

                # Fuzzy match on name
                if field == 'name':
                    similarity = SequenceMatcher(None, query_lower, value).ratio()
                    if similarity > 0.4:
                        score += int(similarity * 40)

            if score > 0:
                scheme_copy = scheme.copy()
                scheme_copy['_search_score'] = score
                scored_results.append(scheme_copy)

        # Sort by score descending
        scored_results.sort(key=lambda x: x['_search_score'], reverse=True)

        return scored_results[:limit]

    def search_by_name(self, name, fuzzy=True, limit=5):
        """Search schemes specifically by name"""
        if not name:
            return []

        name_lower = name.lower().strip()
        results = []

        for scheme in self.schemes:
            scheme_name = scheme.get('name', '').lower()

            # Exact containment
            if name_lower in scheme_name or scheme_name in name_lower:
                results.append((scheme, 100))
                continue

            # Fuzzy matching
            if fuzzy:
                ratio = SequenceMatcher(None, name_lower, scheme_name).ratio()
                if ratio > 0.4:
                    results.append((scheme, int(ratio * 100)))

        results.sort(key=lambda x: x[1], reverse=True)
        return [r[0] for r in results[:limit]]

    # ──────────────────────────────────────────
    # STATISTICS
    # ──────────────────────────────────────────

    def get_statistics(self):
        """Get comprehensive statistics about loaded schemes"""
        stats = {
            'total_schemes': len(self.schemes),
            'load_time': self._load_time.isoformat() if self._load_time else None,
            'file_size_kb': round(self._file_size / 1024, 1),
            'is_loaded': self._is_loaded,
            'categories': {},
            'types': {},
            'state_coverage': {
                'all_india_schemes': len(self._all_states_schemes),
                'state_specific_states': len(self._index_by_state)
            },
            'eligibility_stats': {
                'with_age_limit': 0,
                'with_income_limit': 0,
                'gender_specific': 0,
                'with_occupation': 0,
                'bpl_specific': 0,
                'with_category': 0,
                'with_url': 0,
                'with_description': 0
            },
            'age_range': {
                'min_across_schemes': None,
                'max_across_schemes': None
            },
            'income_limits': {
                'lowest': None,
                'highest': None
            }
        }

        # Category distribution
        for cat, schemes in self._index_by_category.items():
            stats['categories'][cat] = len(schemes)

        # Type distribution
        for stype, schemes in self._index_by_type.items():
            stats['types'][stype] = len(schemes)

        # Analyze eligibility
        all_min_ages = []
        all_max_ages = []
        all_incomes = []

        for scheme in self.schemes:
            elig = scheme.get('eligibility', {})

            if elig.get('min_age') is not None or elig.get('max_age') is not None:
                stats['eligibility_stats']['with_age_limit'] += 1
                if elig.get('min_age') is not None:
                    all_min_ages.append(elig['min_age'])
                if elig.get('max_age') is not None:
                    all_max_ages.append(elig['max_age'])

            if elig.get('max_income') is not None:
                stats['eligibility_stats']['with_income_limit'] += 1
                all_incomes.append(elig['max_income'])

            if elig.get('gender', 'all') != 'all':
                stats['eligibility_stats']['gender_specific'] += 1

            if elig.get('occupation'):
                stats['eligibility_stats']['with_occupation'] += 1

            if elig.get('is_bpl') is not None:
                stats['eligibility_stats']['bpl_specific'] += 1

            if elig.get('category'):
                stats['eligibility_stats']['with_category'] += 1

            if scheme.get('url'):
                stats['eligibility_stats']['with_url'] += 1

            if scheme.get('description'):
                stats['eligibility_stats']['with_description'] += 1

        # Age range
        if all_min_ages:
            stats['age_range']['min_across_schemes'] = min(all_min_ages)
        if all_max_ages:
            stats['age_range']['max_across_schemes'] = max(all_max_ages)

        # Income range
        if all_incomes:
            stats['income_limits']['lowest'] = min(all_incomes)
            stats['income_limits']['highest'] = max(all_incomes)

        return stats

    def get_summary(self):
        """Quick summary string for logging/display"""
        cats = len(self._index_by_category)
        types = len(self._index_by_type)
        all_india = len(self._all_states_schemes)
        state_specific = sum(len(v) for v in self._index_by_state.values())

        return (
            f"📊 DataLoader Summary:\n"
            f"   Total: {len(self.schemes)} schemes\n"
            f"   Categories: {cats} ({', '.join(sorted(self._index_by_category.keys()))})\n"
            f"   Types: {', '.join(sorted(self._index_by_type.keys()))}\n"
            f"   All-India: {all_india} | State-specific: {state_specific}\n"
            f"   File: {round(self._file_size / 1024, 1)} KB\n"
            f"   Loaded: {self._load_time.strftime('%Y-%m-%d %H:%M:%S') if self._load_time else 'N/A'}"
        )

    # ──────────────────────────────────────────
    # DATA EXPORT
    # ──────────────────────────────────────────

    def export_schemes(self, file_path=None, format='json', filters=None):
        """
        Export schemes to file

        Args:
            file_path: output path (default: schemes_export.json)
            format: 'json' or 'csv'
            filters: dict of filter criteria (passed to filter_schemes)
        """
        schemes = self.filter_schemes(**filters) if filters else self.schemes

        if not file_path:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            file_path = os.path.join(
                os.path.dirname(self.file_path),
                f'schemes_export_{timestamp}.{format}'
            )

        try:
            if format == 'json':
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(
                        {'schemes': schemes, 'exported_at': datetime.now().isoformat()},
                        f, indent=2, ensure_ascii=False
                    )

            elif format == 'csv':
                import csv
                with open(file_path, 'w', newline='', encoding='utf-8') as f:
                    if not schemes:
                        return file_path

                    # Flatten eligibility for CSV
                    fieldnames = [
                        'id', 'name', 'description', 'category', 'type',
                        'benefits', 'how_to_apply', 'url',
                        'min_age', 'max_age', 'gender', 'states',
                        'max_income', 'category_eligible', 'occupation'
                    ]
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()

                    for s in schemes:
                        elig = s.get('eligibility', {})
                        row = {
                            'id': s.get('id', ''),
                            'name': s.get('name', ''),
                            'description': s.get('description', ''),
                            'category': s.get('category', ''),
                            'type': s.get('type', ''),
                            'benefits': s.get('benefits', ''),
                            'how_to_apply': s.get('how_to_apply', ''),
                            'url': s.get('url', ''),
                            'min_age': elig.get('min_age', ''),
                            'max_age': elig.get('max_age', ''),
                            'gender': elig.get('gender', 'all'),
                            'states': elig.get('states', 'all'),
                            'max_income': elig.get('max_income', ''),
                            'category_eligible': ','.join(elig.get('category', []) or []),
                            'occupation': ','.join(elig.get('occupation', []) or [])
                        }
                        writer.writerow(row)

            logger.info(f"📤 Exported {len(schemes)} schemes to {file_path}")
            print(f"📤 Exported {len(schemes)} schemes to {file_path}")
            return file_path

        except Exception as e:
            logger.error(f"Export error: {e}")
            print(f"❌ Export failed: {e}")
            return None

    # ──────────────────────────────────────────
    # UTILITY METHODS
    # ──────────────────────────────────────────

    def get_all_states(self):
        """Get all states that have specific schemes"""
        return sorted(self._index_by_state.keys())

    def get_scheme_count(self):
        """Quick count of loaded schemes"""
        return len(self.schemes)

    def is_loaded(self):
        """Check if data is loaded successfully"""
        return self._is_loaded

    def get_schemes_with_url(self):
        """Get schemes that have official URLs"""
        return [s for s in self.schemes if s.get('url')]

    def get_schemes_without_url(self):
        """Get schemes missing URLs (for data completion)"""
        return [s for s in self.schemes if not s.get('url')]

    def get_random_schemes(self, count=5):
        """Get random schemes (for featured/homepage display)"""
        import random
        if len(self.schemes) <= count:
            return self.schemes.copy()
        return random.sample(self.schemes, count)

    def get_unique_occupations(self):
        """Get all unique occupations mentioned in eligibility"""
        occupations = set()
        for scheme in self.schemes:
            occ_list = scheme.get('eligibility', {}).get('occupation', [])
            if occ_list:
                for occ in occ_list:
                    occupations.add(occ.lower())
        return sorted(occupations)

    def get_unique_social_categories(self):
        """Get all unique social categories mentioned"""
        categories = set()
        for scheme in self.schemes:
            cat_list = scheme.get('eligibility', {}).get('category', [])
            if cat_list:
                for cat in cat_list:
                    categories.add(cat.lower())
        return sorted(categories)

    def find_similar_schemes(self, scheme_id, limit=5):
        """Find schemes similar to a given scheme (same category + type)"""
        source = self.get_scheme_by_id(scheme_id)
        if not source:
            return []

        category = source.get('category', '')
        scheme_type = source.get('type', '')

        similar = []
        for s in self.schemes:
            if s['id'] == scheme_id:
                continue

            score = 0
            if s.get('category') == category:
                score += 2
            if s.get('type') == scheme_type:
                score += 1

            # Check eligibility overlap
            src_elig = source.get('eligibility', {})
            s_elig = s.get('eligibility', {})

            if src_elig.get('gender') == s_elig.get('gender'):
                score += 1
            if src_elig.get('states') == s_elig.get('states'):
                score += 1

            if score > 0:
                similar.append((s, score))

        similar.sort(key=lambda x: x[1], reverse=True)
        return [s[0] for s in similar[:limit]]

    def __len__(self):
        """Allow len(data_loader) to return scheme count"""
        return len(self.schemes)

    def __repr__(self):
        return (
            f"<DataLoader: {len(self.schemes)} schemes, "
            f"{len(self._index_by_category)} categories, "
            f"loaded={'Yes' if self._is_loaded else 'No'}>"
        )


# ──────────────────────────────────────────────
# STANDALONE TESTING
# ──────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 55)
    print("🧪 DataLoader Test Mode")
    print("=" * 55)

    loader = DataLoader()

    if not loader.is_loaded():
        print("❌ Failed to load data. Exiting.")
        exit(1)

    # Print summary
    print(f"\n{loader.get_summary()}")

    # Print statistics
    print("\n📊 Detailed Statistics:")
    stats = loader.get_statistics()
    print(f"   Categories: {stats['categories']}")
    print(f"   Types: {stats['types']}")
    print(f"   State coverage: {stats['state_coverage']}")
    print(f"   Eligibility stats: {stats['eligibility_stats']}")

    # Test search
    print("\n🔍 Search Tests:")
    test_queries = ['farmer', 'health', 'loan', 'women', 'pension']
    for query in test_queries:
        results = loader.search(query, limit=3)
        names = [r['name'] for r in results]
        print(f"   '{query}' → {len(results)} results: {names}")

    # Test filtering
    print("\n🔧 Filter Tests:")
    health_schemes = loader.filter_schemes(category='health')
    print(f"   Health schemes: {len(health_schemes)}")

    women_schemes = loader.filter_schemes(gender='female')
    print(f"   Women schemes: {len(women_schemes)}")

    # Test similar schemes
    if loader.schemes:
        first_id = loader.schemes[0]['id']
        similar = loader.find_similar_schemes(first_id, limit=3)
        print(f"\n🔗 Similar to '{first_id}': {[s['name'] for s in similar]}")

    # Validation report
    report = loader.get_validation_report()
    print(f"\n✅ Validation: {report.get('valid', 0)}/{report.get('total_schemes', 0)} valid")
    if report.get('errors'):
        print(f"   Errors: {len(report['errors'])}")
    if report.get('warnings'):
        print(f"   Warnings: {len(report['warnings'])}")

    # Test repr
    print(f"\n{repr(loader)}")
    print(f"len(loader) = {len(loader)}")

    print("\n✅ All tests complete!")
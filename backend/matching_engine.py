"""
Matching Engine v3.0 - Intelligent Scheme Matching Brain
========================================================
Features:
  - Multi-tier filtering (hard → soft → boost)
  - Configurable matching thresholds
  - Match explanation / reasoning for each scheme
  - Priority-based sorting (score + relevance tiers)
  - Batch matching for multiple users
  - Profile completeness scoring
  - Filter analytics (tracks why schemes are rejected)
  - Category-wise best matches
  - Comparison engine (compare 2+ schemes for a user)
  - Cached results with invalidation
  - Performance tracking
  - Debug mode with detailed logs
"""

import time
import logging
from copy import deepcopy
from collections import defaultdict

from scoring import ScoringEngine

logger = logging.getLogger('GovSchemeAI.MatchingEngine')


class MatchConfig:
    """Centralized configuration for matching behavior"""

    # Score thresholds
    MIN_MATCH_SCORE = 30            # Minimum score to be included
    STRONG_MATCH_THRESHOLD = 75     # Considered "strong match"
    PERFECT_MATCH_THRESHOLD = 90    # Considered "perfect match"

    # Result limits
    DEFAULT_MAX_RESULTS = 20
    ABSOLUTE_MAX_RESULTS = 100

    # Boost values (added to base score)
    BOOST_BPL = 5                   # BPL users get slight priority
    BOOST_DISABILITY = 5            # Disabled users get priority
    BOOST_SENIOR_CITIZEN = 3        # 60+ age
    BOOST_WOMEN = 2                 # Women-specific schemes
    BOOST_EXACT_OCCUPATION = 5      # Exact occupation match
    BOOST_EXACT_CATEGORY = 3       # Exact social category match

    # Penalty values (subtracted from base score)
    PENALTY_NO_URL = 2              # Scheme has no official link
    PENALTY_NO_DESCRIPTION = 3     # Scheme has no description

    # Profile completeness weights
    PROFILE_FIELDS = {
        'age': 15,
        'gender': 10,
        'state': 20,
        'category': 15,
        'annual_income': 15,
        'occupation': 10,
        'is_bpl': 5,
        'is_farmer': 5,
        'disability': 5
    }


class FilterReason:
    """Constants for filter rejection reasons"""
    STATE_MISMATCH = "state_mismatch"
    GENDER_MISMATCH = "gender_mismatch"
    AGE_TOO_YOUNG = "age_too_young"
    AGE_TOO_OLD = "age_too_old"
    INCOME_TOO_HIGH = "income_too_high"
    OCCUPATION_MISMATCH = "occupation_mismatch"
    CATEGORY_MISMATCH = "category_mismatch"
    BPL_REQUIRED = "bpl_required"
    LOW_SCORE = "low_score"


class MatchResult:
    """Structured result for a single scheme match"""

    def __init__(self, scheme, score, reasons=None, tier=None):
        self.scheme = scheme
        self.score = score
        self.reasons = reasons or []
        self.tier = tier or self._calculate_tier(score)

    def _calculate_tier(self, score):
        if score >= MatchConfig.PERFECT_MATCH_THRESHOLD:
            return "perfect"
        elif score >= MatchConfig.STRONG_MATCH_THRESHOLD:
            return "strong"
        elif score >= 50:
            return "moderate"
        else:
            return "partial"

    def to_dict(self):
        result = deepcopy(self.scheme)
        result['match_score'] = self.score
        result['match_tier'] = self.tier
        result['match_reasons'] = self.reasons
        return result


class MatchingEngine:
    """
    Enhanced Matching Engine with multi-tier filtering,
    explanations, analytics, and performance tracking
    """

    def __init__(self, schemes, config=None):
        """
        Initialize Matching Engine

        Args:
            schemes: list of scheme dicts
            config: optional MatchConfig override
        """
        self.schemes = schemes
        self.config = config or MatchConfig()
        self.scorer = ScoringEngine()

        # Analytics
        self._filter_stats = defaultdict(int)
        self._match_history = []
        self._total_matches_run = 0
        self._total_time_ms = 0

        # Cache
        self._cache = {}
        self._cache_hits = 0
        self._cache_misses = 0

        logger.info(f"✅ MatchingEngine initialized with {len(schemes)} schemes")

    # ──────────────────────────────────────────────
    # ⭐ CORE MATCHING
    # ──────────────────────────────────────────────

    def find_matches(self, user_profile, max_results=None, min_score=None,
                     include_reasons=False, category_filter=None,
                     type_filter=None, debug=False):
        """
        Main matching function: user profile → ranked scheme list

        Args:
            user_profile: dict with user details
            max_results: limit results (default: 20)
            min_score: minimum match score (default: 30)
            include_reasons: add human-readable match reasons
            category_filter: only match schemes in this category
            type_filter: only match 'central' or 'state' schemes
            debug: print detailed matching logs

        Returns:
            List of scheme dicts with match_score, match_tier, match_reasons
        """
        start_time = time.time()
        self._total_matches_run += 1

        max_results = min(
            max_results or self.config.DEFAULT_MAX_RESULTS,
            self.config.ABSOLUTE_MAX_RESULTS
        )
        min_score = min_score or self.config.MIN_MATCH_SCORE

        # Check cache
        cache_key = self._build_cache_key(user_profile, category_filter, type_filter)
        cached = self._cache.get(cache_key)
        if cached and not debug:
            self._cache_hits += 1
            if debug:
                print(f"   💾 Cache hit for profile")
            return cached[:max_results]
        self._cache_misses += 1

        # Pre-filter schemes by category/type if specified
        candidate_schemes = self._pre_filter(category_filter, type_filter)

        if debug:
            print(f"\n{'=' * 55}")
            print(f"🔍 Matching engine started")
            print(f"   Candidates: {len(candidate_schemes)} schemes")
            print(f"   Min score: {min_score}")
            print(f"   Profile: {self._summarize_profile(user_profile)}")
            print(f"{'=' * 55}")

        # Profile completeness check
        completeness = self._calculate_profile_completeness(user_profile)
        if debug:
            print(f"   📊 Profile completeness: {completeness}%")

        matched = []
        rejected = defaultdict(list)

        for scheme in candidate_schemes:
            scheme_id = scheme.get('id', 'unknown')
            scheme_name = scheme.get('name', 'Unknown')
            eligibility = scheme.get('eligibility', {})

            # TIER 1: Hard filters (instant reject)
            passed, rejection_reason = self._pass_hard_filters(user_profile, eligibility)
            if not passed:
                rejected[rejection_reason].append(scheme_name)
                self._filter_stats[rejection_reason] += 1
                if debug:
                    print(f"   ❌ {scheme_name}: REJECTED ({rejection_reason})")
                continue

            # TIER 2: Soft scoring
            base_score = self.scorer.calculate_score(user_profile, eligibility)

            # TIER 3: Boost/penalty adjustments
            adjusted_score, adjustments = self._apply_adjustments(
                base_score, user_profile, scheme, eligibility
            )

            # Final score cap
            final_score = max(0, min(adjusted_score, 100))

            if final_score < min_score:
                rejected[FilterReason.LOW_SCORE].append(scheme_name)
                self._filter_stats[FilterReason.LOW_SCORE] += 1
                if debug:
                    print(f"   ⚠️ {scheme_name}: LOW SCORE ({final_score} < {min_score})")
                continue

            # Build match reasons
            reasons = []
            if include_reasons:
                reasons = self._build_match_reasons(
                    user_profile, eligibility, final_score, adjustments
                )

            # Create result
            result = MatchResult(scheme, final_score, reasons)
            matched.append(result)

            if debug:
                print(
                    f"   ✅ {scheme_name}: {final_score}% "
                    f"(base:{base_score} adj:{adjusted_score}) [{result.tier}]"
                )

        # Sort by score (primary) and tier (secondary)
        tier_order = {"perfect": 0, "strong": 1, "moderate": 2, "partial": 3}
        matched.sort(key=lambda r: (-r.score, tier_order.get(r.tier, 4)))

        # Convert to dicts
        result_dicts = [r.to_dict() for r in matched[:max_results]]

        # Track performance
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        self._total_time_ms += elapsed_ms

        # Cache results
        self._cache[cache_key] = result_dicts

        # Track match history
        self._match_history.append({
            'profile_summary': self._summarize_profile(user_profile),
            'total_candidates': len(candidate_schemes),
            'matched': len(result_dicts),
            'rejected': sum(len(v) for v in rejected.values()),
            'top_score': result_dicts[0]['match_score'] if result_dicts else 0,
            'elapsed_ms': elapsed_ms,
            'completeness': completeness
        })
        if len(self._match_history) > 100:
            self._match_history = self._match_history[-100:]

        if debug:
            print(f"\n   📊 Results: {len(result_dicts)} matches in {elapsed_ms}ms")
            print(f"   📊 Rejected: {dict(rejected)}")
            print(f"{'=' * 55}\n")

        logger.info(
            f"Matched {len(result_dicts)}/{len(candidate_schemes)} schemes "
            f"in {elapsed_ms}ms (top: {result_dicts[0]['match_score'] if result_dicts else 0}%)"
        )

        return result_dicts

    # ──────────────────────────────────────────────
    # FILTERING TIERS
    # ──────────────────────────────────────────────

    def _pre_filter(self, category_filter=None, type_filter=None):
        """Pre-filter schemes by category and type before scoring"""
        schemes = self.schemes

        if category_filter:
            schemes = [
                s for s in schemes
                if s.get('category', '').lower() == category_filter.lower()
            ]

        if type_filter:
            schemes = [
                s for s in schemes
                if s.get('type', '').lower() == type_filter.lower()
            ]

        return schemes

    def _pass_hard_filters(self, user, eligibility):
        """
        Hard filters - scheme REJECTED if these fail
        Returns: (passed: bool, reason: str or None)
        """

        # STATE CHECK
        states = eligibility.get('states', 'all')
        if states != 'all':
            user_state = user.get('state', '')
            if isinstance(states, list) and user_state not in states:
                return False, FilterReason.STATE_MISMATCH
            elif isinstance(states, str) and states != 'all' and user_state != states:
                return False, FilterReason.STATE_MISMATCH

        # GENDER CHECK
        gender_req = eligibility.get('gender', 'all')
        if gender_req != 'all':
            user_gender = user.get('gender', '').lower()
            if user_gender and user_gender != gender_req.lower():
                return False, FilterReason.GENDER_MISMATCH

        # AGE CHECK
        user_age = self._safe_int(user.get('age', 0))
        min_age = eligibility.get('min_age')
        max_age = eligibility.get('max_age')

        if min_age is not None and user_age < int(min_age):
            return False, FilterReason.AGE_TOO_YOUNG
        if max_age is not None and user_age > int(max_age):
            return False, FilterReason.AGE_TOO_OLD

        # INCOME CHECK (can be hard filter for strict schemes)
        max_income = eligibility.get('max_income')
        if max_income is not None:
            user_income = self._safe_int(user.get('annual_income', 0))
            if user_income > 0 and user_income > int(max_income):
                return False, FilterReason.INCOME_TOO_HIGH

        # BPL STRICT CHECK
        if eligibility.get('is_bpl') is True:
            user_bpl = user.get('is_bpl', False)
            if isinstance(user_bpl, str):
                user_bpl = user_bpl.lower() == 'true'
            if not user_bpl:
                return False, FilterReason.BPL_REQUIRED

        return True, None

    def _apply_adjustments(self, base_score, user, scheme, eligibility):
        """
        Apply boost/penalty adjustments to base score
        Returns: (adjusted_score, list of adjustment descriptions)
        """
        adjustments = []
        adjusted = base_score

        # ── BOOSTS ──

        # BPL boost
        user_bpl = user.get('is_bpl', False)
        if isinstance(user_bpl, str):
            user_bpl = user_bpl.lower() == 'true'
        if user_bpl and eligibility.get('is_bpl') is True:
            adjusted += self.config.BOOST_BPL
            adjustments.append(f"+{self.config.BOOST_BPL} BPL priority")

        # Disability boost
        user_disability = user.get('disability', False)
        if isinstance(user_disability, str):
            user_disability = user_disability.lower() == 'true'
        if user_disability:
            adjusted += self.config.BOOST_DISABILITY
            adjustments.append(f"+{self.config.BOOST_DISABILITY} disability priority")

        # Senior citizen boost
        user_age = self._safe_int(user.get('age', 0))
        if user_age >= 60:
            adjusted += self.config.BOOST_SENIOR_CITIZEN
            adjustments.append(f"+{self.config.BOOST_SENIOR_CITIZEN} senior citizen")

        # Women-specific scheme boost
        if eligibility.get('gender') == 'female' and user.get('gender', '').lower() == 'female':
            adjusted += self.config.BOOST_WOMEN
            adjustments.append(f"+{self.config.BOOST_WOMEN} women-specific scheme")

        # Exact occupation match boost
        elig_occupations = eligibility.get('occupation', [])
        user_occupation = user.get('occupation', '').lower()
        if elig_occupations and user_occupation:
            if user_occupation in [o.lower() for o in elig_occupations]:
                adjusted += self.config.BOOST_EXACT_OCCUPATION
                adjustments.append(f"+{self.config.BOOST_EXACT_OCCUPATION} exact occupation match")

        # Exact category match boost
        elig_categories = eligibility.get('category', [])
        user_category = user.get('category', '').lower()
        if elig_categories and user_category:
            if user_category in [c.lower() for c in elig_categories]:
                adjusted += self.config.BOOST_EXACT_CATEGORY
                adjustments.append(f"+{self.config.BOOST_EXACT_CATEGORY} exact category match")

        # ── PENALTIES ──

        # No URL penalty
        if not scheme.get('url'):
            adjusted -= self.config.PENALTY_NO_URL
            adjustments.append(f"-{self.config.PENALTY_NO_URL} no official URL")

        # No description penalty
        if not scheme.get('description'):
            adjusted -= self.config.PENALTY_NO_DESCRIPTION
            adjustments.append(f"-{self.config.PENALTY_NO_DESCRIPTION} no description")

        return adjusted, adjustments

    # ──────────────────────────────────────────────
    # MATCH EXPLANATIONS
    # ──────────────────────────────────────────────

    def _build_match_reasons(self, user, eligibility, score, adjustments):
        """Build human-readable reasons why this scheme matched"""
        reasons = []

        # State match
        states = eligibility.get('states', 'all')
        user_state = user.get('state', '')
        if states == 'all':
            reasons.append("✅ Available in all Indian states")
        elif user_state in (states if isinstance(states, list) else [states]):
            reasons.append(f"✅ Available in {user_state}")

        # Age match
        min_age = eligibility.get('min_age')
        max_age = eligibility.get('max_age')
        user_age = self._safe_int(user.get('age', 0))
        if min_age or max_age:
            age_range = f"{min_age or 'any'}-{max_age or 'any'}"
            reasons.append(f"✅ Your age ({user_age}) fits the range ({age_range})")

        # Gender match
        gender_req = eligibility.get('gender', 'all')
        if gender_req == 'all':
            reasons.append("✅ Open to all genders")
        else:
            reasons.append(f"✅ Designed for {gender_req}")

        # Income match
        max_income = eligibility.get('max_income')
        if max_income:
            user_income = self._safe_int(user.get('annual_income', 0))
            if user_income <= max_income:
                reasons.append(f"✅ Income ₹{user_income:,} within limit ₹{max_income:,}")

        # Category match
        elig_categories = eligibility.get('category', [])
        if elig_categories:
            user_cat = user.get('category', '').upper()
            if user_cat.lower() in [c.lower() for c in elig_categories]:
                reasons.append(f"✅ {user_cat} category is eligible")

        # Occupation match
        elig_occupations = eligibility.get('occupation', [])
        if elig_occupations:
            user_occ = user.get('occupation', '').title()
            if user_occ.lower() in [o.lower() for o in elig_occupations]:
                reasons.append(f"✅ Occupation '{user_occ}' matches")

        # Special flags
        if eligibility.get('is_bpl') is True:
            user_bpl = user.get('is_bpl', False)
            if isinstance(user_bpl, str):
                user_bpl = user_bpl.lower() == 'true'
            if user_bpl:
                reasons.append("✅ BPL status qualifies you")

        # Add adjustments
        for adj in adjustments:
            reasons.append(f"⚡ {adj}")

        # Score tier
        if score >= self.config.PERFECT_MATCH_THRESHOLD:
            reasons.append(f"🌟 Perfect match ({score}%)")
        elif score >= self.config.STRONG_MATCH_THRESHOLD:
            reasons.append(f"💪 Strong match ({score}%)")
        elif score >= 50:
            reasons.append(f"👍 Moderate match ({score}%)")
        else:
            reasons.append(f"📋 Partial match ({score}%)")

        return reasons

    # ──────────────────────────────────────────────
    # PROFILE ANALYSIS
    # ──────────────────────────────────────────────

    def _calculate_profile_completeness(self, user_profile):
        """
        Calculate how complete the user profile is (0-100%)
        More complete profiles give more accurate results
        """
        total_weight = sum(self.config.PROFILE_FIELDS.values())
        achieved_weight = 0

        for field, weight in self.config.PROFILE_FIELDS.items():
            value = user_profile.get(field)

            if value is None or value == '' or value == 0:
                continue

            if isinstance(value, str) and not value.strip():
                continue

            achieved_weight += weight

        return round((achieved_weight / total_weight) * 100)

    def get_profile_completeness(self, user_profile):
        """
        Public method: get profile completeness with missing field suggestions

        Returns:
            {
                "completeness": 65,
                "filled_fields": [...],
                "missing_fields": [...],
                "suggestions": [...]
            }
        """
        completeness = self._calculate_profile_completeness(user_profile)
        filled = []
        missing = []
        suggestions = []

        field_descriptions = {
            'age': 'Your age',
            'gender': 'Your gender (male/female)',
            'state': 'Your state of residence',
            'category': 'Social category (SC/ST/OBC/General)',
            'annual_income': 'Annual family income',
            'occupation': 'Your occupation',
            'is_bpl': 'BPL card status',
            'is_farmer': 'Whether you are a farmer',
            'disability': 'Disability status'
        }

        suggestion_map = {
            'state': 'Adding your state will filter location-specific schemes',
            'annual_income': 'Income helps match income-limited schemes like Ayushman Bharat',
            'category': 'Social category unlocks SC/ST/OBC specific scholarships and schemes',
            'occupation': 'Your occupation helps find profession-specific benefits',
            'is_bpl': 'BPL status qualifies you for many welfare schemes',
            'disability': 'Disability status unlocks special assistance schemes'
        }

        for field, weight in self.config.PROFILE_FIELDS.items():
            value = user_profile.get(field)
            has_value = value is not None and value != '' and value != 0

            if has_value:
                filled.append({
                    "field": field,
                    "description": field_descriptions.get(field, field),
                    "weight": weight
                })
            else:
                missing.append({
                    "field": field,
                    "description": field_descriptions.get(field, field),
                    "weight": weight
                })
                if field in suggestion_map:
                    suggestions.append(suggestion_map[field])

        # Sort missing by weight (most impactful first)
        missing.sort(key=lambda x: x['weight'], reverse=True)

        return {
            "completeness": completeness,
            "filled_fields": filled,
            "missing_fields": missing,
            "suggestions": suggestions[:5],
            "accuracy_note": self._accuracy_note(completeness)
        }

    def _accuracy_note(self, completeness):
        """Generate accuracy note based on completeness"""
        if completeness >= 80:
            return "🎯 Excellent! Your profile is detailed enough for highly accurate results."
        elif completeness >= 60:
            return "👍 Good profile. Adding more details will improve accuracy."
        elif completeness >= 40:
            return "⚠️ Partial profile. Results may miss some relevant schemes."
        else:
            return "❌ Very incomplete profile. Please add more details for meaningful results."

    # ──────────────────────────────────────────────
    # ADVANCED MATCHING FEATURES
    # ──────────────────────────────────────────────

    def find_best_by_category(self, user_profile, max_per_category=3):
        """
        Get best matches organized by category

        Returns:
            {
                "health": [top 3 health schemes],
                "education": [top 3 education schemes],
                ...
            }
        """
        all_matches = self.find_matches(
            user_profile,
            max_results=self.config.ABSOLUTE_MAX_RESULTS,
            min_score=self.config.MIN_MATCH_SCORE
        )

        by_category = defaultdict(list)
        for scheme in all_matches:
            cat = scheme.get('category', 'other')
            if len(by_category[cat]) < max_per_category:
                by_category[cat].append(scheme)

        # Sort categories by best score in each
        sorted_categories = {}
        for cat in sorted(
            by_category.keys(),
            key=lambda c: by_category[c][0]['match_score'] if by_category[c] else 0,
            reverse=True
        ):
            sorted_categories[cat] = by_category[cat]

        return sorted_categories

    def compare_schemes(self, user_profile, scheme_ids):
        """
        Compare specific schemes against a user profile

        Args:
            user_profile: user dict
            scheme_ids: list of scheme IDs to compare

        Returns:
            List of schemes with scores, reasons, and comparison data
        """
        results = []

        for scheme_id in scheme_ids:
            scheme = self._find_scheme(scheme_id)
            if not scheme:
                results.append({
                    "scheme_id": scheme_id,
                    "found": False,
                    "error": "Scheme not found"
                })
                continue

            eligibility = scheme.get('eligibility', {})
            passed, rejection_reason = self._pass_hard_filters(user_profile, eligibility)

            if not passed:
                result = deepcopy(scheme)
                result['match_score'] = 0
                result['eligible'] = False
                result['rejection_reason'] = rejection_reason
                result['match_reasons'] = [f"❌ Not eligible: {rejection_reason}"]
                results.append(result)
                continue

            base_score = self.scorer.calculate_score(user_profile, eligibility)
            adjusted_score, adjustments = self._apply_adjustments(
                base_score, user_profile, scheme, eligibility
            )
            final_score = max(0, min(adjusted_score, 100))

            reasons = self._build_match_reasons(
                user_profile, eligibility, final_score, adjustments
            )

            result = deepcopy(scheme)
            result['match_score'] = final_score
            result['eligible'] = True
            result['match_tier'] = MatchResult(scheme, final_score).tier
            result['match_reasons'] = reasons
            result['score_breakdown'] = {
                'base_score': base_score,
                'adjustments': adjustments,
                'final_score': final_score
            }
            results.append(result)

        # Sort by score
        results.sort(
            key=lambda x: x.get('match_score', 0),
            reverse=True
        )

        return results

    def check_eligibility(self, user_profile, scheme_id):
        """
        Detailed eligibility check for a single scheme

        Returns:
            {
                "eligible": True/False,
                "score": 85,
                "checks": [
                    {"field": "age", "status": "pass", "detail": "..."},
                    {"field": "state", "status": "fail", "detail": "..."},
                    ...
                ],
                "recommendation": "..."
            }
        """
        scheme = self._find_scheme(scheme_id)
        if not scheme:
            return {"error": "Scheme not found", "eligible": False}

        eligibility = scheme.get('eligibility', {})
        checks = []

        # AGE CHECK
        user_age = self._safe_int(user_profile.get('age', 0))
        min_age = eligibility.get('min_age')
        max_age = eligibility.get('max_age')

        if min_age is not None or max_age is not None:
            age_range = f"{min_age or 'any'} to {max_age or 'any'}"
            if min_age is not None and user_age < min_age:
                checks.append({
                    "field": "age",
                    "status": "fail",
                    "detail": f"Your age ({user_age}) is below minimum ({min_age})",
                    "required": age_range
                })
            elif max_age is not None and user_age > max_age:
                checks.append({
                    "field": "age",
                    "status": "fail",
                    "detail": f"Your age ({user_age}) exceeds maximum ({max_age})",
                    "required": age_range
                })
            else:
                checks.append({
                    "field": "age",
                    "status": "pass",
                    "detail": f"Age {user_age} is within range ({age_range})",
                    "required": age_range
                })
        else:
            checks.append({
                "field": "age",
                "status": "pass",
                "detail": "No age restriction",
                "required": "any"
            })

        # GENDER CHECK
        gender_req = eligibility.get('gender', 'all')
        user_gender = user_profile.get('gender', '').lower()
        if gender_req == 'all':
            checks.append({
                "field": "gender",
                "status": "pass",
                "detail": "Open to all genders",
                "required": "all"
            })
        elif user_gender == gender_req.lower():
            checks.append({
                "field": "gender",
                "status": "pass",
                "detail": f"Gender '{user_gender}' matches requirement",
                "required": gender_req
            })
        else:
            checks.append({
                "field": "gender",
                "status": "fail",
                "detail": f"Requires {gender_req}, you are {user_gender or 'unspecified'}",
                "required": gender_req
            })

        # STATE CHECK
        states = eligibility.get('states', 'all')
        user_state = user_profile.get('state', '')
        if states == 'all':
            checks.append({
                "field": "state",
                "status": "pass",
                "detail": "Available in all states",
                "required": "all"
            })
        elif user_state in (states if isinstance(states, list) else [states]):
            checks.append({
                "field": "state",
                "status": "pass",
                "detail": f"{user_state} is in eligible states",
                "required": states
            })
        else:
            checks.append({
                "field": "state",
                "status": "fail",
                "detail": f"{user_state or 'Unspecified'} is not in eligible states",
                "required": states
            })

        # INCOME CHECK
        max_income = eligibility.get('max_income')
        user_income = self._safe_int(user_profile.get('annual_income', 0))
        if max_income is not None:
            if user_income <= max_income:
                checks.append({
                    "field": "income",
                    "status": "pass",
                    "detail": f"Income ₹{user_income:,} within limit ₹{max_income:,}",
                    "required": f"≤ ₹{max_income:,}"
                })
            else:
                checks.append({
                    "field": "income",
                    "status": "fail",
                    "detail": f"Income ₹{user_income:,} exceeds limit ₹{max_income:,}",
                    "required": f"≤ ₹{max_income:,}"
                })
        else:
            checks.append({
                "field": "income",
                "status": "pass",
                "detail": "No income restriction",
                "required": "any"
            })

        # CATEGORY CHECK
        elig_categories = eligibility.get('category', [])
        user_cat = user_profile.get('category', '').lower()
        if elig_categories:
            if user_cat in [c.lower() for c in elig_categories]:
                checks.append({
                    "field": "social_category",
                    "status": "pass",
                    "detail": f"{user_cat.upper()} is eligible",
                    "required": [c.upper() for c in elig_categories]
                })
            else:
                checks.append({
                    "field": "social_category",
                    "status": "fail",
                    "detail": f"{user_cat.upper() or 'Unspecified'} not in eligible list",
                    "required": [c.upper() for c in elig_categories]
                })
        else:
            checks.append({
                "field": "social_category",
                "status": "pass",
                "detail": "Open to all categories",
                "required": "all"
            })

        # OCCUPATION CHECK
        elig_occupations = eligibility.get('occupation', [])
        user_occ = user_profile.get('occupation', '').lower()
        if elig_occupations:
            if user_occ in [o.lower() for o in elig_occupations]:
                checks.append({
                    "field": "occupation",
                    "status": "pass",
                    "detail": f"Occupation '{user_occ}' is eligible",
                    "required": elig_occupations
                })
            else:
                checks.append({
                    "field": "occupation",
                    "status": "fail",
                    "detail": f"Occupation '{user_occ or 'unspecified'}' not in eligible list",
                    "required": elig_occupations
                })

        # BPL CHECK
        if eligibility.get('is_bpl') is not None:
            user_bpl = user_profile.get('is_bpl', False)
            if isinstance(user_bpl, str):
                user_bpl = user_bpl.lower() == 'true'
            required_bpl = eligibility['is_bpl']

            if user_bpl == required_bpl:
                checks.append({
                    "field": "bpl_status",
                    "status": "pass",
                    "detail": f"BPL status matches (required: {required_bpl})",
                    "required": required_bpl
                })
            else:
                checks.append({
                    "field": "bpl_status",
                    "status": "fail",
                    "detail": f"BPL status mismatch (you: {user_bpl}, required: {required_bpl})",
                    "required": required_bpl
                })

        # Calculate overall
        passed_checks = [c for c in checks if c['status'] == 'pass']
        failed_checks = [c for c in checks if c['status'] == 'fail']
        is_eligible = len(failed_checks) == 0

        # Score
        score = 0
        if is_eligible:
            score = self.scorer.calculate_score(user_profile, eligibility)
            adj_score, _ = self._apply_adjustments(
                score, user_profile, scheme, eligibility
            )
            score = max(0, min(adj_score, 100))

        # Recommendation
        if is_eligible and score >= 75:
            recommendation = "🌟 Highly recommended! You meet all eligibility criteria."
        elif is_eligible:
            recommendation = "✅ You are eligible. Consider applying for this scheme."
        elif len(failed_checks) == 1:
            failed_field = failed_checks[0]['field']
            recommendation = f"⚠️ Almost eligible! Only '{failed_field}' doesn't match."
        else:
            recommendation = f"❌ Not eligible. {len(failed_checks)} criteria don't match."

        return {
            "scheme_id": scheme_id,
            "scheme_name": scheme.get('name', ''),
            "eligible": is_eligible,
            "match_score": score,
            "total_checks": len(checks),
            "passed": len(passed_checks),
            "failed": len(failed_checks),
            "checks": checks,
            "recommendation": recommendation
        }

    def find_near_misses(self, user_profile, max_results=5):
        """
        Find schemes the user ALMOST qualifies for
        (failed only 1 hard filter)
        Useful for showing "you're close to qualifying" suggestions
        """
        near_misses = []

        for scheme in self.schemes:
            eligibility = scheme.get('eligibility', {})
            passed, reason = self._pass_hard_filters(user_profile, eligibility)

            if passed:
                continue  # Already eligible, not a near miss

            # Check how many filters failed
            failures = 0
            failure_reasons = []

            # Re-check each filter individually
            states = eligibility.get('states', 'all')
            if states != 'all':
                if user_profile.get('state', '') not in (
                    states if isinstance(states, list) else [states]
                ):
                    failures += 1
                    failure_reasons.append(f"State: need {states}")

            gender_req = eligibility.get('gender', 'all')
            if gender_req != 'all':
                if user_profile.get('gender', '').lower() != gender_req.lower():
                    failures += 1
                    failure_reasons.append(f"Gender: need {gender_req}")

            user_age = self._safe_int(user_profile.get('age', 0))
            min_age = eligibility.get('min_age')
            max_age = eligibility.get('max_age')
            if min_age and user_age < min_age:
                failures += 1
                failure_reasons.append(f"Age: need ≥{min_age} (you: {user_age})")
            if max_age and user_age > max_age:
                failures += 1
                failure_reasons.append(f"Age: need ≤{max_age} (you: {user_age})")

            max_income = eligibility.get('max_income')
            if max_income:
                user_income = self._safe_int(user_profile.get('annual_income', 0))
                if user_income > max_income:
                    failures += 1
                    failure_reasons.append(
                        f"Income: need ≤₹{max_income:,} (you: ₹{user_income:,})"
                    )

            # Only 1 failure = near miss
            if failures == 1:
                scheme_copy = deepcopy(scheme)
                scheme_copy['near_miss'] = True
                scheme_copy['failure_reasons'] = failure_reasons
                scheme_copy['failures_count'] = failures
                near_misses.append(scheme_copy)

        return near_misses[:max_results]

    # ──────────────────────────────────────────────
    # BATCH OPERATIONS
    # ──────────────────────────────────────────────

    def batch_match(self, user_profiles, max_results_each=10):
        """
        Match multiple user profiles at once

        Args:
            user_profiles: list of user profile dicts
            max_results_each: max results per user

        Returns:
            List of result sets, one per user
        """
        all_results = []
        start_time = time.time()

        for i, profile in enumerate(user_profiles):
            results = self.find_matches(
                profile,
                max_results=max_results_each,
                include_reasons=False
            )
            all_results.append({
                "profile_index": i,
                "profile_summary": self._summarize_profile(profile),
                "total_matches": len(results),
                "schemes": results
            })

        elapsed = round((time.time() - start_time) * 1000, 2)
        logger.info(
            f"Batch matched {len(user_profiles)} profiles in {elapsed}ms"
        )

        return all_results

    # ──────────────────────────────────────────────
    # SCHEME LOOKUP
    # ──────────────────────────────────────────────

    def get_scheme_detail(self, scheme_id):
        """Get full details of a specific scheme"""
        return self._find_scheme(scheme_id)

    def _find_scheme(self, scheme_id):
        """Internal scheme lookup"""
        for scheme in self.schemes:
            if scheme.get('id') == scheme_id:
                return scheme
        return None

    def update_schemes(self, new_schemes):
        """Update scheme list and clear cache"""
        self.schemes = new_schemes
        self.clear_cache()
        logger.info(f"🔄 Updated to {len(new_schemes)} schemes, cache cleared")

    # ──────────────────────────────────────────────
    # CACHE MANAGEMENT
    # ──────────────────────────────────────────────

    def _build_cache_key(self, profile, category=None, type_filter=None):
        """Build deterministic cache key from profile"""
        key_parts = []
        for field in sorted(self.config.PROFILE_FIELDS.keys()):
            val = profile.get(field, '')
            key_parts.append(f"{field}={val}")
        if category:
            key_parts.append(f"cat={category}")
        if type_filter:
            key_parts.append(f"type={type_filter}")
        return "|".join(key_parts)

    def clear_cache(self):
        """Clear the results cache"""
        self._cache.clear()
        logger.info("💾 Matching cache cleared")

    def get_cache_stats(self):
        """Get cache performance stats"""
        total = self._cache_hits + self._cache_misses
        hit_rate = round(
            (self._cache_hits / total * 100), 1
        ) if total > 0 else 0

        return {
            "cached_profiles": len(self._cache),
            "cache_hits": self._cache_hits,
            "cache_misses": self._cache_misses,
            "hit_rate": f"{hit_rate}%"
        }

    # ──────────────────────────────────────────────
    # ANALYTICS
    # ──────────────────────────────────────────────

    def get_filter_stats(self):
        """Get statistics on why schemes are rejected"""
        total_rejections = sum(self._filter_stats.values())
        stats = {
            "total_rejections": total_rejections,
            "by_reason": dict(self._filter_stats)
        }

        if total_rejections > 0:
            stats["percentages"] = {
                reason: f"{(count / total_rejections * 100):.1f}%"
                for reason, count in self._filter_stats.items()
            }

        return stats

    def get_performance_stats(self):
        """Get matching performance statistics"""
        avg_time = round(
            self._total_time_ms / self._total_matches_run, 2
        ) if self._total_matches_run > 0 else 0

        return {
            "total_matches_run": self._total_matches_run,
            "total_time_ms": round(self._total_time_ms, 2),
            "average_time_ms": avg_time,
            "cache": self.get_cache_stats(),
            "filter_stats": self.get_filter_stats(),
            "recent_matches": self._match_history[-5:] if self._match_history else []
        }

    # ──────────────────────────────────────────────
    # HELPERS
    # ──────────────────────────────────────────────

    @staticmethod
    def _safe_int(value, default=0):
        """Safely convert value to int"""
        if value is None:
            return default
        try:
            return int(value)
        except (ValueError, TypeError):
            return default

    @staticmethod
    def _summarize_profile(profile):
        """Create a short summary string of user profile"""
        parts = []
        if profile.get('age'):
            parts.append(f"age:{profile['age']}")
        if profile.get('gender'):
            parts.append(f"gender:{profile['gender']}")
        if profile.get('state'):
            parts.append(f"state:{profile['state']}")
        if profile.get('category'):
            parts.append(f"cat:{profile['category']}")
        if profile.get('occupation'):
            parts.append(f"occ:{profile['occupation']}")
        return ", ".join(parts) if parts else "empty profile"

    def __repr__(self):
        return (
            f"<MatchingEngine: {len(self.schemes)} schemes, "
            f"{self._total_matches_run} matches run, "
            f"cache:{len(self._cache)} entries>"
        )


# ──────────────────────────────────────────────
# STANDALONE TESTING
# ──────────────────────────────────────────────

if __name__ == '__main__':
    import json

    print("=" * 55)
    print("🧪 Matching Engine Test Mode")
    print("=" * 55)

    # Load schemes
    schemes_path = os.path.join(os.path.dirname(__file__), 'schemes.json') \
        if '__file__' in dir() else 'schemes.json'

    import os
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'schemes.json')

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            schemes = data.get('schemes', [])
    except Exception as e:
        print(f"❌ Could not load schemes: {e}")
        exit(1)

    engine = MatchingEngine(schemes)

    # Test profiles
    test_profiles = [
        {
            "name": "Young Farmer from Bihar",
            "profile": {
                "age": 28, "gender": "male", "state": "Bihar",
                "category": "obc", "annual_income": 120000,
                "occupation": "farmer", "is_bpl": True, "is_farmer": True
            }
        },
        {
            "name": "Female Student from Tamil Nadu",
            "profile": {
                "age": 20, "gender": "female", "state": "Tamil Nadu",
                "category": "sc", "annual_income": 200000,
                "occupation": "student", "is_student": True
            }
        },
        {
            "name": "Senior Citizen from Delhi",
            "profile": {
                "age": 65, "gender": "male", "state": "Delhi",
                "category": "general", "annual_income": 300000
            }
        }
    ]

    for test in test_profiles:
        print(f"\n{'─' * 55}")
        print(f"👤 {test['name']}")
        print(f"{'─' * 55}")

        results = engine.find_matches(
            test['profile'],
            include_reasons=True,
            debug=True
        )

        print(f"\n📋 Top {min(3, len(results))} matches:")
        for i, scheme in enumerate(results[:3], 1):
            print(f"   {i}. {scheme['name']} ({scheme['match_score']}% - {scheme['match_tier']})")
            for reason in scheme.get('match_reasons', [])[:3]:
                print(f"      {reason}")

        # Profile completeness
        completeness = engine.get_profile_completeness(test['profile'])
        print(f"\n   📊 Profile: {completeness['completeness']}%")
        print(f"   {completeness['accuracy_note']}")

        # Near misses
        near_misses = engine.find_near_misses(test['profile'], max_results=2)
        if near_misses:
            print(f"\n   ⚠️ Near misses:")
            for nm in near_misses:
                print(f"      {nm['name']}: {nm['failure_reasons']}")

    # Performance stats
    print(f"\n{'═' * 55}")
    print("📈 Performance Stats:")
    perf = engine.get_performance_stats()
    print(f"   Matches run: {perf['total_matches_run']}")
    print(f"   Total time: {perf['total_time_ms']}ms")
    print(f"   Average time: {perf['average_time_ms']}ms")
    print(f"   Cache: {perf['cache']}")
    print(f"   Filter stats: {perf['filter_stats']}")
    print(f"\n{repr(engine)}")
    print("\n✅ All tests complete!")
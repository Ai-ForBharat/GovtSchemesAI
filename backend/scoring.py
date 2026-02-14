"""
Scoring Engine v3.0 - Intelligent Relevance Calculator
=======================================================
Features:
  - Weighted scoring with configurable weights
  - Gradient scoring (partial credit, not just pass/fail)
  - Per-field score breakdown with explanations
  - Multiple scoring strategies (strict, lenient, balanced)
  - Confidence level calculation
  - Score normalization and capping
  - Detailed audit trail for every score
  - Bonus/penalty system for edge cases
  - Bulk scoring with statistics
  - Score comparison between schemes
  - Custom weight profiles for different use cases
  - Full type safety with input sanitization
  - Performance tracking
"""

import time
import logging
from copy import deepcopy
from collections import defaultdict

logger = logging.getLogger('GovSchemeAI.ScoringEngine')


class WeightProfile:
    """
    Predefined weight configurations for different scoring strategies.
    Each profile changes how much each criterion matters.
    """

    BALANCED = {
        'age': 15,
        'gender': 15,
        'state': 20,
        'category': 15,
        'income': 15,
        'occupation': 10,
        'special': 10
    }

    LOCATION_PRIORITY = {
        'age': 10,
        'gender': 10,
        'state': 30,
        'category': 15,
        'income': 15,
        'occupation': 10,
        'special': 10
    }

    ECONOMIC_PRIORITY = {
        'age': 10,
        'gender': 10,
        'state': 15,
        'category': 15,
        'income': 25,
        'occupation': 10,
        'special': 15
    }

    DEMOGRAPHIC_PRIORITY = {
        'age': 20,
        'gender': 20,
        'state': 15,
        'category': 20,
        'income': 10,
        'occupation': 5,
        'special': 10
    }

    OCCUPATION_PRIORITY = {
        'age': 10,
        'gender': 10,
        'state': 15,
        'category': 10,
        'income': 15,
        'occupation': 25,
        'special': 15
    }

    @classmethod
    def get_profile(cls, name):
        """Get weight profile by name"""
        profiles = {
            'balanced': cls.BALANCED,
            'location': cls.LOCATION_PRIORITY,
            'economic': cls.ECONOMIC_PRIORITY,
            'demographic': cls.DEMOGRAPHIC_PRIORITY,
            'occupation': cls.OCCUPATION_PRIORITY
        }
        return profiles.get(name.lower(), cls.BALANCED)

    @classmethod
    def list_profiles(cls):
        """List all available weight profiles"""
        return ['balanced', 'location', 'economic', 'demographic', 'occupation']


class ScoreBreakdown:
    """Structured breakdown of a scoring result"""

    def __init__(self):
        self.field_scores = {}
        self.total_earned = 0
        self.total_applicable = 0
        self.final_score = 0
        self.confidence = 0
        self.strategy = 'balanced'
        self.bonuses = []
        self.penalties = []
        self.notes = []

    def add_field(self, field_name, earned, applicable, detail="", gradient=1.0):
        """Add a field score to the breakdown"""
        self.field_scores[field_name] = {
            'earned': round(earned, 2),
            'applicable': round(applicable, 2),
            'percentage': round((earned / applicable * 100), 1) if applicable > 0 else 0,
            'detail': detail,
            'gradient': round(gradient, 2)
        }
        self.total_earned += earned
        self.total_applicable += applicable

    def add_bonus(self, name, points, reason):
        self.bonuses.append({
            'name': name,
            'points': points,
            'reason': reason
        })

    def add_penalty(self, name, points, reason):
        self.penalties.append({
            'name': name,
            'points': points,
            'reason': reason
        })

    def add_note(self, note):
        self.notes.append(note)

    def calculate_final(self):
        """Calculate final score with bonuses and penalties"""
        if self.total_applicable == 0:
            self.final_score = 50
            self.confidence = 0
            self.add_note("No applicable criteria found, default score assigned")
            return self.final_score

        base = (self.total_earned / self.total_applicable) * 100

        # Apply bonuses
        bonus_total = sum(b['points'] for b in self.bonuses)
        penalty_total = sum(p['points'] for p in self.penalties)

        adjusted = base + bonus_total - penalty_total
        self.final_score = max(0, min(int(adjusted), 100))

        # Calculate confidence
        applicable_fields = sum(
            1 for f in self.field_scores.values() if f['applicable'] > 0
        )
        total_fields = len(self.field_scores) if self.field_scores else 1
        self.confidence = round((applicable_fields / max(total_fields, 1)) * 100)

        return self.final_score

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            'final_score': self.final_score,
            'confidence': self.confidence,
            'strategy': self.strategy,
            'base_earned': round(self.total_earned, 2),
            'base_applicable': round(self.total_applicable, 2),
            'base_percentage': round(
                (self.total_earned / self.total_applicable * 100), 1
            ) if self.total_applicable > 0 else 0,
            'field_scores': self.field_scores,
            'bonuses': self.bonuses,
            'penalties': self.penalties,
            'total_bonus': sum(b['points'] for b in self.bonuses),
            'total_penalty': sum(p['points'] for p in self.penalties),
            'notes': self.notes,
            'fields_evaluated': len(self.field_scores),
            'fields_applicable': sum(
                1 for f in self.field_scores.values() if f['applicable'] > 0
            )
        }

    def summary(self):
        """One-line summary string"""
        applicable = sum(
            1 for f in self.field_scores.values() if f['applicable'] > 0
        )
        return (
            f"Score: {self.final_score}% | "
            f"Confidence: {self.confidence}% | "
            f"Fields: {applicable}/{len(self.field_scores)} | "
            f"Bonuses: {len(self.bonuses)} | "
            f"Penalties: {len(self.penalties)}"
        )


class ScoringEngine:
    """
    Enhanced Scoring Engine with gradient scoring,
    multiple strategies, detailed breakdowns, and analytics
    """

    def __init__(self, weight_profile='balanced', enable_gradient=True):
        """
        Initialize Scoring Engine

        Args:
            weight_profile: 'balanced', 'location', 'economic', 'demographic', 'occupation'
            enable_gradient: use partial scores instead of pass/fail
        """
        self.WEIGHTS = WeightProfile.get_profile(weight_profile)
        self.profile_name = weight_profile
        self.enable_gradient = enable_gradient

        # Analytics
        self._scores_calculated = 0
        self._total_time_ms = 0
        self._score_distribution = defaultdict(int)
        self._field_match_rates = defaultdict(lambda: {'matched': 0, 'total': 0})

        logger.info(
            f"✅ ScoringEngine initialized "
            f"(profile: {weight_profile}, gradient: {enable_gradient})"
        )

    # ──────────────────────────────────────────────
    # ⭐ MAIN SCORING
    # ──────────────────────────────────────────────

    def calculate_score(self, user, eligibility):
        """
        Calculate match score (0-100) between user and scheme.
        Backward compatible - returns just the score integer.
        """
        breakdown = self.calculate_detailed_score(user, eligibility)
        return breakdown.final_score

    def calculate_detailed_score(self, user, eligibility):
        """
        Calculate match score with full breakdown.
        Returns ScoreBreakdown object with per-field details.
        """
        start_time = time.time()
        self._scores_calculated += 1

        breakdown = ScoreBreakdown()
        breakdown.strategy = self.profile_name

        # Score each dimension
        self._score_age(user, eligibility, breakdown)
        self._score_gender(user, eligibility, breakdown)
        self._score_state(user, eligibility, breakdown)
        self._score_category(user, eligibility, breakdown)
        self._score_income(user, eligibility, breakdown)
        self._score_occupation(user, eligibility, breakdown)
        self._score_special_flags(user, eligibility, breakdown)

        # Apply contextual bonuses
        self._apply_bonuses(user, eligibility, breakdown)

        # Apply penalties
        self._apply_penalties(user, eligibility, breakdown)

        # Calculate final
        final = breakdown.calculate_final()

        # Track analytics
        elapsed = (time.time() - start_time) * 1000
        self._total_time_ms += elapsed

        bucket = (final // 10) * 10
        self._score_distribution[f"{bucket}-{bucket + 9}"] += 1

        return breakdown

    # ──────────────────────────────────────────────
    # INDIVIDUAL FIELD SCORERS
    # ──────────────────────────────────────────────

    def _score_age(self, user, elig, breakdown):
        """Score age match with gradient support"""
        min_age = elig.get('min_age')
        max_age = elig.get('max_age')

        if min_age is None and max_age is None:
            breakdown.add_field('age', 0, 0, "No age requirement", gradient=1.0)
            return

        user_age = self._safe_int(user.get('age', 0))
        weight = self.WEIGHTS['age']

        # Track analytics
        self._field_match_rates['age']['total'] += 1

        # No user age provided
        if user_age <= 0:
            breakdown.add_field(
                'age', 0, weight,
                "User age not provided",
                gradient=0
            )
            return

        # Check if age is in range
        in_range = True
        if min_age is not None and user_age < min_age:
            in_range = False
        if max_age is not None and user_age > max_age:
            in_range = False

        if in_range:
            # Perfect match
            self._field_match_rates['age']['matched'] += 1

            # Gradient: closer to middle of range = slightly higher
            if self.enable_gradient and min_age is not None and max_age is not None:
                range_span = max_age - min_age
                if range_span > 0:
                    mid = (min_age + max_age) / 2
                    distance = abs(user_age - mid) / (range_span / 2)
                    gradient = max(0.8, 1.0 - (distance * 0.2))
                    earned = weight * gradient
                    breakdown.add_field(
                        'age', earned, weight,
                        f"Age {user_age} in range {min_age}-{max_age} "
                        f"(optimality: {gradient:.0%})",
                        gradient=gradient
                    )
                else:
                    breakdown.add_field(
                        'age', weight, weight,
                        f"Age {user_age} matches exact requirement {min_age}",
                        gradient=1.0
                    )
            else:
                age_str = f"{min_age or '?'}-{max_age or '?'}"
                breakdown.add_field(
                    'age', weight, weight,
                    f"Age {user_age} within range ({age_str})",
                    gradient=1.0
                )
        else:
            # Not in range - check how close (gradient scoring)
            if self.enable_gradient:
                distance = 0
                if min_age is not None and user_age < min_age:
                    distance = min_age - user_age
                elif max_age is not None and user_age > max_age:
                    distance = user_age - max_age

                # Give partial credit if within 5 years
                if distance <= 5:
                    gradient = max(0, 1.0 - (distance / 5) * 0.8)
                    earned = weight * gradient
                    breakdown.add_field(
                        'age', earned, weight,
                        f"Age {user_age} is {distance} years outside range "
                        f"(partial credit: {gradient:.0%})",
                        gradient=gradient
                    )
                    if earned > 0:
                        self._field_match_rates['age']['matched'] += 1
                    return

            age_str = f"{min_age or '?'}-{max_age or '?'}"
            breakdown.add_field(
                'age', 0, weight,
                f"Age {user_age} outside range ({age_str})",
                gradient=0
            )

    def _score_gender(self, user, elig, breakdown):
        """Score gender match"""
        gender_req = elig.get('gender', 'all')

        if gender_req == 'all':
            breakdown.add_field(
                'gender', 0, 0,
                "Open to all genders",
                gradient=1.0
            )
            return

        weight = self.WEIGHTS['gender']
        user_gender = user.get('gender', '').lower().strip()

        self._field_match_rates['gender']['total'] += 1

        if not user_gender:
            breakdown.add_field(
                'gender', 0, weight,
                "User gender not provided",
                gradient=0
            )
            return

        if user_gender == gender_req.lower():
            self._field_match_rates['gender']['matched'] += 1
            breakdown.add_field(
                'gender', weight, weight,
                f"Gender '{user_gender}' matches requirement '{gender_req}'",
                gradient=1.0
            )
        else:
            breakdown.add_field(
                'gender', 0, weight,
                f"Gender '{user_gender}' doesn't match '{gender_req}'",
                gradient=0
            )

    def _score_state(self, user, elig, breakdown):
        """Score state match with proximity awareness"""
        states = elig.get('states', 'all')
        weight = self.WEIGHTS['state']
        user_state = user.get('state', '').strip()

        self._field_match_rates['state']['total'] += 1

        if states == 'all':
            self._field_match_rates['state']['matched'] += 1
            breakdown.add_field(
                'state', weight, weight,
                "Available across all states",
                gradient=1.0
            )
            return

        if not user_state:
            breakdown.add_field(
                'state', 0, weight,
                "User state not provided",
                gradient=0
            )
            return

        eligible_states = states if isinstance(states, list) else [states]

        if user_state in eligible_states:
            self._field_match_rates['state']['matched'] += 1
            breakdown.add_field(
                'state', weight, weight,
                f"State '{user_state}' is eligible",
                gradient=1.0
            )
        else:
            # Gradient: check neighboring states (regional proximity)
            if self.enable_gradient:
                proximity_score = self._check_state_proximity(user_state, eligible_states)
                if proximity_score > 0:
                    earned = weight * proximity_score
                    breakdown.add_field(
                        'state', earned, weight,
                        f"State '{user_state}' not listed but "
                        f"neighboring state is eligible (proximity: {proximity_score:.0%})",
                        gradient=proximity_score
                    )
                    return

            breakdown.add_field(
                'state', 0, weight,
                f"State '{user_state}' not in eligible list: "
                f"{', '.join(eligible_states[:5])}"
                f"{'...' if len(eligible_states) > 5 else ''}",
                gradient=0
            )

    def _score_category(self, user, elig, breakdown):
        """Score social category match"""
        categories = elig.get('category')

        if not categories:
            breakdown.add_field(
                'category', 0, 0,
                "No category restriction",
                gradient=1.0
            )
            return

        weight = self.WEIGHTS['category']
        user_cat = user.get('category', '').lower().strip()

        self._field_match_rates['category']['total'] += 1

        if not user_cat:
            breakdown.add_field(
                'category', 0, weight,
                "User category not provided",
                gradient=0
            )
            return

        eligible_cats = [c.lower() for c in categories]

        if user_cat in eligible_cats:
            self._field_match_rates['category']['matched'] += 1
            breakdown.add_field(
                'category', weight, weight,
                f"Category '{user_cat.upper()}' is eligible",
                gradient=1.0
            )
        else:
            # Gradient: related categories get partial credit
            if self.enable_gradient:
                related_score = self._check_category_relation(user_cat, eligible_cats)
                if related_score > 0:
                    earned = weight * related_score
                    breakdown.add_field(
                        'category', earned, weight,
                        f"Category '{user_cat.upper()}' not listed but "
                        f"related category is eligible (relation: {related_score:.0%})",
                        gradient=related_score
                    )
                    return

            breakdown.add_field(
                'category', 0, weight,
                f"Category '{user_cat.upper()}' not in "
                f"{[c.upper() for c in eligible_cats]}",
                gradient=0
            )

    def _score_income(self, user, elig, breakdown):
        """Score income match with gradient for closeness"""
        max_income = elig.get('max_income')

        if max_income is None:
            breakdown.add_field(
                'income', 0, 0,
                "No income restriction",
                gradient=1.0
            )
            return

        weight = self.WEIGHTS['income']
        user_income = self._safe_int(user.get('annual_income', 0))

        self._field_match_rates['income']['total'] += 1

        if user_income <= 0:
            breakdown.add_field(
                'income', 0, weight,
                "User income not provided",
                gradient=0
            )
            return

        if user_income <= max_income:
            self._field_match_rates['income']['matched'] += 1

            # Gradient: how much below the limit
            if self.enable_gradient and max_income > 0:
                ratio = user_income / max_income
                if ratio <= 0.5:
                    gradient = 1.0  # Well within limit
                    note = "well within"
                elif ratio <= 0.8:
                    gradient = 0.95
                    note = "comfortably within"
                else:
                    gradient = 0.85
                    note = "close to"

                earned = weight * gradient
                breakdown.add_field(
                    'income', earned, weight,
                    f"Income ₹{user_income:,} is {note} limit ₹{max_income:,} "
                    f"({ratio:.0%} of max)",
                    gradient=gradient
                )
            else:
                breakdown.add_field(
                    'income', weight, weight,
                    f"Income ₹{user_income:,} within limit ₹{max_income:,}",
                    gradient=1.0
                )
        else:
            # Over the limit
            if self.enable_gradient:
                overshoot = (user_income - max_income) / max_income
                if overshoot <= 0.1:  # Within 10% over
                    gradient = 0.3
                    earned = weight * gradient
                    breakdown.add_field(
                        'income', earned, weight,
                        f"Income ₹{user_income:,} slightly exceeds limit "
                        f"₹{max_income:,} by {overshoot:.0%} (marginal credit)",
                        gradient=gradient
                    )
                    return

            breakdown.add_field(
                'income', 0, weight,
                f"Income ₹{user_income:,} exceeds limit ₹{max_income:,}",
                gradient=0
            )

    def _score_occupation(self, user, elig, breakdown):
        """Score occupation match with similarity detection"""
        occupations = elig.get('occupation')

        if not occupations:
            breakdown.add_field(
                'occupation', 0, 0,
                "No occupation restriction",
                gradient=1.0
            )
            return

        weight = self.WEIGHTS['occupation']
        user_occ = user.get('occupation', '').lower().strip()

        self._field_match_rates['occupation']['total'] += 1

        if not user_occ:
            breakdown.add_field(
                'occupation', 0, weight,
                "User occupation not provided",
                gradient=0
            )
            return

        eligible_occs = [o.lower() for o in occupations]

        if user_occ in eligible_occs:
            self._field_match_rates['occupation']['matched'] += 1
            breakdown.add_field(
                'occupation', weight, weight,
                f"Occupation '{user_occ}' matches",
                gradient=1.0
            )
        else:
            # Gradient: check related occupations
            if self.enable_gradient:
                related_score = self._check_occupation_relation(user_occ, eligible_occs)
                if related_score > 0:
                    earned = weight * related_score
                    breakdown.add_field(
                        'occupation', earned, weight,
                        f"Occupation '{user_occ}' related to "
                        f"eligible: {[o.title() for o in eligible_occs]} "
                        f"(relation: {related_score:.0%})",
                        gradient=related_score
                    )
                    return

            breakdown.add_field(
                'occupation', 0, weight,
                f"Occupation '{user_occ}' not in "
                f"{[o.title() for o in eligible_occs]}",
                gradient=0
            )

    def _score_special_flags(self, user, elig, breakdown):
        """Score special boolean flags (BPL, farmer, student, disability)"""
        weight = self.WEIGHTS['special']

        flags = [
            ('is_bpl', 'BPL Status'),
            ('is_farmer', 'Farmer Status'),
            ('is_student', 'Student Status'),
            ('disability', 'Disability Status')
        ]

        total_flag_score = 0
        total_flag_applicable = 0
        flag_details = []

        for flag_key, flag_label in flags:
            elig_value = elig.get(flag_key)

            if elig_value is None:
                continue

            total_flag_applicable += weight

            user_value = user.get(flag_key, False)
            if isinstance(user_value, str):
                user_value = user_value.lower() in ('true', '1', 'yes')

            self._field_match_rates[flag_key]['total'] += 1

            if user_value == elig_value:
                total_flag_score += weight
                self._field_match_rates[flag_key]['matched'] += 1
                flag_details.append(f"✅ {flag_label}: matches (you: {user_value})")
            else:
                flag_details.append(
                    f"❌ {flag_label}: mismatch "
                    f"(you: {user_value}, required: {elig_value})"
                )

        if total_flag_applicable == 0:
            breakdown.add_field(
                'special_flags', 0, 0,
                "No special flag requirements",
                gradient=1.0
            )
            return

        gradient = total_flag_score / total_flag_applicable if total_flag_applicable > 0 else 0
        detail = " | ".join(flag_details)

        breakdown.add_field(
            'special_flags', total_flag_score, total_flag_applicable,
            detail,
            gradient=gradient
        )

    # ──────────────────────────────────────────────
    # BONUSES & PENALTIES
    # ──────────────────────────────────────────────

    def _apply_bonuses(self, user, elig, breakdown):
        """Apply contextual bonuses based on user-scheme alignment"""

        # Bonus: all applicable fields matched
        applicable_fields = sum(
            1 for f in breakdown.field_scores.values() if f['applicable'] > 0
        )
        matched_fields = sum(
            1 for f in breakdown.field_scores.values()
            if f['applicable'] > 0 and f['gradient'] >= 0.8
        )
        if applicable_fields >= 3 and matched_fields == applicable_fields:
            breakdown.add_bonus(
                'perfect_alignment', 3,
                f"All {applicable_fields} criteria matched perfectly"
            )

        # Bonus: vulnerable group priority
        user_bpl = self._parse_bool(user.get('is_bpl', False))
        user_disability = self._parse_bool(user.get('disability', False))
        user_age = self._safe_int(user.get('age', 0))

        if user_bpl and user_disability:
            breakdown.add_bonus(
                'vulnerable_priority', 3,
                "BPL + disability: priority applicant"
            )
        elif user_bpl:
            breakdown.add_bonus(
                'bpl_priority', 1,
                "BPL applicant priority"
            )

        # Bonus: senior citizen
        if user_age >= 60:
            breakdown.add_bonus(
                'senior_citizen', 1,
                f"Senior citizen (age {user_age})"
            )

        # Bonus: scheme targets user's exact demographic
        user_cat = user.get('category', '').lower()
        elig_cats = elig.get('category', [])
        if elig_cats and user_cat and len(elig_cats) <= 2:
            if user_cat in [c.lower() for c in elig_cats]:
                breakdown.add_bonus(
                    'targeted_scheme', 2,
                    f"Scheme specifically targets {user_cat.upper()} category"
                )

    def _apply_penalties(self, user, elig, breakdown):
        """Apply penalties for data quality or mismatch issues"""

        # Penalty: user provided very little information
        provided_fields = 0
        key_fields = ['age', 'gender', 'state', 'category', 'annual_income', 'occupation']
        for field in key_fields:
            value = user.get(field)
            if value is not None and value != '' and value != 0:
                provided_fields += 1

        if provided_fields <= 2:
            breakdown.add_penalty(
                'sparse_profile', 3,
                f"Only {provided_fields}/{len(key_fields)} key fields provided"
            )
            breakdown.add_note(
                "⚠️ Score accuracy limited due to incomplete profile"
            )

        # Penalty: age at boundary (within 1 year of limit)
        user_age = self._safe_int(user.get('age', 0))
        min_age = elig.get('min_age')
        max_age = elig.get('max_age')

        if min_age is not None and user_age == min_age:
            breakdown.add_note(
                f"📌 You are at the minimum age limit ({min_age}). "
                f"Verify exact date of birth eligibility."
            )
        if max_age is not None and user_age == max_age:
            breakdown.add_note(
                f"📌 You are at the maximum age limit ({max_age}). "
                f"Apply soon before age cutoff."
            )

    # ──────────────────────────────────────────────
    # GRADIENT HELPERS
    # ──────────────────────────────────────────────

    # State proximity map for gradient scoring
    STATE_NEIGHBORS = {
        'Delhi': ['Haryana', 'Uttar Pradesh'],
        'Haryana': ['Delhi', 'Punjab', 'Rajasthan', 'Uttar Pradesh', 'Himachal Pradesh'],
        'Punjab': ['Haryana', 'Himachal Pradesh', 'Rajasthan', 'Jammu and Kashmir', 'Chandigarh'],
        'Uttar Pradesh': ['Delhi', 'Haryana', 'Rajasthan', 'Madhya Pradesh', 'Bihar',
                          'Jharkhand', 'Chhattisgarh', 'Uttarakhand'],
        'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
        'West Bengal': ['Bihar', 'Jharkhand', 'Odisha', 'Sikkim', 'Assam'],
        'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana',
                        'Karnataka', 'Goa'],
        'Karnataka': ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Telangana',
                       'Andhra Pradesh'],
        'Tamil Nadu': ['Karnataka', 'Kerala', 'Andhra Pradesh', 'Puducherry'],
        'Kerala': ['Karnataka', 'Tamil Nadu'],
        'Gujarat': ['Maharashtra', 'Rajasthan', 'Madhya Pradesh'],
        'Rajasthan': ['Gujarat', 'Maharashtra', 'Madhya Pradesh', 'Uttar Pradesh',
                       'Haryana', 'Punjab'],
        'Madhya Pradesh': ['Rajasthan', 'Gujarat', 'Maharashtra', 'Chhattisgarh',
                           'Uttar Pradesh'],
        'Andhra Pradesh': ['Telangana', 'Karnataka', 'Tamil Nadu', 'Odisha',
                           'Chhattisgarh'],
        'Telangana': ['Andhra Pradesh', 'Maharashtra', 'Karnataka', 'Chhattisgarh'],
        'Odisha': ['West Bengal', 'Jharkhand', 'Chhattisgarh', 'Andhra Pradesh'],
        'Jharkhand': ['Bihar', 'West Bengal', 'Odisha', 'Chhattisgarh', 'Uttar Pradesh'],
        'Chhattisgarh': ['Madhya Pradesh', 'Maharashtra', 'Telangana', 'Andhra Pradesh',
                          'Odisha', 'Jharkhand', 'Uttar Pradesh'],
        'Assam': ['West Bengal', 'Meghalaya', 'Nagaland', 'Manipur', 'Mizoram',
                   'Tripura', 'Arunachal Pradesh'],
        'Himachal Pradesh': ['Punjab', 'Haryana', 'Uttarakhand', 'Jammu and Kashmir'],
        'Uttarakhand': ['Uttar Pradesh', 'Himachal Pradesh'],
        'Goa': ['Maharashtra', 'Karnataka'],
        'Sikkim': ['West Bengal'],
        'Meghalaya': ['Assam'],
        'Nagaland': ['Assam', 'Manipur', 'Arunachal Pradesh'],
        'Manipur': ['Assam', 'Nagaland', 'Mizoram'],
        'Mizoram': ['Assam', 'Manipur', 'Tripura'],
        'Tripura': ['Assam', 'Mizoram'],
        'Arunachal Pradesh': ['Assam', 'Nagaland'],
    }

    def _check_state_proximity(self, user_state, eligible_states):
        """Check if user's state is a neighbor of any eligible state"""
        neighbors = self.STATE_NEIGHBORS.get(user_state, [])
        for neighbor in neighbors:
            if neighbor in eligible_states:
                return 0.2  # 20% partial credit for neighboring state
        return 0

    # Related category mappings
    RELATED_CATEGORIES = {
        'sc': ['st', 'obc'],
        'st': ['sc', 'obc'],
        'obc': ['sc', 'st'],
        'general': [],
        'minority': ['obc']
    }

    def _check_category_relation(self, user_cat, eligible_cats):
        """Check if user's category is related to any eligible category"""
        related = self.RELATED_CATEGORIES.get(user_cat, [])
        for rel_cat in related:
            if rel_cat in eligible_cats:
                return 0.15  # 15% partial credit for related category
        return 0

    # Related occupation mappings
    RELATED_OCCUPATIONS = {
        'farmer': ['agriculture', 'farm worker', 'fisherman', 'dairy farmer'],
        'student': ['researcher', 'scholar'],
        'business': ['entrepreneur', 'self-employed', 'trader', 'shopkeeper'],
        'labour': ['worker', 'construction', 'daily wage', 'factory worker'],
        'unemployed': ['job seeker', 'fresh graduate'],
        'housewife': ['homemaker', 'self-help group'],
        'teacher': ['educator', 'professor', 'lecturer'],
        'doctor': ['medical professional', 'health worker'],
        'artisan': ['craftsman', 'weaver', 'potter', 'handicraft'],
    }

    def _check_occupation_relation(self, user_occ, eligible_occs):
        """Check if user's occupation is related to any eligible occupation"""
        # Direct alias check
        related = self.RELATED_OCCUPATIONS.get(user_occ, [])
        for rel_occ in related:
            if rel_occ in eligible_occs:
                return 0.5  # 50% credit for closely related occupation

        # Reverse check
        for elig_occ in eligible_occs:
            related = self.RELATED_OCCUPATIONS.get(elig_occ, [])
            if user_occ in related:
                return 0.5

        # Partial word match
        for elig_occ in eligible_occs:
            if user_occ in elig_occ or elig_occ in user_occ:
                return 0.3

        return 0

    # ──────────────────────────────────────────────
    # ADVANCED SCORING FEATURES
    # ──────────────────────────────────────────────

    def score_multiple(self, user, schemes):
        """
        Score user against multiple schemes at once

        Returns:
            List of (scheme, score, breakdown) sorted by score
        """
        results = []

        for scheme in schemes:
            elig = scheme.get('eligibility', {})
            breakdown = self.calculate_detailed_score(user, elig)
            results.append({
                'scheme': scheme,
                'score': breakdown.final_score,
                'confidence': breakdown.confidence,
                'breakdown': breakdown.to_dict()
            })

        results.sort(key=lambda x: x['score'], reverse=True)
        return results

    def compare_scores(self, user, scheme_a, scheme_b):
        """
        Compare scoring of two schemes for the same user

        Returns detailed comparison dict
        """
        elig_a = scheme_a.get('eligibility', {})
        elig_b = scheme_b.get('eligibility', {})

        breakdown_a = self.calculate_detailed_score(user, elig_a)
        breakdown_b = self.calculate_detailed_score(user, elig_b)

        comparison = {
            'scheme_a': {
                'name': scheme_a.get('name', 'Scheme A'),
                'score': breakdown_a.final_score,
                'confidence': breakdown_a.confidence,
                'breakdown': breakdown_a.to_dict()
            },
            'scheme_b': {
                'name': scheme_b.get('name', 'Scheme B'),
                'score': breakdown_b.final_score,
                'confidence': breakdown_b.confidence,
                'breakdown': breakdown_b.to_dict()
            },
            'winner': (
                scheme_a.get('name') if breakdown_a.final_score >= breakdown_b.final_score
                else scheme_b.get('name')
            ),
            'score_difference': abs(breakdown_a.final_score - breakdown_b.final_score),
            'field_comparison': {}
        }

        # Compare each field
        all_fields = set(
            list(breakdown_a.field_scores.keys()) +
            list(breakdown_b.field_scores.keys())
        )
        for field in all_fields:
            fa = breakdown_a.field_scores.get(field, {'percentage': 0})
            fb = breakdown_b.field_scores.get(field, {'percentage': 0})
            comparison['field_comparison'][field] = {
                'scheme_a': fa.get('percentage', 0),
                'scheme_b': fb.get('percentage', 0),
                'better': 'A' if fa.get('percentage', 0) >= fb.get('percentage', 0) else 'B'
            }

        return comparison

    def change_weights(self, new_weights=None, profile_name=None):
        """
        Change scoring weights dynamically

        Args:
            new_weights: dict of field → weight
            profile_name: name of predefined profile
        """
        if profile_name:
            self.WEIGHTS = WeightProfile.get_profile(profile_name)
            self.profile_name = profile_name
        elif new_weights:
            self.WEIGHTS.update(new_weights)
            self.profile_name = 'custom'

        self.clear_cache()
        logger.info(f"🔧 Weights changed to: {self.profile_name}")

    def clear_cache(self):
        """Clear any cached scores (for after weight changes)"""
        # Currently stateless per call, but future-proofs
        pass

    # ──────────────────────────────────────────────
    # ANALYTICS
    # ──────────────────────────────────────────────

    def get_analytics(self):
        """Get scoring engine analytics"""
        avg_time = round(
            self._total_time_ms / self._scores_calculated, 3
        ) if self._scores_calculated > 0 else 0

        match_rates = {}
        for field, data in self._field_match_rates.items():
            total = data['total']
            matched = data['matched']
            rate = round((matched / total * 100), 1) if total > 0 else 0
            match_rates[field] = {
                'total_evaluated': total,
                'matched': matched,
                'match_rate': f"{rate}%"
            }

        return {
            'total_scores_calculated': self._scores_calculated,
            'total_time_ms': round(self._total_time_ms, 2),
            'average_time_ms': avg_time,
            'weight_profile': self.profile_name,
            'current_weights': self.WEIGHTS,
            'gradient_enabled': self.enable_gradient,
            'score_distribution': dict(self._score_distribution),
            'field_match_rates': match_rates,
            'available_profiles': WeightProfile.list_profiles()
        }

    def reset_analytics(self):
        """Reset analytics counters"""
        self._scores_calculated = 0
        self._total_time_ms = 0
        self._score_distribution.clear()
        self._field_match_rates.clear()
        logger.info("📊 Scoring analytics reset")

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
    def _parse_bool(value):
        """Parse various boolean representations"""
        if isinstance(value, bool):
            return value
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes')
        if isinstance(value, (int, float)):
            return bool(value)
        return False

    def __repr__(self):
        return (
            f"<ScoringEngine: profile={self.profile_name}, "
            f"gradient={self.enable_gradient}, "
            f"scored={self._scores_calculated}>"
        )


# ──────────────────────────────────────────────
# STANDALONE TESTING
# ──────────────────────────────────────────────

if __name__ == '__main__':
    print("=" * 60)
    print("🧪 Scoring Engine Test Mode")
    print("=" * 60)

    engine = ScoringEngine(weight_profile='balanced', enable_gradient=True)

    # Test user
    test_user = {
        'age': 28,
        'gender': 'male',
        'state': 'Bihar',
        'category': 'obc',
        'annual_income': 120000,
        'occupation': 'farmer',
        'is_bpl': True,
        'is_farmer': True,
        'disability': False
    }

    # Test eligibilities
    test_schemes = [
        {
            'name': 'Perfect Match Scheme',
            'eligibility': {
                'min_age': 18, 'max_age': 40,
                'gender': 'all',
                'states': 'all',
                'category': ['obc', 'sc', 'st'],
                'max_income': 200000,
                'occupation': ['farmer'],
                'is_bpl': True
            }
        },
        {
            'name': 'Partial Match Scheme',
            'eligibility': {
                'min_age': 21, 'max_age': 35,
                'gender': 'female',
                'states': ['Bihar', 'UP'],
                'max_income': 150000
            }
        },
        {
            'name': 'No Restrictions Scheme',
            'eligibility': {
                'states': 'all',
                'gender': 'all'
            }
        },
        {
            'name': 'Age Edge Case',
            'eligibility': {
                'min_age': 30, 'max_age': 50,
                'states': 'all',
                'category': ['obc']
            }
        }
    ]

    print(f"\n👤 Test User: {test_user}\n")

    for scheme_data in test_schemes:
        name = scheme_data['name']
        elig = scheme_data['eligibility']

        print(f"{'─' * 55}")
        print(f"📋 {name}")
        print(f"{'─' * 55}")

        breakdown = engine.calculate_detailed_score(test_user, elig)
        print(f"   {breakdown.summary()}")

        for field, data in breakdown.field_scores.items():
            status = "✅" if data['gradient'] >= 0.8 else (
                "🟡" if data['gradient'] > 0 else "❌"
            )
            if data['applicable'] > 0:
                print(
                    f"   {status} {field}: {data['earned']:.1f}/{data['applicable']:.1f} "
                    f"({data['percentage']:.0f}%) - {data['detail']}"
                )

        if breakdown.bonuses:
            for b in breakdown.bonuses:
                print(f"   ⬆️  +{b['points']} {b['reason']}")

        if breakdown.penalties:
            for p in breakdown.penalties:
                print(f"   ⬇️  -{p['points']} {p['reason']}")

        if breakdown.notes:
            for n in breakdown.notes:
                print(f"   📝 {n}")

        print()

    # Test weight profiles
    print(f"\n{'═' * 60}")
    print("🔧 Weight Profile Comparison")
    print(f"{'═' * 60}")

    profiles = WeightProfile.list_profiles()
    first_elig = test_schemes[0]['eligibility']

    for profile in profiles:
        eng = ScoringEngine(weight_profile=profile, enable_gradient=True)
        score = eng.calculate_score(test_user, first_elig)
        print(f"   {profile:15} → Score: {score}%")

    # Test comparison
    print(f"\n{'═' * 60}")
    print("⚖️ Scheme Comparison")
    print(f"{'═' * 60}")

    comparison = engine.compare_scores(test_user, test_schemes[0], test_schemes[1])
    print(f"   Winner: {comparison['winner']} "
          f"(by {comparison['score_difference']} points)")
    print(f"   {test_schemes[0]['name']}: {comparison['scheme_a']['score']}%")
    print(f"   {test_schemes[1]['name']}: {comparison['scheme_b']['score']}%")

    # Analytics
    print(f"\n{'═' * 60}")
    print("📊 Engine Analytics")
    print(f"{'═' * 60}")

    analytics = engine.get_analytics()
    print(f"   Scores calculated: {analytics['total_scores_calculated']}")
    print(f"   Average time: {analytics['average_time_ms']}ms")
    print(f"   Distribution: {analytics['score_distribution']}")
    print(f"   Field match rates: {analytics['field_match_rates']}")

    print(f"\n{repr(engine)}")
    print("\n✅ All tests complete!")
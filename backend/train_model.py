"""
🧠 GovScheme AI - Model Training Pipeline v3.0
================================================
Features:
  - Multiple model comparison (Logistic Regression, SVM, Random Forest, Naive Bayes)
  - Data augmentation (synonyms, typos, word shuffling)
  - Cross-validation with stratified K-Fold
  - Confusion matrix & per-intent performance report
  - Hyperparameter tuning with grid search
  - Train/test split evaluation (not just training accuracy)
  - Model versioning with metadata
  - Overfitting detection
  - Dataset quality analysis
  - Interactive testing mode
  - Export training report
  - Automatic best model selection
  - Handles Hindi/Hinglish patterns
  - Reproducible results with seed control

Command: python train_model.py
Options: python train_model.py --compare  (compare all models)
         python train_model.py --augment  (train with data augmentation)
         python train_model.py --test     (interactive testing mode)
         python train_model.py --report   (generate full report)
"""

import json
import pickle
import os
import sys
import time
import random
import re
import warnings
from datetime import datetime
from collections import Counter, defaultdict
from copy import deepcopy

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import (
    train_test_split,
    StratifiedKFold,
    cross_val_score,
    GridSearchCV
)
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score
)
from sklearn.calibration import CalibratedClassifierCV
from sklearn.pipeline import Pipeline

warnings.filterwarnings('ignore')

# Seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)


# ──────────────────────────────────────────────────
# DATA LOADING & VALIDATION
# ──────────────────────────────────────────────────

class DatasetAnalyzer:
    """Analyzes and validates the training dataset"""

    def __init__(self, data):
        self.data = data
        self.intents = data.get('intents', [])

    def analyze(self):
        """Run full dataset analysis"""
        report = {
            'total_intents': len(self.intents),
            'total_patterns': 0,
            'total_responses': 0,
            'patterns_per_intent': {},
            'responses_per_intent': {},
            'avg_patterns_per_intent': 0,
            'avg_responses_per_intent': 0,
            'min_patterns': float('inf'),
            'max_patterns': 0,
            'shortest_pattern': '',
            'longest_pattern': '',
            'duplicate_patterns': [],
            'empty_intents': [],
            'low_pattern_intents': [],
            'word_frequency': Counter(),
            'avg_pattern_length': 0,
            'unique_words': 0,
            'quality_score': 0,
            'warnings': [],
            'suggestions': []
        }

        all_patterns = []
        all_pattern_texts = []
        total_pattern_length = 0

        for intent in self.intents:
            tag = intent.get('tag', 'unknown')
            patterns = intent.get('patterns', [])
            responses = intent.get('responses', [])

            num_patterns = len(patterns)
            num_responses = len(responses)

            report['total_patterns'] += num_patterns
            report['total_responses'] += num_responses
            report['patterns_per_intent'][tag] = num_patterns
            report['responses_per_intent'][tag] = num_responses

            report['min_patterns'] = min(report['min_patterns'], num_patterns)
            report['max_patterns'] = max(report['max_patterns'], num_patterns)

            if num_patterns == 0:
                report['empty_intents'].append(tag)
                report['warnings'].append(f"Intent '{tag}' has no patterns!")

            if num_patterns < 3:
                report['low_pattern_intents'].append(tag)
                report['suggestions'].append(
                    f"Intent '{tag}' has only {num_patterns} patterns. "
                    f"Add at least 5 for better accuracy."
                )

            if num_responses == 0:
                report['warnings'].append(f"Intent '{tag}' has no responses!")

            for pattern in patterns:
                pattern_lower = pattern.lower().strip()
                all_patterns.append((pattern_lower, tag))
                all_pattern_texts.append(pattern_lower)
                total_pattern_length += len(pattern_lower.split())

                for word in pattern_lower.split():
                    cleaned = re.sub(r'[^a-z0-9]', '', word)
                    if len(cleaned) >= 2:
                        report['word_frequency'][cleaned] += 1

        # Averages
        if report['total_intents'] > 0:
            report['avg_patterns_per_intent'] = round(
                report['total_patterns'] / report['total_intents'], 1
            )
            report['avg_responses_per_intent'] = round(
                report['total_responses'] / report['total_intents'], 1
            )

        if report['total_patterns'] > 0:
            report['avg_pattern_length'] = round(
                total_pattern_length / report['total_patterns'], 1
            )

        # Find duplicates
        seen = {}
        for pattern, tag in all_patterns:
            if pattern in seen:
                report['duplicate_patterns'].append({
                    'pattern': pattern,
                    'intent_1': seen[pattern],
                    'intent_2': tag
                })
            else:
                seen[pattern] = tag

        if report['duplicate_patterns']:
            report['warnings'].append(
                f"Found {len(report['duplicate_patterns'])} duplicate patterns!"
            )

        # Shortest/longest
        if all_pattern_texts:
            report['shortest_pattern'] = min(all_pattern_texts, key=len)
            report['longest_pattern'] = max(all_pattern_texts, key=len)

        # Unique words
        report['unique_words'] = len(report['word_frequency'])

        # Quality score (0-100)
        report['quality_score'] = self._calculate_quality_score(report)

        # Top words
        report['top_words'] = report['word_frequency'].most_common(20)

        return report

    def _calculate_quality_score(self, report):
        """Calculate overall dataset quality score"""
        score = 100

        # Deductions
        if report['total_intents'] < 5:
            score -= 20
        elif report['total_intents'] < 10:
            score -= 10

        if report['avg_patterns_per_intent'] < 3:
            score -= 25
        elif report['avg_patterns_per_intent'] < 5:
            score -= 15
        elif report['avg_patterns_per_intent'] < 8:
            score -= 5

        if report['empty_intents']:
            score -= len(report['empty_intents']) * 10

        if report['duplicate_patterns']:
            score -= min(len(report['duplicate_patterns']) * 3, 15)

        if len(report['low_pattern_intents']) > len(report['patterns_per_intent']) * 0.3:
            score -= 10

        if report['total_patterns'] < 50:
            score -= 15
        elif report['total_patterns'] < 100:
            score -= 5

        return max(0, min(100, score))


# ──────────────────────────────────────────────────
# DATA AUGMENTATION
# ──────────────────────────────────────────────────

class DataAugmenter:
    """Augments training data with variations"""

    # Common word synonyms for government scheme context
    SYNONYMS = {
        'scheme': ['yojana', 'program', 'programme', 'plan', 'initiative'],
        'apply': ['register', 'enroll', 'sign up', 'submit'],
        'eligible': ['qualify', 'qualified', 'eligibility', 'can i get'],
        'benefit': ['advantage', 'help', 'support', 'assistance'],
        'farmer': ['kisan', 'agriculturist', 'farm worker'],
        'student': ['scholar', 'learner', 'vidyarthi'],
        'women': ['woman', 'female', 'mahila', 'ladies'],
        'pension': ['retirement', 'old age support', 'monthly allowance'],
        'loan': ['credit', 'finance', 'lending', 'borrowing'],
        'scholarship': ['fellowship', 'grant', 'financial aid'],
        'health': ['medical', 'healthcare', 'hospital', 'treatment'],
        'house': ['home', 'housing', 'shelter', 'awas', 'ghar'],
        'document': ['documents', 'papers', 'paperwork', 'dastavez'],
        'income': ['earning', 'salary', 'kamai'],
        'government': ['govt', 'sarkar', 'sarkari'],
        'tell': ['explain', 'describe', 'show', 'give info'],
        'want': ['need', 'require', 'looking for'],
        'help': ['assist', 'support', 'guide', 'help me'],
        'old': ['elderly', 'senior', 'aged', 'buzurg'],
        'poor': ['bpl', 'below poverty', 'garib', 'low income'],
        'money': ['paisa', 'funds', 'amount', 'rupees'],
        'insurance': ['bima', 'coverage', 'protection'],
        'education': ['padhai', 'studies', 'shiksha'],
        'business': ['vyapar', 'enterprise', 'startup', 'udyam'],
    }

    # Common typos/misspellings
    COMMON_TYPOS = {
        'government': ['goverment', 'governmnt', 'goverment'],
        'scheme': ['schem', 'schme', 'skeme'],
        'scholarship': ['scholorship', 'scholarshp'],
        'eligible': ['eligble', 'elgible', 'elegible'],
        'ayushman': ['ayusman', 'aayushman', 'ayushmann'],
        'pradhan': ['prdhan', 'pradhen'],
        'kisan': ['kisaan', 'kishan'],
        'yojana': ['yojna', 'yojnaa', 'yojanna'],
        'pension': ['pention', 'pensin'],
        'application': ['aplication', 'applicaton'],
        'document': ['documnt', 'docment', 'documet'],
        'insurance': ['insurence', 'insuranse'],
        'certificate': ['certificat', 'certifcate'],
    }

    @classmethod
    def augment(cls, data, multiplier=2, add_typos=True, add_synonyms=True,
                add_shuffled=True, add_hinglish=True):
        """
        Augment training data with variations

        Args:
            data: original dataset dict
            multiplier: how many variations per pattern (approx)
            add_typos: include common misspellings
            add_synonyms: include synonym replacements
            add_shuffled: include word-order variations
            add_hinglish: include Hindi/Hinglish patterns

        Returns:
            Augmented dataset dict
        """
        augmented_data = deepcopy(data)
        original_count = sum(len(i['patterns']) for i in data['intents'])
        added = 0

        for intent in augmented_data['intents']:
            new_patterns = []

            for pattern in intent['patterns']:
                variations = set()

                if add_synonyms:
                    for _ in range(multiplier):
                        var = cls._synonym_replace(pattern)
                        if var != pattern.lower():
                            variations.add(var)

                if add_typos:
                    var = cls._add_typo(pattern)
                    if var != pattern.lower():
                        variations.add(var)

                if add_shuffled and len(pattern.split()) >= 4:
                    var = cls._shuffle_words(pattern)
                    if var != pattern.lower():
                        variations.add(var)

                if add_hinglish:
                    var = cls._hinglish_variant(pattern)
                    if var and var != pattern.lower():
                        variations.add(var)

                new_patterns.extend(list(variations))

            # Add unique patterns
            existing = set(p.lower().strip() for p in intent['patterns'])
            for new_p in new_patterns:
                if new_p.strip() and new_p not in existing:
                    intent['patterns'].append(new_p)
                    existing.add(new_p)
                    added += 1

        total = sum(len(i['patterns']) for i in augmented_data['intents'])
        print(f"   📈 Augmentation: {original_count} → {total} patterns (+{added} new)")

        return augmented_data

    @classmethod
    def _synonym_replace(cls, text):
        """Replace random words with synonyms"""
        words = text.lower().split()
        for i, word in enumerate(words):
            clean = re.sub(r'[^a-z]', '', word)
            if clean in cls.SYNONYMS and random.random() < 0.4:
                words[i] = random.choice(cls.SYNONYMS[clean])
        return ' '.join(words)

    @classmethod
    def _add_typo(cls, text):
        """Add a common typo"""
        text_lower = text.lower()
        for correct, typos in cls.COMMON_TYPOS.items():
            if correct in text_lower and random.random() < 0.5:
                text_lower = text_lower.replace(correct, random.choice(typos), 1)
                break
        return text_lower

    @classmethod
    def _shuffle_words(cls, text):
        """Shuffle word order slightly"""
        words = text.lower().split()
        if len(words) < 3:
            return text.lower()

        # Swap two adjacent words
        idx = random.randint(0, len(words) - 2)
        words[idx], words[idx + 1] = words[idx + 1], words[idx]
        return ' '.join(words)

    @classmethod
    def _hinglish_variant(cls, text):
        """Create Hinglish (Hindi+English) variant"""
        hinglish_map = {
            'tell me about': 'mujhe batao',
            'how to apply': 'kaise apply kare',
            'what is': 'kya hai',
            'i want': 'mujhe chahiye',
            'help me': 'meri madad karo',
            'thank you': 'dhanyavaad',
            'good bye': 'alvida',
            'hello': 'namaste',
            'who can get': 'kisko milega',
            'how much money': 'kitna paisa milega',
            'which documents': 'kaunse documents chahiye',
            'am i eligible': 'kya main eligible hu',
            'for farmers': 'kisano ke liye',
            'for women': 'mahilao ke liye',
            'for students': 'students ke liye',
            'old age': 'budhape ka',
        }

        text_lower = text.lower()
        for eng, hindi in hinglish_map.items():
            if eng in text_lower:
                return text_lower.replace(eng, hindi)

        return None


# ──────────────────────────────────────────────────
# MODEL TRAINING
# ──────────────────────────────────────────────────

class ModelTrainer:
    """Handles model training, evaluation, and selection"""

    MODELS = {
        'logistic_regression': {
            'class': LogisticRegression,
            'params': {
                'max_iter': 2000,
                'random_state': RANDOM_SEED,
                'C': 10,
                'multi_class': 'multinomial',
                'solver': 'lbfgs'
            },
            'supports_proba': True
        },
        'svm': {
            'class': LinearSVC,
            'params': {
                'max_iter': 2000,
                'random_state': RANDOM_SEED,
                'C': 1.0
            },
            'supports_proba': False  # needs calibration
        },
        'random_forest': {
            'class': RandomForestClassifier,
            'params': {
                'n_estimators': 100,
                'random_state': RANDOM_SEED,
                'max_depth': 20,
                'min_samples_split': 2
            },
            'supports_proba': True
        },
        'naive_bayes': {
            'class': MultinomialNB,
            'params': {
                'alpha': 0.1
            },
            'supports_proba': True
        },
        'gradient_boosting': {
            'class': GradientBoostingClassifier,
            'params': {
                'n_estimators': 100,
                'random_state': RANDOM_SEED,
                'max_depth': 5,
                'learning_rate': 0.1
            },
            'supports_proba': True
        },
        'knn': {
            'class': KNeighborsClassifier,
            'params': {
                'n_neighbors': 5,
                'weights': 'distance'
            },
            'supports_proba': True
        }
    }

    VECTORIZER_CONFIGS = {
        'standard': {
            'max_features': 1500,
            'ngram_range': (1, 2),
            'stop_words': 'english',
            'lowercase': True,
            'sublinear_tf': True
        },
        'detailed': {
            'max_features': 3000,
            'ngram_range': (1, 3),
            'stop_words': 'english',
            'lowercase': True,
            'sublinear_tf': True,
            'min_df': 1,
            'max_df': 0.95
        },
        'minimal': {
            'max_features': 500,
            'ngram_range': (1, 1),
            'stop_words': 'english',
            'lowercase': True
        }
    }

    HYPERPARAMETER_GRID = {
        'logistic_regression': {
            'C': [0.1, 1, 10, 50],
            'max_iter': [1000, 2000],
        },
        'svm': {
            'C': [0.1, 0.5, 1, 5, 10],
        },
        'random_forest': {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 20, None],
        },
        'naive_bayes': {
            'alpha': [0.01, 0.1, 0.5, 1.0],
        }
    }

    def __init__(self):
        self.training_report = {}

    def create_vectorizer(self, config_name='standard'):
        """Create TF-IDF vectorizer with given config"""
        config = self.VECTORIZER_CONFIGS.get(config_name, self.VECTORIZER_CONFIGS['standard'])
        return TfidfVectorizer(**config)

    def train_single(self, model_name, X_train, y_train, X_test=None, y_test=None):
        """Train a single model and evaluate"""
        if model_name not in self.MODELS:
            raise ValueError(f"Unknown model: {model_name}")

        config = self.MODELS[model_name]
        model_class = config['class']
        params = config['params']

        start_time = time.time()
        model = model_class(**params)
        model.fit(X_train, y_train)
        train_time = round((time.time() - start_time) * 1000, 2)

        # Training accuracy
        train_pred = model.predict(X_train)
        train_acc = accuracy_score(y_train, train_pred)

        result = {
            'model_name': model_name,
            'model': model,
            'train_accuracy': round(train_acc * 100, 2),
            'train_time_ms': train_time,
            'supports_proba': config['supports_proba']
        }

        # Test accuracy
        if X_test is not None and y_test is not None:
            test_pred = model.predict(X_test)
            test_acc = accuracy_score(y_test, test_pred)
            test_f1 = f1_score(y_test, test_pred, average='weighted')
            test_precision = precision_score(y_test, test_pred, average='weighted', zero_division=0)
            test_recall = recall_score(y_test, test_pred, average='weighted', zero_division=0)

            result['test_accuracy'] = round(test_acc * 100, 2)
            result['test_f1'] = round(test_f1 * 100, 2)
            result['test_precision'] = round(test_precision * 100, 2)
            result['test_recall'] = round(test_recall * 100, 2)
            result['classification_report'] = classification_report(
                y_test, test_pred, zero_division=0
            )
            result['confusion_matrix'] = confusion_matrix(y_test, test_pred).tolist()

            # Overfitting detection
            overfit_gap = result['train_accuracy'] - result['test_accuracy']
            result['overfit_gap'] = round(overfit_gap, 2)
            result['overfit_warning'] = overfit_gap > 15

        return result

    def train_all_models(self, X_train, y_train, X_test, y_test):
        """Train all available models and compare"""
        results = {}

        for model_name in self.MODELS:
            try:
                print(f"   Training {model_name}...", end=" ")
                result = self.train_single(model_name, X_train, y_train, X_test, y_test)
                results[model_name] = result
                print(
                    f"Train: {result['train_accuracy']}% | "
                    f"Test: {result.get('test_accuracy', 'N/A')}% | "
                    f"Time: {result['train_time_ms']}ms"
                )
            except Exception as e:
                print(f"FAILED: {e}")
                results[model_name] = {'error': str(e)}

        return results

    def cross_validate(self, model_name, X, y, n_folds=5):
        """Perform stratified K-fold cross-validation"""
        if model_name not in self.MODELS:
            raise ValueError(f"Unknown model: {model_name}")

        config = self.MODELS[model_name]
        model = config['class'](**config['params'])

        skf = StratifiedKFold(n_splits=n_folds, shuffle=True, random_state=RANDOM_SEED)

        scores = cross_val_score(model, X, y, cv=skf, scoring='accuracy')

        return {
            'model': model_name,
            'n_folds': n_folds,
            'scores': [round(s * 100, 2) for s in scores],
            'mean_accuracy': round(scores.mean() * 100, 2),
            'std_deviation': round(scores.std() * 100, 2),
            'min_accuracy': round(scores.min() * 100, 2),
            'max_accuracy': round(scores.max() * 100, 2)
        }

    def hyperparameter_tune(self, model_name, X, y):
        """Grid search for best hyperparameters"""
        if model_name not in self.HYPERPARAMETER_GRID:
            print(f"   No grid defined for {model_name}")
            return None

        config = self.MODELS[model_name]
        model = config['class'](**config['params'])
        param_grid = self.HYPERPARAMETER_GRID[model_name]

        print(f"   Tuning {model_name} with grid: {param_grid}")

        grid_search = GridSearchCV(
            model, param_grid,
            cv=3, scoring='accuracy',
            n_jobs=-1, verbose=0
        )
        grid_search.fit(X, y)

        return {
            'best_params': grid_search.best_params_,
            'best_score': round(grid_search.best_score_ * 100, 2),
            'best_model': grid_search.best_estimator_
        }

    def select_best_model(self, results):
        """Select the best model based on test accuracy and other metrics"""
        valid_results = {
            name: r for name, r in results.items()
            if 'error' not in r and 'test_accuracy' in r
        }

        if not valid_results:
            return 'logistic_regression'  # default fallback

        # Score each model (weighted combination)
        scored = {}
        for name, r in valid_results.items():
            score = 0
            score += r.get('test_accuracy', 0) * 0.4
            score += r.get('test_f1', 0) * 0.3
            score -= r.get('overfit_gap', 0) * 0.2  # penalize overfitting
            score += (1 if r.get('supports_proba', False) else -5) * 0.1 * 100

            # Prefer models with probability support (needed for confidence)
            scored[name] = round(score, 2)

        best_name = max(scored, key=scored.get)
        return best_name


# ──────────────────────────────────────────────────
# MAIN TRAINING PIPELINE
# ──────────────────────────────────────────────────

def load_training_data():
    """Load chat dataset with validation"""
    file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'chat_dataset.json')

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        print("   Create chat_dataset.json with intents/patterns/responses")
        sys.exit(1)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error in chat_dataset.json: {e}")
        sys.exit(1)

    if 'intents' not in data:
        print("❌ chat_dataset.json must have 'intents' key")
        sys.exit(1)

    return data


def prepare_data(data):
    """Convert dataset into training format"""
    texts = []
    labels = []

    for intent in data['intents']:
        tag = intent['tag']
        for pattern in intent['patterns']:
            cleaned = pattern.lower().strip()
            if cleaned:
                texts.append(cleaned)
                labels.append(tag)

    return texts, labels


def train_and_save(compare_models=False, use_augmentation=False,
                   run_tuning=False, generate_report=False):
    """
    Main training pipeline

    Args:
        compare_models: train and compare all model types
        use_augmentation: augment data before training
        run_tuning: perform hyperparameter tuning
        generate_report: save detailed report to file
    """
    pipeline_start = time.time()

    print("\n" + "=" * 60)
    print("🧠 GovScheme AI - Model Training Pipeline v3.0")
    print("=" * 60)

    # ── STEP 1: Load Data ──
    print("\n📂 Step 1: Loading training data...")
    data = load_training_data()

    # ── STEP 2: Analyze Dataset ──
    print("\n📊 Step 2: Analyzing dataset quality...")
    analyzer = DatasetAnalyzer(data)
    analysis = analyzer.analyze()

    print(f"   Total intents: {analysis['total_intents']}")
    print(f"   Total patterns: {analysis['total_patterns']}")
    print(f"   Total responses: {analysis['total_responses']}")
    print(f"   Avg patterns/intent: {analysis['avg_patterns_per_intent']}")
    print(f"   Avg pattern length: {analysis['avg_pattern_length']} words")
    print(f"   Unique vocabulary: {analysis['unique_words']} words")
    print(f"   Dataset quality: {analysis['quality_score']}%")

    if analysis['warnings']:
        print(f"\n   ⚠️ Warnings:")
        for w in analysis['warnings'][:5]:
            print(f"      {w}")

    if analysis['suggestions']:
        print(f"\n   💡 Suggestions:")
        for s in analysis['suggestions'][:5]:
            print(f"      {s}")

    if analysis['duplicate_patterns']:
        print(f"\n   🔄 Duplicates: {len(analysis['duplicate_patterns'])}")
        for dup in analysis['duplicate_patterns'][:3]:
            print(f"      '{dup['pattern']}' in both '{dup['intent_1']}' and '{dup['intent_2']}'")

    # ── STEP 3: Data Augmentation ──
    if use_augmentation:
        print("\n📈 Step 3: Augmenting training data...")
        data = DataAugmenter.augment(
            data,
            multiplier=2,
            add_typos=True,
            add_synonyms=True,
            add_shuffled=True,
            add_hinglish=True
        )
    else:
        print("\n⏭️ Step 3: Skipping augmentation (use --augment to enable)")

    # Prepare training data
    texts, labels = prepare_data(data)
    print(f"\n   📋 Training samples: {len(texts)}")
    print(f"   🏷️ Intent categories: {len(set(labels))}")
    print(f"   📊 Samples per intent:")

    label_counts = Counter(labels)
    for tag, count in sorted(label_counts.items(), key=lambda x: x[1], reverse=True):
        bar = "█" * min(count, 30)
        print(f"      {tag:25} {count:4} {bar}")

    # ── STEP 4: Vectorization ──
    print("\n🔤 Step 4: Creating TF-IDF vectors...")
    trainer = ModelTrainer()
    vectorizer = trainer.create_vectorizer('detailed' if use_augmentation else 'standard')
    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    print(f"   Vocabulary size: {len(vectorizer.vocabulary_)}")
    print(f"   Feature matrix: {X.shape}")

    # ── STEP 5: Train/Test Split ──
    print("\n✂️ Step 5: Splitting train/test data...")

    # Handle small datasets
    min_samples = min(label_counts.values())
    if min_samples < 2:
        print("   ⚠️ Some intents have very few samples. Using full dataset for training.")
        X_train, X_test, y_train, y_test = X, X, y, y
        split_note = "No split (too few samples per intent)"
    else:
        test_size = 0.2 if len(texts) >= 50 else 0.15
        try:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=test_size,
                random_state=RANDOM_SEED,
                stratify=y
            )
            split_note = f"{len(y_train)} train / {len(y_test)} test ({test_size:.0%} split)"
        except ValueError:
            X_train, X_test, y_train, y_test = X, X, y, y
            split_note = "No split (stratification failed)"

    print(f"   {split_note}")

    # ── STEP 6: Model Training ──
    if compare_models:
        print("\n🏋️ Step 6: Training ALL models for comparison...")
        all_results = trainer.train_all_models(X_train, y_train, X_test, y_test)

        print("\n📊 Model Comparison:")
        print(f"   {'Model':<25} {'Train%':>8} {'Test%':>8} {'F1%':>8} {'Overfit':>10} {'Time':>10}")
        print(f"   {'─' * 75}")

        for name, r in sorted(
            all_results.items(),
            key=lambda x: x[1].get('test_accuracy', 0),
            reverse=True
        ):
            if 'error' in r:
                print(f"   {name:<25} {'ERROR':>8}")
                continue

            overfit = f"{r.get('overfit_gap', 0):+.1f}%" if 'overfit_gap' in r else 'N/A'
            overfit_flag = " ⚠️" if r.get('overfit_warning', False) else ""

            print(
                f"   {name:<25} "
                f"{r['train_accuracy']:>7.1f}% "
                f"{r.get('test_accuracy', 0):>7.1f}% "
                f"{r.get('test_f1', 0):>7.1f}% "
                f"{overfit:>9}{overfit_flag} "
                f"{r['train_time_ms']:>8.0f}ms"
            )

        # Select best
        best_name = trainer.select_best_model(all_results)
        print(f"\n   🏆 Best model: {best_name}")

        best_result = all_results[best_name]
        model = best_result['model']
        supports_proba = best_result['supports_proba']

    else:
        print("\n🏋️ Step 6: Training Logistic Regression model...")
        best_name = 'logistic_regression'
        result = trainer.train_single(best_name, X_train, y_train, X_test, y_test)
        model = result['model']
        supports_proba = result['supports_proba']

        print(f"   Training accuracy: {result['train_accuracy']}%")
        if 'test_accuracy' in result:
            print(f"   Test accuracy: {result['test_accuracy']}%")
            print(f"   F1 score: {result.get('test_f1', 'N/A')}%")

            if result.get('overfit_warning'):
                print(
                    f"   ⚠️ Overfitting detected! "
                    f"Gap: {result['overfit_gap']}%"
                )

        if 'classification_report' in result:
            print(f"\n   📋 Per-Intent Performance:")
            print(result['classification_report'])

        all_results = {best_name: result}

    # ── STEP 7: Cross-Validation ──
    print(f"\n🔄 Step 7: Cross-validation ({best_name})...")
    try:
        n_folds = min(5, min_samples) if min_samples >= 2 else 2
        cv_results = trainer.cross_validate(best_name, X, y, n_folds=max(2, n_folds))
        print(f"   {cv_results['n_folds']}-Fold scores: {cv_results['scores']}")
        print(f"   Mean: {cv_results['mean_accuracy']}% (±{cv_results['std_deviation']}%)")
    except Exception as e:
        print(f"   ⚠️ Cross-validation skipped: {e}")
        cv_results = None

    # ── STEP 8: Hyperparameter Tuning (optional) ──
    if run_tuning:
        print(f"\n🔧 Step 8: Hyperparameter tuning for {best_name}...")
        tune_result = trainer.hyperparameter_tune(best_name, X, y)
        if tune_result:
            print(f"   Best params: {tune_result['best_params']}")
            print(f"   Best CV score: {tune_result['best_score']}%")
            model = tune_result['best_model']
            model.fit(X, y)  # Retrain on full data
            print(f"   ✅ Retrained with best params on full dataset")
    else:
        print("\n⏭️ Step 8: Skipping tuning (use --tune to enable)")
        tune_result = None

    # Wrap SVM for probability support
    if not supports_proba:
        print(f"\n   🔧 Calibrating {best_name} for probability support...")
        calibrated = CalibratedClassifierCV(model, cv=3)
        calibrated.fit(X_train, y_train)
        model = calibrated
        supports_proba = True

    # ── STEP 9: Test Queries ──
    print("\n🧪 Step 9: Testing with sample queries...")
    test_queries = [
        "tell me about pm kisan",
        "how to apply for schemes",
        "hi there",
        "schemes for farmers",
        "what documents do i need",
        "health insurance scheme",
        "loan for business",
        "pension for old age",
        "scholarship for students",
        "bye",
        "kaise apply kare",
        "mujhe yojana batao",
        "am i eligible for ayushman bharat",
        "list all women schemes",
        "mudra loan kya hai"
    ]

    print(f"\n   {'Query':<40} {'Intent':<20} {'Confidence':>12}")
    print(f"   {'─' * 75}")

    for query in test_queries:
        query_vec = vectorizer.transform([query.lower()])
        pred = model.predict(query_vec)[0]

        if supports_proba:
            confidence = max(model.predict_proba(query_vec)[0]) * 100
            conf_str = f"{confidence:.0f}%"
            conf_indicator = "🟢" if confidence > 70 else ("🟡" if confidence > 40 else "🔴")
        else:
            conf_str = "N/A"
            conf_indicator = "⚪"

        print(f"   {conf_indicator} '{query[:38]}'  →  {pred:<18} {conf_str:>10}")

    # ── STEP 10: Save Model ──
    print("\n💾 Step 10: Saving trained model...")

    model_data = {
        'model': model,
        'vectorizer': vectorizer,
        'intents': data['intents'],
        'metadata': {
            'model_type': best_name,
            'trained_at': datetime.now().isoformat(),
            'version': '3.0',
            'total_patterns': len(texts),
            'total_intents': len(set(labels)),
            'vocabulary_size': len(vectorizer.vocabulary_),
            'augmented': use_augmentation,
            'supports_proba': supports_proba,
            'dataset_quality': analysis['quality_score'],
            'training_accuracy': all_results[best_name].get('train_accuracy', 0),
            'test_accuracy': all_results[best_name].get('test_accuracy', 0),
            'cross_val_mean': cv_results['mean_accuracy'] if cv_results else None,
            'seed': RANDOM_SEED
        }
    }

    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trained_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)

    file_size = os.path.getsize(model_path) / 1024
    print(f"   ✅ Model saved: trained_model.pkl ({file_size:.1f} KB)")
    print(f"   📋 Model type: {best_name}")
    print(f"   📋 Version: 3.0")
    print(f"   📋 Patterns: {len(texts)}")
    print(f"   📋 Intents: {len(set(labels))}")

    # ── STEP 11: Generate Report (optional) ──
    if generate_report:
        print("\n📄 Step 11: Generating training report...")
        report = generate_training_report(
            analysis, all_results, cv_results, tune_result,
            model_data['metadata'], test_queries, vectorizer, model
        )
        report_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'training_report.json'
        )
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False, default=str)
        print(f"   ✅ Report saved: training_report.json")
    else:
        print("\n⏭️ Step 11: Skipping report (use --report to enable)")

    # ── DONE ──
    total_time = round(time.time() - pipeline_start, 2)
    print(f"\n{'=' * 60}")
    print(f"✅ TRAINING COMPLETE in {total_time}s")
    print(f"{'=' * 60}")
    print(f"\n   Model: {best_name}")
    print(f"   Accuracy: {all_results[best_name].get('test_accuracy', 'N/A')}%")
    print(f"   File: trained_model.pkl ({file_size:.1f} KB)")
    print(f"\n   Next: python app.py")
    print()


def generate_training_report(analysis, model_results, cv_results,
                              tune_result, metadata, test_queries,
                              vectorizer, model):
    """Generate comprehensive training report"""
    report = {
        'generated_at': datetime.now().isoformat(),
        'version': '3.0',
        'dataset_analysis': {
            'total_intents': analysis['total_intents'],
            'total_patterns': analysis['total_patterns'],
            'total_responses': analysis['total_responses'],
            'quality_score': analysis['quality_score'],
            'avg_patterns_per_intent': analysis['avg_patterns_per_intent'],
            'unique_words': analysis['unique_words'],
            'patterns_per_intent': analysis['patterns_per_intent'],
            'warnings': analysis['warnings'],
            'suggestions': analysis['suggestions']
        },
        'model_comparison': {},
        'cross_validation': cv_results,
        'hyperparameter_tuning': tune_result,
        'selected_model': metadata,
        'test_results': []
    }

    # Model comparison (sanitized - no model objects)
    for name, result in model_results.items():
        if 'error' in result:
            report['model_comparison'][name] = {'error': result['error']}
        else:
            report['model_comparison'][name] = {
                'train_accuracy': result.get('train_accuracy'),
                'test_accuracy': result.get('test_accuracy'),
                'test_f1': result.get('test_f1'),
                'test_precision': result.get('test_precision'),
                'test_recall': result.get('test_recall'),
                'overfit_gap': result.get('overfit_gap'),
                'train_time_ms': result.get('train_time_ms')
            }

    # Test query results
    for query in test_queries:
        query_vec = vectorizer.transform([query.lower()])
        pred = model.predict(query_vec)[0]
        try:
            confidence = float(max(model.predict_proba(query_vec)[0]) * 100)
        except Exception:
            confidence = None

        report['test_results'].append({
            'query': query,
            'predicted_intent': pred,
            'confidence': round(confidence, 1) if confidence else None
        })

    return report


# ──────────────────────────────────────────────────
# INTERACTIVE TESTING
# ──────────────────────────────────────────────────

def interactive_test():
    """Interactive testing mode for the trained model"""
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trained_model.pkl')

    if not os.path.exists(model_path):
        print("❌ No trained model found. Run training first:")
        print("   python train_model.py")
        return

    print("\n🧪 Loading trained model for testing...")

    with open(model_path, 'rb') as f:
        model_data = pickle.load(f)

    model = model_data['model']
    vectorizer = model_data['vectorizer']
    intents = model_data['intents']
    metadata = model_data.get('metadata', {})

    print(f"   Model: {metadata.get('model_type', 'unknown')}")
    print(f"   Version: {metadata.get('version', '?')}")
    print(f"   Trained: {metadata.get('trained_at', '?')}")
    print(f"   Intents: {metadata.get('total_intents', '?')}")

    intent_map = {intent['tag']: intent for intent in intents}

    print(f"\n{'=' * 50}")
    print("🤖 Interactive Test Mode")
    print("   Type messages to test intent classification")
    print("   Commands: 'quit', 'intents', 'stats', 'top5 <query>'")
    print(f"{'=' * 50}\n")

    test_count = 0
    high_confidence = 0

    while True:
        try:
            user_input = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break

        if not user_input:
            continue

        if user_input.lower() in ['quit', 'exit', 'q']:
            break

        if user_input.lower() == 'intents':
            print("\n📋 Available intents:")
            for tag in sorted(intent_map.keys()):
                patterns_count = len(intent_map[tag].get('patterns', []))
                responses_count = len(intent_map[tag].get('responses', []))
                print(f"   {tag}: {patterns_count} patterns, {responses_count} responses")
            print()
            continue

        if user_input.lower() == 'stats':
            print(f"\n📊 Testing stats:")
            print(f"   Tests run: {test_count}")
            print(f"   High confidence (>70%): {high_confidence}")
            rate = round(high_confidence / test_count * 100, 1) if test_count > 0 else 0
            print(f"   High confidence rate: {rate}%")
            print()
            continue

        if user_input.lower().startswith('top5 '):
            query = user_input[5:].strip()
            query_vec = vectorizer.transform([query.lower()])
            try:
                probas = model.predict_proba(query_vec)[0]
                classes = model.classes_
                top_indices = np.argsort(probas)[::-1][:5]
                print(f"\n   Top 5 intents for '{query}':")
                for i, idx in enumerate(top_indices, 1):
                    print(f"   {i}. {classes[idx]}: {probas[idx] * 100:.1f}%")
                print()
            except Exception:
                print("   Probability analysis not available for this model")
            continue

        # Normal prediction
        test_count += 1
        query_vec = vectorizer.transform([user_input.lower()])
        pred = model.predict(query_vec)[0]

        try:
            confidence = max(model.predict_proba(query_vec)[0]) * 100
            conf_indicator = "🟢" if confidence > 70 else ("🟡" if confidence > 40 else "🔴")

            if confidence > 70:
                high_confidence += 1
        except Exception:
            confidence = None
            conf_indicator = "⚪"

        print(f"\n   {conf_indicator} Intent: {pred}", end="")
        if confidence:
            print(f" ({confidence:.1f}%)")
        else:
            print()

        # Show sample response
        if pred in intent_map:
            responses = intent_map[pred].get('responses', [])
            if responses:
                sample = random.choice(responses)
                print(f"   💬 Sample: {sample[:100]}{'...' if len(sample) > 100 else ''}")
        print()

    print(f"\n👋 Testing complete. {test_count} queries tested.")


# ──────────────────────────────────────────────────
# CLI ENTRY POINT
# ──────────────────────────────────────────────────

if __name__ == '__main__':
    args = sys.argv[1:]

    compare = '--compare' in args or '-c' in args
    augment = '--augment' in args or '-a' in args
    tune = '--tune' in args or '-t' in args
    report = '--report' in args or '-r' in args
    test_mode = '--test' in args or '-i' in args
    full = '--full' in args or '-f' in args

    if test_mode:
        interactive_test()
    elif full:
        train_and_save(
            compare_models=True,
            use_augmentation=True,
            run_tuning=True,
            generate_report=True
        )
    else:
        if not any([compare, augment, tune, report]):
            print("\n💡 Available options:")
            print("   --compare  (-c)  Compare all model types")
            print("   --augment  (-a)  Use data augmentation")
            print("   --tune     (-t)  Hyperparameter tuning")
            print("   --report   (-r)  Generate training report")
            print("   --test     (-i)  Interactive testing mode")
            print("   --full     (-f)  Run everything")
            print("\n   Running default training...\n")

        train_and_save(
            compare_models=compare,
            use_augmentation=augment,
            run_tuning=tune,
            generate_report=report
        )
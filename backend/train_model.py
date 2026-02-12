"""
🧠 Train the Chatbot Model
Run this ONCE to train and save the model
Command: python train_model.py
"""

import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os
import random


def load_training_data():
    """Load chat dataset"""
    file_path = os.path.join(os.path.dirname(__file__), 'chat_dataset.json')
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def prepare_data(data):
    """Convert dataset into training format"""
    texts = []     
    labels = []     

    for intent in data['intents']:
        tag = intent['tag']
        for pattern in intent['patterns']:
            texts.append(pattern.lower().strip())
            labels.append(tag)

    return texts, labels


def train_and_save():
    """Train the model and save it"""
    print("=" * 50)
    print("🧠 GovScheme AI - Model Training")
    print("=" * 50)

    print("\n📂 Loading training data...")
    data = load_training_data()
    texts, labels = prepare_data(data)
    print(f"   ✅ Loaded {len(texts)} training samples")
    print(f"   ✅ Found {len(set(labels))} intent categories")

    print("\n🔤 Creating TF-IDF vectors...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),    
        stop_words='english',
        lowercase=True
    )
    X = vectorizer.fit_transform(texts)
    print(f"   ✅ Vocabulary size: {len(vectorizer.vocabulary_)}")

    print("\n🏋️ Training Logistic Regression model...")
    model = LogisticRegression(
        max_iter=1000,
        random_state=42,
        C=10,
        multi_class='multinomial'
    )
    model.fit(X, labels)

    print("\n📊 Evaluating model...")
    predictions = model.predict(X)
    accuracy = accuracy_score(labels, predictions)
    print(f"   ✅ Training Accuracy: {accuracy * 100:.1f}%")

    print("\n🧪 Testing with sample queries:")
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
        "bye"
    ]

    for query in test_queries:
        query_vec = vectorizer.transform([query.lower()])
        pred = model.predict(query_vec)[0]
        confidence = max(model.predict_proba(query_vec)[0]) * 100
        print(f"   '{query}' → {pred} ({confidence:.0f}%)")

    print("\n💾 Saving trained model...")
    model_data = {
        'model': model,
        'vectorizer': vectorizer,
        'intents': data['intents']
    }

    model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_data, f)

    file_size = os.path.getsize(model_path) / 1024
    print(f"   ✅ Model saved to: trained_model.pkl ({file_size:.1f} KB)")

    print("\n" + "=" * 50)
    print("✅ TRAINING COMPLETE! Model is ready to use.")
    print("=" * 50)
    print("\nNow run: python app.py")


if __name__ == '__main__':
    train_and_save()
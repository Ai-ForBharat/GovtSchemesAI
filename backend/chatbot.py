"""
🤖 Local Chatbot - Uses trained scikit-learn model
NO API KEY NEEDED - Runs 100% on your laptop
"""

import pickle
import os
import random


class GovSchemeBot:
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.intents = []
        self.is_ready = False
        self.load_model()

    def load_model(self):
        """Load the trained model from .pkl file"""
        model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')

        if not os.path.exists(model_path):
            print("⚠️  trained_model.pkl not found!")
            print("   Run: python train_model.py")
            print("   Chatbot will use basic fallback mode.\n")
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
        """Get chatbot response for user query"""
        if not user_message.strip():
            return "Please type your question about government schemes."

        if self.is_ready:
            response = self._predict_response(user_message, context)
        else:
            response = self._fallback_response(user_message)

        if language != 'en':
            try:
                from utils import translate_text
                response = translate_text(response, language)
            except Exception:
                pass

        return response

    def _predict_response(self, message, context):
        """Use trained model to predict intent and return response"""

        
        message_vec = self.vectorizer.transform([message.lower().strip()])

        
        predicted_tag = self.model.predict(message_vec)[0]
        confidence = max(self.model.predict_proba(message_vec)[0])

        print(f"   🤖 Query: '{message}' → Intent: {predicted_tag} ({confidence:.0%})")

        
        if confidence < 0.3:
            return self._low_confidence_response(context)

        
        for intent in self.intents:
            if intent['tag'] == predicted_tag:
                response = random.choice(intent['responses'])

                
                if context and predicted_tag == 'eligibility':
                    response += self._add_context_info(context)

                return response

        return self._fallback_response(message)

    def _low_confidence_response(self, context):
        """When model isn't confident enough"""
        response = "I'm not sure about that specific query. "
        response += "Here's what I can help with:\n\n"
        response += "• Ask about specific schemes (PM-KISAN, Ayushman Bharat, etc.)\n"
        response += "• Schemes for farmers, women, students, SC/ST\n"
        response += "• How to apply for schemes\n"
        response += "• Documents required\n"
        response += "• Pension and insurance schemes\n\n"
        response += "Or fill the form above for personalized recommendations! 😊"
        return response

    def _add_context_info(self, context):
        """Add personalized info based on user profile"""
        info = "\n\n📊 Based on your profile:\n"
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

        if context.get('category') in ['sc', 'st']:
            info += "📝 SC/ST schemes: Stand Up India, special scholarships\n"
            added = True

        return info if added else ""

    def _fallback_response(self, message):
        """Basic keyword fallback when model not available"""
        message_lower = message.lower()

        if any(w in message_lower for w in ['hi', 'hello', 'hey', 'namaste']):
            return "Namaste! 🙏 I'm GovScheme AI. Ask me about government schemes!"

        if any(w in message_lower for w in ['bye', 'goodbye', 'thanks']):
            return "Thank you for using GovScheme AI! Visit official websites to apply. 🙏"

        if any(w in message_lower for w in ['kisan', 'farmer', 'farming']):
            return "For farmers: PM-KISAN gives Rs.6,000/year. PM Fasal Bima provides crop insurance. Fill the form for all matching schemes!"

        if any(w in message_lower for w in ['apply', 'how to']):
            return "Apply through: 1) Official website 2) Nearest CSC Center 3) Bank 4) UMANG App. Keep Aadhaar and bank details ready!"

        if any(w in message_lower for w in ['document', 'papers']):
            return "Common documents: Aadhaar Card, Income Certificate, Caste Certificate, Bank Passbook, Photos. Get certificates from Tehsil office."

        if any(w in message_lower for w in ['health', 'ayushman', 'hospital']):
            return "Ayushman Bharat: Rs.5 Lakh free health cover for BPL families. Call 14555 or visit pmjay.gov.in"

        if any(w in message_lower for w in ['loan', 'mudra', 'business']):
            return "PM Mudra Yojana: Business loans up to Rs.10 Lakh without collateral. Apply at any bank branch."

        if any(w in message_lower for w in ['pension', 'old age', 'retire']):
            return "Atal Pension Yojana: Rs.1,000-5,000/month pension after age 60. Join at any bank (age 18-40)."

        if any(w in message_lower for w in ['scholarship', 'student', 'education']):
            return "National Scholarship Portal: Free education for SC/ST/OBC students. Apply at scholarships.gov.in"

        return "I can help with government schemes! Try asking about:\n• PM-KISAN, Ayushman Bharat, Mudra Loan\n• Schemes for farmers/women/students\n• How to apply\n• Documents needed\n\nOr fill the form above! 😊"



if __name__ == '__main__':
    bot = GovSchemeBot()
    print("\n🤖 Chatbot Test Mode (type 'quit' to exit)\n")
    while True:
        user_input = input("You: ").strip()
        if user_input.lower() in ['quit', 'exit', 'q']:
            break
        response = bot.get_response(user_input)
        print(f"Bot: {response}\n")
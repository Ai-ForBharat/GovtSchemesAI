# Saarthi AI – Requirements Document

**Project Name:** Saarthi AI – Government Scheme Guidance Assistant  
**Team:** TECHTONICS  
**Version:** 1.0  
**Date:** February 15, 2026  

---

# 1. Introduction

Saarthi AI is a multilingual AI-powered platform designed to help citizens discover government schemes, verify eligibility, and understand application procedures in a simple, personalized way. The system bridges the gap between complex government scheme data and citizens by providing intelligent recommendations, explanations, and next steps.

---

# 2. Problem Statement

India has thousands of central and state welfare schemes, but:

- Information is fragmented across multiple portals  
- Eligibility rules are complex and difficult to interpret  
- Citizens lack personalized guidance  
- Language barriers limit accessibility  
- Many beneficiaries rely on intermediaries  
- Large numbers of eligible citizens remain unaware  

Saarthi AI addresses these issues by providing AI-driven personalized scheme discovery and guidance.

---

# 3. Objectives

- Improve accessibility to welfare programs  
- Provide personalized scheme recommendations  
- Simplify eligibility explanations  
- Enable multilingual interaction  
- Reduce dependency on middlemen  
- Provide a single trusted platform for scheme guidance  

---

# 4. Stakeholders

## Primary Users
- Citizens seeking government benefits
- Rural and semi-urban communities
- Students, farmers, workers, and small entrepreneurs

## Secondary Users
- Government agencies
- NGOs and welfare organizations
- Policy researchers

## System Administrators
- Platform managers
- Scheme database maintainers
- Content verifiers

---

# 5. User Roles

### Citizen
- Enter personal details
- Ask queries in natural language
- View eligible schemes
- Receive guidance and document checklist

### Admin
- Add and update scheme data
- Maintain eligibility rules
- Monitor system performance

---

# 6. Functional Requirements

## 6.1 User Profile Handling
- System must allow users to enter:
  - Age
  - Income
  - Occupation
  - Category
  - Location
- System must validate and store profile data securely.

## 6.2 Scheme Recommendation Engine
- System must match schemes to user profiles.
- System must filter schemes using eligibility rules.
- System must rank schemes using relevance scoring.
- System must provide top recommended schemes.

## 6.3 Eligibility Verification
- System must check eligibility instantly.
- System must explain why user qualifies or does not qualify.
- System must highlight missing criteria if any.

## 6.4 Conversational Chatbot
- System must accept natural language questions.
- System must detect user intent.
- System must provide conversational responses.
- System must answer scheme-related questions.

## 6.5 Multilingual Support
- System must support multiple Indian languages.
- System must translate user queries to system language.
- System must generate responses in user-selected language.

## 6.6 Scheme Guidance Module
- System must show:
  - Benefits of scheme
  - Eligibility conditions
  - Required documents
  - Application steps
- System must provide verified official portal links.

## 6.7 Scheme Explorer
- Users must be able to browse schemes manually.
- System must allow search by keyword, category, or sector.

## 6.8 Admin Panel
- Admin must be able to add schemes.
- Admin must update eligibility rules.
- Admin must delete outdated schemes.
- Admin must monitor system usage.

---

# 7. Non-Functional Requirements

## Performance
- Response time for recommendations < 3 seconds
- System must handle concurrent users
- Chatbot response time < 2 seconds

## Scalability
- Must support addition of new schemes easily
- Must allow new language integration
- Must support national-scale deployment

## Reliability
- System uptime target: 99%
- Data backup must be automated
- System must handle API failures gracefully

## Security
- User data must be encrypted
- Secure authentication required for admin access
- Government data sources must be verified
- HTTPS must be enforced

## Usability
- Interface must be mobile-first
- Must support low digital literacy users
- Must provide simple language explanations

---

# 8. Constraints

- Scheme data must remain accurate and verified
- Integration depends on availability of government datasets
- Language translation accuracy may vary
- System performance may depend on server resources

---

# 9. Success Metrics

- Increase in scheme discovery rate
- Reduction in time taken to find eligible schemes
- User satisfaction score
- Chatbot accuracy rate
- Number of successful applications guided

---

# 10. Future Scope

- Voice-based assistant support
- Offline SMS-based interaction
- Integration with DigiLocker for documents
- Direct application submission support
- AI-powered fraud detection for scheme misuse
- Integration with state and central APIs

---

# 11. Conclusion

Saarthi AI aims to transform how citizens access welfare programs by converting complex scheme data into personalized, multilingual, and actionable guidance. The system supports scalable deployment and future integration with public digital infrastructure, making it suitable for nationwide impact.

---

**Document Version:** 1.0  
**Last Updated:** February 15, 2026

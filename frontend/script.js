
const API_BASE = 'http://localhost:5000';
let currentLanguage = 'en';
let allResults = [];
let userFormData = {};

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand",
    "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Puducherry", "Chandigarh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
];
document.addEventListener('DOMContentLoaded', () => {
    populateStates();
    console.log('🏛️ GovScheme AI Loaded');
});

function populateStates() {
    const stateSelect = document.getElementById('state');
    INDIAN_STATES.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
    });
}

function changeLanguage(lang) {
    currentLanguage = lang;
    console.log(`🌐 Language changed to: ${lang}`);
}

function scrollToForm() {
    document.getElementById('formSection').scrollIntoView({
        behavior: 'smooth'
    });
}

function nextStep(step) {
    if (step === 2 && !validateStep1()) return;
    if (step === 3 && !validateStep2()) return;

    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));

    document.getElementById(`step${step}`).classList.remove('hidden');

    updateProgress(step);
}

function prevStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(`step${step}`).classList.remove('hidden');
    updateProgress(step);
}

function updateProgress(currentStep) {
    document.querySelectorAll('.progress-bar .step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');

        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });
}

function validateStep1() {
    const name = document.getElementById('name').value.trim();
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const state = document.getElementById('state').value;
    const category = document.getElementById('category').value;

    if (!name || !age || !gender || !state || !category) {
        showAlert('Please fill all fields in this step');
        return false;
    }

    if (age < 0 || age > 120) {
        showAlert('Please enter a valid age');
        return false;
    }

    return true;
}

function validateStep2() {
    const income = document.getElementById('annual_income').value;
    const occupation = document.getElementById('occupation').value;

    if (!income || !occupation) {
        showAlert('Please fill income and occupation');
        return false;
    }

    return true;
}

function showAlert(message) {
    alert(message); 
}

async function submitForm(event) {
    event.preventDefault();

    userFormData = {
        name: document.getElementById('name').value.trim(),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        state: document.getElementById('state').value,
        category: document.getElementById('category').value,
        annual_income: parseInt(document.getElementById('annual_income').value),
        occupation: document.getElementById('occupation').value,
        education: document.getElementById('education').value,
        marital_status: document.getElementById('marital_status').value,
        is_bpl: document.getElementById('is_bpl').checked,
        is_farmer: document.getElementById('is_farmer').checked,
        is_student: document.getElementById('is_student').checked,
        disability: document.getElementById('disability').checked,
        is_minority: document.getElementById('is_minority').checked,
        language: currentLanguage
    };

    console.log('📤 Sending user data:', userFormData);

    document.getElementById('formSection').classList.add('hidden');
    document.getElementById('heroSection').classList.add('hidden');
    document.getElementById('loadingSection').classList.remove('hidden');

    try {
        const response = await fetch(`${API_BASE}/api/recommend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userFormData)
        });

        const data = await response.json();
        console.log('📥 Received:', data);

        if (data.success) {
            allResults = data.schemes;
            displayResults(data.schemes, data.total_matches);
        } else {
            throw new Error(data.error || 'Something went wrong');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        showAlert('Error connecting to server. Make sure backend is running on port 5000.');

        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('heroSection').classList.remove('hidden');
        document.getElementById('formSection').classList.remove('hidden');
    }
}

function displayResults(schemes, totalCount) {
    document.getElementById('loadingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');

    document.getElementById('resultsCount').textContent =
        `Found ${totalCount} schemes matching your profile`;

    renderSchemeCards(schemes);

    document.getElementById('resultsSection').scrollIntoView({
        behavior: 'smooth'
    });
}

function renderSchemeCards(schemes) {
    const grid = document.getElementById('schemesGrid');
    grid.innerHTML = '';

    if (schemes.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="color: var(--text-light);">😔 No matching schemes found</h3>
                <p style="color: var(--text-light);">Try adjusting your details or browse all schemes</p>
            </div>
        `;
        return;
    }

    schemes.forEach((scheme, index) => {
        const card = createSchemeCard(scheme, index);
        grid.appendChild(card);
    });
}

function createSchemeCard(scheme, index) {
    const div = document.createElement('div');
    div.className = 'scheme-card';
    div.setAttribute('data-type', scheme.type);

    const score = scheme.match_score || 0;
    let scoreClass = 'match-low';
    if (score >= 80) scoreClass = 'match-high';
    else if (score >= 60) scoreClass = 'match-medium';

    const typeBadge = scheme.type === 'central' ? 'badge-central' : 'badge-state';
    const typeLabel = scheme.type === 'central' ? '🇮🇳 Central' : '🏛️ State';

    div.innerHTML = `
        <div class="card-top">
            <span class="scheme-type-badge ${typeBadge}">${typeLabel}</span>
            <div class="match-circle ${scoreClass}">
                ${score}%
                <small>match</small>
            </div>
        </div>
        <h3>${scheme.name}</h3>
        <p class="description">${scheme.description}</p>
        <div class="scheme-benefits">
            <strong>💰 Benefits:</strong> ${scheme.benefits}
        </div>
        <div class="card-bottom">
            <span class="category-tag">${formatCategory(scheme.category)}</span>
            <button class="card-btn" onclick='openModal(${JSON.stringify(scheme).replace(/'/g, "\\'")})'>
                View Details →
            </button>
        </div>
    `;

    div.style.animationDelay = `${index * 0.1}s`;

    return div;
}

function formatCategory(cat) {
    if (!cat) return 'General';
    return cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function filterResults(type) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let filtered = allResults;
    if (type !== 'all') {
        filtered = allResults.filter(s => s.type === type);
    }
    renderSchemeCards(filtered);
}

function openModal(scheme) {
    const modal = document.getElementById('schemeModal');
    const content = document.getElementById('modalContent');

    const documentsHtml = scheme.documents
        ? scheme.documents.map(doc => `<li>${doc}</li>`).join('')
        : '<li>Check official website for details</li>';

    content.innerHTML = `
        <span class="scheme-type-badge ${scheme.type === 'central' ? 'badge-central' : 'badge-state'}"
              style="margin-bottom: 15px; display: inline-block;">
            ${scheme.type === 'central' ? '🇮🇳 Central Government' : '🏛️ State Government'}
        </span>

        <h2>${scheme.name}</h2>
        ${scheme.name_en ? `<p style="color:var(--text-light); font-size:13px; margin-bottom:15px;">(${scheme.name_en})</p>` : ''}

        <div class="modal-section">
            <h4><i class="fas fa-info-circle" style="color: var(--primary)"></i> Description</h4>
            <p>${scheme.description}</p>
        </div>

        <div class="modal-section">
            <h4><i class="fas fa-gift" style="color: var(--success)"></i> Benefits</h4>
            <p>${scheme.benefits}</p>
        </div>

        <div class="modal-section">
            <h4><i class="fas fa-building" style="color: var(--secondary)"></i> Ministry/Department</h4>
            <p>${scheme.ministry || 'Government of India'}</p>
        </div>

        <div class="modal-section">
            <h4><i class="fas fa-file-alt" style="color: var(--warning)"></i> Documents Required</h4>
            <ul>${documentsHtml}</ul>
        </div>

        <div class="modal-section">
            <h4><i class="fas fa-clipboard-list" style="color: var(--primary)"></i> How to Apply</h4>
            <p>${scheme.how_to_apply || 'Visit official website'}</p>
        </div>

        <div class="modal-section">
            <h4><i class="fas fa-chart-bar" style="color: var(--success)"></i> Your Match Score</h4>
            <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                <div style="flex:1; height:12px; background:#e2e8f0; border-radius:10px; overflow:hidden;">
                    <div style="width:${scheme.match_score}%; height:100%; background: ${scheme.match_score >= 80 ? 'var(--success)' : scheme.match_score >= 60 ? 'var(--warning)' : 'var(--danger)'}; border-radius:10px;"></div>
                </div>
                <strong style="font-size:18px;">${scheme.match_score}%</strong>
            </div>
        </div>

        <a href="${scheme.apply_link || '#'}" target="_blank" class="apply-btn">
            <i class="fas fa-external-link-alt"></i> Apply Now on Official Website
        </a>
    `;

    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('schemeModal').classList.add('hidden');
}

document.getElementById('schemeModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('schemeModal')) {
        closeModal();
    }
});

function resetForm() {
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('heroSection').classList.remove('hidden');
    document.getElementById('formSection').classList.remove('hidden');

    document.querySelectorAll('.form-step').forEach(s => s.classList.add('hidden'));
    document.getElementById('step1').classList.remove('hidden');
    updateProgress(1);

    document.getElementById('userForm').reset();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.classList.toggle('hidden');
}

async function sendChat() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    const typingId = addChatMessage('Thinking... 🤔', 'bot');

    try {
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                language: currentLanguage,
                context: userFormData
            })
        });

        const data = await response.json();

        document.getElementById(typingId)?.remove();

        addChatMessage(data.response || 'Sorry, I could not process that.', 'bot');

    } catch (error) {
        document.getElementById(typingId)?.remove();
        addChatMessage('Sorry, I am having trouble connecting. Please try again.', 'bot');
    }
}

function addChatMessage(text, sender) {
    const messagesDiv = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    const msgId = 'msg-' + Date.now();
    msgDiv.id = msgId;
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = `<p>${text}</p>`;
    messagesDiv.appendChild(msgDiv);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return msgId;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        document.getElementById('chatWindow')?.classList.add('hidden');
    }
});
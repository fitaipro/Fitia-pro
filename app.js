/* ============================================================
   FitAI Pro — app.js
   Gestion : formulaire multi-étapes, IA, auth, dashboard
   ============================================================ */

/* ─── NAVBAR SCROLL ─── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

/* ─── SCROLL TO GENERATOR ─── */
function scrollToGenerator() {
  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
}

/* ─── FORM STEPS ─── */
let currentStep = 1;

function goToStep(n) {
  // Validation step 1
  if (n > 1 && currentStep === 1) {
    const age = document.getElementById('age')?.value;
    if (!age || age < 16 || age > 70) {
      alert('Veuillez entrer un âge valide (16–70 ans).');
      return;
    }
  }
  ['step', 'dot'].forEach(prefix => {
    document.getElementById(`${prefix}-${currentStep}`)?.classList.remove('active');
  });
  document.getElementById(`dot-${currentStep}`)?.classList.add('done');
  currentStep = n;
  document.getElementById(`step-${currentStep}`)?.classList.add('active');
  const dot = document.getElementById(`dot-${currentStep}`);
  if (dot) { dot.classList.add('active'); dot.classList.remove('done'); }
  const label = document.getElementById('step-label-num');
  if (label) label.textContent = currentStep;
  document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectOpt(el, groupId) {
  document.querySelectorAll(`#${groupId} .opt-card`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

/* ─── COLLECT FORM DATA ─── */
function collectFormData() {
  return {
    sexe:       document.getElementById('sexe')?.value || 'homme',
    age:        document.getElementById('age')?.value || '30',
    poids:      document.getElementById('poids')?.value || '75',
    taille:     document.getElementById('taille')?.value || '175',
    objectif:   document.querySelector('input[name="objectif"]:checked')?.value || 'prise de masse musculaire',
    niveau:     document.querySelector('input[name="niveau"]:checked')?.value || 'intermédiaire',
    frequence:  document.getElementById('frequence')?.value || '4',
    duree:      document.getElementById('duree')?.value || '60',
    moment:     document.getElementById('moment')?.value || 'soir',
    equipement: document.getElementById('equipement')?.value || 'salle complète',
    morpho:     document.getElementById('morpho')?.value || 'mésomorphe',
    modevi:     document.getElementById('modevi')?.value || 'sédentaire',
    blessures:  document.getElementById('blessures')?.value || 'aucune',
    extra:      document.getElementById('extra')?.value || ''
  };
}

/* ─── BUILD PROMPT ─── */
function buildPrompt(d) {
  return `Tu es un coach sportif expert en musculation et nutrition.
Génère un programme d'entraînement COMPLET, DÉTAILLÉ et PERSONNALISÉ.

PROFIL :
- Sexe : ${d.sexe} | Âge : ${d.age} ans | Poids : ${d.poids} kg | Taille : ${d.taille} cm
- Morphologie : ${d.morpho} | Mode de vie : ${d.modevi} | Niveau : ${d.niveau}
- Objectif : ${d.objectif}

PLANNING :
- Fréquence : ${d.frequence} jours/semaine | Durée : ${d.duree} min | Moment : ${d.moment}
- Équipement : ${d.equipement}

CONTRAINTES :
- Blessures : ${d.blessures}
- Infos sup : ${d.extra || 'aucune'}

GÉNÈRE un programme structuré avec ces sections exactes :
🎯 ANALYSE DU PROFIL
📅 STRUCTURE HEBDOMADAIRE (jours + groupes musculaires)
🏋️ SÉANCES DÉTAILLÉES (chaque jour : exercices, séries x reps, repos)
🍽️ NUTRITION (calories, macros, 4 repas types)
💊 TOP 3 SUPPLÉMENTS (avec dosage)
📈 PROGRESSION 12 SEMAINES (3 phases)
⚠️ CONSEILS SPÉCIFIQUES

Sois concret avec de vrais chiffres. Style direct et motivant.`;
}

/* ─── LOADING ANIMATION ─── */
let loadingInterval;
function startLoadingAnimation() {
  const ids = ['ls1','ls2','ls3','ls4','ls5'];
  let i = 0;
  ids.forEach(id => document.getElementById(id)?.classList.remove('active','done'));
  document.getElementById(ids[0])?.classList.add('active');
  i = 1;
  loadingInterval = setInterval(() => {
    if (i > 0) {
      document.getElementById(ids[i-1])?.classList.remove('active');
      document.getElementById(ids[i-1])?.classList.add('done');
    }
    if (i < ids.length) {
      document.getElementById(ids[i])?.classList.add('active');
      i++;
    } else clearInterval(loadingInterval);
  }, 800);
}

/* ─── TYPEWRITER EFFECT ─── */
function typeWriter(text, el, speed = 8) {
  el.textContent = '';
  el.classList.add('typing');
  let i = 0;
  const interval = setInterval(() => {
    el.textContent += text.slice(i, i + 4);
    el.scrollTop = el.scrollHeight;
    i += 4;
    if (i >= text.length) {
      el.textContent = text;
      el.classList.remove('typing');
      clearInterval(interval);
    }
  }, speed);
}

/* ─── GENERATE PROGRAM ─── */
async function generateProgram() {
  const data = collectFormData();

  // Show/hide sections
  document.getElementById('form-container').style.display = 'none';
  document.getElementById('result-screen').style.display = 'none';
  const loadingEl = document.getElementById('loading-screen');
  loadingEl.style.display = 'flex';
  startLoadingAnimation();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildPrompt(data), userData: data })
    });

    clearInterval(loadingInterval);
    loadingEl.style.display = 'none';

    if (!response.ok) throw new Error('Erreur API');
    const result = await response.json();
    const text = result.text || 'Erreur lors de la génération.';

    // Save to localStorage
    const programs = JSON.parse(localStorage.getItem('fitai_programs') || '[]');
    programs.unshift({
      id: Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      objectif: data.objectif,
      niveau: data.niveau,
      text
    });
    localStorage.setItem('fitai_programs', JSON.stringify(programs.slice(0, 20)));

    // Show result
    document.getElementById('result-screen').style.display = 'block';
    typeWriter(text, document.getElementById('ai-output'));

  } catch (err) {
    clearInterval(loadingInterval);
    loadingEl.style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('ai-output').classList.remove('typing');
    document.getElementById('ai-output').textContent =
      '❌ Erreur de connexion. Vérifie ta connexion internet et réessaie.';
  }
}

/* ─── DOWNLOAD PLAN ─── */
function downloadPlan() {
  const text = document.getElementById('ai-output')?.textContent;
  if (!text) return;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitai-programme-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── RESTART FORM ─── */
function restartForm() {
  document.getElementById('result-screen').style.display = 'none';
  document.getElementById('form-container').style.display = 'block';
  currentStep = 1;
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`step-${i}`)?.classList.remove('active');
    const dot = document.getElementById(`dot-${i}`);
    if (dot) dot.classList.remove('active','done');
  }
  document.getElementById('step-1')?.classList.add('active');
  document.getElementById('dot-1')?.classList.add('active');
  const lbl = document.getElementById('step-label-num');
  if (lbl) lbl.textContent = '1';
}

/* ─── SIMPLE AUTH (localStorage) ─── */
const Auth = {
  KEY: 'fitai_user',

  register(name, email, password, plan = 'free') {
    const users = JSON.parse(localStorage.getItem('fitai_users') || '[]');
    if (users.find(u => u.email === email)) return { error: 'Email déjà utilisé.' };
    const user = { id: Date.now(), name, email, password: btoa(password), plan, createdAt: new Date().toISOString() };
    users.push(user);
    localStorage.setItem('fitai_users', JSON.stringify(users));
    this.setSession(user);
    return { user };
  },

  login(email, password) {
    const users = JSON.parse(localStorage.getItem('fitai_users') || '[]');
    const user = users.find(u => u.email === email && u.password === btoa(password));
    if (!user) return { error: 'Email ou mot de passe incorrect.' };
    this.setSession(user);
    return { user };
  },

  logout() {
    localStorage.removeItem(this.KEY);
    window.location.href = 'index.html';
  },

  setSession(user) {
    const session = { ...user };
    delete session.password;
    localStorage.setItem(this.KEY, JSON.stringify(session));
  },

  getUser() {
    try { return JSON.parse(localStorage.getItem(this.KEY)); } catch { return null; }
  },

  isLoggedIn() { return !!this.getUser(); }
};

/* ─── LOGIN PAGE ─── */
function handleLogin(e) {
  e?.preventDefault();
  const email    = document.getElementById('login-email')?.value;
  const password = document.getElementById('login-password')?.value;
  const errEl    = document.getElementById('login-error');

  if (!email || !password) { showError(errEl, 'Remplis tous les champs.'); return; }
  const result = Auth.login(email, password);
  if (result.error) { showError(errEl, result.error); return; }
  window.location.href = 'dashboard.html';
}

/* ─── SIGNUP PAGE ─── */
function handleSignup(e) {
  e?.preventDefault();
  const name     = document.getElementById('signup-name')?.value;
  const email    = document.getElementById('signup-email')?.value;
  const password = document.getElementById('signup-password')?.value;
  const errEl    = document.getElementById('signup-error');

  if (!name || !email || !password) { showError(errEl, 'Remplis tous les champs.'); return; }
  if (password.length < 6) { showError(errEl, 'Mot de passe trop court (6 caractères min).'); return; }

  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'free';
  const result = Auth.register(name, email, password, plan);
  if (result.error) { showError(errEl, result.error); return; }

  if (plan === 'pro') {
    window.location.href = 'checkout.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

/* ─── DASHBOARD ─── */
function loadDashboard() {
  const user = Auth.getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  document.getElementById('dash-user-name').textContent = user.name;
  document.getElementById('dash-plan').textContent = user.plan === 'pro' ? '⭐ Pro' : 'Starter';

  const programs = JSON.parse(localStorage.getItem('fitai_programs') || '[]');
  document.getElementById('dash-programs-count').textContent = programs.length;
  document.getElementById('dash-plan-stat').textContent = user.plan === 'pro' ? 'Pro' : 'Starter';

  const listEl = document.getElementById('program-list');
  if (!listEl) return;

  if (programs.length === 0) {
    listEl.innerHTML = `<div class="empty-state"><p>Tu n'as pas encore de programme.</p><button class="btn-generate" onclick="window.location.href='index.html#generator'">⚡ Générer mon premier plan</button></div>`;
    return;
  }

  listEl.innerHTML = programs.map((p, i) => `
    <div class="program-card">
      <div>
        <div class="program-card-title">${capitalize(p.objectif)}</div>
        <div class="program-card-meta">Niveau : ${p.niveau} · Créé le ${p.date}</div>
      </div>
      <div class="program-card-actions">
        <button class="btn-sm primary" onclick="viewProgram(${i})">Voir</button>
        <button class="btn-sm ghost" onclick="downloadProgram(${i})">📥</button>
        <button class="btn-sm ghost" onclick="deleteProgram(${i})" style="color:#ff4778">🗑️</button>
      </div>
    </div>`).join('');
}

function viewProgram(i) {
  const programs = JSON.parse(localStorage.getItem('fitai_programs') || '[]');
  const p = programs[i];
  if (!p) return;
  const modal = document.getElementById('program-modal');
  if (modal) {
    document.getElementById('modal-content').textContent = p.text;
    modal.style.display = 'flex';
  }
}

function closeModal() {
  document.getElementById('program-modal').style.display = 'none';
}

function downloadProgram(i) {
  const programs = JSON.parse(localStorage.getItem('fitai_programs') || '[]');
  const p = programs[i];
  if (!p) return;
  const blob = new Blob([p.text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `fitai-${p.objectif}-${p.date}.txt`; a.click();
  URL.revokeObjectURL(url);
}

function deleteProgram(i) {
  if (!confirm('Supprimer ce programme ?')) return;
  const programs = JSON.parse(localStorage.getItem('fitai_programs') || '[]');
  programs.splice(i, 1);
  localStorage.setItem('fitai_programs', JSON.stringify(programs));
  loadDashboard();
}

/* ─── UTILS ─── */
function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 4000);
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

/* ─── AUTO INIT ─── */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();
  if (page === 'dashboard.html') loadDashboard();
  if (page === 'login.html' && Auth.isLoggedIn()) window.location.href = 'dashboard.html';
});

# 🚀 GUIDE COMPLET — LANCER FITAI PRO
## De zéro à un business en ligne en moins d'1 heure

---

## 📁 STRUCTURE DES FICHIERS

```
fitai/
├── index.html          ← Page d'accueil + générateur
├── login.html          ← Page de connexion
├── signup.html         ← Inscription
├── dashboard.html      ← Espace utilisateur
├── style.css           ← Tous les styles
├── app.js              ← Logique JavaScript
├── api/
│   └── generate.js     ← Fonction serveur (clé API sécurisée)
├── vercel.json         ← Configuration hébergement
└── package.json        ← Dépendances
```

---

## ✅ ÉTAPE 1 — PRÉREQUIS (10 min)

### Créer les comptes nécessaires (tous GRATUITS) :

1. **GitHub** → https://github.com
   - Clique "Sign Up", crée ton compte
   - C'est là où ton code sera stocké

2. **Vercel** → https://vercel.com
   - Clique "Sign Up with GitHub"
   - Vercel héberge ton site gratuitement

3. **Anthropic** → https://console.anthropic.com
   - Crée un compte pour obtenir la clé API
   - Va dans "API Keys" → "Create Key"
   - **Copie la clé** (commence par `sk-ant-...`)
   - ⚠️ La clé n'est visible qu'une seule fois — sauvegarde-la

---

## ✅ ÉTAPE 2 — METTRE LE CODE EN LIGNE (15 min)

### Option A — Via l'interface GitHub (plus simple) :

1. Va sur **github.com** → clique **"New repository"**
2. Nom : `fitai-pro` | Visibilité : **Public** | Clique **Create**
3. Sur la page du repo, clique **"uploading an existing file"**
4. **Glisse-dépose TOUS les fichiers** du dossier `fitai/`
   (index.html, style.css, app.js, signup.html, login.html, dashboard.html, vercel.json, package.json + le dossier api/)
5. Écris un message : `Premier commit` → Clique **Commit changes**

### Option B — Via le terminal (si tu l'as) :
```bash
cd fitai
git init
git add .
git commit -m "Premier commit FitAI Pro"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/fitai-pro.git
git push -u origin main
```

---

## ✅ ÉTAPE 3 — DÉPLOYER SUR VERCEL (5 min)

1. Va sur **vercel.com** → clique **"Add New Project"**
2. Clique **"Import Git Repository"** → sélectionne `fitai-pro`
3. Vercel détecte automatiquement la configuration
4. **NE DÉPLOIE PAS ENCORE** — il faut d'abord ajouter la clé API

### Ajouter la clé API Claude :
1. Dans Vercel, va dans ton projet → **Settings** → **Environment Variables**
2. Clique **Add New** :
   - Name : `ANTHROPIC_API_KEY`
   - Value : `sk-ant-XXXXXXXX...` (ta clé copiée depuis Anthropic)
   - Environment : **Production, Preview, Development**
3. Clique **Save**
4. Maintenant clique **Deploy** (ou Redeploy si déjà déployé)

### Résultat :
✅ Ton site est en ligne sur `https://fitai-pro.vercel.app` (ou un nom similaire)

---

## ✅ ÉTAPE 4 — AJOUTER UN VRAI DOMAINE (optionnel, 10 min)

### Acheter un nom de domaine (~10€/an) :
- **Namecheap** → namecheap.com (recommandé, pas cher)
- **OVH** → ovh.com (option française)
- Cherche : `fitaipro.fr` ou `moncoachfit.com` ou `programmefit.fr`

### Connecter à Vercel :
1. Vercel → ton projet → **Settings → Domains**
2. Écris ton domaine → **Add**
3. Vercel te donne 2 enregistrements DNS à copier
4. Va chez Namecheap → **Domain List → Manage → Advanced DNS**
5. Ajoute les enregistrements donnés par Vercel
6. Attends 5–30 min → ton domaine est actif avec HTTPS automatique ✅

---

## ✅ ÉTAPE 5 — INTÉGRER STRIPE (PAIEMENTS) (20 min)

### Créer le compte Stripe :
1. Va sur **stripe.com** → Créer un compte
2. Remplis les infos de ton entreprise (ou particulier)
3. Mode **Test** d'abord pour valider, puis **Live** pour recevoir de l'argent

### Créer les produits dans Stripe :
1. Dashboard Stripe → **Products** → **Add Product**
2. Crée :
   - **FitAI Pro** — 12€/mois — type : Recurring
   - **FitAI Coach** — 39€/mois — type : Recurring
3. Copie les **Price IDs** (commencent par `price_...`)

### Ajouter Stripe à ton site :

**Dans `index.html`**, ajoute dans le `<head>` :
```html
<script src="https://js.stripe.com/v3/"></script>
```

**Remplace les boutons** "Essayer 7 jours gratuit" par :
```html
<button onclick="startCheckout('price_XXXX')">Essayer 7 jours gratuit</button>
```

**Crée le fichier `api/checkout.js`** :
```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { priceId } = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${req.headers.origin}/dashboard.html?success=1`,
    cancel_url: `${req.headers.origin}/#pricing`,
    trial_period_days: 7,
  });
  res.json({ url: session.url });
}
```

**Dans `app.js`**, ajoute :
```javascript
async function startCheckout(priceId) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId })
  });
  const { url } = await res.json();
  window.location.href = url;
}
```

**Variables d'environnement Vercel à ajouter** :
- `STRIPE_SECRET_KEY` = `sk_live_XXXX` (ou `sk_test_XXXX` en test)
- `STRIPE_WEBHOOK_SECRET` = disponible dans Stripe Webhooks

---

## ✅ ÉTAPE 6 — BASE DE DONNÉES (pour sauvegarder les users)

Pour aller plus loin (users en base, pas seulement localStorage) :

### Option la plus simple — Supabase (gratuit) :
1. Va sur **supabase.com** → Create project
2. SQL Editor → Exécute :
```sql
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  plan text default 'free',
  created_at timestamp default now()
);

create table programs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  objectif text,
  niveau text,
  content text,
  created_at timestamp default now()
);
```
3. Copie l'**URL** et la **clé anon** de ton projet Supabase
4. Ajoute dans Vercel :
   - `SUPABASE_URL` = `https://XXXX.supabase.co`
   - `SUPABASE_KEY` = `eyJXXXX...`

---

## ✅ ÉTAPE 7 — SEO (être trouvé sur Google)

### Actions immédiates (dans `index.html`) :
Le fichier index.html contient déjà les balises meta essentielles.

### Créer du contenu pour Google :

**Créer un fichier `blog.html`** avec des articles comme :
- "Programme musculation débutant : guide complet 2025"
- "Ectomorphe : comment prendre du muscle rapidement"
- "Programme push pull legs : le meilleur split pour la masse"

Ces articles attirent des visiteurs gratuitement depuis Google.

### Déclarer le site à Google :
1. **Google Search Console** → search.google.com/search-console
2. Ajoute ton domaine → Vérifie avec Vercel
3. Soumet le sitemap : `https://tonsite.com/sitemap.xml`

### Créer `sitemap.xml` :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.2">
  <url><loc>https://tonsite.com/</loc><priority>1.0</priority></url>
  <url><loc>https://tonsite.com/blog.html</loc><priority>0.8</priority></url>
</urlset>
```

---

## 💰 MODÈLE ÉCONOMIQUE

### Revenus estimés :

| Utilisateurs Pro | Revenu mensuel |
|-----------------|----------------|
| 10 clients      | 120€/mois      |
| 50 clients      | 600€/mois      |
| 100 clients     | 1 200€/mois    |
| 500 clients     | 6 000€/mois    |

### Coûts (très bas) :
- Vercel : **Gratuit** (jusqu'à 100GB bande passante)
- Anthropic API : ~0,003€ par programme généré
- Nom de domaine : ~10€/an
- **Total pour lancer : moins de 15€/an**

### Stratégie d'acquisition clients :
1. **Instagram/TikTok** — Montre des exemples de programmes générés
2. **Forums musculation** — Reddit r/fitness, forums francophones
3. **SEO** — Articles de blog (résultats en 3–6 mois)
4. **Partenariats** — Coachs sportifs qui utilisent ton outil pour leurs clients

---

## 🔧 MISES À JOUR FUTURES (roadmap)

### Version 2.0 :
- [ ] App mobile (React Native ou PWA)
- [ ] Suivi de progression avec graphiques
- [ ] Programme ajusté automatiquement chaque semaine
- [ ] Calcul 1RM automatique
- [ ] Export PDF mis en page professionnellement

### Version 3.0 :
- [ ] Coach IA par chat (pose des questions, l'IA répond)
- [ ] Intégration wearables (Fitbit, Apple Watch)
- [ ] Programme nutrition avec liste de courses

---

## 🆘 RÉSOLUTION DE PROBLÈMES

**"L'API ne répond pas"**
→ Vérifie que `ANTHROPIC_API_KEY` est bien ajoutée dans Vercel Environment Variables
→ Redéploie après avoir ajouté la variable

**"Le site n'est pas visible"**
→ Attends 2–5 min après le déploiement Vercel
→ Vérifie qu'il n'y a pas d'erreur dans le log Vercel (onglet Deployments)

**"Mon domaine ne fonctionne pas"**
→ La propagation DNS peut prendre jusqu'à 48h (souvent 15 min)
→ Teste avec https://dnschecker.org

**"Stripe ne charge pas"**
→ Vérifie que `STRIPE_SECRET_KEY` commence par `sk_live_` en production
→ Teste d'abord avec `sk_test_` en mode test

---

## 📞 RÉCAPITULATIF RAPIDE

```
1. Compte GitHub ✓
2. Compte Vercel ✓  
3. Compte Anthropic + clé API ✓
4. Upload des fichiers sur GitHub ✓
5. Import sur Vercel + variable ANTHROPIC_API_KEY ✓
6. Site en ligne ✓ ← Tu peux déjà gagner de l'argent
7. Domaine personnalisé (optionnel)
8. Stripe pour les paiements
9. SEO pour les visiteurs organiques
```

**Temps total pour avoir un site fonctionnel : 30–60 minutes.**

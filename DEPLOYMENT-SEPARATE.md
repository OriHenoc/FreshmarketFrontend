# 🚀 Déploiement Séparé FreshMarket

## 📋 Vue d'ensemble

Ce guide explique comment déployer le **frontend** et le **backend** séparément :

- **Frontend** : Next.js sur Vercel
- **Backend** : Node.js sur Railway/Render/Heroku
- **Base de données** : MongoDB Atlas

## 🏗️ Architecture

```
┌─────────────────┐    API Calls    ┌─────────────────┐
│   Frontend      │ ──────────────► │    Backend      │
│   (Vercel)      │                 │  (Railway/etc)  │
│                 │                 │                 │
│  Next.js App    │                 │  Express API    │
└─────────────────┘                 └─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │   MongoDB       │
                                    │   Atlas         │
                                    └─────────────────┘
```

## 🚀 ÉTAPE 1 : DÉPLOYER LE BACKEND

### Option A : Railway (Recommandé)

1. **Allez sur [railway.app](https://railway.app)**
2. **Connectez votre compte GitHub**
3. **Cliquez sur "New Project" → "Deploy from GitHub repo"**
4. **Sélectionnez votre repository**
5. **Configurez les variables d'environnement :**

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freshmarket
JWT_SECRET=votre-super-secret-jwt-key-tres-long-et-complexe
FRONTEND_URL=https://votre-frontend.vercel.app
NODE_ENV=production
```

6. **Déployez !** 🎉

### Option B : Render

1. **Allez sur [render.com](https://render.com)**
2. **Connectez votre compte GitHub**
3. **Cliquez sur "New" → "Web Service"**
4. **Sélectionnez votre repository**
5. **Configurez :**
   - **Name** : `freshmarket-backend`
   - **Environment** : `Node`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
6. **Ajoutez les variables d'environnement**
7. **Déployez !**

### Option C : Heroku

1. **Allez sur [heroku.com](https://heroku.com)**
2. **Connectez votre compte GitHub**
3. **Créez une nouvelle app**
4. **Connectez votre repository**
5. **Configurez les variables d'environnement**
6. **Déployez !**

## 🚀 ÉTAPE 2 : DÉPLOYER LE FRONTEND

### Vercel (Recommandé)

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Connectez votre compte GitHub**
3. **Cliquez sur "New Project"**
4. **Importez votre repository**
5. **Configurez :**
   - **Framework Preset** : `Next.js`
   - **Root Directory** : `app`
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`
6. **Ajoutez les variables d'environnement :**

```bash
NEXT_PUBLIC_API_BASE_URL=https://votre-backend.railway.app
```

7. **Déployez !** 🎉

## 🔧 Configuration des variables d'environnement

### Backend (Railway/Render/Heroku)

```bash
# Base de données
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freshmarket

# Sécurité
JWT_SECRET=votre-super-secret-jwt-key-tres-long-et-complexe

# Frontend URL (pour CORS)
FRONTEND_URL=https://votre-frontend.vercel.app

# Environnement
NODE_ENV=production
```

### Frontend (Vercel)

```bash
# URL de l'API backend
NEXT_PUBLIC_API_BASE_URL=https://votre-backend.railway.app
```

## 🌐 URLs finales

### Développement local
- **Frontend** : `http://localhost:3000`
- **Backend** : `http://localhost:4000`

### Production
- **Frontend** : `https://votre-frontend.vercel.app`
- **Backend** : `https://votre-backend.railway.app`
- **Admin** : `https://votre-frontend.vercel.app/admin`

## 🔄 Workflow de développement

### Développement local

```bash
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend
cd app
npm install
npm run dev
```

### Déploiement

```bash
# Backend (automatique via Railway/Render)
git push origin main

# Frontend (automatique via Vercel)
git push origin main
```

## 🔒 Sécurité

### CORS Configuration

Le backend est configuré pour accepter les requêtes depuis :
- `http://localhost:3000` (développement)
- `https://votre-frontend.vercel.app` (production)

### Variables sensibles

✅ **À configurer dans les plateformes de déploiement :**
- `MONGO_URI` : URL de votre base MongoDB
- `JWT_SECRET` : Clé secrète pour les tokens JWT
- `FRONTEND_URL` : URL de votre frontend

❌ **Ne jamais commiter :**
- Fichiers `.env`
- Clés privées
- URLs de base de données

## 📊 Monitoring

### Backend (Railway/Render/Heroku)
- **Logs** : Accessibles dans le dashboard
- **Métriques** : Performance et utilisation
- **Health checks** : `/health` endpoint

### Frontend (Vercel)
- **Analytics** : Performance et utilisateurs
- **Logs** : Erreurs et fonctionnalités
- **Deployments** : Historique des déploiements

## 🔧 Dépannage

### Erreurs communes

1. **CORS errors**
   - Vérifiez `FRONTEND_URL` dans le backend
   - Vérifiez `NEXT_PUBLIC_API_BASE_URL` dans le frontend

2. **Database connection failed**
   - Vérifiez `MONGO_URI`
   - Vérifiez les permissions MongoDB Atlas

3. **Authentication failed**
   - Vérifiez `JWT_SECRET`
   - Vérifiez les tokens dans le localStorage

### Health checks

```bash
# Backend
curl https://votre-backend.railway.app/health

# Frontend
curl https://votre-frontend.vercel.app
```

## 🎯 Avantages du déploiement séparé

### ✅ Avantages :
- **Scalabilité** : Chaque service peut être mis à l'échelle indépendamment
- **Maintenance** : Mise à jour d'un service sans affecter l'autre
- **Coûts** : Optimisation des coûts par service
- **Performance** : CDN global pour le frontend
- **Sécurité** : Isolation des services

### 🔧 Technologies recommandées :
- **Frontend** : Vercel (Next.js optimisé)
- **Backend** : Railway (Node.js simple)
- **Database** : MongoDB Atlas (géré)

## 📞 Support

- **Vercel Docs** : https://vercel.com/docs
- **Railway Docs** : https://docs.railway.app
- **MongoDB Atlas** : https://docs.atlas.mongodb.com
- **Next.js Docs** : https://nextjs.org/docs

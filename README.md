# 🛒 FreshMarket - Votre épicerie en ligne

## 🚀 Déploiement Séparé (Recommandé)

### Architecture
- **Frontend** : Next.js sur Vercel
- **Backend** : Node.js sur Railway/Render
- **Base de données** : MongoDB Atlas

### Déploiement rapide

1. **Déployez le backend :**
   ```bash
   # Connectez votre repo à Railway/Render
   # Configurez les variables d'environnement
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/freshmarket
   JWT_SECRET=votre-super-secret-jwt-key-tres-long-et-complexe
   FRONTEND_URL=https://votre-frontend.vercel.app
   ```

2. **Déployez le frontend :**
   ```bash
   # Connectez votre repo à Vercel
   # Configurez Root Directory: app
   # Ajoutez la variable d'environnement
   NEXT_PUBLIC_API_BASE_URL=https://votre-backend.railway.app
   ```

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

## 📁 Structure du projet

```
freshmarket/
├── app/                    # Frontend Next.js
├── server/                 # Backend Node.js
├── DEPLOYMENT-SEPARATE.md  # Guide déploiement séparé
├── deploy-backend.sh       # Script déploiement backend
├── deploy-frontend.sh      # Script déploiement frontend
└── README.md              # Ce fichier
```

## 🔧 Technologies utilisées

- **Frontend** : Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend** : Node.js, Express.js, MongoDB, JWT
- **Déploiement** : Vercel (Frontend) + Railway/Render (Backend)
- **Base de données** : MongoDB Atlas

## 🌐 URLs

### Développement
- **Frontend** : `http://localhost:3000`
- **Backend** : `http://localhost:4000`

### Production
- **Frontend** : `https://votre-frontend.vercel.app`
- **Backend** : `https://votre-backend.railway.app`
- **Admin** : `https://votre-frontend.vercel.app/admin`

## 📖 Documentation

Voir `DEPLOYMENT-SEPARATE.md` pour un guide détaillé de déploiement séparé.

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

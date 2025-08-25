#!/bin/bash

# 🚀 Script de déploiement Backend FreshMarket
# Usage: ./deploy-backend.sh

echo "🚀 Déploiement du backend FreshMarket..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "server/package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Aller dans le dossier server
cd server

# Vérifier les variables d'environnement
if [ -z "$MONGO_URI" ]; then
    echo "⚠️  Attention: MONGO_URI n'est pas définie"
    echo "   Configurez-la dans votre plateforme de déploiement"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  Attention: JWT_SECRET n'est pas définie"
    echo "   Configurez-la dans votre plateforme de déploiement"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Vérifier que tout fonctionne
echo "🔍 Vérification du build..."
npm run build

echo "✅ Backend prêt pour le déploiement !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Poussez votre code vers GitHub"
echo "2. Connectez votre repo à Railway/Render/Heroku"
echo "3. Configurez les variables d'environnement :"
echo "   - MONGO_URI"
echo "   - JWT_SECRET"
echo "   - FRONTEND_URL"
echo "4. Déployez !"
echo ""
echo "🌐 URLs de test :"
echo "   - Health check: https://votre-backend.railway.app/health"
echo "   - API root: https://votre-backend.railway.app/"

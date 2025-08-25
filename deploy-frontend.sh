#!/bin/bash

# 🚀 Script de déploiement Frontend FreshMarket
# Usage: ./deploy-frontend.sh

echo "🚀 Déploiement du frontend FreshMarket..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "app/package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Aller dans le dossier app
cd app

# Vérifier les variables d'environnement
if [ -z "$NEXT_PUBLIC_API_BASE_URL" ]; then
    echo "⚠️  Attention: NEXT_PUBLIC_API_BASE_URL n'est pas définie"
    echo "   Configurez-la dans Vercel Dashboard"
    echo "   Exemple: https://votre-backend.railway.app"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

echo "✅ Frontend prêt pour le déploiement !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Poussez votre code vers GitHub"
echo "2. Connectez votre repo à Vercel"
echo "3. Configurez dans Vercel :"
echo "   - Root Directory: app"
echo "   - Framework Preset: Next.js"
echo "   - Build Command: npm run build"
echo "4. Ajoutez la variable d'environnement :"
echo "   - NEXT_PUBLIC_API_BASE_URL=https://votre-backend.railway.app"
echo "5. Déployez !"
echo ""
echo "🌐 URLs finales :"
echo "   - Site: https://votre-frontend.vercel.app"
echo "   - Admin: https://votre-frontend.vercel.app/admin"

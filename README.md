# Application de Gestion de Tâches avec Rappels

Une application simple pour gérer vos tâches avec des notifications de rappel.

## Déploiement

### Option 1 : Vercel (Recommandé)

1. Créez un compte sur https://vercel.com
2. Installez Vercel CLI : `npm i -g vercel`
3. Dans le dossier du projet, exécutez : `vercel`
4. Suivez les instructions à l'écran

**OU** utilisez l'interface web :
1. Allez sur https://vercel.com/new
2. Importez ce dossier (glissez-déposez ou via GitHub)
3. Cliquez sur "Deploy"

### Option 2 : Netlify

1. Créez un compte sur https://netlify.com
2. Glissez-déposez ce dossier sur https://app.netlify.com/drop
3. Votre site sera en ligne en quelques secondes !

### Option 3 : GitHub Pages

1. Créez un repository GitHub
2. Poussez ce code
3. Allez dans Settings > Pages
4. Configurez le déploiement depuis la branche main

## Installation locale

```bash
npm install
npm run dev
```

L'application sera accessible sur http://localhost:5173

## Construction pour la production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `dist/`

## Fonctionnalités

- ✅ Ajout de tâches
- 🔔 Notifications de rappel
- 💾 Sauvegarde automatique
- ✔️ Marquage comme terminé
- 🗑️ Suppression de tâches
- ⚠️ Indication des tâches en retard

# Configuration Firebase pour CityLog

## Étapes pour configurer Firebase :

### 1. Créer le projet Firebase
1. Va sur https://console.firebase.google.com/
2. Clique sur "Créer un projet"
3. Nom du projet : **CityLog**
4. Désactive Google Analytics (optionnel pour le moment)
5. Clique sur "Créer le projet"

### 2. Configurer Authentication
1. Dans ton projet Firebase, va dans "Authentication"
2. Clique sur "Commencer"
3. Va dans l'onglet "Sign-in method"
4. Active "E-mail/Mot de passe"
5. Sauvegarde

### 3. Configurer Firestore Database
1. Va dans "Firestore Database"
2. Clique sur "Créer une base de données"
3. Commence en mode "test" (règles de sécurité seront configurées plus tard)
4. Choisis une région proche (europe-west)

### 4. Obtenir les clés de configuration
1. Va dans "Paramètres du projet" (roue dentée)
2. Dans l'onglet "Général", descends jusqu'à "Vos applications"
3. Clique sur l'icône Web (</>)
4. Nom de l'app : **CityLog**
5. **NE PAS** cocher "Configurer Firebase Hosting"
6. Clique sur "Enregistrer l'application"
7. **COPIE les clés de configuration** qui s'affichent

### 5. Remplacer les clés dans le projet
Dans le fichier `config/firebase.ts`, remplace les valeurs par tes vraies clés :

```typescript
const firebaseConfig = {
  apiKey: "ta-vraie-api-key",
  authDomain: "ton-project-id.firebaseapp.com",
  projectId: "ton-project-id",
  storageBucket: "ton-project-id.appspot.com",
  messagingSenderId: "ton-messaging-sender-id",
  appId: "ton-app-id"
};
```

### 6. Tester l'authentification
1. Lance l'app avec `npm start`
2. L'app devrait t'emmener sur l'écran de connexion
3. Crée un compte et teste la connexion

## Sécurité
⚠️ **IMPORTANT** : Ajoute un fichier `.env` pour les clés sensibles en production !

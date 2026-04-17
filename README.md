# Portail de Gestion des Objets Perdus et Trouvés — Campus

Ce projet constitue une application web complète (*full-stack*) destinée à la gestion centralisée des objets perdus et trouvés au sein d'un campus universitaire. Il permet aux membres de la communauté académique de déclarer des objets égarés ou découverts, d'effectuer des recherches ciblées et d'engager une procédure de réclamation, le tout au travers d'une interface sécurisée et conforme aux exigences réglementaires en vigueur (RGPD, WCAG).

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Serveur (*backend*) | Node.js + Express |
| Base de données | PostgreSQL (ORM Prisma) |
| Authentification | JWT + messagerie institutionnelle |
| Interface (*frontend*) | HTML / CSS / JavaScript (natif, sans framework) |
| Stockage des fichiers | Système de fichiers local / compatible S3 |

---

## Structure du Projet

```
campus-lost-found/
├── server/
│   ├── src/
│   │   ├── config/         # Configuration base de données, variables d'environnement, Multer
│   │   ├── middleware/     # Authentification, gestion des erreurs, téléversement
│   │   ├── models/         # Schéma Prisma (voir prisma/)
│   │   ├── routes/         # Routeurs Express
│   │   ├── controllers/    # Logique métier par ressource
│   │   ├── services/       # Couche de services réutilisables
│   │   └── app.js          # Point d'entrée de l'application Express
│   ├── prisma/
│   │   └── schema.prisma   # Schéma ER complet (7 entités)
│   └── package.json
├── client/
│   ├── public/
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   └── pages/
└── docs/
    ├── cahier-des-charges.md
    └── features.md
```

---

## Mise en Route

```bash
# 1. Installation des dépendances
cd server && npm install

# 2. Copie du fichier de configuration
cp .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET

# 3. Exécution des migrations de base de données
npx prisma migrate dev --name init

# 4. Démarrage du serveur en mode développement
npm run dev
```

---

## Modèle de Données (Entités ER)

Le schéma relationnel repose sur **7 entités principales** : `User`, `Item`, `Location`, `Category`, `Message`, `ClaimRequest`, `Photo`.

Le détail complet du schéma est disponible dans `server/prisma/schema.prisma`.

---

## Fonctionnalités

**Implémentées**

- Authentification institutionnelle (JWT, messagerie campus)
- Déclaration d'objets perdus et trouvés (opérations CRUD complètes)
- Téléversement de photographies par annonce
- Recherche et filtrage avancés (mots-clés, catégorie, lieu, date, statut)
- Messagerie interne sécurisée entre utilisateurs
- Interface de modération administrative
- Processus de demande de réclamation

**Prévues (versions ultérieures)**

- Suggestion automatique de correspondances (intelligence artificielle / apprentissage automatique)
- Système de notifications en temps réel

---

## API Reference

Base URL : `http://localhost:3000/api`

Toutes les routes protégées nécessitent un header :
```
Authorization: Bearer <jwt_token>
```

---

### Authentication (`/api/auth`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Inscription — crée un compte utilisateur |
| `POST` | `/auth/login` | ❌ | Connexion — retourne un JWT |
| `GET` | `/auth/me` | ✅ | Retourne le profil de l'utilisateur connecté |

**POST `/auth/register`**
```json
// Corps de la requête
{
  "email": "prenom.nom@isep.fr",
  "password": "motdepasse123",
  "username": "prenom.nom"
}

// Réponse 201
{
  "user": { "id": 1, "email": "prenom.nom@isep.fr", "username": "prenom.nom" },
  "token": "<jwt_token>"
}
```

**POST `/auth/login`**
```json
// Corps de la requête
{ "email": "prenom.nom@isep.fr", "password": "motdepasse123" }

// Réponse 200
{ "token": "<jwt_token>", "user": { "id": 1, "email": "...", "role": "USER" } }
```

---

### Items (`/api/items`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/items` | Optionnel | Liste les annonces (filtrages disponibles) |
| `GET` | `/items/:id` | Optionnel | Détail d'une annonce |
| `POST` | `/items` | ✅ | Créer une annonce |
| `PUT` | `/items/:id` | ✅ | Modifier une annonce (propriétaire) |
| `DELETE` | `/items/:id` | ✅ | Supprimer une annonce (propriétaire ou admin) |
| `PATCH` | `/items/:id/close` | ✅ | Marquer l'annonce comme résolue/réclamée |
| `POST` | `/items/:id/photos` | ✅ | Uploader des photos pour une annonce |
| `DELETE` | `/photos/:id` | ✅ | Supprimer une photo |

**GET `/items` — Query params disponibles**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `type` | `string` | `LOST` ou `FOUND` |
| `categoryId` | `number` | Filtrer par catégorie |
| `locationId` | `number` | Filtrer par lieu |
| `status` | `string` | `ACTIVE`, `RESOLVED`, `PENDING` |
| `q` | `string` | Recherche par mot-clé |
| `page` | `number` | Page (défaut: 1) |
| `limit` | `number` | Résultats par page (défaut: 20) |

**POST `/items`**
```json
// Corps de la requête
{
  "title": "Portefeuille noir",
  "description": "Trouvé près de la cafétéria",
  "type": "FOUND",
  "categoryId": 2,
  "locationId": 3,
  "date": "2026-04-17"
}

// Réponse 201
{ "item": { "id": 42, "title": "Portefeuille noir", "status": "ACTIVE", ... } }
```

---

### Recherche (`/api/search`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/search` | Optionnel | Recherche avancée multi-critères |

**GET `/search` — Query params**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `q` | `string` | Terme de recherche (titre, description) |
| `type` | `string` | `LOST` ou `FOUND` |
| `categoryId` | `number` | ID de catégorie |
| `locationId` | `number` | ID de lieu |
| `startDate` | `string` | Date de début (ISO 8601) |
| `endDate` | `string` | Date de fin (ISO 8601) |
| `page` | `number` | Page (défaut: 1) |
| `limit` | `number` | Résultats par page (défaut: 20) |

---

### Messages (`/api/messages`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/messages` | ✅ | Inbox — messages reçus |
| `GET` | `/messages/conversations` | ✅ | Liste des conversations groupées |
| `GET` | `/messages/thread/:itemId/:partnerId` | ✅ | Fil de discussion par item et interlocuteur |
| `GET` | `/messages/item/:itemId` | ✅ | Tous les messages liés à un item |
| `POST` | `/messages` | ✅ | Envoyer un message |
| `PATCH` | `/messages/:id/read` | ✅ | Marquer un message comme lu |

**POST `/messages`**
```json
// Corps de la requête
{
  "receiverId": 5,
  "itemId": 42,
  "content": "Bonjour, est-ce votre portefeuille ?"
}

// Réponse 201
{ "message": { "id": 99, "content": "...", "createdAt": "2026-04-17T..." } }
```

---

### Notifications (`/api/notifications`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `GET` | `/notifications` | ✅ | Liste des notifications de l'utilisateur |
| `PATCH` | `/notifications/read-all` | ✅ | Marquer toutes les notifications comme lues |
| `PATCH` | `/notifications/:id/read` | ✅ | Marquer une notification comme lue |

**GET `/notifications` — Exemple de réponse**
```json
{
  "notifications": [
    {
      "id": 1,
      "type": "NEW_MESSAGE",
      "message": "Vous avez reçu un nouveau message",
      "read": false,
      "createdAt": "2026-04-17T14:00:00Z"
    }
  ],
  "unreadCount": 1
}
```

---

### Réclamations (`/api/claims`)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| `POST` | `/claims` | ✅ | Soumettre une réclamation sur un item |
| `GET` | `/claims` | ✅ | Admin : toutes les réclamations / User : les siennes |
| `GET` | `/claims/my` | ✅ | Réclamations de l'utilisateur connecté |
| `PATCH` | `/claims/:id/review` | 🔒 ADMIN | Approuver ou rejeter une réclamation |

**POST `/claims`**
```json
// Corps de la requête
{
  "itemId": 42,
  "description": "C'est mon portefeuille, il contient ma carte étudiante n°12345"
}

// Réponse 201
{ "claim": { "id": 7, "status": "PENDING", "itemId": 42, ... } }
```

---

### Administration (`/api/admin`)

> Toutes les routes admin nécessitent le rôle `ADMIN`.

#### Modération des annonces

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/items` | Liste les items en attente de modération |
| `PATCH` | `/admin/items/:id/moderate` | Approuver ou rejeter une annonce |

**PATCH `/admin/items/:id/moderate`**
```json
// Corps de la requête
{ "action": "APPROVE" }  // ou "REJECT"
```

#### Gestion des utilisateurs

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/users` | Liste tous les utilisateurs |
| `GET` | `/admin/users/:id` | Détail d'un utilisateur |
| `PUT` | `/admin/users/:id` | Modifier un utilisateur |
| `PATCH` | `/admin/users/:id/status` | Activer / suspendre un compte |
| `PATCH` | `/admin/users/:id/role` | Changer le rôle (`USER` / `ADMIN`) |

#### Catégories

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/categories` | Liste toutes les catégories |
| `POST` | `/admin/categories` | Créer une catégorie |
| `PUT` | `/admin/categories/:id` | Modifier une catégorie |
| `DELETE` | `/admin/categories/:id` | Supprimer une catégorie |

#### Lieux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/locations` | Liste tous les lieux |
| `POST` | `/admin/locations` | Créer un lieu |
| `PUT` | `/admin/locations/:id` | Modifier un lieu |
| `DELETE` | `/admin/locations/:id` | Supprimer un lieu |

---

### Codes de Réponse

| Code | Signification |
|------|---------------|
| `200` | Succès |
| `201` | Ressource créée |
| `400` | Requête invalide (paramètres manquants ou incorrects) |
| `401` | Non authentifié (token manquant ou expiré) |
| `403` | Non autorisé (droits insuffisants) |
| `404` | Ressource introuvable |
| `409` | Conflit (ex : email déjà utilisé) |
| `429` | Trop de requêtes (rate limiting) |
| `500` | Erreur serveur interne |

---

> Développé pour le campus de l'ISEP. Conforme au RGPD et aux standards d'accessibilité WCAG.

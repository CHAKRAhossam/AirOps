# 📸 Guide Complet des Captures d'Écran AirOps

## 🎯 Objectif
Documenter visuellement tous les aspects du projet AirOps pour le rapport de stage avec des captures d'écran professionnelles et complètes.

## 📋 Liste Complète des Captures à Réaliser

### 🖥️ 1. Application Frontend AirOps

#### 🔐 Authentification
- **URL**: `http://localhost:3000`
- **Captures**:
  - [ ] Page de login avec formulaire d'authentification
  - [ ] Page de registration (si disponible)
  - [ ] Message d'erreur de connexion
  - [ ] Redirection après connexion réussie

#### 📊 Dashboard Principal
- **URL**: `http://localhost:3000/dashboard`
- **Captures**:
  - [ ] Vue d'ensemble avec métriques temps réel
  - [ ] Widgets de statistiques (vols, personnel, messages)
  - [ ] Navigation principale et menu latéral
  - [ ] Notifications et alertes

#### ✈️ Gestion des Vols
- **URL**: `http://localhost:3000/flights`
- **Captures**:
  - [ ] Liste complète des vols avec tableau
  - [ ] Filtres et barre de recherche
  - [ ] Formulaire de création de vol
  - [ ] Formulaire de modification de vol
  - [ ] Détails d'un vol spécifique
  - [ ] Changement de statut en temps réel
  - [ ] Pagination et tri des colonnes

#### 👥 Gestion du Personnel
- **URL**: `http://localhost:3000/staff`
- **Captures**:
  - [ ] Liste du personnel avec photos
  - [ ] Formulaire d'ajout d'employé
  - [ ] Profil détaillé d'un employé
  - [ ] Planning/horaires de travail
  - [ ] Évaluations de performance
  - [ ] Filtres par département/rôle

#### 💬 Communication Temps Réel
- **URL**: `http://localhost:3000/chat`
- **Captures**:
  - [ ] Interface de chat public
  - [ ] Messages privés entre utilisateurs
  - [ ] Création de salles de discussion
  - [ ] Liste des utilisateurs connectés
  - [ ] Notifications de nouveaux messages
  - [ ] Historique des conversations

#### 📱 Interface Responsive
- **Captures**:
  - [ ] Version mobile du dashboard
  - [ ] Navigation mobile (menu hamburger)
  - [ ] Formulaires adaptés mobile
  - [ ] Chat sur mobile

### 🐳 2. Docker et Containerisation

#### Containers en Fonctionnement
```bash
# Commandes pour captures
docker ps                          # Tous les containers actifs
docker ps -a                       # Tous les containers (actifs + arrêtés)
docker images                      # Toutes les images
docker-compose ps                  # Status via docker-compose
docker stats                       # Utilisation des ressources
```

**Captures nécessaires**:
- [ ] `docker ps` - Liste des containers actifs
- [ ] `docker images` - Images Docker construites
- [ ] `docker-compose ps` - Status des services
- [ ] `docker stats` - Monitoring des ressources
- [ ] Docker Desktop interface (si utilisé)
- [ ] Logs d'un container spécifique

#### Architecture Docker Compose
- [ ] Fichier `docker-compose.yml` ouvert dans l'éditeur
- [ ] Structure des services dans l'éditeur
- [ ] Réseaux Docker créés
- [ ] Volumes Docker montés

### 🗄️ 3. Bases de Données

#### PostgreSQL (3 instances)
- **Auth DB** (Port 5432): `http://localhost:5432`
- **Flight DB** (Port 5434): `http://localhost:5434` 
- **Staff DB** (Port 5433): `http://localhost:5433`

**Captures avec un client DB (pgAdmin, DBeaver, etc.)**:
- [ ] Connexion aux 3 bases PostgreSQL
- [ ] Structure des tables (Users, Flights, Staff, etc.)
- [ ] Données d'exemple dans les tables
- [ ] Relations entre les tables
- [ ] Index et contraintes

#### MongoDB (Chat Service)
- **Chat DB** (Port 27017): `http://localhost:27017`

**Captures avec MongoDB Compass ou autre client**:
- [ ] Collections MongoDB (Messages, ChatRooms)
- [ ] Documents d'exemple
- [ ] Structure des données JSON
- [ ] Index MongoDB

### 🔧 4. Outils de Développement

#### IDE - IntelliJ IDEA / VS Code
- [ ] Structure complète du projet
- [ ] Code source d'un service (ex: AuthService)
- [ ] Configuration Spring Boot
- [ ] Fichiers de configuration (.properties, .yml)
- [ ] Tests unitaires
- [ ] Debugging en cours

#### Postman / REST Client
- [ ] Collection de tests API
- [ ] Test d'authentification JWT
- [ ] Test CRUD pour les vols
- [ ] Test CRUD pour le personnel
- [ ] Réponses API avec données JSON
- [ ] Tests d'erreur (401, 404, 500)

### 🚀 5. GitHub et Gestion de Code

#### Repository GitHub
- **URL**: Votre repository GitHub
- [ ] Page principale du repository
- [ ] Structure des dossiers/fichiers
- [ ] README.md affiché
- [ ] Commits récents
- [ ] Branches (main, develop, features)
- [ ] Pull requests (si existantes)
- [ ] Issues/tickets (si existants)

#### Code Source
- [ ] Fichier Java principal (ex: AuthController.java)
- [ ] Fichier React/TypeScript (ex: Dashboard.tsx)
- [ ] Configuration Docker (Dockerfile)
- [ ] Configuration CI/CD (.github/workflows/)
- [ ] Documentation technique (README, guides)

### ⚡ 6. GitHub Actions (CI/CD)

#### Workflows
- **URL**: `https://github.com/[username]/[repo]/actions`
- [ ] Liste des workflows configurés
- [ ] Workflow backend en cours d'exécution
- [ ] Workflow frontend en cours d'exécution
- [ ] Historique des builds (succès/échecs)
- [ ] Détails d'un build spécifique
- [ ] Logs de compilation
- [ ] Tests automatisés passés
- [ ] Déploiement automatique (si configuré)

#### Pipeline Details
- [ ] Étapes du pipeline backend
- [ ] Étapes du pipeline frontend
- [ ] Tests unitaires exécutés
- [ ] Build Docker images
- [ ] Artifacts générés

### 🏗️ 7. Architecture et Monitoring

#### Service Discovery (Eureka)
- **URL**: `http://localhost:8761`
- [ ] Dashboard Eureka avec services enregistrés
- [ ] Status des microservices
- [ ] Informations de santé des services

#### API Gateway
- **URL**: `http://localhost:8222`
- [ ] Routes configurées
- [ ] Monitoring du gateway
- [ ] Métriques de performance

#### Spring Boot Actuator (Health Checks)
- **URLs**: `http://localhost:808X/actuator/health`
- [ ] Health check d'un service
- [ ] Métriques applicatives
- [ ] Information sur l'environnement

### 🔍 8. Tests et Validation

#### Tests API
- [ ] Collection Postman complète
- [ ] Tests d'intégration réussis
- [ ] Validation des réponses JSON
- [ ] Tests de charge (si disponibles)

#### Tests Frontend
- [ ] Tests unitaires React
- [ ] Tests d'intégration frontend
- [ ] Validation des formulaires
- [ ] Tests de navigation

### 📊 9. Métriques et Performance

#### Monitoring
- [ ] Utilisation CPU/Mémoire des services
- [ ] Temps de réponse API
- [ ] Connexions WebSocket actives
- [ ] Métriques base de données

#### Logs
- [ ] Logs applicatifs d'un service
- [ ] Logs d'erreur et debugging
- [ ] Logs de sécurité (authentification)

## 🎨 Conseils pour des Captures Professionnelles

### ✅ Bonnes Pratiques
1. **Résolution**: Captures en haute résolution (1920x1080 minimum)
2. **Navigateur**: Utiliser Chrome/Edge en mode développeur si nécessaire
3. **Données**: Utiliser des données réalistes et complètes
4. **Interface**: S'assurer que l'interface est propre et professionnelle
5. **Annotations**: Préparer des annotations pour expliquer les captures

### 🖼️ Outils Recommandés
- **Windows**: Outil Capture d'écran, Snipping Tool, ShareX
- **Chrome**: Extensions de capture d'écran
- **Éditeurs**: Paint.NET, GIMP pour retouches si nécessaire

### 📝 Organisation des Captures
```
screenshots/
├── 01-frontend/
│   ├── login.png
│   ├── dashboard.png
│   ├── flights-list.png
│   ├── staff-management.png
│   └── chat-interface.png
├── 02-backend/
│   ├── eureka-dashboard.png
│   ├── api-gateway.png
│   └── actuator-health.png
├── 03-docker/
│   ├── containers-running.png
│   ├── docker-images.png
│   └── docker-compose.png
├── 04-databases/
│   ├── postgresql-tables.png
│   └── mongodb-collections.png
├── 05-development/
│   ├── ide-project-structure.png
│   ├── postman-tests.png
│   └── code-examples.png
├── 06-github/
│   ├── repository-overview.png
│   ├── code-structure.png
│   └── commits-history.png
└── 07-cicd/
    ├── github-actions-workflows.png
    ├── build-pipeline.png
    └── deployment-logs.png
```

## ✅ Checklist Finale

### Avant de Commencer
- [ ] Tous les services Docker sont démarrés
- [ ] Frontend accessible sur http://localhost:3000
- [ ] Données de test insérées dans les bases
- [ ] Utilisateurs de test créés avec différents rôles
- [ ] Navigateur en plein écran, interface propre

### Pendant les Captures
- [ ] Vérifier la qualité et la lisibilité
- [ ] Inclure les barres d'adresse pour montrer les URLs
- [ ] Capturer les états de chargement si pertinents
- [ ] Montrer les interactions utilisateur

### Après les Captures
- [ ] Organiser les fichiers selon la structure proposée
- [ ] Renommer les fichiers de manière descriptive
- [ ] Vérifier que toutes les captures sont exploitables
- [ ] Préparer les légendes pour le rapport LaTeX

## 🚀 Commandes Utiles

```bash
# Démarrer tous les services
cd services
docker-compose up -d

# Vérifier le status
docker-compose ps
docker ps

# Voir les logs d'un service
docker-compose logs auth-service
docker-compose logs -f frontend  # En temps réel

# Arrêter tous les services
docker-compose down

# Redémarrer un service spécifique
docker-compose restart flight-service
```

## 📋 Services et Ports de Référence

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Frontend | 3000 | http://localhost:3000 | Interface utilisateur React |
| API Gateway | 8222 | http://localhost:8222 | Point d'entrée API |
| Eureka | 8761 | http://localhost:8761 | Service Discovery |
| Config Server | 8888 | http://localhost:8888 | Configuration centralisée |
| Auth Service | 8081 | http://localhost:8081 | Authentification JWT |
| Flight Service | 8082 | http://localhost:8082 | Gestion des vols |
| Staff Service | 8083 | http://localhost:8083 | Gestion du personnel |
| Chat Service | 8084 | http://localhost:8084 | Communication temps réel |
| Auth DB | 5432 | localhost:5432 | Base PostgreSQL Auth |
| Staff DB | 5433 | localhost:5433 | Base PostgreSQL Staff |
| Flight DB | 5434 | localhost:5434 | Base PostgreSQL Flight |
| Chat DB | 27017 | localhost:27017 | Base MongoDB Chat |

Ce guide vous permettra de créer une documentation visuelle complète et professionnelle de votre projet AirOps !

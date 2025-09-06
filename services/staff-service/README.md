# Staff Service

Service de gestion du personnel pour AirOps - Système de gestion aéronautique.

## 🎯 Fonctionnalités

### 👥 Gestion du Personnel
- **Création/Modification/Suppression** de membres du personnel
- **Association** d'un utilisateur (userId) à un profil de staff
- **Définition** de rôles métier (pilote, agent sécurité, etc.)
- **Gestion** des départements et hiérarchies

### 📅 Planning & Affectations
- **Planification** des horaires de travail
- **Gestion** des types d'horaires (régulier, overtime, garde, etc.)
- **Pointage** d'entrée et de sortie
- **Suivi** des heures supplémentaires

### 📈 Évaluations et Performances
- **Évaluations** de performance complètes
- **Notes** par critères (technique, communication, travail d'équipe, etc.)
- **Historique** des évaluations
- **Statistiques** de performance

### 🔒 Sécurité et Permissions
- **Intégration** avec auth-service pour l'authentification
- **Vérification** des permissions par rôle
- **Validation** des tokens JWT
- **Contrôle d'accès** granulaire

## 🏗️ Architecture

### Entités Principales
- **Staff** : Informations du personnel
- **PerformanceEvaluation** : Évaluations de performance
- **WorkSchedule** : Horaires de travail

### Rôles Métier
- **PILOT** : Pilote
- **CO_PILOT** : Copilote
- **FLIGHT_ATTENDANT** : Hôtesse/Steward
- **GROUND_CREW** : Équipe au sol
- **SECURITY_AGENT** : Agent de sécurité
- **MAINTENANCE_TECHNICIAN** : Technicien de maintenance
- **SUPERVISOR** : Superviseur
- **MANAGER** : Manager
- Et bien d'autres...

### Départements
- **FLIGHT_OPERATIONS** : Opérations de vol
- **MAINTENANCE** : Maintenance
- **SECURITY** : Sécurité
- **CUSTOMER_SERVICE** : Service client
- **ADMINISTRATION** : Administration
- Et bien d'autres...

## 🚀 API Endpoints

### Staff Management
```
POST   /api/v1/staff                    # Créer un membre du personnel
PUT    /api/v1/staff/{id}               # Modifier un membre du personnel
DELETE /api/v1/staff/{id}               # Supprimer un membre du personnel
GET    /api/v1/staff/{id}               # Récupérer un membre du personnel
GET    /api/v1/staff/user/{userId}      # Récupérer par userId
GET    /api/v1/staff                    # Liste paginée
GET    /api/v1/staff/search             # Recherche
GET    /api/v1/staff/role/{role}        # Par rôle
GET    /api/v1/staff/status/{status}    # Par statut
GET    /api/v1/staff/hire-date          # Par période d'embauche
```

### Performance Evaluations
```
POST   /api/v1/evaluations                    # Créer une évaluation
PUT    /api/v1/evaluations/{id}               # Modifier une évaluation
DELETE /api/v1/evaluations/{id}               # Supprimer une évaluation
GET    /api/v1/evaluations/{id}               # Récupérer une évaluation
GET    /api/v1/evaluations/staff/{staffId}    # Évaluations d'un staff
GET    /api/v1/evaluations/staff/{staffId}/latest  # Dernières évaluations
GET    /api/v1/evaluations/date-range         # Par période
GET    /api/v1/evaluations/status/{status}    # Par statut
PUT    /api/v1/evaluations/{id}/status        # Mettre à jour le statut
```

### Work Schedules
```
POST   /api/v1/schedules                    # Créer un horaire
PUT    /api/v1/schedules/{id}               # Modifier un horaire
DELETE /api/v1/schedules/{id}               # Supprimer un horaire
GET    /api/v1/schedules/{id}               # Récupérer un horaire
GET    /api/v1/schedules/staff/{staffId}    # Horaires d'un staff
GET    /api/v1/schedules/date/{date}        # Horaires d'une date
GET    /api/v1/schedules/date-range         # Par période
GET    /api/v1/schedules/status/{status}    # Par statut
GET    /api/v1/schedules/type/{type}        # Par type
PUT    /api/v1/schedules/{id}/status        # Mettre à jour le statut
PUT    /api/v1/schedules/{id}/clock-in      # Pointage d'entrée
PUT    /api/v1/schedules/{id}/clock-out     # Pointage de sortie
```

## 🔧 Configuration

### Variables d'environnement
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/airops_staff
    username: postgres
    password: password

server:
  port: 8083

auth-service:
  url: http://localhost:8090
```

### Base de données
- **PostgreSQL** : Base de données principale
- **Port** : 5433 (en développement)
- **Base** : `airops_staff`

## 🐳 Docker

### Construction
```bash
docker build -t staff-service .
```

### Exécution
```bash
docker run -p 8083:8083 staff-service
```

### Avec Docker Compose
```bash
docker-compose up staff-service
```

## 🔗 Dépendances

### Services Externes
- **auth-service** : Authentification et autorisation
- **discovery-service** : Service discovery (Eureka)
- **config-server** : Configuration centralisée

### Technologies
- **Spring Boot 3.5.3**
- **Spring Data JPA**
- **Spring Security**
- **Spring Cloud OpenFeign**
- **PostgreSQL**
- **Lombok**
- **JWT**

## 📊 Monitoring

### Health Check
```
GET /actuator/health
```

### Métriques
```
GET /actuator/metrics
```

### Info
```
GET /actuator/info
```

## 🔐 Sécurité

### Authentification
- **JWT Token** : Validation via auth-service
- **Authorization Header** : `Bearer <token>`

### Permissions
- **ADMIN** : Accès complet
- **MANAGER** : Gestion du personnel et évaluations
- **SUPERVISOR** : Création d'horaires et évaluations
- **STAFF** : Lecture seule

## 🧪 Tests

### Tests Unitaires
```bash
./mvnw test
```

### Tests d'Intégration
```bash
./mvnw test -Dtest=*IntegrationTest
```

## 📝 Exemples d'utilisation

### Créer un membre du personnel
```json
POST /api/v1/staff
{
  "userId": 1,
  "employeeId": "EMP000001",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@airops.com",
  "phone": "+33123456789",
  "staffRole": "PILOT",
  "department": "FLIGHT_OPERATIONS",
  "hireDate": "2023-01-15",
  "salary": 5000.0,
  "status": "ACTIVE"
}
```

### Créer une évaluation
```json
POST /api/v1/evaluations
{
  "staffId": 1,
  "evaluatorId": 2,
  "evaluationDate": "2024-01-15",
  "evaluationType": "ANNUAL",
  "overallRating": 4,
  "technicalSkillsRating": 5,
  "communicationSkillsRating": 4,
  "teamworkRating": 4,
  "reliabilityRating": 5,
  "initiativeRating": 3,
  "comments": "Excellent pilote, très professionnel"
}
```

### Créer un horaire
```json
POST /api/v1/schedules
{
  "staffId": 1,
  "scheduleDate": "2024-01-20",
  "startTime": "08:00:00",
  "endTime": "16:00:00",
  "scheduleType": "REGULAR",
  "location": "Terminal 1"
}
```

## 🚀 Déploiement

### Développement
```bash
./mvnw spring-boot:run
```

### Production
```bash
./mvnw clean package
java -jar target/staff-service-0.0.1-SNAPSHOT.jar
```

## 📞 Support

Pour toute question ou problème :
- **Documentation** : Voir les commentaires dans le code
- **Logs** : Vérifier les logs de l'application
- **Health Check** : `/actuator/health`
- **API Documentation** : Endpoints listés ci-dessus 
# Construction Project Management App

A full-stack web application for managing construction projects, workers, budgets, equipment, materials, inspections, and more.

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.2
- Spring Security (JWT + Google OAuth2)
- Spring Data JPA, MySQL
- iText 7 (PDF reports), Lombok

**Frontend**
- React 18, TypeScript, Vite
- Tailwind CSS, Recharts
- Axios, React Router v6

## Features

- Project management with milestones and progress tracking
- Worker management, assignments, and attendance
- Budget tracking and expense management
- Equipment tracking and maintenance scheduling
- Material inventory and transactions
- Site inspections and issue tracking
- Delay prediction analytics
- PDF report generation
- Dashboard with key metrics
- JWT authentication + Google OAuth2 login
- Real-time notifications

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

## Getting Started

### 1. Database

```sql
CREATE DATABASE construction_pm;
```

### 2. Backend

```bash
cd backend
```

Set environment variables (or update `application.properties`):

| Variable | Description |
|---|---|
| `DB_USERNAME` | MySQL username (default: `root`) |
| `DB_PASSWORD` | MySQL password (default: `root`) |
| `JWT_SECRET` | JWT signing secret |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `FRONTEND_URL` | Frontend origin for CORS (default: `http://localhost:5173`) |

```bash
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Project Structure

```
ConstructionApp/
├── backend/
│   └── src/main/java/com/constructionpm/app/
│       ├── config/        # Security configuration
│       ├── controller/    # REST controllers
│       ├── dto/           # Data transfer objects
│       ├── entity/        # JPA entities
│       ├── exception/     # Global exception handling
│       ├── repository/    # Spring Data repositories
│       ├── security/      # JWT filter, OAuth2 handler
│       └── service/       # Business logic
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── contexts/      # React contexts (Auth)
        ├── layouts/       # Page layouts
        ├── pages/         # Route-level page components
        ├── services/      # API service layer
        ├── types/         # TypeScript types
        └── utils/         # Utility functions
```

## API Overview

| Prefix | Description |
|---|---|
| `/api/auth/**` | Authentication (login, register, OAuth2) |
| `/api/projects/**` | Project CRUD |
| `/api/workers/**` | Worker management |
| `/api/budget/**` | Budget and expenses |
| `/api/equipment/**` | Equipment and maintenance |
| `/api/materials/**` | Materials and transactions |
| `/api/inspections/**` | Site inspections |
| `/api/dashboard/**` | Dashboard metrics |
| `/api/delay-prediction/**` | Delay analytics |
| `/api/reports/**` | PDF report generation |

## Build for Production

**Backend**
```bash
cd backend
mvn clean package
java -jar target/construction-pm-backend-1.0.0.jar
```

**Frontend**
```bash
cd frontend
npm run build
```

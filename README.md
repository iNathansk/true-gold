Project Documentation

## 1. Project Overview
This project is a full-stack ERP (Enterprise Resource Planning) suite built for managing gold/silver procurement, processing, and sales. It features a modern React frontend and a robust Node.js/Express backend with Sequelize ORM.

### Architecture Diagram
    User((User)) -->|React/Vite| Frontend[Frontend SPA]
    Frontend -->|REST API| Backend[Node/Express Backend]
    Backend -->|Sequelize| DB[(MariaDB/SQLite)]
    Backend -->|JWT|  Auth[Authentication Service]
    Frontend -->|External API| Market[Gold/Silver Live Rates]

## 2. Core Module Breakdown

### [Backend](file:///home/wdm/Downloads/latest-v1/backend)
- **[server.ts](file:///home/wdm/Downloads/latest-v1/backend/server.ts)**: Express server initialization, middleware configuration (CORS, JWT), and API routing.
- **[models.ts](file:///home/wdm/Downloads/latest-v1/backend/models.ts)**: Sequelize models defining the database schema (Tenant, User, Transaction, KYC, etc.).
- **[db.ts](file:///home/wdm/Downloads/latest-v1/backend/db.ts)**: Database connection setup using Sequelize.
- **[seeders.ts](file:///home/wdm/Downloads/latest-v1/backend/seeders.ts)**: Logic for initial database population with mock data.

### [Frontend](file:///home/wdm/Downloads/latest-v1/frontend)
- **[App.tsx](file:///home/wdm/Downloads/latest-v1/frontend/App.tsx)**: Main application entry point with routing and view management.
- **[data-api.ts](file:///home/wdm/Downloads/latest-v1/frontend/data-api.ts)**: API service layer handling communication with the backend and external market data feeds.
- **[types.ts](file:///home/wdm/Downloads/latest-v1/frontend/types.ts)**: Shared TypeScript interfaces and enums.

#### Key Components
- **[Dashboard.tsx](file:///home/wdm/Downloads/latest-v1/frontend/components/Dashboard.tsx)**: High-level overview of metrics and recent activity.
- **[TransactionWorkflow.tsx](file:///home/wdm/Downloads/latest-v1/frontend/components/TransactionWorkflow.tsx)**: Core logic for managing multi-step procurement processes.
- **[KYCCheck.tsx](file:///home/wdm/Downloads/latest-v1/frontend/components/KYCCheck.tsx)**: Compliance and identity verification module.
- **[Melting.tsx](file:///home/wdm/Downloads/latest-v1/frontend/components/Melting.tsx)**: Specialized refining operation management.
- **[Payment.tsx](file:///home/wdm/Downloads/latest-v1/frontend/components/Payment.tsx)**: Cash/Bank disbursement processing.

---

## 3. Command History & Operations

### Setup and Development
```bash
# Backend Setup
cd backend
npm install
npm start # Starts the server at http://localhost:5000

# Frontend Setup
cd frontend
npm install
npm run dev # Starts the Dev server
```

### Database Management
- **Initialization**: Automatically handled on server boot via `sequelize.sync({ alter: true })`.
- **Seeding**: Mock data is injected on startup for development testing.

---

## 4. Key Workflows Implemented
1. **Procurement Lifecycle**: Material Inward → Quotation → RH Approval → Purchase Invoice → Accounts Verification → Payment.
2. **Logistics Management**: Hub Transfer and Receipt with real-time status tracking.
3. **Melting Operations**: Input/Output weight tracking with automatic loss calculation.
4. **Market Data Integration**: Real-time syncing of gold and silver rates from external APIs (Gold-API, GoldPrice.org).

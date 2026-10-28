# Backend API - Smart Community Health Monitoring & Early Warning System

**SIH Problem Statement:** Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India  
**Problem ID:** SIH25001  
**Ministry:** Ministry of Development of North Eastern Region  

## Tech Stack
- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas / Mongoose
- **Authentication**: JWT (Access + Refresh tokens) & bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Morgan

## Key Features
- **Early Warning Surveillance Engine**: Configurable threshold analysis across 7-day windows flagging surges in diarrhea, vomiting, and water contamination. All alerts strictly labeled *"Potential Risk – Based on Unverified Citizen Reports"* (never clinical diagnoses).
- **Role-Based Access Control**:
  - `citizen`: Submit water & symptom reports, track own submissions, receive status alerts.
  - `health_worker`: Review local village reports, record laboratory/field water test parameters, investigate alerts.
  - `admin`: Regional dashboard, user management, early warning threshold config, data seeding.
- **Geospatial Indexing**: MongoDB 2dsphere coordinates `[longitude, latitude]` for GIS disease mapping across rural Northeast India.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Add your MongoDB Atlas URI or run with local MongoDB.

3. Seed Demo Data:
   ```bash
   npm run seed
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   npm start
   ```

## Default Seed Credentials
- **Admin**: `admin@smarthealth.ne.gov.in` / `Password123!`
- **Health Worker (Cherrapunji)**: `mary.lyngdoh@health.meghalaya.gov.in` / `Password123!`
- **Health Worker (Majuli)**: `biren.hazarika@health.assam.gov.in` / `Password123!`
- **Citizen (Majuli)**: `rupjyoti@majuli.in` / `Password123!`
- **Citizen (Loktak)**: `thoiba@loktak.net` / `Password123!`

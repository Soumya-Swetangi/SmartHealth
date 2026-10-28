# Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India

**Smart India Hackathon 2025**  
**Problem ID:** SIH25001  
**Ministry:** Ministry of Development of North Eastern Region  

---

## 🧭 Executive Summary

In rural and flood-prone regions across Northeast India (including the Brahmaputra valley of Assam, Meghalaya's limestone terrains, Manipur's wetland margins, and remote hill districts), access to clean potable water is heavily affected by seasonal floods, shallow aquifer contamination, and agricultural runoffs.

This platform bridges rural communities and health departments through an **intelligent, community-powered early-warning surveillance engine**. Citizens log observations about contaminated water sources and household gastrointestinal complaints (diarrhea, vomiting, fever). An automated rule-based surveillance engine aggregates data over 7-day rolling windows to detect localized hazard clusters, trigger early warnings to health workers, prioritize field water tests (pH, turbidity, chlorine, coliform, E. coli), and enable rapid intervention before outbreaks expand.

---

## 🎨 Color Theme & Design System

The platform strictly uses the official SIH 2025 designated palette:

```css
:root {
  --twilight-indigo: #3a405aff; /* Primary text & headers */
  --powder-petal: #f9dec9ff;    /* Primary background */
  --powder-blue: #99b2ddff;     /* Accent buttons & highlights */
  --powder-blush: #e9afa3ff;    /* Secondary accents / alerts */
  --ash-brown: #685044ff;       /* Borders, cards, secondary text */
}
```

- **Primary background**: `powder-petal` (`#f9dec9`)
- **Primary text & headers**: `twilight-indigo` (`#3a405a`)
- **Accent buttons & highlights**: `powder-blue` (`#99b2dd`)
- **Secondary accents / alerts**: `powder-blush` (`#e9afa3`)
- **Borders, cards, secondary text**: `ash-brown` (`#685044`)

---

## ⚡ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Leaflet, React-Leaflet, React Router v6, Axios, React Hook Form, Zod, Lucide React |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, JWT (Access + Refresh Tokens), bcryptjs, express-validator, cors, dotenv, helmet, morgan |
| **Database** | MongoDB Atlas (with 2dsphere spatial index on coordinates `[longitude, latitude]`) |
| **Deployment** | **Frontend:** GitHub Pages (Static SPA with Hash routing)<br>**Backend:** Render (Web Service)<br>**Database:** MongoDB Atlas (Cloud Cluster) |

---

## 📁 Complete Folder Structure

```
smart-health-northeast/
├── frontend/                          # React + Vite (deployed to GitHub Pages)
│   ├── public/
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── AlertBanner.tsx
│   │   │   │   └── Pagination.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── maps/
│   │   │   │   ├── RiskMap.tsx
│   │   │   │   └── MapMarker.tsx
│   │   │   ├── charts/
│   │   │   │   ├── ReportsTrendChart.tsx
│   │   │   │   ├── SymptomPieChart.tsx
│   │   │   │   └── VillageBarChart.tsx
│   │   │   ├── reports/
│   │   │   │   ├── ReportForm.tsx
│   │   │   │   ├── ReportCard.tsx
│   │   │   │   └── ReportStatusBadge.tsx
│   │   │   └── dashboard/
│   │   │       ├── StatsCards.tsx
│   │   │       ├── RecentReports.tsx
│   │   │       └── AlertsList.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── CitizenDashboard.tsx
│   │   │   ├── HealthWorkerDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ReportSubmissionPage.tsx
│   │   │   ├── MyReportsPage.tsx
│   │   │   ├── WaterTestPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   ├── UsersManagementPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── reportService.ts
│   │   │   ├── waterTestService.ts
│   │   │   ├── alertService.ts
│   │   │   └── userService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   ├── styles/
│   │   │   └── index.css                 # Tailwind + custom theme variables
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── README.md
│
├── backend/                           # Node.js + Express (deployed to Render)
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── jwt.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── reportController.ts
│   │   │   ├── waterTestController.ts
│   │   │   ├── alertController.ts
│   │   │   ├── userController.ts
│   │   │   └── analyticsController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── roleMiddleware.ts
│   │   │   ├── errorMiddleware.ts
│   │   │   └── validateMiddleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Report.ts
│   │   │   ├── WaterTest.ts
│   │   │   ├── Alert.ts
│   │   │   ├── Notification.ts
│   │   │   └── AuditLog.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   ├── waterTestRoutes.ts
│   │   │   ├── alertRoutes.ts
│   │   │   ├── userRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── services/
│   │   │   ├── alertEngine.ts            # Early warning logic
│   │   │   └── notificationService.ts
│   │   ├── utils/
│   │   │   ├── generateToken.ts
│   │   │   ├── asyncHandler.ts
│   │   │   └── seedData.ts               # Demo data seeder
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🗄️ MongoDB Collections & Schemas

### 1. `users`
```typescript
{
  name: string;
  email: string;              // Unique index
  password: string;           // Salted bcrypt hash
  role: "citizen" | "health_worker" | "admin";
  village: string;            // Primary village assignment
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. `reports`
```typescript
{
  userId: ObjectId;           // Ref: User
  village: string;
  sourceType: "handpump" | "well" | "river" | "pond" | "pipeline" | "other";
  symptoms: string[];         // ["diarrhea", "vomiting", "fever", "abdominal_pain", "dehydration"]
  description?: string;
  reportedAt: Date;
  status: "pending" | "under_review" | "verified" | "resolved" | "rejected";
  location: {
    type: "Point",
    coordinates: [number, number] // [longitude, latitude] (2dsphere indexed)
  };
  assignedTo?: ObjectId;      // Ref: User (health_worker)
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. `waterTests`
```typescript
{
  reportId?: ObjectId;        // Ref: Report (optional link)
  village: string;
  sourceType: string;
  testedBy: ObjectId;         // Ref: User (health_worker)
  testDate: Date;
  parameters: {
    pH?: number;
    turbidity?: number;
    chlorine?: number;
    coliform?: boolean;
    ecoli?: boolean;
  };
  result: "safe" | "unsafe" | "borderline";
  notes?: string;
  location?: { type: "Point", coordinates: [number, number] };
  createdAt: Date;
}
```

### 4. `alerts`
```typescript
{
  village: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  reason: string;             // Always prefixed with "Potential Risk – Based on Unverified Citizen Reports"
  reportCount: number;
  symptomsInvolved: string[];
  status: "active" | "acknowledged" | "resolved";
  generatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: ObjectId;      // Ref: User
  notes?: string;
}
```

### 5. `notifications`
```typescript
{
  userId: ObjectId;           // Ref: User
  title: string;
  message: string;
  type: "alert" | "status_update" | "system";
  relatedId?: ObjectId;
  isRead: boolean;
  createdAt: Date;
}
```

### 6. `auditLogs`
```typescript
{
  userId: ObjectId;
  action: string;
  resource: string;
  resourceId?: ObjectId;
  details?: object;
  ipAddress?: string;
  createdAt: Date;
}
```

---

## 🚨 Early Warning Surveillance Engine

The Early Warning Engine (`backend/src/services/alertEngine.ts`) implements algorithmic anomaly detection:

1. **Surveillance Window**: Inspects reports submitted within the past 7 days for any given village.
2. **Threshold Matrix**:
   - **Critical Risk**: Unsafe water test confirmed in the village within 14 days AND $\ge 3$ citizen reports (or $\ge 2$ diarrhea cases).
   - **High Risk**: $\ge 8$ reports OR $\ge 5$ acute diarrhea cases in 7 days.
   - **Medium Risk**: $\ge 5$ reports OR $\ge 3$ diarrhea cases in 7 days.
   - **Low Risk**: $\ge 3$ community reports.
3. **Mandatory Labeling**: Every alert reason is strictly formatted:
   > *"Potential Risk – Based on Unverified Citizen Reports: [trigger context]"*
4. **Automated Notification**: Dispatches in-app alerts to all Health Workers registered to that village and to regional Administrators.

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v18 or v20+)
- MongoDB Atlas connection string or local MongoDB (`mongodb://127.0.0.1:27017/smart-health-northeast`)

### Step 1: Clone & Install
```bash
git clone https://github.com/your-username/smart-health-northeast.git
cd smart-health-northeast

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-health-northeast?retryWrites=true&w=majority
JWT_SECRET=supersecretjwtsecretkey_sih2025_northeast_water_health
JWT_REFRESH_SECRET=supersecretrefreshjwtkey_sih2025_refresh_token
JWT_EXPIRE=2h
JWT_REFRESH_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run Seed Data
Populate the database with Northeast India test communities, realistic users, water tests, and alerts:
```bash
cd backend
npm run seed
```

### Step 4: Run Development Servers
In two separate terminals:
```bash
# Terminal 1: Start Backend API (runs at http://localhost:5000)
cd backend
npm run dev

# Terminal 2: Start Frontend (runs at http://localhost:5173)
cd frontend
npm run dev
```

---

## 🔑 Default Demo Credentials

| Role | Email | Password | Assigned Village |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@smarthealth.ne.gov.in` | `Password123!` | Guwahati HQ |
| **Health Worker** | `mary.lyngdoh@health.meghalaya.gov.in` | `Password123!` | Sohra (Cherrapunji) |
| **Health Worker** | `biren.hazarika@health.assam.gov.in` | `Password123!` | Majuli Island |
| **Citizen** | `rupjyoti@majuli.in` | `Password123!` | Majuli Island |
| **Citizen** | `thoiba@loktak.net` | `Password123!` | Moirang (Loktak) |
| **Citizen** | `tage@ziro.org` | `Password123!` | Ziro Valley |

> **Note:** The login screen features convenient 1-click demo autofill buttons for Evaluators.

---

## 🚀 Deployment Instructions

### 1. Backend → Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure 32+ character random string
   - `JWT_REFRESH_SECRET`: A secure random string
   - `NODE_ENV`: `production`

### 2. Frontend → GitHub Pages
1. In `frontend/vite.config.ts`, `base: './'` is already configured for relative path resolution.
2. In `frontend/package.json`, add deployment script or use GitHub Actions:
   ```yaml
   name: Deploy Frontend to GitHub Pages
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 20
         - run: cd frontend && npm install && npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./frontend/dist
   ```
3. Update `VITE_API_URL` to point to your live Render backend URL (e.g. `https://smart-health-northeast.onrender.com/api`).

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /register` – Register citizen account (or staff if requested by admin).
- `POST /login` – Authenticate with email & password, receives JWT tokens.
- `POST /refresh` – Exchange refresh token for fresh access token.
- `GET /me` – Retrieve current user profile.
- `POST /logout` – End session & invalidate client tokens.

### Reports (`/api/reports`)
- `POST /` – Submit citizen water problem/symptom report. Triggers early warning evaluation.
- `GET /` – List reports (supports search, village filter, status filter, pagination).
- `GET /my` – Fetch authenticated citizen's personal report history.
- `GET /:id` – Retrieve individual report details.
- `PATCH /:id/status` – Update report triage status (`under_review`, `verified`, `resolved`, `rejected`) and add field resolution notes.

### Water Tests (`/api/water-tests`)
- `POST /` – Record laboratory or field water test (pH, turbidity, chlorine, coliform, E. coli, result: safe/unsafe/borderline).
- `GET /` – Query water tests with village and result filters.
- `GET /:id` – Detailed test assay report.

### Early Warning Alerts (`/api/alerts`)
- `GET /` – Fetch alerts filtered by status (`active`, `acknowledged`, `resolved`) and severity (`critical`, `high`, `medium`, `low`).
- `GET /:id` – Single alert investigation view.
- `PATCH /:id` – Acknowledge or resolve an alert with operational field notes.
- `POST /evaluate` – Manually trigger full epidemiological surveillance engine scan across all villages.

### Analytics (`/api/analytics`)
- `GET /overview` – High-level KPIs (total reports, active warnings, contamination rate, resolution rate).
- `GET /trends` – 14-day daily time-series counts of reports and acute diarrhea cases.
- `GET /symptoms` – Frequency distribution across symptoms (diarrhea, vomiting, fever, abdominal pain, dehydration).
- `GET /villages` – Comparative cross-district vulnerability metrics.
- `GET /map-data` – GeoJSON spatial coordinate points with risk indicators for Leaflet mapping.

### User Directory & Notifications (`/api/users`)
- `GET /` – Administrator directory of registered users.
- `PATCH /:id` – Activate/deactivate accounts or change roles.
- `GET /notifications` – Fetch user surveillance notifications and unread count.
- `PATCH /notifications/:id/read` – Mark notification as read.

---

## 📸 Screenshots & Previews

| View | Description |
| :--- | :--- |
| **Landing Portal** | Hero section with SIH problem ID, ministry branding, workflow steps, and safety disclaimers. |
| **Interactive GIS Risk Map** | Leaflet map color-coded by alert severity across Northeast India villages (Majuli, Sohra, Mawlynnong, Loktak, Ziro, Mokokchung). |
| **Citizen Reporting Portal** | Multi-symptom checklist, water source selector, and GPS geolocation coordinate pinning. |
| **Health Worker Desk** | Triage queue, status updating modal, water test recording with biological assay inputs. |
| **Admin Regional Command** | 14-day Recharts area chart, symptom distribution donut, village vulnerability comparison, and alert lifecycle manager. |

---

## ⚕️ Official Medical & Epidemiological Disclaimer

> [!IMPORTANT]
> **Surveillance Disclaimer**: This platform is strictly an **environmental hazard and community symptom surveillance tool**. It uses statistical thresholds to help health workers detect clusters early.
> - It does **NOT** provide medical diagnoses.
> - Alerts labeled *"Potential Risk – Based on Unverified Citizen Reports"* do not constitute confirmed clinical disease outbreaks without accredited laboratory pathogen verification.
> - Individuals experiencing acute gastrointestinal distress or severe dehydration must seek immediate care from a qualified healthcare practitioner.

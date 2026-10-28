# Frontend - Smart Community Health Monitoring & Early Warning System

**SIH Problem Statement:** Smart Community Health Monitoring and Early Warning System for Water-Borne Diseases in Rural Northeast India  
**Problem ID:** SIH25001  
**Ministry:** Ministry of Development of North Eastern Region  

## Color Theme (Strict SIH Variables)
```css
:root {
  --twilight-indigo: #3a405aff; /* Primary text & headers */
  --powder-petal: #f9dec9ff;    /* Primary background */
  --powder-blue: #99b2ddff;     /* Accent buttons & highlights */
  --powder-blush: #e9afa3ff;    /* Secondary accents / alerts */
  --ash-brown: #685044ff;       /* Borders, cards, secondary text */
}
```

## Tech Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom Theme Palette
- **Mapping**: Leaflet + React-Leaflet (Interactive GIS pins with risk color encoding)
- **Data Visualization**: Recharts (14-day trend area chart, symptom distribution donut, village comparison bars)
- **Forms & Validation**: React Hook Form + Zod resolvers
- **Icons**: Lucide React
- **HTTP Client**: Axios with automatic JWT interceptors

## Features & Portals
- **Landing Page**: SIH Branding, how the system functions, safety guidelines, and live interactive Northeast GIS map.
- **Citizen Portal**: Report contaminated drinking water sources, log household symptoms, view submission history, and observe local alerts.
- **Health Worker Surveillance Desk**: Review village-level symptom reports, update case statuses, perform lab water quality assays, and inspect spatial GIS pins.
- **Admin Command Dashboard**: High-level regional KPIs, epidemiological trend charts, alert lifecycle management, user management, and dev dataset seeding.

## Setup & Running Locally
```bash
npm install
npm run dev
```

Build for static GitHub Pages deployment:
```bash
npm run build
```
The output will be placed in `dist/`.

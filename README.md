# 🏛️ CivicPulse AI — Municipal Complaint & Resolution System

A modernized, production-ready civic defect triage and authority dispatch platform built with **React**, **Vite**, **Supabase (PostgreSQL & Storage)**, and an edge **AI Urgency Classifier**, ready for zero-config hosting on **Vercel**.

---

## ✨ Features

- **Real-Time AI Complaint Triage**: Analyzes civic issue descriptions in real-time as the citizen types. Predicts category, severity level, priority queue, triggered hazard reasons (e.g., live wires, gas leaks, open manholes, vulnerable institutions), and estimated SLA.
- **Interactive Leaflet GIS Mapping**: Citizens can pinpoint defects via address search, interactive map click, or HTML5 browser GPS geolocation with reverse geocoding.
- **Authority Command Center**: Zonal dashboard featuring real-time KPI metrics, city-wide incident heatmap with color-coded severity pins, live search, multi-factor filtering, status updates with official dispatch remarks, and CSV export.
- **Supabase Cloud Backend**: Replaces fragile local SQLite/Flask setups with cloud PostgreSQL, real-time table subscriptions, and public evidence photo storage via Supabase Storage.
- **Vercel Deployment Ready**: Pre-configured with `vercel.json` SPA rewrite rules and optimized Vite production bundle.

---

## 🚀 Supabase Setup Guide

### 1. Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Dashboard, navigate to **Project Settings → API**.
3. Copy your **Project URL** and **anon public API Key**.

### 2. Run the Database Schema
1. In your Supabase Dashboard, open the **SQL Editor** (`/sql`).
2. Open [`supabase_schema.sql`](./supabase_schema.sql) in this repository and paste its entire content into the SQL Editor.
3. Click **Run**. This will:
   - Create the `complaints` table with appropriate indexes and constraints.
   - Configure Row Level Security (RLS) policies for public submissions and transparent viewing.
   - Enable Realtime subscriptions.
   - Create the `complaint-evidence` storage bucket with public access policies.
   - Seed initial municipal complaints so your authority board is pre-populated.

### 3. Add Keys to Your Project
You can configure your keys in two ways:

#### Option A: In the Website UI (No restart needed!)
Click the **"Connect Supabase"** button in the top navigation bar, paste your **Project URL** and **Anon Key**, click **Test Connection**, and then **Save & Apply**.

#### Option B: In `.env`
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploy to Vercel

### Method 1: Vercel Web Dashboard (Recommended)
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework Preset will auto-detect as **Vite**.
4. In **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon public key
5. Click **Deploy**. Your site will be live on an SSL-enabled `.vercel.app` domain in seconds!

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel
```
Follow the interactive prompts to link your project and deploy.

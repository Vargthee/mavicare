# Medweb Care

A healthcare appointment platform built with React, Vite, TypeScript, and Supabase.

## Features
- Patient and doctor authentication (via Supabase Auth)
- Appointment booking and management
- Medical records management
- Doctor profile setup and verification
- Role-based dashboards (patient / doctor)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS
- **Routing**: React Router DOM v6
- **Data Fetching**: TanStack Query (React Query) v5
- **Backend/Auth/DB**: Supabase (Auth, PostgreSQL with Row Level Security)

## Project Structure
```
src/
  App.tsx               # Root component with routing
  pages/                # Page-level components
    Index.tsx           # Landing page
    Auth.tsx            # Sign in / Sign up
    PatientDashboard.tsx
    DoctorDashboard.tsx
    Doctors.tsx         # Doctor discovery
    MedicalRecords.tsx
    NotFound.tsx
  components/           # Feature components + shadcn/ui components
  hooks/                # Custom React hooks
  integrations/
    supabase/           # Supabase client + generated TypeScript types
  lib/                  # Utility functions
supabase/
  migrations/           # SQL migration files (applied to Supabase project)
```

## Environment Variables
Stored as Replit environment variables (not in .env):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

## Development
```
npm run dev     # Start dev server on port 5000
npm run build   # Build for production
```

## Database
The schema is managed through Supabase migrations in `supabase/migrations/`. The database uses PostgreSQL with Row Level Security (RLS) policies for data protection.

## Deployment
Configured as a static deployment. Build outputs to `dist/`.

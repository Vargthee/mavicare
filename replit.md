# Medweb Care

A hospital-subscription telemedicine platform. Hospitals register on a monthly plan, onboard their doctors, and patients receive care through text, images, voice notes, voice calls, and video calls.

## Business Model
- Hospitals subscribe to monthly plans (Basic ₦50k, Professional ₦150k, Enterprise ₦400k)
- Each hospital manages its own doctors
- Patients browse registered hospitals, select a doctor, and start a real-time consultation

## Features
- **Hospital admin**: Register hospital, choose subscription plan, manage doctors
- **Doctors**: View active consultations, join chat room
- **Patients**: Browse hospitals, pick a doctor, start consultation
- **Consultation chat**: Real-time text, image sharing, voice notes (MediaRecorder), voice & video calls (WebRTC)
- Supabase Auth with 3 roles: `patient`, `doctor`, `hospital_admin`

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **UI**: shadcn/ui (Radix UI) + Tailwind CSS
- **Routing**: React Router DOM v6
- **Data Fetching**: TanStack Query v5
- **Backend/Auth/DB**: Supabase (Auth, PostgreSQL with RLS, Storage, Realtime)
- **Real-time messaging**: Supabase Realtime (postgres_changes on messages table)
- **Voice/Video calls**: WebRTC (STUN: stun.l.google.com) + Supabase Realtime as signaling channel
- **File storage**: Supabase Storage bucket `medical-files`

## Project Structure
```
src/
  App.tsx                      # Routes
  pages/
    Index.tsx                  # Landing page (hospital B2B pitch + pricing)
    Auth.tsx                   # Sign in/up (patient | doctor | hospital_admin)
    HospitalSetup.tsx          # Hospital registration (2-step: info + plan)
    HospitalDashboard.tsx      # Hospital admin dashboard
    PatientDashboard.tsx       # Patient: browse hospitals, consultations list
    DoctorDashboard.tsx        # Doctor: consultation queue
    Consultation.tsx           # Real-time chat + calls (core feature)
    Doctors.tsx                # Doctor discovery (legacy)
    MedicalRecords.tsx         # Medical records (legacy)
    NotFound.tsx
  components/
    BookingDialog.tsx          # Legacy appointment booking
    DoctorProfileSetup.tsx     # Doctor profile form
    ProfileSettingsDialog.tsx
    UploadRecordDialog.tsx
    ui/                        # shadcn/ui components
  integrations/
    supabase/                  # Supabase client + generated types
supabase/
  migrations/                  # SQL migrations (run against Supabase project)
    ...original migrations...
    20260402000000_hospital_subscription_model.sql  # NEW: hospitals, consultations, messages
```

## Environment Variables (Replit Secrets)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Database Schema (key new tables)
- `hospitals` — name, admin_id, subscription_plan, subscription_status
- `hospital_doctors` — links doctors to hospitals
- `consultations` — patient_id, doctor_id, hospital_id, status, chief_complaint
- `messages` — consultation_id, sender_id, content, message_type (text/image/voice_note/system), media_url

## Important: Run SQL Migration
The file `supabase/migrations/20260402000000_hospital_subscription_model.sql` needs to be applied to the Supabase project (via Supabase dashboard SQL editor or Supabase CLI).

## Development
```
npm run dev    # Start dev server on port 5000
npm run build  # Build for production (static output to dist/)
```

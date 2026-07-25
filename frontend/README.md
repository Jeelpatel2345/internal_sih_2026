# 🎨 Internal SIH 2026 Student Registration Frontend Portal

Modern, responsive web application built with **React**, **TypeScript**, **Vite**, and custom modern CSS design components for the **Internal SIH 2026 Hackathon Registration**.

---

## 🌟 Key Features

- **Multi-Step Team Registration Form**: Seamless 3-step registration process:
  1. Team Details & Leader Information
  2. Member Details (up to 5 team members with gender, department, semester, enrollment number validation)
  3. Mentor Consent Submission
- **Real-Time Validation**: Field validation for phone numbers, institutional emails, enrollment IDs, and duplicate name checks.
- **Dynamic UX & Glassmorphic UI**: Vibrant gradient styling, micro-animations, mobile responsiveness, and dark mode ready.
- **Registration Status Tracker**: Search team registration status by Registration ID or Leader Email.
- **Mentor Approval Portal**: Dedicated landing view for faculty & industry mentors to review and submit consent.

---

## 🛠️ Technology Stack

- **Core Framework**: React 18 + TypeScript
- **Build Tool**: Vite (Lightning fast HMR & bundling)
- **Styling**: Modern CSS3 / Glassmorphism Design Token System
- **HTTP Client**: Axios / Fetch with global error handling
- **Routing**: React Router DOM v6
- **Icons**: Lucide React Icons

---

## 🚀 Quick Start

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Variables Setup

Create a `.env` file in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Development Mode

Start local development server:

```bash
npm run dev
```

The application will be running at `http://localhost:3000`.

### 4. Production Build

Build for production deployment (Vercel / Netlify / NGINX):

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

---

## 📁 Directory Structure

```
frontend/
├── public/                 # Static assets, logos, favicons
├── src/
│   ├── assets/             # Images, graphics, illustrations
│   ├── components/         # Reusable UI components (Navbar, Footer, StepIndicator, Input)
│   ├── pages/              # Main route views:
│   │   ├── Home.tsx        # Hackathon overview & schedule
│   │   ├── Register.tsx    # Multi-step team registration
│   │   ├── Status.tsx      # Team registration tracker
│   │   └── MentorForm.tsx  # Faculty mentor submission form
│   ├── services/           # API integration services & endpoint callers
│   ├── types/              # TypeScript interfaces (Team, Participant, Mentor)
│   ├── utils/              # Helper functions & form validation logic
│   ├── App.tsx             # Main App layout & route router
│   ├── main.tsx            # React entry point
│   └── index.css           # Global CSS design tokens & utilities
├── package.json
└── vite.config.ts
```

---

## 🌐 Pages & Navigation Routes

- `/` : Landing Page (Hackathon Guidelines, Timeline, FAQs)
- `/register` : Team Registration Form (Leader & Members)
- `/status` : Registration Status Lookup
- `/mentor-consent` : Faculty Mentor Approval Form

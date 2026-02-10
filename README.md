<div align="center">

# Study Hub

### Digital Education Ecosystem for Central Asia

**The GitHub for Learners** — an all-in-one platform connecting students, teachers, parents, and employers through education, analytics, and career tools.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) | [Architecture](#-architecture) | [Tech Stack](#-tech-stack) | [Getting Started](#-getting-started)

</div>

---

## The Problem

In Kazakhstan and Central Asia, **300,000+ students** take the national university entrance exam (ENT) every year. Yet there is no unified digital platform that:

- Diagnoses knowledge gaps with adaptive testing
- Generates personalized study plans
- Tracks progress with real-time analytics
- Connects student achievements with employers
- Enables teachers to monetize their expertise

Students rely on fragmented YouTube tutorials and expensive private tutors ($50-150/month). **Study Hub bridges this gap.**

## The Solution

Study Hub is a **5-sided marketplace** that creates value for every stakeholder in the education ecosystem:

| Role | Value Proposition |
|------|------------------|
| **Students** | Diagnostic testing, AI-powered study plans, progress tracking, digital portfolio |
| **Parents** | Real-time child monitoring, weekly progress reports, subject trend analysis |
| **Teachers** | Course creation platform, student analytics, earnings dashboard |
| **Employers** | Talent discovery, skill-based candidate filtering, job posting |
| **Admins** | Platform analytics, user management, revenue tracking |

---

## Key Features

### Adaptive Diagnostic Engine
- Select from **11 subjects** (Math, Physics, Chemistry, Biology, History, English, Kazakh, Russian, Informatics, Geography, Literature)
- Timed assessment with real ENT-style questions
- Instant results with per-subject breakdown, weak/strong topic identification
- **University admission probability** calculator based on scores
- **Retake with comparison** — track progress between attempts with visual diff

### Smart Study Plan Generator
- AI-generated 16-week personalized study plans based on diagnostic results
- Adaptive weekly tasks: theory, practice, tests, reviews
- Per-subject task scheduling targeting weak areas
- Real-time progress tracking with completion analytics

### AI Mentor Chat
- Context-aware study assistant
- Subject-specific help with ENT preparation
- Smart responses based on student's diagnostic profile

### Real-Time Notification System
- In-app notification center with categorized alerts (info, success, warning, achievement)
- Auto-notifications on diagnostic completion, streak milestones, new courses
- Read/unread state management

### Course Marketplace
- **10+ courses** across 7 categories (ENT Prep, Programming, Languages, Science, Business, Design, Personal Growth)
- Advanced filtering: category, subject, level, price range
- Search with real-time results
- Teacher profiles with ratings and student counts

### Parent Dashboard
- Child's diagnostic results with subject-level breakdown
- **Weekly progress reports** with study time, task completion, streak data
- **Subject trend analysis** — visual comparison of previous vs. current scores
- Activity charts (daily study minutes, tasks completed)
- Personalized recommendations

### Teacher Dashboard
- Course creation and management
- Earnings analytics with monthly revenue charts
- Student engagement metrics

### Employer Dashboard
- Talent search with skill-based filtering
- Candidate profiles with match percentage scoring
- Job posting management

### Public Profile (Portfolio)
- **GitHub-style public profile** for learners
- Skills visualization with proficiency levels
- Education history, work experience, certifications
- "Open to Work" badge for employer visibility
- Shareable link for university and job applications

### Gamification & Retention
- **Streak system** with consecutive study day tracking
- **8 achievement badges** — unlocked automatically based on activity
- Progress visualization throughout the platform

---

## Architecture

```
src/
├── components/
│   ├── ui/                       # Reusable UI component library
│   │   ├── Button.tsx            # Polymorphic button with variants
│   │   ├── Card.tsx              # Card with glass/gradient variants
│   │   ├── Input.tsx             # Form input with icon support
│   │   ├── Badge.tsx             # Color-coded status badges
│   │   ├── Progress.tsx          # Animated progress bars
│   │   ├── Modal.tsx             # Animated modal with portal
│   │   ├── Avatar.tsx            # User avatar component
│   │   └── Tabs.tsx              # Tab navigation
│   └── NotificationDropdown.tsx  # Notification center dropdown
├── pages/
│   ├── Landing.tsx               # Marketing landing page
│   ├── Auth.tsx                  # Multi-role authentication (5 roles)
│   ├── Diagnostic.tsx            # Adaptive testing engine with retake
│   ├── Dashboard.tsx             # Student dashboard with analytics
│   ├── Plan.tsx                  # Study plan generator & tracker
│   ├── Mentor.tsx                # AI chat interface
│   ├── Portfolio.tsx             # Personal portfolio builder
│   ├── Courses.tsx               # Course marketplace with filters
│   ├── PublicProfile.tsx         # Public portfolio (GitHub-style)
│   ├── ParentDashboard.tsx       # Parent monitoring with weekly reports
│   ├── TeacherDashboard.tsx      # Teacher course & earnings management
│   ├── EmployerDashboard.tsx     # Employer talent search
│   ├── Admin.tsx                 # Platform admin panel
│   └── Pricing.tsx               # Subscription pricing tiers
├── store/
│   └── useStore.ts               # Zustand global state with persistence
├── data/
│   ├── questions.ts              # 27 ENT diagnostic questions (11 subjects)
│   ├── universities.ts           # 6 KZ universities with specialties
│   └── courses.ts                # 10 marketplace courses
├── types/
│   └── index.ts                  # TypeScript interfaces & type definitions
├── lib/
│   └── utils.ts                  # Utility functions (formatting, scoring)
└── App.tsx                       # Router with role-based route guards
```

### State Management

Zustand store with `persist` middleware handles:
- **Authentication** — multi-role login/register with pre-configured demo accounts
- **Diagnostic engine** — result storage, history tracking, cross-attempt comparison
- **Study plans** — plan generation, task toggling, progress calculation
- **Notifications** — real-time alerts with read/unread state
- **Achievements** — gamification badges with automatic unlocking
- **Parent data** — child monitoring with weekly trend reports

### Routing & Security

Role-based route protection with 5 guard components:
- `ProtectedRoute` — any authenticated user
- `ParentRoute` — parent role only
- `AdminRoute` — admin role only
- `TeacherRoute` — teacher role only
- `EmployerRoute` — employer role only

---

## Tech Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI framework | 19.2 |
| **TypeScript** | Type safety (strict mode) | 5.9 |
| **Vite** | Build tool & dev server | 7.3 |
| **Tailwind CSS** | Utility-first styling | 4.1 |
| **Zustand** | Global state management | 5.0 |
| **React Router** | Client-side routing | 7.13 |
| **Framer Motion** | Physics-based animations | 12.34 |
| **Recharts** | Data visualization & charts | 3.7 |
| **Lucide React** | Icon system | 0.563 |
| **date-fns** | Date formatting & localization | 4.1 |

### Technical Decisions

- **React 19** — concurrent rendering, improved Suspense, streaming SSR-ready
- **TypeScript strict mode** — zero runtime type errors, comprehensive type coverage
- **Tailwind CSS v4** — native CSS engine (no PostCSS), 2x faster build times
- **Zustand over Redux** — 10x less boilerplate, built-in persistence, 1KB bundle
- **Vite 7** — sub-second HMR, optimized chunking, native ESM
- **Framer Motion** — spring physics animations, layout transitions, gesture support

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/alibekovakarakat5-png/study_hub_Karakat.git
cd study_hub_Karakat

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Demo Accounts

All demo accounts share the same credentials:
- **Email:** `alibekovakarakat5@gmail.com`
- **Password:** `karakat120505`

Select your role at login to explore:

| Role | Route | Key Features |
|------|-------|-------------|
| Student | `/dashboard` | Diagnostic test, study plan, AI mentor, portfolio |
| Parent | `/parent` | Child monitoring, weekly reports, subject trends |
| Teacher | `/teacher` | Course management, earnings analytics |
| Employer | `/employer` | Talent search, job postings, candidate filtering |
| Admin | `/admin` | Platform stats, user management, revenue tracking |

---

## Business Model

### Revenue Streams

1. **Freemium Subscriptions** — Free tier + Premium (4,990 KZT/mo) + Annual (39,990 KZT/yr)
2. **Course Marketplace** — 30% commission on teacher course sales
3. **Employer Access** — Premium talent search and job posting fees
4. **B2B Partnerships** — White-label solutions for schools and universities

### Market Opportunity

- **TAM:** 5M+ students across Central Asia
- **SAM:** 300,000 annual ENT test-takers in Kazakhstan
- **Target:** Network effects from 5-sided marketplace create strong moat

---

## Roadmap

- [x] Adaptive diagnostic engine (11 subjects, 27+ questions)
- [x] Multi-role authentication system (5 roles)
- [x] Student dashboard with real-time analytics
- [x] AI mentor chat interface
- [x] Personalized study plan generator
- [x] Parent monitoring dashboard with weekly reports
- [x] Course marketplace with advanced filtering
- [x] Teacher dashboard with earnings tracking
- [x] Employer talent search platform
- [x] Public portfolio system (GitHub-style)
- [x] Notification system with auto-alerts
- [x] Repeat diagnostic with progress comparison
- [x] Weekly parent reports with subject trends
- [ ] Backend API (Node.js + PostgreSQL)
- [ ] Payment integration (Kaspi Pay, Halyk Bank)
- [ ] Mobile application (React Native)
- [ ] Real AI mentor (LLM API integration)
- [ ] Video lessons infrastructure
- [ ] Push notifications & email reports
- [ ] Social features (leaderboards, study groups)

---

## Author

**Karakat Alibekova**

Founder & Full-Stack Developer

---

<div align="center">

Built with passion for education in Kazakhstan

**Study Hub** — where every learner's journey becomes a portfolio

</div>

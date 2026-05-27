# EduNova School Portal

A complete school management website and portal built with HTML, CSS, JavaScript, and Supabase.

## Features

- **Public Landing Page** — School info, hero slideshow, programs, online admission form
- **Multi-Role Portal** — Admin, Teacher, Student, Parent dashboards
- **Student Management** — Enrollment, bulk import, class assignments
- **Attendance** — Daily marking, QR scanner, teacher check-in
- **Grades & Reports** — Subject scores, report cards, analytics
- **Fee Management** — Monthly tuition tracking, payment history, receipts
- **Timetable** — Weekly schedule per class
- **Notices** — School announcements with pinning
- **ID Cards** — QR-code student ID cards with A4 batch printing
- **Family Portal** — Parent access to children's data
- **Settings** — School branding, logo, colors, slides

## Tech Stack

- **Frontend**: Single-page HTML/CSS/JS (no build step)
- **Auth & Database**: [Supabase](https://supabase.com) (Auth + PostgreSQL + RLS)
- **Hosting**: [Vercel](https://vercel.com) (static deployment)
- **Libraries**: QRCode.js, html5-qrcode, Supabase JS SDK v2

## Security

- Supabase Auth (email/password) — no local password storage
- Row Level Security (RLS) on all tables
- HSTS, X-Frame-Options DENY, CSP headers via Vercel
- Login rate limiting (5 attempts, 60s lockout)
- 30-minute idle session timeout
- Unsaved changes warning on navigation

## Setup

1. Create a Supabase project
2. Run `school_database_setup.sql` in Supabase SQL Editor
3. Create auth users in Supabase Dashboard → Authentication → Users
4. Deploy to Vercel (auto-detects static site)

## Deployment

This is a static site. Push to GitHub and connect to Vercel for automatic deployments.

```bash
git push origin main
```

Vercel will automatically deploy on every push.

## License

Private — All rights reserved.
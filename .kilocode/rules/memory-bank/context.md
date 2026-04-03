# Active Context: Crystal One

## Current State

**Status**: Crystal One e-commerce platform - Arabic/English toggle on auth + dashboard pages, fully built with 0 errors

Crystal One is an e-commerce platform built with Next.js 16, TypeScript, and Tailwind CSS. It uses a JSON-file-based data persistence layer and features a complete user dashboard and admin panel.

## Key Features

- **Arabic/English Toggle**: Auth pages (landing, login, register) + all dashboard pages support Arabic/English with RTL direction - no external i18n library, inline translations; layout manages `dir` attribute on `document.documentElement`, child pages sync via `MutationObserver`
- **Authentication**: Phone + password login, registration with name, phone, password, optional invitation code, country code selector (Egypt +20, Saudi Arabia +966, Libya +218)
- **10 Store Levels**: Level 1 = FREE ($2/day), Level 2 = $80, Level 3 = $200, then doubles
- **Sales Tasks**: Accept/decline tasks with 1-10% commission
- **Products**: Skincare Products & Devices
- **Subscription Flow**: Free store auto-subscribe, paid stores require deposit + admin approval
- **Admin Panel**: Full control over users (incl. passwords), products, tasks, deposits, withdrawals, referrals, settings
- **Admin can approve invitations** after verifying payment
- **User can unlock next level** after admin accepts request

## Store Pricing

| Level | Price | Daily Profit |
|-------|-------|-------------|
| 1 (Free) | $0 | $2 |
| 2 | $80 | $4 |
| 3 | $200 | $10 |
| 4 | $400 | $20 |
| 5 | $800 | $40 |
| 6 | $1,600 | $80 |
| 7 | $3,200 | $160 |
| 8 | $6,400 | $320 |
| 9 | $12,800 | $640 |
| 10 | $25,600 | $1,280 |

## Admin Credentials

- **Phone**: 01026541250
- **Password**: abdallah

## Registration

Fields: Name, Country Code (dropdown: Egypt +20, Saudi +966, Libya +218), Phone Number, Password, Confirm Password, Invitation Code (Optional)
- Phone uniqueness enforced (can't register twice with same number)
- Invitation code is optional
- countryCode sent in POST body to /api/auth/register

## Build Status

- TypeScript: 0 errors
- ESLint: 0 errors, 9 warnings
- Next.js Build: 38 routes compiled successfully

## Session History

| Date | Changes |
|------|---------|
| 2026-03-29 | Full Crystal One platform built |
| 2026-03-30 | Removed Arabic/RTL, made English-only |
| 2026-03-30 | Updated store pricing ($0, $80, $200, doubling) |
| 2026-03-30 | Added name field to user registration |
| 2026-03-30 | Made invitation code optional |
| 2026-03-30 | Products category changed to Skincare Products & Devices |
| 2026-03-30 | Added Arabic/English toggle to landing, login, register pages with RTL support |
| 2026-03-30 | Added country code selector (Egypt +20, Saudi +966, Libya +218) to registration |
| 2026-03-30 | Added Arabic/English toggle to dashboard pages (layout, main, stores, tasks) with RTL support |

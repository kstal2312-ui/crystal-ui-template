# Project Brief: Crystal One

## Purpose

Crystal One is a bilingual (Arabic/English) e-commerce platform that allows users to subscribe to store levels, complete sales tasks, earn commissions, and manage deposits/withdrawals. It features a full admin panel for managing users, products, tasks, payments, and site settings.

## Target Users

- Users in Egypt, Saudi Arabia, UAE, Kuwait, and Libya
- Looking to earn money through online sales tasks
- Need Arabic and English language support

## Core Features

### User Features
- Registration with phone number and invitation code
- 10 store levels (first free, then $80 doubling)
- Sales tasks with 1-10% commission
- Deposit and withdrawal management
- Referral system ($10 per approved referral)
- Real-time notifications (every 7 minutes)
- Personal profile with stats

### Admin Features
- View all users including passwords
- Manage products with image uploads
- Manage store prices and categories
- Approve/reject deposits, withdrawals, referrals
- Control site name, logo, welcome message
- Manage deposit phone numbers
- Toggle user active status, edit balances

## Technical Requirements

- Next.js 16 with App Router
- TypeScript strict mode
- Tailwind CSS 4
- JSON file-based data persistence
- Cookie-based session authentication
- RTL support for Arabic
- Phone validation for allowed countries

## Admin Credentials

- Username: 01026541250
- Password: abdallah

## Constraints

- Registration limited to Egyptian, Saudi, Emirati, Kuwaiti, and Libyan phone numbers
- First store is free, subsequent stores require payment + admin approval
- Tasks appear 1 hour after registration
- Withdrawal requests have no image attachment
- Deposit requests require image attachment

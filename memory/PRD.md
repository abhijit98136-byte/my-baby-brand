# Pehli Kilkari — PRD

## Problem Statement
Premium 3D e-commerce website for baby & kids brand "Pehli Kilkari" with FirstCry/Carter's-grade aesthetics, floating 3D hero, glassmorphism, pastel palette (Cream/BabyBlue/PastelPink/Lavender/Mint), full cart with GST/coupons, Razorpay, JWT + OTP + Google auth, and admin dashboard.

## User Personas
- **Parents (25-40)** — buying premium baby essentials online, mobile-first.
- **Gifters** — friends/family purchasing gift sets.
- **Admin** — brand manager listing products, tracking orders & sales.

## Core Requirements (static)
- 16 categories, 5 collections, ~30 seeded products
- Cart with coupons, GST 5%, shipping FREE > ₹999
- Checkout: Razorpay (mocked: UPI/GPay/PhonePe/Paytm/Card/NetBanking) + COD
- Auth: email/password JWT, mock SMS OTP, Emergent Google Auth
- Wishlist, Recently Viewed, Address Book, Order Tracking (multi-stage)
- Admin Dashboard: stats, products CRUD, orders, users, coupons
- Static pages: About, Contact, FAQ, Privacy, Returns, Terms
- WhatsApp float, Instagram/Facebook/YouTube socials, Newsletter

## What's Implemented (2026-02)
- Backend FastAPI + Mongo with all endpoints (products, categories, cart pricing, orders, tracking, coupons, wishlist, addresses, reviews, admin, newsletter, contact)
- Google Auth via Emergent (cookie + bearer dual-mode)
- Full seeded catalog + 3 coupons + admin user (admin@pehlikilkari.com / Admin@123)
- Frontend: Home (3D CSS gift box hero, floating cards), Shop with filters, Product Detail, Cart, Checkout, Auth (login/signup/OTP/Google), Account, Wishlist, TrackOrder, OrderSuccess, Admin, About, Contact, FAQ, Privacy, Returns, Terms
- Framer Motion animations, glassmorphism, pastel palette, Outfit + Quicksand fonts
- Testing agent verified 16/16 checks pass

## MOCKED
- **Razorpay**: `/api/payment/razorpay/mock` always returns success
- **SMS OTP**: `/api/auth/otp/request` returns `demo_otp` in response

## Backlog (P1)
- Real Razorpay integration (needs merchant keys)
- Real SMS OTP via Twilio/MSG91 (needs keys)
- Product image upload via object storage
- Email order confirmations (Resend/SendGrid)
- Google indexing / sitemap.xml / structured data

## Backlog (P2)
- Loyalty points, referral program
- Real React-Three-Fiber 3D hero (currently CSS-3D due to node 20 engine block on camera-controls@3.1.2)
- Multi-language (Hindi)
- Blog / parenting guides



# Harivant Home Services App - PWA Implementation Plan

## 🎯 App Overview
**Harivant** एक professional home services marketplace app जो service providers को service seekers से जोड़ती है। Firebase backend के साथ PWA (installable app) के रूप में।

---

## 📱 Core Features

### 1. Splash Screen & Onboarding
- Harivant branding के साथ animated splash screen
- Language selection (Hindi/English)
- Location selection (city/area)

### 2. Authentication System (Firebase Auth)
- Phone OTP login/signup
- Email authentication option
- Admin login separate portal

### 3. Service Seeker Home
- Service categories grid (Plumber, Electrician, Carpenter, etc.)
- Search functionality with filters
- Location-based service providers list
- Service provider profile view with ratings
- Contact/Call service provider

### 4. Service Provider Features
- Registration form (name, skills, location, phone, photo)
- Profile page with services offered
- Availability status toggle
- View booking requests

### 5. Admin Dashboard
- Pending service provider approvals
- Approve/Reject functionality
- View all users and providers
- Analytics overview

### 6. PWA Features
- Home screen install capability
- Offline access to basic pages
- App icon and splash screen
- Fast loading with service worker caching

---

## 🎨 Design Approach
- Modern, clean Indian design aesthetic
- Mobile-first responsive layout
- Blue/Green color theme (professional services)
- Easy-to-use navigation with bottom bar
- Hindi language support throughout

---

## 🔧 Technical Setup Required
आपको implement करने के बाद अपना Firebase config provide करना होगा:
- Firebase API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

---

## 📋 Pages Structure
1. `/` - Splash → Language → Location → Home
2. `/home` - Service Seeker Home
3. `/providers/:category` - Service Providers List
4. `/provider/:id` - Provider Profile
5. `/register-provider` - Service Provider Registration
6. `/admin` - Admin Login & Dashboard


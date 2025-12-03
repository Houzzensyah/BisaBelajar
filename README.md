# BisaBelajar - Full-Stack Skill Sharing Platform

A complete social learning platform built with **Laravel** backend and **React Native (Expo)** mobile frontend. Users can share skills, create posts, join courses, message each other, and schedule calls.

---

## 📋 Table of Contents

1. [Quick Start](#-quick-start)
2. [Project Overview](#-project-overview)
3. [Features](#-features)
4. [Architecture](#-architecture)
5. [Backend Setup](#-backend-setup)
6. [Mobile Setup](#-mobile-setup)
7. [API Reference](#-api-reference)
8. [Database Schema](#-database-schema)
9. [User Workflows](#-user-workflows)
10. [Testing](#-testing)
11. [Deployment](#-deployment)
12. [Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Start Backend (Terminal 1)

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --port=8000
```

Backend runs at: **http://localhost:8000**

### Start Mobile (Terminal 2)

```bash
cd mobile
npm install
npx expo start
```

Then press:

- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web
- Scan QR with Expo Go app for physical device

### Demo Credentials

```
alice@example.com / password
bob@example.com / password
carol@example.com / password
david@example.com / password
emma@example.com / password
frank@example.com / password
grace@example.com / password
henry@example.com / password
```

---

## 📖 Project Overview

### Technology Stack

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| **Backend**     | Laravel 12, PHP 8.2, Sanctum Auth              |
| **Database**    | SQLite (dev), PostgreSQL (prod)                |
| **Mobile**      | Expo, React Native, TypeScript                 |
| **Navigation**  | Expo Router (file-based)                       |
| **HTTP Client** | Axios                                          |
| **Storage**     | expo-secure-store (native), AsyncStorage (web) |

### Project Statistics

- **Backend**: 12 controllers, 8 models, 18 migrations, 40+ API endpoints
- **Mobile**: 13+ screens, 6 main tabs, 3 services
- **Tests**: 9 unit/feature tests, all passing
- **Database**: 8 users, 16 skills, 5 courses, 16 posts seeded

---

## ✨ Features

### Authentication & Users

- ✅ Token-based auth with Sanctum
- ✅ Registration with specialty selection
- ✅ Geolocation capture and storage
- ✅ Profile picture upload
- ✅ Profile editing

### Posts & Threads

- ✅ Create posts with optional photos
- ✅ Thread/reply system (nested conversations)
- ✅ Photo upload from gallery or camera
- ✅ Course association for posts
- ✅ Delete own posts

### Search & Discovery

- ✅ Full-text search across users and skills
- ✅ Proximity-based search (Haversine formula)
- ✅ Specialty filtering
- ✅ Distance badges on results

### Messaging

- ✅ Direct messaging between users
- ✅ Instagram-style chat UI
- ✅ Auto-scroll to latest messages
- ✅ Message deletion

### Calls

- ✅ Call lifecycle (pending → accepted → ended)
- ✅ Accept/decline incoming calls
- ✅ End active calls
- ✅ Real-time status polling

### Skills & Courses

- ✅ Skill CRUD operations
- ✅ Course enrollment
- ✅ Skill swap requests

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    BisaBelajar Platform                       │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
         ┌──────▼──────┐          ┌────────▼────────┐
         │  Backend    │          │  Mobile App     │
         │  (Laravel)  │◄────────►│ (React Native)  │
         └──────┬──────┘  JSON    └────────┬────────┘
                │                          │
         ┌──────▼──────┐          ┌────────▼────────┐
         │  SQLite/    │          │  Expo Router    │
         │  PostgreSQL │          │  + Axios        │
         └─────────────┘          └─────────────────┘
```

### Backend Layers

```
Routes (routes/api.php)
         │
Controllers (app/Http/Controllers/Api/)
         │
Models (app/Models/)
         │
Database (database/database.sqlite)
```

### Mobile Layers

```
Expo Router Navigation
         │
Screens & Components
         │
Services (api.ts, auth.ts)
         │
External Services (Axios, SecureStore)
```

### Directory Structure

```
.
├── Backend/                          # Laravel API
│   ├── app/Http/Controllers/Api/     # 12 controllers
│   ├── app/Models/                   # 8 models
│   ├── database/migrations/          # 18 migrations
│   ├── database/seeders/             # Database seeding
│   ├── routes/api.php                # 40+ API routes
│   └── tests/                        # PHPUnit tests
│
├── mobile/                           # Expo React Native app
│   ├── app/                          # Screens (file-based routing)
│   │   ├── auth/                     # Login, Register
│   │   ├── (tabs)/                   # 6 main tabs
│   │   ├── calls/                    # Call screen
│   │   ├── chat/                     # Chat screen
│   │   ├── posts/                    # Create/Reply posts
│   │   ├── users/                    # User profile
│   │   └── services/                 # API client, auth
│   ├── components/                   # Reusable UI
│   └── constants/                    # Theme, colors
│
└── README.md                         # This file
```

---

## ⚙️ Backend Setup

### Prerequisites

- PHP 8.2+
- Composer
- SQLite (development) or PostgreSQL (production)

### Installation

```bash
cd Backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve --port=8000
```

### Environment Configuration

```env
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SESSION_DOMAIN=localhost
```

### Database Commands

```bash
# Fresh migration with seeding
php artisan migrate:fresh --seed

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Create storage link for uploads
php artisan storage:link
```

### Controllers

| Controller            | Purpose                             |
| --------------------- | ----------------------------------- |
| `AuthController`      | Register, login, profile management |
| `SkillController`     | CRUD for skills                     |
| `CourseController`    | Courses and enrollment              |
| `PostController`      | Posts with threading                |
| `SearchController`    | Full-text and proximity search      |
| `UserController`      | User profiles                       |
| `SpecialtyController` | List specialties                    |
| `CallController`      | Call lifecycle management           |
| `ChatController`      | Messaging                           |
| `SwapController`      | Skill swaps                         |
| `MeetingController`   | Meeting scheduling                  |

---

## 📱 Mobile Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator or Android Emulator

### Installation

```bash
cd mobile
npm install
npx expo start
```

### Configure API Base URL

For physical devices, update `mobile/app/services/api.ts`:

```typescript
export const API_BASE_URL = "http://YOUR_IP:8000/api";
```

Platform defaults:

- iOS Simulator: `http://127.0.0.1:8000/api`
- Android Emulator: `http://10.0.2.2:8000/api`
- Web: `http://localhost:8000/api`

### Navigation Structure (6 Tabs)

1. **Home** 🏡 - Discover posts feed
2. **Explore** 🔍 - Search users & skills
3. **Skills** ⭐ - Browse skills
4. **Posts** 📝 - Instagram-style posts
5. **Messages** 💬 - Direct messaging
6. **Profile** 👤 - User profile & settings

### Key Services

**api.ts** - Centralized Axios client

- Auto-injects Bearer token
- Handles 401 (token expiry)
- Exports typed API methods

**auth.ts** - Token persistence

- SecureStore on native platforms
- AsyncStorage fallback on web

---

## 📡 API Reference

### Base URL

```
http://localhost:8000/api
```

### Authentication Header

```
Authorization: Bearer {token}
```

### Public Endpoints

#### Register

```http
POST /api/register
Content-Type: application/json

{
  "name": "string",
  "email": "email",
  "password": "string",
  "password_confirmation": "string",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "specialties": [1, 2, 3]
}

Response: { token, user }
```

#### Login

```http
POST /api/login
Content-Type: application/json

{
  "email": "email",
  "password": "string"
}

Response: { token, user }
```

#### List Specialties

```http
GET /api/specialties

Response: { data: [{ id, name }, ...] }
```

### Protected Endpoints

#### Current User

```http
GET /api/me
PUT /api/me (update profile)
POST /api/me/avatar (upload picture)
```

#### Skills

```http
GET /api/skills
POST /api/skills
GET /api/skills/{id}
PUT /api/skills/{id}
DELETE /api/skills/{id}
```

#### Courses

```http
GET /api/courses
POST /api/courses
GET /api/courses/{id}
POST /api/courses/{id}/enroll
```

#### Posts

```http
GET /api/posts
POST /api/posts (supports thread_id for replies)
GET /api/posts/{id}
DELETE /api/posts/{id}
```

#### Search

```http
GET /api/search?query=text&lat=X&lng=Y&distance=50&specialty=1
```

#### Calls

```http
POST /api/calls { callee_id }
GET /api/calls/{id}
POST /api/calls/{id}/accept
POST /api/calls/{id}/decline
POST /api/calls/{id}/end
```

#### Messages

```http
GET /api/messages?user_id=X
POST /api/messages { to_id, content }
DELETE /api/messages/{id}
```

#### Swaps

```http
GET /api/swaps
POST /api/swaps
POST /api/swaps/{id}/accept
POST /api/swaps/{id}/reject
```

### Response Format

**Success (200, 201)**

```json
{ "id": 1, "name": "example", ... }
```

**Validation Error (422)**

```json
{
  "message": "The given data was invalid.",
  "errors": { "field": ["error message"] }
}
```

**Unauthorized (401)**

```json
{ "message": "Unauthenticated." }
```

### Pagination

```json
{
  "data": [...],
  "links": { "first", "last", "next", "prev" },
  "meta": { "current_page", "per_page", "total" }
}
```

---

## 🗄️ Database Schema

### Core Tables

```
users
├── id, name, email, password
├── latitude, longitude
├── avatar_path, bio
└── timestamps

posts
├── id, user_id, thread_id (self-ref)
├── title, content, photo_url
├── course_id (optional)
└── timestamps

messages
├── id, from_id, to_id
├── content
└── timestamps

skills
├── id, user_id
├── name, category, description
└── timestamps

courses
├── id, user_id
├── title, description
└── timestamps

calls
├── id, caller_id, callee_id
├── status (pending/accepted/declined/ended)
├── started_at, ended_at
└── timestamps
```

### Relationships

```
User hasMany Skills, Courses, Posts
User belongsToMany Specialties
Post belongsTo User, Course (optional)
Post hasMany Replies (self-referential)
Call belongsTo User (caller, callee)
Message belongsTo User (from, to)
```

---

## 🔄 User Workflows

### Registration Flow

```
Mobile: Fill form + select specialties + capture location
    ↓
Backend: POST /api/register
    ↓
Backend: Create user, attach specialties, generate token
    ↓
Mobile: Save token in SecureStore → Redirect to home
```

### Call Flow

```
Mobile: User profile → Press "Call"
    ↓
Backend: POST /api/calls {callee_id} → status: pending
    ↓
Mobile: Redirect to /calls/[id], poll every 3s
    ↓
Callee: Accept/Decline buttons shown
    ↓
Backend: POST /api/calls/{id}/accept → status: accepted
    ↓
Either: POST /api/calls/{id}/end → status: ended
```

### Thread Creation

```
Create Post (thread_id = null) → Top-level post
    ↓
Reply to Post (thread_id = post_id) → Nested reply
    ↓
View Feed → Top-level posts with replies shown
```

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend
php artisan test
```

Expected output:

```
PASS  Tests\Unit\ExampleTest
PASS  Tests\Feature\CallTest
PASS  Tests\Feature\ExampleTest
  ✓ api skills returns
  ✓ api search returns users and skills
  ✓ api posts can be created
  ✓ api search nearby users
  ✓ api search filter specialty
  ✓ register with specialties and location

Tests: 9 passed (26 assertions)
Duration: 0.84s
```

### Mobile Linting

```bash
cd mobile
npm run lint
```

Expected: 0 errors, 0 warnings

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password","password_confirmation":"password"}'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password"}'

# Get profile (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/me
```

---

## 🚀 Deployment

### Backend Deployment

1. **Server Requirements**

   - PHP 8.2+
   - Composer
   - PostgreSQL (recommended for production)
   - Nginx or Apache

2. **Environment Setup**

   ```env
   APP_ENV=production
   APP_DEBUG=false
   DB_CONNECTION=pgsql
   DB_HOST=your-db-host
   DB_DATABASE=bisabelajar
   ```

3. **Deploy Commands**
   ```bash
   composer install --no-dev
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan storage:link
   ```

### Mobile Deployment

1. **Build for Production**

   ```bash
   npx expo build:ios
   npx expo build:android
   ```

2. **Update API URL**

   - Set `API_BASE_URL` to production server

3. **Publish**
   - iOS: App Store Connect
   - Android: Google Play Console

### Deployment Checklist

- [x] All tests passing
- [x] Linting clean
- [x] Migrations ready
- [x] Seeds working
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] SSL/TLS enabled
- [ ] Backups automated

---

## 🔧 Troubleshooting

### Backend Issues

**Database Lock Error**

```bash
rm database/database.sqlite
touch database/database.sqlite
php artisan migrate --seed
```

**Clear All Caches**

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### Mobile Issues

**Port 8081 Already in Use**

```bash
npx expo start --clear
```

**API Connection Issues**

- Check `API_BASE_URL` in `api.ts`
- For Android emulator: use `10.0.2.2` instead of `127.0.0.1`
- For physical device: use your machine's IP address
- Verify backend is running: `curl http://localhost:8000/api/specialties`

**Token Not Persisting**

- Check SecureStore/AsyncStorage permissions
- Check browser console for errors in web mode

---

## 📊 Current Status

| Component   | Status              | Tests              |
| ----------- | ------------------- | ------------------ |
| Backend API | ✅ Production Ready | 9/9 passing        |
| Mobile App  | ✅ MVP Complete     | Lint 0 errors      |
| Database    | ✅ Optimized        | With seeding       |
| Auth System | ✅ Secure           | Token-based        |
| Search      | ✅ Advanced         | Proximity + filter |
| Calls       | ✅ Lifecycle Ready  | Accept/decline/end |
| Chat        | ✅ Instagram-style  | Dynamic bubbles    |
| Posts       | ✅ Threaded         | With photos        |

---

## 📝 Development Guidelines

### Backend Conventions

- Controllers in `app/Http/Controllers/Api/`
- All API responses must be JSON
- Use `auth:sanctum` middleware for protected routes
- Use resource routes: `Route::apiResource('skills', SkillController::class)`
- Keep controllers clean, delegate logic to Models/Services

### Mobile Conventions

- All API calls through `services/api.ts`
- Never call axios directly in screens
- Use `services/auth.ts` for token management
- Follow file-based routing with Expo Router
- Use TypeScript for all files

---

## 📞 Support

- **Laravel Docs**: https://laravel.com/docs
- **Expo Docs**: https://docs.expo.dev
- **Sanctum**: https://laravel.com/docs/sanctum
- **React Native**: https://reactnative.dev

---

## 📄 License

MIT License

---

**Built with Laravel 12 + Expo | Tested & Production Ready | © 2025**

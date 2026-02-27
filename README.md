# Task Reminder Lite

A mobile task reminder app built with **React Native (Expo)** and **Supabase**. Users can sign up, log in, and manage personal tasks with local notifications and optional Telegram alerts.

---

## Tech Stack

- **React Native** (Expo SDK 54)
- **Expo Router** (file-based routing)
- **TypeScript**
- **Supabase** (Auth, PostgreSQL, RLS)
- **Expo Notifications**
- **Expo Secure Store** (session persistence)

---

## Features

- **Auth** – Email/password signup & login with validation (valid email, min 6 chars)
- **Tasks** – Create (title + optional description), toggle complete, delete with per-user isolation
- **Notifications** – Local reminder when a task is added (2 min delay)
- **Toast** – Success/error feedback for add, update, delete, login, signup
- **Battery** – Optional Telegram alert when battery drops below 20% (foreground only)
- **UI** – Warm brown theme, logout confirmation
- **Session** – Persistent auth via Secure Store, splash redirects to home or login

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app (for device testing)
- Supabase project
- (Optional) Telegram bot for battery alerts

---

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example` if present):

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: for battery low Telegram alerts
EXPO_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
EXPO_PUBLIC_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

---

## Database Schema

### `tasks` table

| Column      | Type      | Description               |
| ----------- | --------- | ------------------------- |
| id          | uuid      | Primary key               |
| title       | text      | Task title                |
| description | text      | Optional task description |
| completed   | boolean   | Task status               |
| user_id     | uuid      | Owner (auth.users.id)     |
| created_at  | timestamp | Created time              |

To add the `description` column to an existing table, run in Supabase SQL editor:

```sql
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description text;
```

RLS policies ensure users can only access their own tasks. `user_id` is set via `auth.uid()`.

---

## Project Structure

```
app/
  _layout.tsx       # Root layout
  index/            # Splash (auth check, redirect)
  login/            # LoginScreen
  signup/           # RegisterScreen
  home/             # HomeScreen (task list)

components/
  AuthInput.tsx     # Reusable auth field with validation
  TaskInput.tsx     # Add-task input
  TaskItem.tsx      # Task row (checkbox, delete)
  Toast.tsx         # Global toast notifications

hooks/
  useAuth.ts        # Login/signup logic
  useTasks.ts       # Task CRUD, notifications, battery

constants/
  colors.ts         # Theme colors
  routeConstants.ts # Route paths
lib/
  supabase.ts       # Supabase client
  telegram.ts       # Telegram alert helper
```

---

## How to Run

```bash
# Install dependencies
npm install

# Create .env with Supabase (and optionally Telegram) vars
# Then start:
npx expo start
```

Use `npx expo start --android` or `npx expo start --ios` for device/simulator.

---

## Notifications

- Uses **Expo Notifications**
- Android notification channel required
- Reminder scheduled 2 minutes after a task is added
- Permission requested on first load

---

## Battery & Telegram

- Battery is checked **only while the app is in the foreground**
- If level ≤ 20%, a Telegram message is sent (when env vars are set)
- True background monitoring would need native services and is not included

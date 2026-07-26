# SUR & SWAG — Project Specification (PRD)

## 1. Project Overview

Name: Sur & Swag (সুর ও স্বাগ)
One-liner: A Bengali-first short-video (reels) platform matching TikTok's core experience — music-driven vertical video feed, creation tools, social interaction, and monetization.
Target users: Bengali-speaking content creators and viewers (Bangladesh/West Bengal focus), ages 13+.
Platform: Mobile-first responsive web app (built with React), designed to later wrap as Android/iOS app if needed.
Business goal: Real users will use this. Must support monetization and creator subscriptions from the roadmap's mid-phase onward.

---

## 2. Core Features (Full List)

### 2.1 Authentication & Onboarding
- Sign up / Login (email, phone number, Google, Facebook)
- OTP verification (phone)
- Profile setup wizard (username, avatar, bio, interests selection)
- Age gate / terms acceptance

### 2.2 Video Feed (For You + Following)
- Vertical infinite-scroll video feed (swipe up/down)
- Two tabs: For You (algorithmic) and Following (chronological)
- Auto-play, auto-loop videos
- Mute/unmute, tap to pause
- Double-tap to like (heart animation)
- Progress bar for video scrubbing

### 2.3 Video Creation & Upload
- Record video in-app (camera, front/back switch)
- Upload from gallery
- Multi-clip recording (segments, combine)
- Trim/cut clips
- Speed control (0.3x-3x)
- Filters (color grading presets)
- Beauty filter / face effects (AR filters, stickers)
- Green screen / background replacement
- Text overlay (multiple boxes, fonts, colors, animation)
- Stickers, GIFs, emoji overlay
- Voiceover recording
- Add music/sound from library
- Volume mixing (original vs added music)
- Auto-captions (speech-to-text)
- Cover photo selection
- Caption + hashtags + mentions (@)
- Privacy setting per video (public/friends/private)
- Allow/disallow: comments, duet, stitch, download
- Schedule post for later
- Draft saving

### 2.4 Duet & Stitch
- Duet: side-by-side recording with original video
- Stitch: clip seconds of another video, continue with own content
- Original creator attribution shown

### 2.5 Sound / Music System
- Music library (licensed tracks, trending sounds)
- Sound detail page (videos using that sound, usage count)
- Save sound to favorites
- Extract sound from any video
- Trending sounds chart/discovery

### 2.6 Engagement & Social
- Like, comment, share, bookmark/save
- Comments: nested replies, like, pin (creator), sort top/newest
- Comment moderation (delete, keyword filter)
- Share to: DM, WhatsApp, Facebook, copy link, download
- Follow/unfollow, follower/following list
- Block/report user or video
- @mentions, #hashtag pages

### 2.7 Discover / Search
- Search: users, sounds, hashtags, videos
- Trending page
- Category browsing (dance, comedy, music, food, etc.)
- QR code profile sharing

### 2.8 Profile Page
- Avatar, username, bio, link
- Stats: following, followers, likes
- Tabs: Videos, Liked (if public), Reposts
- Edit/share profile
- Verified checkmark system

### 2.9 Direct Messages
- 1:1 chat, emoji, stickers
- Share videos/sounds in chat
- Message requests (non-followers)
- Read receipts, typing indicator

### 2.10 Notifications
- Likes, comments, followers, mentions
- Milestone notifications
- System notifications, push support

### 2.11 Live Streaming
- Go live (min follower requirement)
- Live comments/reactions
- Virtual gifts during live
- Viewer count, replay/highlights

### 2.12 Monetization
- Creator Fund / ad revenue share
- Virtual Gifts: coins to buy gifts, gifts to diamonds, cash out
- In-feed video ads
- Branded content disclosure toggle
- Creator analytics dashboard
- Payout (bKash/Nagad integration)

### 2.13 Subscriptions
- Creator subscription tiers (monthly)
- Subscriber-only content
- Subscriber badge in comments/live chat
- Subscription management (user + creator side)

### 2.14 Safety & Moderation
- AI content flagging + human review
- Report system
- Restricted mode
- Screen time/digital wellbeing
- Community guidelines page

### 2.15 Settings
- Account/privacy settings
- Notification preferences
- Data controls (export/delete account)
- Language toggle (Bengali/English)
- Dark/light theme

---

## 3. Design System

### Color Palette
- Background (base): #0B0B0F (near-black)
- Text (primary): #F5F0E8 (warm off-white)
- Accent (primary): #FF3B7C (pink-magenta — likes, music energy)
- Accent (secondary): #F5C042 (gold — highlights, live badges)
- Surface (cards/overlays): rgba(255,255,255,0.08)

### Typography
- Display/Headings: Poppins Bold (or Hind Siliguri Bold for Bengali)
- Body text: Hind Siliguri Regular (Bengali support)
- UI/numerals: Inter or system sans-serif

### Layout
- Mobile-first, full-screen vertical video feed
- Bottom navigation: Home, Discover, Upload (+), Inbox, Profile
- Right-side action rail: profile avatar, like, comment, share, music disc
- Bottom caption block: username, caption, sound name

### Signature Element
- Spinning music disc icon (bottom-right of each video) — spins while video plays, pauses when video is paused
- Reinforces the "Sur" (music) identity of the brand

### Interaction Rules
- Double-tap video = like animation
- Tap once = pause/play
- Swipe up/down = next/previous video
- Long-press = show video options (save, report, speed)

---

## 4. Tech Stack & Architecture

### Frontend
- Framework: React (with Vite or Next.js)
- Styling: Tailwind CSS
- Icons: lucide-react
- Video playback: HTML5 video / hls.js for streaming
- State management: React Context or Zustand

### Backend
- Runtime: Node.js (Express or Fastify)
- API style: REST or GraphQL
- Auth: JWT-based sessions + OAuth (Google/Facebook)
- Real-time: WebSocket (Socket.io) for live chat, DMs, live streaming signals

### Database
- Primary DB: PostgreSQL (users, videos metadata, follows, comments, subscriptions)
- Cache/session: Redis
- Search: Elasticsearch or Meilisearch (video/user/hashtag search)

### Media & Storage
- Video storage: Cloud object storage (S3-compatible) + CDN for delivery
- Video processing: FFmpeg (transcoding, thumbnails, trimming)
- Live streaming: RTMP ingest + HLS output (e.g., via a media server like Ant Media / Mux)

### Payments & Payouts
- Coins/gifts purchase: Stripe or local payment gateway
- Creator payouts: bKash/Nagad API integration (Bangladesh)

### Infrastructure
- Hosting: Cloud provider (AWS/GCP/DigitalOcean)
- CI/CD: GitHub Actions
- Monitoring: Basic logging + error tracking (e.g., Sentry)

### Folder Structure (proposed)
```
sur-swag/
  frontend/
    src/
      components/
      pages/
      hooks/
      styles/
  backend/
    src/
      routes/
      controllers/
      models/
      services/
      sockets/
  shared/
    types/
docs/
  sur-swag-spec.md   (this file)
```

---

## 5. Development Roadmap

### Phase 1 — Frontend UI (dummy data)
- Build all core screens: feed, profile, upload UI, search, inbox, notifications
- Use placeholder/mock video data
- Finalize design system and signature interactions

### Phase 2 — Backend Foundation
- Set up database schema (users, videos, comments, likes, follows)
- Build auth system (signup/login/OTP)
- Build core APIs (CRUD for videos, comments, likes, follows)

### Phase 3 — Connect Frontend to Backend
- Replace dummy data with real API calls
- Implement video upload pipeline (storage + transcoding)
- Implement real-time features (DM, notifications)

### Phase 4 — Monetization & Subscriptions
- Build coins/gifts purchase flow
- Build creator subscription tiers
- Build analytics dashboard for creators
- Integrate payout system (bKash/Nagad)

### Phase 5 — Advanced Features
- Live streaming
- Duet/Stitch
- AR filters/effects
- Recommendation algorithm (For You feed ranking)

### Phase 6 — Testing & Deployment
- Security testing, load testing
- Beta launch with limited users
- Public launch

---

## 6. Notes / Decisions Log

- Chosen React + Node.js stack for fastest iteration speed and wide community support.
- Bengali language support is a first-class requirement, not an afterthought — all UI text, fonts, and content moderation must account for Bengali script.
- Monetization (gifts, subscriptions, ads) is a Must-have from Phase 4 onward, not optional/later.
- Design direction: near-black theme with pink-magenta + gold accents, avoiding generic "AI-generated" design defaults (cream/serif or plain dark+neon look).
- Signature UI element: spinning music disc, ties visual identity to the "Sur" (music) concept of the brand name.

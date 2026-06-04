# Nexus Board - Web PWA

Play Chess, Ludo & Snakes with friends online!

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build:** Vite
- **Styling:** Tailwind CSS v3
- **State:** Pinia
- **Router:** Vue Router 4
- **Auth:** Firebase Auth (Email Link + Google)
- **Database:** Firestore + Firebase Realtime DB
- **PWA:** Vite PWA Plugin (installable, offline capable)
- **Push:** FCM v1 Web Push
- **Hosting:** Vercel

## Project Structure

```
src/
├── components/          # Vue components
│   ├── ui/             # Base UI components
│   ├── game/           # Game components
│   ├── theme/          # Theme components
│   ├── chat/           # Chat components
│   ├── rps/            # Rock Paper Scissors
│   ├── skill/          # Skill system
│   └── admin/          # Admin components
├── views/              # Page-level components
│   └── admin/          # Admin pages
├── stores/             # Pinia stores
├── composables/        # Vue composables
├── router/             # Vue Router config
├── lib/                # Utilities & configs
└── assets/             # CSS and static assets
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env.local with Firebase config
cp .env.example .env.local
# Edit .env.local with your Firebase credentials
```

### Development

```bash
npm run dev
```

Opens at http://localhost:3000

### Build

```bash
npm run build
```

Generates optimized bundle in `dist/`

### Preview Build

```bash
npm run preview
```

## Firebase Setup

1. Create Firebase project: https://console.firebase.google.com
2. Enable:
   - Authentication (Email Link + Google)
   - Firestore Database
   - Realtime Database
   - Cloud Messaging (FCM v1)
3. Get credentials and add to `.env.local`

## PWA Installation

- **Desktop:** Chrome → Install button (top-right)
- **Android:** Chrome → Menu → Install app
- **iOS:** Safari → Share → Add to Home Screen

## Features

- ✅ Chess, Ludo, Ular Tangga games
- ✅ Online multiplayer with real-time sync
- ✅ Offline AI opponents
- ✅ 20 dynamic themes (2 free + 8 premium)
- ✅ Skill system (cosmetic only)
- ✅ Betting system (optional)
- ✅ Social features (friends, chat)
- ✅ Economy system (Koin + Diamond)
- ✅ Admin dashboard
- ✅ PWA (installable, offline playable)

## Roadmap

See `NEXUS_BOARD_MASTER.md` for complete 12-phase development roadmap.

## License

MIT

## Support

For issues and questions, contact support@nexusboard.app

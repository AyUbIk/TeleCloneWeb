# TeleClone - Telegram-Style Chat Application

## Overview

TeleClone is a Telegram-inspired web chat application built with React and Express. It features a modern messaging interface with AI-powered conversations using Google's Gemini API through Replit's AI Integrations service. The app supports dark/light themes, responsive mobile layouts, and local storage for message persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React useState/useLocalStorage for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom Telegram-inspired theme (light/dark modes)
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` using Zod for validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **AI Integration**: Google Gemini API via Replit's AI Integrations service

### Data Storage
- **Primary Database**: PostgreSQL (via Drizzle ORM)
- **Client-side Storage**: LocalStorage for messages and theme preferences (keys prefixed with `teleclone_`)
- **Schema Tables**: `users`, `app_messages`, `app_chats`, `conversations`, `messages`

### Key Design Patterns
- **Shared Types**: TypeScript types and Zod schemas in `shared/` directory are used by both frontend and backend
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Component Structure**: UI primitives in `components/ui/`, custom components in `components/`
- **Server-side Rendering**: Vite middleware handles development, static files served in production

### Build & Development
- **Development**: `npm run dev` runs TSX for hot-reloading server with Vite middleware
- **Production Build**: esbuild bundles server, Vite bundles client to `dist/`
- **Database Migrations**: `npm run db:push` syncs schema to database via Drizzle Kit

## External Dependencies

### AI Services
- **Gemini API**: Accessed through Replit AI Integrations (`@google/genai` package)
- **Environment Variables**: `AI_INTEGRATIONS_GEMINI_API_KEY`, `AI_INTEGRATIONS_GEMINI_BASE_URL`
- **Supported Models**: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-image`

### Database
- **PostgreSQL**: Connected via `DATABASE_URL` environment variable
- **Connection Pool**: `pg` package with Drizzle ORM adapter

### Key NPM Packages
- **UI**: Radix UI primitives, Lucide React icons, class-variance-authority
- **Forms**: React Hook Form with Zod resolver
- **Utilities**: date-fns, clsx, tailwind-merge, uuid, nanoid
- **Messaging**: react-textarea-autosize, embla-carousel-react

### Fonts
- Inter (primary sans-serif)
- DM Sans, Fira Code, Geist Mono (additional fonts loaded from Google Fonts)
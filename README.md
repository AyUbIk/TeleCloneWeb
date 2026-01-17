# TeleClone-Web (Serverless Ready)

A Telegram-inspired P2P web application built with React, Vite, and PeerJS. This application is designed to be serverless-friendly and can be deployed to platforms like Vercel.

## Serverless Deployment (Vercel)
This project is fully compatible with Vercel. It uses PeerJS for direct P2P communication, meaning messages don't pass through a central server.
1. Push to GitHub.
2. Import to Vercel.
3. Add `AI_INTEGRATIONS_GEMINI_API_KEY` if you want to use the Gemini AI feature.

## Features
- **P2P Messaging**: Direct browser-to-browser communication via PeerJS.
- **Serverless Architecture**: No backend required for core messaging.
- **Local Storage**: Messages are saved locally in your browser.
- **Gemini AI Integration**: Chat with AI via API.
- **Modern UI**: Telegram-like experience with dark mode.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Lucide React, Framer Motion.
- Backend: Express, Socket.io (for signaling).
- P2P: PeerJS.
- Database: PostgreSQL (via Drizzle ORM).

## Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd TeleClone-Web
   npm install
   ```
3. Set up environment variables (see `.env.example`).
4. Run the development server:
   ```bash
   npm run dev
   ```

## License
MIT

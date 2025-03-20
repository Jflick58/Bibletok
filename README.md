# BibleTok Next.js App

This is a Next.js version of the BibleTok application, combining both the frontend and backend into a single codebase.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with the following variables:
```
BIBLE_API_KEY=your_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- Single codebase for both frontend and backend
- API routes for Bible verses and information
- React components with Tailwind CSS for styling
- Next.js App Router for improved performance

## Deployment

Deploy to Vercel with a simple push to your repository. Make sure to set the `BIBLE_API_KEY` environment variable in your Vercel project settings.
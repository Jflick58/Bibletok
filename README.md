# Bibletok

A TikTok-inspired application for infinitely scrolling through Bible verses. This app allows users to swipe through verses, like their favorites, and share verses with others.

## Project Structure

```
Bibletok/
├── frontend/          # React frontend application
│   ├── public/        # Static assets
│   ├── src/           # Source code
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts for state management
│   │   └── types/       # TypeScript interfaces
│   └── ...            # Configuration files
├── server/            # Express backend application
│   ├── src/
│   │   ├── controllers/ # API endpoint handlers
│   │   ├── routes/      # API route definitions
│   │   ├── services/    # Business logic and API integrations
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Utility functions and helpers
│   └── ...            # Configuration files
└── ...                # Project configuration files
```

## Features

- Swipe-based navigation through Bible verses
- Multiple Bible translations support
- Verse liking and sharing
- Infinite scrolling with dynamic loading
- Beautiful gradient backgrounds
- Mobile-first responsive design
- Fast and secure API

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Bible API key (already included in the example configuration)

### Running the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The backend will be available at http://localhost:3000/api

### Running the Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will be available at http://localhost:5173

## Building for Production

### Backend Build

```
cd server
npm run build
npm start
```

### Frontend Build

```
cd frontend
npm run build
```

The build will be available in the `frontend/dist` directory, which is served by the backend in production mode.

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **External API**: Bible API (api.scripture.api.bible)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

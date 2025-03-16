# BibleTok

BibleTok is a React application that allows users to explore and read Bible verses. The application features a user-friendly interface with swipe navigation, version selection, and the ability to like and share verses.

## Project Structure

```
frontend
├── public
│   ├── bible-icon.svg        # SVG icon used as a favicon
│   └── index.html            # Main HTML file serving the React app
├── src
│   ├── components            # Contains all React components
│   ├── contexts              # Contains context providers for state management
│   ├── types                 # TypeScript interfaces for Bible data
│   ├── App.tsx               # Main application component
│   ├── index.css             # Global styles
│   ├── main.tsx              # Entry point for the React application
│   └── vite-env.d.ts         # TypeScript definitions for Vite's environment
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
├── tsconfig.node.json        # Node.js specific TypeScript configuration
└── vite.config.ts            # Vite configuration file
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Run the development server:**
   ```
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Usage

- Use swipe gestures to navigate through verses.
- Click the like button to save your favorite verses.
- Share verses via the share button.
- Select different Bible versions using the version selector.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.
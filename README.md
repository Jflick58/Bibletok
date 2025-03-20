# BibleTok

![BibleTok Logo](/public/images/web/apple-touch-icon.png)

BibleTok is a modern, engaging Bible exploration app inspired by TikTok and [Wikitok](https://wikitok.vercle.app) It presents Bible verses in a fun, swipeable interface while maintaining reverence for scripture.

## Why? 

A few reasons: 
- I'm a big fan of WikiTok and a friend suggested someone could do that but with Bible verses. 
- I've never used Next.JS and wanted to learn it. 
- I wanted to see how far I could get with #vibecoding. This was built using the Claude iOS App (I actually dictated the original though via voice), Github Codespaces, and Claude Code. I never actually ran this locally on a full-featured computer. Most of the development was done on iPad. 

## ✨ Features

- **Verse Discovery**: Swipe through hand-picked Bible verses in an engaging format
- **Multiple Translations**: Access various English Bible translations
- **Save Favorites**: Mark your favorite verses for quick access later
- **Full PWA Support**: Install on mobile devices as a standalone app
- **Responsive Design**: Optimized for all devices from mobile to desktop

## 🚀 Live Demo

Visit [bibletok.vercel.app](https://bibletok.vercel.app) to see the app in action!

## 🛠️ Tech Stack

- **Frontend**: React.js with Next.js App Router
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API
- **API Integration**: [Scripture API](https://scripture.api.bible/) for scripture content
- **Deployment**: Vercel for serverless hosting

## 🧰 Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Bible API key from [Scripture API](https://scripture.api.bible)

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bibletok.git
   cd bibletok
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with your API key:
   ```
   BIBLE_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

### Build for Production

```bash
npm run build
npm run start
```

## 📱 PWA Installation

BibleTok can be installed as a Progressive Web App:

1. Visit the website in Chrome, Safari, or your preferred browser
2. On iOS, tap the Share button, then "Add to Home Screen"
3. On Android, tap the menu button, then "Add to Home Screen"
4. On desktop, look for the install icon in the address bar

## 📝 API Reference

BibleTok uses the following API endpoints:

- `/api/bibles` - Get all available Bible translations
- `/api/bibles/[bibleId]` - Get information about a specific Bible translation
- `/api/verses/[bibleId]` - Get random verses from a specific Bible
- `/api/verses/[bibleId]/after/[verseId]` - Get verses after a specific verse
- `/api/verses/[bibleId]/before/[verseId]` - Get verses before a specific verse

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Bible content provided by [Scripture API](https://scripture.api.bible)
- Icons developed using [IconKitchen](https://icon.kitchen/i/H4sIAAAAAAAAA6tWKkvMKU0tVrKqVkpJLMoOyUjNTVWySkvMKU6t1VHKzU8pzQHJRisl5qUU5WemKOkoZeYXA8ny1CSl2FoApT8%2BHkAAAAA%3D)
- All scripture quotations are from their respective translations and copyright holders
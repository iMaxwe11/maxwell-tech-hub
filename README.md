# Maxwell Tech Hub v5.0

🚀 **Dark-luxury developer portfolio with real-time data feeds, interactive tools, and space tracking.**

Built with Next.js 15, TypeScript, Framer Motion, and Tailwind CSS — featuring Grok-style starfield animation, live ISS tracking, NASA imagery, cryptocurrency tickers, and more.

---

## ✨ Features

### 🌟 Visual Effects
- **Grok-Style Starfield**: 150 twinkling stars with depth variation and parallax
- **CRT Terminal**: Retro phosphor green terminal with scan lines and matrix rain
- **Aurora Background**: Animated gradient bands with smooth motion
- **Text Animations**: RGB sweep, shimmer, custom color picker for headers
- **Glass Morphism**: Frosted glass cards with hover effects

### 📡 Live Data Feeds (Phase 1)
- **ISS Tracker**: Real-time International Space Station position, velocity, altitude
- **NASA APOD**: Astronomy Picture of the Day with expandable descriptions
- **Crypto Ticker**: Live cryptocurrency prices via CoinCap API (BTC, ETH, etc.)
- **Weather Widget**: Local weather for Sicklerville, NJ via Open-Meteo

### 🛠️ Developer Tools
- JSON Formatter
- Base64 Encoder/Decoder
- Regex Tester
- Color Tools
- Timestamp Converter

### 🎨 Design System
- Dark-luxury aesthetic with cyan/purple accent colors
- Responsive design (mobile-first)
- Custom font system (Inter + monospace)
- Smooth scroll animations
- Interactive hover states

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/iMaxwe11/maxwell-tech-hub.git
cd maxwell-tech-hub

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📦 Tech Stack

**Frontend:**
- Next.js 15.0.8 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

**APIs:**
- CoinCap v2 (Cryptocurrency)
- NASA API (Space imagery & NEO data)
- Where the ISS At? (Satellite tracking)
- Open-Meteo (Weather)

**Deployment:**
- Vercel (recommended)
- Cloudflare Workers (API proxying)

---

## 🗂️ Project Structure

```
maxwell-tech-hub/
├── app/
│   ├── api/
│   │   ├── nasa/route.ts          # NASA API proxy
│   │   ├── iss/route.ts           # ISS tracker proxy
│   │   ├── crypto/route.ts        # CoinCap proxy
│   │   └── github/route.ts        # GitHub API proxy
│   ├── terminal/page.tsx          # CRT terminal page
│   ├── tools/page.tsx             # Developer tools
│   ├── page.tsx                   # Homepage
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
├── components/
│   └── widgets/
│       ├── ISSTracker.tsx         # ISS live tracker widget
│       ├── NASAAPODCard.tsx       # NASA imagery card
│       └── CryptoTicker.tsx       # Crypto price ticker
├── public/                        # Static assets
└── package.json
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
# NASA API (optional - defaults to DEMO_KEY)
NASA_API_KEY=DEMO_KEY

# GitHub API (optional - for higher rate limits)
GITHUB_TOKEN=your_github_token_here
```

### API Keys

- **NASA API**: Get a free key at https://api.nasa.gov (instant approval)
- **GitHub Token**: Generate at https://github.com/settings/tokens (for higher rate limits)
- **CoinCap**: No key required
- **Where the ISS At**: No key required
- **Open-Meteo**: No key required

---

## 📋 Roadmap

### Phase 1: Core Experience ✅
- [x] Grok starfield animation
- [x] Weather widget
- [x] Terminal bug fixes
- [x] UI visibility improvements
- [x] ISS tracker
- [x] NASA APOD card
- [x] Crypto ticker

### Phase 2: Developer Tools (In Progress)
- [ ] QR code generator
- [ ] Dictionary lookup
- [ ] GitHub stats dashboard
- [ ] Enhanced tool pages

### Phase 3: Engagement Features (Planned)
- [ ] Tech trivia quiz
- [ ] Programming jokes widget
- [ ] Hacker News feed
- [ ] Earthquake map
- [ ] HTTP Cats reference

### Future Enhancements
- [ ] Blog/articles section
- [ ] Project showcase with filtering
- [ ] Resume download
- [ ] Contact form
- [ ] Dark/light theme toggle

---

## 🐛 Known Issues & Fixes

### Terminal `.includes()` Error - FIXED ✅
**Issue:** `TypeError: Cannot read properties of undefined (reading 'includes')`  
**Fix:** Added `String()` wrapper to prevent errors on undefined values

### UI Visibility - IMPROVED ✅
**Changes:**
- Navbar: Darker background, better borders, added shadows
- Text: Increased contrast (white/70-90 instead of muted colors)
- Buttons: More prominent borders and hover states

---

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Maxwell Nixon**

- GitHub: [@iMaxwe11](https://github.com/iMaxwe11)
- Email: mnixon112@outlook.com
- Location: Southampton, NJ

---

## 🙏 Acknowledgments

- NASA API for space imagery and data
- CoinCap for cryptocurrency data
- Open-Meteo for weather data
- Where the ISS At? for satellite tracking
- Vercel for hosting
- The open-source community

---

**Built with ❤️ and way too much caffeine**

*Last updated: March 15, 2026*

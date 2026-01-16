# ThreadBound 📚🤖

**AI-Powered Reading Companion** - A React Native mobile app that enhances your ebook reading experience with spoiler-free AI assistance.

## ✨ Features

### 📖 EPUB Reader
- Import EPUB files from your device
- Clean, distraction-free reading interface
- Chapter navigation with table of contents
- Adjustable font sizes
- Reading progress tracking

### 🤖 AI Reading Companion
- **Spoiler-Free Summaries** - Get story recaps that only include what you've read
- **Quick Recaps** - Refresh your memory when returning after a break
- **Character Guide** - Track characters introduced up to your current position
- **Reading Assistance** - Get explanations for complex passages or vocabulary
- **Custom Questions** - Ask anything about the story (spoiler-protected)

### 🛡️ Spoiler Protection
The AI strictly adheres to your reading position:
- Only references events up to your current chapter
- Politely declines questions about future plot points
- Never hints at upcoming twists or developments

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (iOS/Android) or emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/BertrandOscarSaputra/ThreadBound.git
cd ThreadBound

# Install dependencies
npm install

# Set up environment variables
# Create a .env file with your Gemini API key:
echo "EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here" > .env
```

### Running the App

```bash
# Start the development server
npx expo start
```

- Press **i** for iOS simulator
- Press **a** for Android emulator
- Scan QR code with Expo Go for physical device

## 🔑 API Key Setup

This app uses Google's Gemini API for AI features. To get your free API key:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add it to your `.env` file:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ProgressTracker.tsx
│   └── QuickActions.tsx
├── navigation/       # App navigation
│   └── AppNavigator.tsx
├── prompts/          # AI system prompts
│   └── systemPrompt.ts
├── screens/          # Main app screens
│   ├── AICompanionScreen.tsx
│   ├── LibraryScreen.tsx
│   └── ReaderScreen.tsx
├── services/         # Business logic
│   ├── aiService.ts
│   └── bookService.ts
├── store/            # State management
│   └── bookStore.ts
├── theme/            # Styling constants
│   └── index.ts
└── types/            # TypeScript definitions
    └── index.ts
```

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** Zustand
- **AI:** Google Gemini API
- **File Parsing:** JSZip for EPUB

## 📱 Screenshots

*Coming soon*

## 🗺️ Roadmap

- [ ] PDF support
- [ ] Bookmarking system
- [ ] Highlighting and annotations
- [ ] Multiple theme options
- [ ] Offline AI with on-device models
- [ ] Reading statistics

## 📄 License

MIT License - feel free to use this project for learning or building your own reading app!

---

Built with ❤️ using React Native and Expo

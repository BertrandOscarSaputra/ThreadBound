# ThreadBound 

**AI-Powered Reading Companion** - A React Native mobile app that enhances your ebook reading experience with spoiler-free AI assistance.

## Features

### EPUB Reader
- Import EPUB files from your device
- Clean, distraction-free reading interface
- Chapter navigation with table of contents
- Adjustable font sizes
- Reading progress tracking

### AI Reading Companion
- **Spoiler-Free Summaries** - Get story recaps that only include what you've read
- **Quick Recaps** - Refresh your memory when returning after a break
- **Character Guide** - Track characters introduced up to your current position
- **Reading Assistance** - Get explanations for complex passages or vocabulary
- **Custom Questions** - Ask anything about the story (spoiler-protected)

### Spoiler Protection
The AI strictly adheres to your reading position:
- Only references events up to your current chapter
- Politely declines questions about future plot points
- Never hints at upcoming twists or developments

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo Go app (iOS/Android) or emulator

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** Zustand
- **AI:** Google Gemini API
- **File Parsing:** JSZip for EPUB

## Roadmap

- [ ] PDF support
- [ ] Bookmarking system
- [ ] Highlighting and annotations
- [ ] Multiple theme options
- [ ] Offline AI with on-device models
- [ ] Reading statistics

## License

MIT License - feel free to use this project for learning or building your own reading app!

---

# NOMA — Voice Command Shopping Assistant 🛒

NOMA is an intelligent, voice-first shopping assistant engineered for natural speech interaction. Rather than requiring users to manually type items and organize shopping lists, NOMA listens to everyday conversational phrases (such as *"I need two bottles of milk and five apples"*) and instantly transforms speech into structured, aisle-categorized items with exact quantities and units.

---

## 📄 Technical Approach (Assessment Write-Up)

> **Software Engineering Approach & Architecture (200 Words)**
>
> NOMA was designed as a production-grade, voice-first consumer application focused on low-latency human interaction. To deliver a seamless user experience, the system uses a hybrid intent processing architecture: a high-speed local deterministic parser handles structured and multilingual commands (English, Hindi, Hinglish like *"Do packet doodh add kar do"*) in under 100ms, while a serverless endpoint proxy handles complex conversational sentences via `/api/ai/interpret`.
>
> State management is powered by React 19 Context API with persistent local storage syncing list state, custom voice logs, and historical purchase data. Smart suggestions calculate household replenishment rhythms based on restock interval gaps, current monthly seasonal catalog availability, and product substitution logic (e.g., Almond Milk for Milk).
>
> For physical supermarket trips, NOMA features a dedicated hands-free **Shopping Mode** with high-contrast typography, large touch targets, and voice step navigation (*"Got it"*, *"Next"*). Built with React 19, TypeScript, Tailwind CSS v4, and Vite.

---

## ✨ Core Features

### 🎙️ 1. Multilingual Voice Input
- Real-time speech recognition powered by Web Speech API.
- Accepts natural commands in **English**, **Hindi** (*"दूध जोड़ो"*), and **Hinglish** (*"2 packet doodh add kar do"*).
- Live updating voice command activity log with real-time relative timestamps.

### 💡 2. Smart Suggestions & Personalization
- **Replenishment Predictor**: Automatically calculates household restock frequencies (e.g., Milk every 7 days) and highlights overdue items.
- **Frequently Bought Together**: Identifies product pairings (Bread + Milk + Eggs) with 1-click bundle addition.
- **Product Substitutions**: Recommends smart alternatives for out-of-stock or requested items (Almond Milk for Milk, Whole Wheat for White Bread).
- **Seasonal Catalog**: Highlights fresh produce in season for the active month.

### 📝 3. Intelligent Shopping List
- **Aisle Categorization**: Organizes items into store sections (Produce, Dairy, Bakery, Pantry, Personal Care, Beverages, Snacks).
- **Quantity & Unit Controls**: Flexible voice & UI steppers (*"2 bottles"*, *"1 kg"*, *"6 pieces"*).
- **Visual Progress Tracker**: Live progress bar and completion metrics.

### 🛒 4. In-Supermarket Shopping Mode
- High-contrast fullscreen view tailored for physical grocery store trips.
- Single-item focal cards, large touch targets, and hands-free voice step-through (*"Got it"*, *"Next"*).

---

## 🛠️ Installation & Setup

```bash
# 1. Install project dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production & typecheck
npm run build
```

---

## 📂 Project Architecture

```
noma-shopping-assistant/
├── api/                   # Serverless function endpoints
│   └── ai/interpret.js
├── src/
│   ├── components/        # UI components (Voice, Shopping, Products, Navigation)
│   ├── data/              # Product catalog, seasonal items, vocabulary maps
│   ├── hooks/             # Custom React hooks (useSpeechRecognition, useShoppingList, etc.)
│   ├── lib/               # Context providers & local storage persistence stores
│   ├── pages/             # HomePage, ListPage, SearchPage, InsightsPage
│   ├── services/          # Command parser, multilingual normalizer, recommendation engine
│   └── types/             # TypeScript domain interfaces
├── README.md              # Documentation & candidate assessment write-up
└── package.json           # Scripts & dependencies
```

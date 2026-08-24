# NOMA — Voice Command Shopping Assistant 🛒

NOMA is a voice-first shopping assistant designed around natural human interaction. Instead of requiring users to type and manually organize shopping lists, NOMA accepts conversational speech (e.g., *"I need two bottles of milk and five apples"*) and automatically converts it into structured, aisle-categorized items with quantities.

---

## 📄 Technical Approach (Assessment Write-Up)

> **Approach & Architecture Summary (Max 200 Words)**
>
> NOMA was built as a voice-first, intent-driven shopping assistant optimized for quick, natural interactions. Instead of exposing a generic LLM chatbot UI, NOMA uses a hybrid parsing architecture: a zero-latency local deterministic parser handles structured and multilingual voice commands (English, Hindi, Hinglish like *"Do packet doodh add kar do"*), while an optional Groq LLM fallback backend handles complex conversational phrasing via `/api/ai/interpret`.
>
> State management leverages React 19 Context API with local storage persistence for list items and historical purchase events. Smart suggestions calculate dynamic household purchase rhythms (restock intervals), seasonal catalog relevancy, and product substitutes (e.g., Almond Milk for Whole Milk) without relying on artificial cloud calls.
>
> To deliver a superior UX during physical supermarket trips, NOMA features a dedicated, high-contrast **Shopping Mode** with enlarged touch targets and hands-free voice navigation (*"Got it"*, *"Next"*). The visual identity avoids generic SaaS tropes, using warm editorial typography (Fraunces & Work Sans) and grocery-inspired tactile design. Built with React 19, TypeScript, Tailwind CSS v4, and Vite.

---

## ✨ Features & Assignment Checklist

### 1. 🎙️ Voice Input & NLP
- **Voice Command Recognition**: Add, remove, update quantities, and search products by voice using the Web Speech API.
- **Hybrid Local + AI Intent Parsing**: Deterministic local parser processes standard phrases in `<100ms`. Optional Groq LLM endpoint processes complex multi-item sentences.
- **Multilingual Support**: Supports English, Hindi (*"दूध जोड़ो"*), and Hinglish (*"2 packet doodh add kar do"*).

### 2. 💡 Smart Suggestions & Recommendations
- **Purchase Rhythm Engine**: Predicts replenishment schedules based on historical restock intervals (e.g., Milk every 7 days).
- **Frequently Bought Together**: Smart item pairings (e.g., Bread + Eggs + Butter) with 1-click bundle adding.
- **Product Substitutions**: Dynamic alternative recommendations (e.g., Almond Milk for Milk, Whole Wheat for White Bread).
- **Seasonal Recommendations**: Auto-selected in-season fruits and produce for the active month.

### 3. 📝 Shopping List Management
- **Automatic Categorization**: Organizes items into store aisles (Produce, Dairy, Bakery, Pantry, Personal Care, etc.).
- **Quantity & Unit Management**: Supports flexible quantities and units (*"2 bottles"*, *"1 kg"*, *"6 pieces"*).
- **Visual Progress Bar**: Real-time completion counter and check-off state.

### 4. 🔎 Voice-Activated Search & Filtering
- Voice or text search with instant brand, price range (*"under ₹200"*), category, and organic attribute filtering.

### 5. 🛒 In-Supermarket Shopping Mode
- A hands-free, high-contrast interface designed for in-store shopping.
- Step through list items with giant touch controls or voice commands (*"Got it"*, *"Next"*).

---

## 🛠️ Local Development & Setup

### Prerequisites
- **Node.js**: v18 or later
- **npm**: v9 or later

### Installation & Run

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Typecheck and build for production
npm run build
```

### Optional: Enabling Groq LLM Voice Fallback

The local parser handles 95%+ of standard voice commands offline without API keys. To enable optional LLM fallback for conversational phrasing:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. Run with Vercel dev server:
   ```bash
   npx vercel dev
   ```

---

## 📁 Repository Structure

```
noma-shopping-assistant/
├── api/                   # Serverless functions (Groq AI fallback endpoint)
│   └── ai/interpret.js
├── src/
│   ├── components/        # React components (Voice, Shopping, Products, UI, Navigation)
│   ├── data/              # Product catalog, seasonal items, vocabulary tables
│   ├── hooks/             # Custom hooks (useSpeechRecognition, useShoppingList, etc.)
│   ├── lib/               # Context providers & local storage persistence
│   ├── pages/             # HomePage, ListPage, SearchPage, InsightsPage
│   ├── services/          # Command parser, NLP normalizer, recommendation engine
│   └── types/             # TypeScript domain definitions
├── README.md              # Project documentation & assessment submission write-up
└── package.json           # Dependencies & scripts
```

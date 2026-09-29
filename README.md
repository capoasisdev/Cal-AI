# Salado AI 🥗

A modern photo-first calorie & macro tracking mobile application built for **Android & iOS** using **React Native**, **Expo SDK 57**, and **NativeWind (Tailwind CSS)**.

Salado AI allows users to photograph their food, automatically calculates calories and macros (Protein, Carbs, Fat), tracks streaks, and manages daily nutritional targets.

---

## 📱 Features

- **Photo-First Food Logging**:
  - Live camera scanner (`expo-camera`) with viewfinder and gallery photo picker (`expo-image-picker`).
  - Realistic instant nutrition recognition in testing mode, and ready for **OpenRouter Vision AI** (`openai/gpt-4o-mini`, `claude-3.5-haiku`).
- **Interactive Onboarding & Goal Calculation**:
  - 9 personalized steps (Gender, Birthday, Height, Weight, Goal, Target Weight, Activity Level, Pace, Diet).
  - Cross-platform Birthday Picker (works on Android & iOS).
  - Interactive tape-measure Ruler Picker for precise height, weight, and pace selection.
  - Dietitian plan generation powered by Mifflin-St Jeor BMR & TDEE formulas.
- **Plan Reveal with Confetti**:
  - Daily calorie calculation, 3 macro cards (Protein, Carbs, Fat), and personalized rationale.
- **Home Dashboard**:
  - 3-week horizontal scrolling calendar strip (past days log history, today active, future locked).
  - Circular calorie progress ring with remaining calories.
  - Macro progress cards with custom rings.
  - Today's meals feed with meal cards, meal types (Breakfast, Lunch, Dinner, Snack), macros, calories, and deletion.
  - Motivational flame streak modal sheet (`StreakSheet`).
- **Profile & Targets Management**:
  - Edit daily calorie and macro goals anytime.
  - Toggle between Metric (kg/cm) and Imperial (lbs/in).
  - Quick test reset button to easily run tests again.
- **Backend Architecture**:
  - **Testing Mode**: Self-contained out of the box with offline persistence (`AsyncStorage`) — no backend server required to test and evaluate!
  - **Supabase Integration**: Ready for cloud sync, Auth, and Storage.
  - **OpenRouter Integration**: Ready for vision AI models.

---

## 🚀 Running the App

### 1. Install dependencies
```bash
npm install
```

### 2. Start the Expo development server
```bash
npx expo start
```

- Press **`a`** to open on an Android emulator or connected device.
- Press **`i`** to open on an iOS simulator.
- Press **`w`** to open in the web browser.
- Scan the QR code with **Expo Go** on your physical Android or iPhone.

---

## ⚙️ Environment Variables (Optional)

Copy `.env.example` to `.env`:

```env
# OpenRouter API (Optional - activates live AI food image recognition)
EXPO_PUBLIC_OPENROUTER_API_KEY=your_key_here

# Supabase (Optional - activates cloud sync)
EXPO_PUBLIC_SUPABASE_URL=your_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

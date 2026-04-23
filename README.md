# Clash Royale Elixir & Deck Tracker

A sophisticated, machine-learning-powered companion app for Clash Royale. This tool tracks the opponent's elixir, predicts their deck in real-time, and estimates their current hand rotation using advanced statistical models trained on millions of battles.

## 🚀 Features

### 🧠 AI-Powered Prediction
-   **Machine Learning Model**: Utilizes a Ridge Regression model trained on **1,000,000+ battles** to predict the opponent's deck composition based on the cards played so far.
-   **Context-Aware**: Analyzes elixir usage patterns and game tempo to refine predictions.
-   **Synergy Detection**: Recognizes common card combinations (e.g., Tank + Support, Win Condition + Spell) dynamically.
-   **In-App Benchmark Badge**: Shows subtle, live benchmark expectations (Top-1 / Top-3 deck hit-rate) for the current number of unique cards seen.

### 💧 Elixir Tracking
-   **Real-time Elixir Bar**: Tracks the opponent's estimated elixir with high precision.
-   **Smart Multipliers**: Automatically handles 1x, 2x, and 3x elixir generation phases (Regular Time vs. Overtime).
-   **Affordability Indicators**: Cards in the tracker fade out if the opponent likely cannot afford them.

### 🃏 Cycle & Hand Tracking
-   **Card Rotation**: Estimates the opponent's 4-card hand and the "Next Up" card.
-   **Cooldown Logic**: Accurately tracks the 4-card cycle rule, preventing impossible plays from being suggested.
-   **Mirror Logic**: Intelligent handling of the Mirror card, including dynamic cost calculation and "Mirror-after-Mirror" restrictions.

### 🖥️ Overlay Mode
-   **Compact UI**: A draggable, transparent overlay designed to sit on top of the game (or alongside it).
-   **Visual Cues**: Subtle glows and badges indicate which cards are likely in hand or coming next.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
-   **State Management**: Zustand
-   **Machine Learning**: Python (Scikit-learn, Pandas) used for offline training; Custom matrix-inference engine in TypeScript for real-time predictions.
-   **Data**: Models trained on public Clash Royale battle datasets.

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/thijsvndmeer/clashcounter.git
    cd clash-royale-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

## 🎮 Usage

1.  **Start the App**: Open the tracker in your browser.
2.  **Select Cards**: As the opponent plays cards, click them in the grid.
3.  **Track Elixir**: The top bar shows the opponent's elixir. Use the **Start** button (triangle) or manual adjustments if needed (though the app auto-generates elixir).
4.  **Analyze**:
    *   **Unlocked Phase**: The grid sorts cards by likelihood. Top cards are the best predictions for what's in their deck.
    *   **Locked Phase**: Once 8 cards are found, the UI switches to "Locked" mode. It now shows their specific hand rotation (Top Row = In Hand, Bottom Left = Next Up).

## 📊 Applied ML Midterm Benchmark Notes

-   Trained/evaluated with weighted simulations over the current 1,000 meta-deck candidates.
-   10,000 simulated matches (random card reveal order) were used for benchmark generation.
-   Result: a Bayesian reformulation produced **0.0pp Top-1 gain** versus the current match-count + frequency tie-break ranking on this dataset.
-   Conclusion: for this deck-candidate setup, the current approach is already near the practical ceiling.

## ⚠️ Disclaimer

This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy.

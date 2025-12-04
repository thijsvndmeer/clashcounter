https://thijsvndmeer.github.io/clashcounter/

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1QPo8yIwpecRjNTSDkehyOlHo-K5ROD-s

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

The app must be built before it can run on GitHub Pages. Serving the raw source files (for example, requesting `/index.tsx` or `%BASE_URL%vite.svg`) will result in 404/400 errors because those paths only exist during local development. A GitHub Actions workflow is included to build the Vite app and publish the compiled `dist` folder to Pages. The deployed site lives under `/clashcounter/`, matching the `base` configured in [`vite.config.ts`](./vite.config.ts).

### Manual deployment steps

1. Ensure changes are pushed to `main`.
2. Trigger the **Deploy to GitHub Pages** workflow manually from the Actions tab (or push to `main` to deploy automatically).
3. After the workflow finishes, visit https://thijsvndmeer.github.io/clashcounter/ to load the built app without missing-file errors.

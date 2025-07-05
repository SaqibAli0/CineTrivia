# CineTrivia 🎬

Welcome to **CineTrivia**, your AI-powered guide to the world of movies! Discover your next favorite film, uncover fascinating behind-the-scenes facts, and see unique, AI-generated movie posters.

This project is built with Next.js, Genkit, and ShadCN UI to create a modern, interactive, and intelligent web application.

## ✨ Key Features

*   **AI Movie Recommendations:** Can't decide what to watch? Select your favorite genres and mood, and let our AI suggest a list of tailored movie recommendations.
*   **Dynamic Poster Generation:** See unique, artistically inspired movie posters created on-the-fly by a generative AI model.
*   **Instant Fun Facts:** Get interesting trivia and behind-the-scenes details for any movie in our collection with the click of a button.
*   **Interactive Movie Grid:** Explore and search through a curated list of classic and popular movies.
*   **Modern, Responsive UI:** A sleek and beautiful interface built with ShadCN UI and Tailwind CSS, complete with a dark mode.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **UI Library:** [React](https://reactjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **AI Integration:** [Firebase Genkit](https://firebase.google.com/docs/genkit) with Google's Gemini Models
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)

## 🚀 Getting Started

Follow these steps to get the project running on your local machine.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or later)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   A **Google AI API Key**. You can get one from [Google AI Studio](https://makersuite.google.com/app/apikey).

### Installation & Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up environment variables:**
    Create a file named `.env` in the root of your project and add your Google AI API key:
    ```
    GOOGLE_API_KEY=your_api_key_here
    ```

3.  **Run the development servers:**
    This project requires two servers to run concurrently: the Next.js frontend and the Genkit AI backend. Open two separate terminals to run the following commands.

    *   In your first terminal, start the Next.js app:
        ```bash
        npm run dev
        ```

    *   In your second terminal, start the Genkit development server:
        ```bash
        npm run genkit:dev
        ```

4.  **Open the app:**
    Navigate to [http://localhost:9002](http://localhost:9002) in your browser to see the app in action!

## ☁️ Deployment

This application is ready to be deployed on platforms that support Next.js, such as [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

When deploying, remember to:
1.  Set the build command to `npm run build`.
2.  Set the publish directory to `.next`.
3.  Add your `GOOGLE_API_KEY` as an environment variable in your deployment provider's settings.

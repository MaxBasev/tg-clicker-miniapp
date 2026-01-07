# Telegram Mini Games App 🎮

A collection of classic arcade games reimagined as a Telegram Mini App.

This project demonstrates a modern React application architecture designed for the Telegram ecosystem, featuring high-performance animations, touch-first controls, and a maintainable code structure.

## 🌟 Features

- **Integrated Environment**: Fully compatible with [Telegram Mini Apps SDK](https://core.telegram.org/bots/webapps).
- **Responsive Design**: Touch-optimized controls and layout for mobile interaction.
- **Classic Games**:
    - **2048**: The strategic puzzle game.
    - **Snake**: Classic navigation and reflex game.
    - **Flappy Rocket**: A space-themed twist on Flappy Bird.
- **Dynamic UI**: Floating emoji backgrounds, smooth transitions, and engaging visual effects.

## 🛠 Tech Stack

- **Core**: [React 18](https://reactjs.org/) (Hooks, Functional Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for strict type safety.
- **Build Tool**: [Vite](https://vitejs.dev/) for blazing fast development and optimized production builds.
- **Styling**: Modern CSS3 with animations.
- **Linting**: ESLint + Prettier for code quality.

## 🚀 How to Run

1.  **Clone the repository**
    ```bash
    git clone https://github.com/maxbasev/tg-clicker-miniapp.git
    cd tg-clicker-miniapp
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 📐 Project Structure

```
src/
├── components/     # Game components and UI elements
├── hooks/          # Custom hooks (e.g., useSnakeGame) for logic separation
├── styles/         # CSS styles
├── types/          # TypeScript definitions
└── App.tsx         # Main application entry point
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---
> *Created by [MaxBasev](https://github.com/maxbasev)*

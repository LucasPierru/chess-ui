# Chess UI

A modern chess game user interface built with SvelteKit and TypeScript. This project provides an interactive chess board and game interface for playing chess online.

## Features

- Interactive chess board with drag-and-drop piece movement
- Real-time multiplayer support via WebSocket (STOMP)
- Clean, modern UI with theme toggle support
- Responsive design that works on desktop and mobile
- Game state management and player stores

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```sh
npm install
# or
pnpm install
# or
yarn install
```

### Development

Start the development server:

```sh
npm run dev
# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The application will be available at `http://localhost:5173`

### Building for Production

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── board/           # Chess board component
│   │   └── ui/              # Reusable UI components
│   ├── stores/              # Svelte stores for state management
│   │   ├── playerStore.ts   # Player data management
│   │   └── stompClientStore.ts  # WebSocket connection
│   └── utils.ts             # Utility functions
├── routes/
│   ├── +layout.svelte       # App layout
│   ├── +page.svelte         # Home page
│   └── game/[id]/           # Individual game pages
└── static/
    └── pieces/              # Chess piece assets
```

## Technologies Used

- **SvelteKit** - Full-stack web framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **STOMP** - WebSocket messaging protocol for real-time communication
- **Tailwind** - Tailwind utility classes styling with theme support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source and available under the MIT License.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

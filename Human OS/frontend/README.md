# Human OS Frontend

A modern, production-ready web frontend for the Human OS Cognitive API. This is a cognitive control interface - mission control for your brain. It helps you manage focus, loops, threads, and mental state through explicit commands.

## Overview

Human OS is built on the principle that your brain is a powerful system that benefits from explicit controls. Rather than letting 1,000 loops auto-spawn, this interface gives you tools to issue clear instructions to yourself.

### Key Features

- **Dashboard**: Real-time cognitive status monitoring with visual load indicators
- **Focus Management**: Set and lock focus with countdown timers and success criteria
- **Loop Control**: Authorize, close, and kill cognitive loops (open commitments)
- **Thread Management**: Spawn and terminate foreground/background cognitive processes
- **Task & Idea Ingestion**: Capture incoming tasks and ideas before they become uncontrolled loops
- **Emotion Tracking**: Tag emotions and initiate decompression protocols
- **Archive**: Commit completed work with lessons learned

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization
- **React Router** for navigation
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Human OS API running on `localhost:8080` (or configure via environment variable)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Header, Sidebar, Layout, CommandPalette
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── focus/           # Focus forms and timer
│   │   ├── loops/           # Loop management components
│   │   ├── threads/         # Thread management
│   │   ├── ingest/          # Task and idea ingestion
│   │   ├── emotion/         # Emotion tagging and decompression
│   │   ├── archive/         # Archive commit form
│   │   └── ui/              # Base UI components (Button, Card, etc.)
│   ├── pages/               # Route pages
│   ├── services/            # API service layer
│   ├── hooks/               # Custom React hooks
│   ├── context/             # React Context providers
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions and constants
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Component Architecture

### UI Components (`/components/ui`)

Base components with consistent styling:
- `Button` - Primary, secondary, danger, ghost variants with loading states
- `Card` - Container component with header/footer slots
- `Input` / `Textarea` - Form inputs with labels and validation
- `Select` - Dropdown selector
- `Modal` - Dialog overlay
- `Badge` - Status and category badges
- `Toast` - Notification system

### Layout Components (`/components/layout`)

- `Layout` - Main application wrapper with sidebar and header
- `Header` - Top navigation with status indicators
- `Sidebar` - Navigation menu with quick stats
- `CommandPalette` - Quick actions modal (Cmd+K)

### Page Components (`/pages`)

Each page corresponds to a route:
- `Dashboard` - Main overview
- `Focus` - Focus session management
- `Loops` - Open loop management
- `Threads` - Cognitive thread control
- `Ingest` - Task and idea capture
- `Emotion` - Emotional regulation
- `Archive` - Work completion and archiving
- `Settings` - System configuration

## API Integration

The frontend connects to the Human OS API at `/api/v1`. Key endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /dashboard/status` | Real-time cognitive status |
| `POST /focus/set` | Start a focus session |
| `POST /focus/lock` | Enter hyperfocus mode |
| `POST /loop/authorize` | Create new loop |
| `POST /loop/close` | Close a loop |
| `DELETE /loop/kill` | Terminate a loop |
| `POST /thread/spawn` | Create new thread |
| `DELETE /thread/terminate` | Kill threads by rule |
| `POST /ingest/task` | Capture a task |
| `POST /ingest/idea` | Capture an idea |
| `POST /emotion/tag` | Tag an emotion |
| `POST /emotion/decompress` | Start decompression |
| `POST /archive/commit` | Archive completed work |
| `POST /mode/reset-soft` | Soft cognitive reset |
| `POST /mode/reset-hard` | Hard cognitive reset |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `G D` | Go to Dashboard |
| `G F` | Go to Focus |
| `G L` | Go to Loops |
| `G T` | Go to Threads |
| `G I` | Go to Ingest |
| `G E` | Go to Emotion |
| `G A` | Go to Archive |
| `G S` | Go to Settings |
| `Esc` | Close modal/palette |

## Design Decisions

### Aesthetic
- **Clean and minimal**: No gamification, no bright distracting colors
- **Professional dashboard feel**: Like mission control, not a game
- **Color-coded states**: Green (low/good), amber (medium/warning), red (high/alert)
- **Information dense but not overwhelming**: Clear visual hierarchy

### State Management
- React Context with useReducer for global cognitive state
- Polling for real-time status updates (every 5 seconds)
- Optimistic UI updates for immediate feedback

### Accessibility
- Keyboard navigation support
- Focus management in modals
- ARIA labels for interactive elements
- Color is not the only indicator of state

## Visualizations

The dashboard includes Recharts-powered visualizations:
- **Emotional Load Over Time**: Line chart tracking load levels
- **Load Indicators**: Bar-style gauges for current status
- **Progress Rings**: Focus timer progress visualization

## Future Enhancements

- [ ] Dark mode support
- [ ] WebSocket for real-time updates (replace polling)
- [ ] Focus session history and statistics
- [ ] Drag-and-drop loop reordering
- [ ] Browser notifications for focus timer completion
- [ ] Mobile app (React Native)
- [ ] AI-powered suggestions
- [ ] Integration with calendar systems

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for linting
- Component files use PascalCase
- Utility functions use camelCase
- Types defined in `/types/index.ts`

### Adding New Features

1. Add types to `/types/index.ts`
2. Add API methods to `/services/api.ts`
3. Create component(s) in appropriate directory
4. Add route in `App.tsx` if page-level
5. Update exports in index files

## License

Part of the Human OS project.

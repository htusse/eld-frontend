# ELD Trip Planner - Frontend

React + TypeScript frontend for planning HOS-compliant trucking trips with interactive route visualization and ELD log sheet viewing.

## Features

- **Interactive Trip Planning Form**: Enter locations via addresses or coordinates
- **Real-time Route Visualization**: Interactive Leaflet maps with route polylines
- **Trip Itinerary Display**: Detailed schedule with all stops and breaks
- **ELD Log Sheet Gallery**: View auto-generated daily log sheets
- **Responsive Design**: Mobile-friendly Material-UI components
- **HOS Compliance Indicators**: Visual feedback on cycle usage and limits

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client
- **Emotion** - CSS-in-JS styling

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/htusse/eld-frontend.git
cd eld-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
VITE_API_URL=http://localhost:8000/api
```

**Important**: The backend API must be running at this URL. See `backend/README.md` for setup instructions.

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── LocationInput/   # Location input with autocomplete
│   │   ├── TripForm/        # Main trip planning form
│   │   ├── RouteMap/        # Interactive Leaflet map
│   │   ├── TripItinerary/   # Schedule display
│   │   ├── TripResults/     # Results container
│   │   └── LogSheetGallery/ # Log sheet image viewer
│   ├── services/
│   │   └── api.ts           # API client (Axios)
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   └── index.ts         # Utility functions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── .env.example             # Environment variables template
└── README.md                # This file
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` | Yes |

**Note**: Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client.

## Component Overview

### TripForm
Main form component for entering trip details:
- Current location
- Pickup location
- Dropoff location
- Supports both addresses and coordinates

### RouteMap
Interactive Leaflet map that displays:
- Route polyline
- Waypoint markers
- Stop locations with icons
- Auto-zoom to fit route

### TripItinerary
Displays the trip schedule with:
- All stops and waypoints
- Break types and durations
- Timestamps and locations
- Distance and duration summaries

### LogSheetGallery
Gallery view of generated ELD log sheets:
- Daily log sheet images
- Download capability
- Responsive grid layout

## Building for Production

### 1. Update Environment Variables

Create `.env.production`:

```env
VITE_API_URL=
```

### 2. Build

```bash
npm run build
```

This creates optimized production files in the `dist/` directory.

### 3. Test Production Build

```bash
npm run preview
```

## Troubleshooting

### Common Issues

**API Connection Errors**:
- Check `VITE_API_URL` is correct
- Ensure backend is running
- Check browser console for CORS errors

**Map Not Displaying**:
- Check internet connection (Leaflet uses external tiles)
- Verify Leaflet CSS is imported
- Check browser console for errors

**Build Errors**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Environment Variables Not Working**:
- Ensure variables start with `VITE_`
- Restart dev server after changing `.env`
- Check variables are not quoted in `.env`

### Browser Compatibility

Supported browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Save any file and see changes immediately.

### Type Checking
Run TypeScript type checking:
```bash
npx tsc --noEmit
```

### Code Formatting
Format code with Prettier (if configured):
```bash
npx prettier --write src/
```

## Performance Optimization

The production build includes:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Lazy loading

## Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` for templates
- Rotate API keys regularly
- Use HTTPS in production

## Contributing

1. Create a feature branch
2. Make changes
3. Run linter: `npm run lint`
4. Build: `npm run build`
5. Submit pull request

## License

MIT License

## Support

For issues and questions, please open a GitHub issue.

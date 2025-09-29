# StrideWise - Running Coaching App

A comprehensive running coaching application built with React TypeScript frontend and Node.js Express backend.

## Features

- 🏃‍♂️ Personalized training plans
- 🤖 AI-powered training adaptation based on Strava data
- 📊 Workout tracking and analytics with real running data
- 📅 Training calendar that evolves with your progress
- 🎯 Goal setting and intelligent plan adjustments
- 📈 Strava integration for automatic activity sync
- 👥 Social features and community
- 📱 Mobile-responsive design
- 🔐 User authentication and profiles

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Material-UI for components
- React Router for navigation
- Recharts for data visualization
- Axios for API calls

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads

## Project Structure

```
stridewise/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
├── shared/           # Shared types and utilities
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)

### Installation

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Set up environment variables (see .env.example files)

4. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend  
   cd frontend
   npm run dev
   ```

## Development

- Frontend runs on http://localhost:5173
- Backend API runs on http://localhost:3000
- MongoDB connection required for full functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

STRAVA_CLIENT_ID=your_actual_client_id_from_strava
STRAVA_CLIENT_SECRET=your_actual_client_secret_from_stravaSTRAVA_CLIENT_ID=your_actual_client_id_from_strava
STRAVA_CLIENT_SECRET=your_actual_client_secret_from_strava

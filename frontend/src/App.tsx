import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Training from './pages/Training'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import AICoach from './pages/AICoach'
import StravaCallback from './components/StravaCallback'

const App: React.FC = () => {
  return (
    <Box className="app-container">
      <Navbar />
      <Box className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/training" element={<Training />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/strava/callback" element={<StravaCallback />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default App
import React from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  LinearProgress,
} from '@mui/material'
import { PlayArrow, AccessTime, DirectionsRun } from '@mui/icons-material'

const Dashboard: React.FC = () => {
  const todaysWorkout = {
    type: 'Easy Run',
    duration: 30,
    distance: '5K',
    description: 'Comfortable pace run to build aerobic base'
  }

  const weeklyStats = {
    runsCompleted: 3,
    totalRuns: 5,
    totalDistance: 15.2,
    totalTime: '2h 15m'
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Welcome back, Runner! 👋
      </Typography>
      
      <Grid container spacing={3}>
        {/* Today's Workout */}
        <Grid item xs={12} md={6}>
          <Card className="workout-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#2c3e50' }}>
                Today's Workout
              </Typography>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                {todaysWorkout.type}
              </Typography>
              <Typography sx={{ mb: 2, color: '#555', fontSize: '1.1rem' }}>
                {todaysWorkout.description}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  backgroundColor: 'rgba(255, 107, 53, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 107, 53, 0.3)'
                }}>
                  <AccessTime sx={{ color: '#FF6B35' }} />
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {todaysWorkout.duration} min
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  backgroundColor: 'rgba(79, 195, 247, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid rgba(79, 195, 247, 0.3)'
                }}>
                  <DirectionsRun sx={{ color: '#4FC3F7' }} />
                  <Typography sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {todaysWorkout.distance}
                  </Typography>
                </Box>
              </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<PlayArrow />}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
                  }
                }}
              >
                Start Workout
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Progress */}
        <Grid item xs={12} md={6}>
          <Card className="workout-card" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                This Week's Progress
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    Runs Completed
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#4FC3F7', fontWeight: 600 }}>
                    {weeklyStats.runsCompleted}/{weeklyStats.totalRuns}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(weeklyStats.runsCompleted / weeklyStats.totalRuns) * 100}
                  sx={{ 
                    mb: 2,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                      borderRadius: 4,
                    }
                  }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(255, 107, 53, 0.1)', border: '1px solid rgba(255, 107, 53, 0.2)' }}>
                    <Typography variant="h3" sx={{ color: '#FF6B35', fontWeight: 700, mb: 0.5 }}>
                      {weeklyStats.totalDistance}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      km this week
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(79, 195, 247, 0.1)', border: '1px solid rgba(79, 195, 247, 0.2)' }}>
                    <Typography variant="h3" sx={{ color: '#4FC3F7', fontWeight: 700, mb: 0.5 }}>
                      {weeklyStats.totalTime}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#555' }}>
                      total time
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Card className="workout-card">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
                Recent Activities
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { date: 'Yesterday', type: 'Interval Training', distance: '6K', time: '28 min' },
                  { date: '2 days ago', type: 'Long Run', distance: '10K', time: '55 min' },
                  { date: '3 days ago', type: 'Easy Run', distance: '5K', time: '26 min' },
                ].map((activity, index) => (
                  <Box 
                    key={index}
                    className="activity-item"
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2.5,
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                      border: '1px solid rgba(218, 165, 32, 0.3)',
                      borderRadius: 2,
                      backdropFilter: 'blur(5px)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(79, 195, 247, 0.1) 100%)',
                        transform: 'translateX(4px)',
                        borderColor: 'rgba(255, 107, 53, 0.4)',
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: '#1a1a1a', mb: 0.5 }}>
                        {activity.type}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {activity.date}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body1" fontWeight="600" sx={{ color: '#4FC3F7' }}>
                        {activity.distance} • {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
import React from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const Progress: React.FC = () => {
  const distanceData = [
    { week: 'Week 1', distance: 8 },
    { week: 'Week 2', distance: 12 },
    { week: 'Week 3', distance: 15 },
    { week: 'Week 4', distance: 18 },
    { week: 'Week 5', distance: 22 },
    { week: 'Week 6', distance: 25 },
  ]

  const paceData = [
    { workout: 'Run 1', pace: 6.2 },
    { workout: 'Run 2', pace: 5.8 },
    { workout: 'Run 3', pace: 6.0 },
    { workout: 'Run 4', pace: 5.5 },
    { workout: 'Run 5', pace: 5.3 },
  ]

  const stats = [
    { label: 'Total Runs', value: '42', change: '+5 this month' },
    { label: 'Total Distance', value: '187 km', change: '+23 km this month' },
    { label: 'Avg Pace', value: '5:45/km', change: '-0:15 improvement' },
    { label: 'Personal Best', value: '24:32', change: '5K time' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Your Progress
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card className="workout-card">
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h3" sx={{ color: '#FF6B35', fontWeight: 700, mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                  {stat.label}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4FC3F7', fontWeight: 500 }}>
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Distance Progress
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={distanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="distance" 
                      stroke="#FF6B35" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pace Improvement (min/km)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="workout" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pace" fill="#2E7D32" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Achievements */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Achievements 🏆
          </Typography>
          <Grid container spacing={2}>
            {[
              { title: 'First 5K', description: 'Completed your first 5K run!', date: '2 weeks ago' },
              { title: 'Consistency Master', description: 'Ran 5 times this week', date: '1 week ago' },
              { title: 'Distance Goal', description: 'Reached 100km total distance', date: '3 days ago' },
              { title: 'Personal Best', description: 'New 5K personal record!', date: 'Yesterday' },
            ].map((achievement, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {achievement.title}
                  </Typography>
                  <Typography variant="body2">
                    {achievement.description}
                  </Typography>
                  <Typography variant="caption">
                    {achievement.date}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  )
}

export default Progress
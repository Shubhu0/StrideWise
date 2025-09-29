import React from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Divider,
  Box,
  Chip,
} from '@mui/material'
import { Edit, Settings, Share } from '@mui/icons-material'

const Profile: React.FC = () => {
  const userProfile = {
    name: 'Alex Runner',
    email: 'alex@example.com',
    joinDate: 'January 2024',
    currentPlan: '10K Intermediate',
    profileImage: '/api/placeholder/150/150',
    stats: {
      totalRuns: 42,
      totalDistance: 187,
      avgPace: '5:45',
      personalBest: '24:32'
    },
    preferences: {
      units: 'Metric',
      notifications: true,
      privacy: 'Friends Only'
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={4}>
          <Card className="workout-card">
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  border: '3px solid #FF6B35',
                  fontSize: '3rem',
                  backgroundColor: 'rgba(255, 107, 53, 0.2)',
                  color: '#FF6B35'
                }}
                src={userProfile.profileImage}
              >
                AR
              </Avatar>
              <Typography variant="h5" gutterBottom sx={{ color: '#1a1a1a', fontWeight: 600 }}>
                {userProfile.name}
              </Typography>
              <Typography sx={{ color: '#666', mb: 2 }}>
                {userProfile.email}
              </Typography>
              <Chip 
                label={userProfile.currentPlan} 
                sx={{ 
                  mb: 3,
                  background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <Typography variant="body2" sx={{ color: '#777', mb: 3 }}>
                Member since {userProfile.joinDate}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Edit />} 
                  fullWidth 
                  sx={{ 
                    mb: 1,
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
                    }
                  }}
                >
                  Edit Profile
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Share />} 
                  fullWidth
                  sx={{
                    borderColor: '#4FC3F7',
                    color: '#4FC3F7',
                    '&:hover': {
                      borderColor: '#29B6F6',
                      backgroundColor: 'rgba(79, 195, 247, 0.1)',
                    }
                  }}
                >
                  Share Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Stats & Settings */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Running Statistics
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {userProfile.stats.totalRuns}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Runs
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {userProfile.stats.totalDistance}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Distance (km)
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {userProfile.stats.avgPace}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Avg Pace
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {userProfile.stats.personalBest}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          5K Best
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Settings & Preferences
                  </Typography>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Units</Typography>
                      <Typography color="text.secondary">
                        {userProfile.preferences.units}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Notifications</Typography>
                      <Typography color="text.secondary">
                        {userProfile.preferences.notifications ? 'Enabled' : 'Disabled'}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography>Privacy</Typography>
                      <Typography color="text.secondary">
                        {userProfile.preferences.privacy}
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<Settings />} fullWidth>
                      Manage All Settings
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Profile
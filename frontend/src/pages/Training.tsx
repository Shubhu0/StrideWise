import React from 'react'
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import { PlayArrow, Schedule, FitnessCenter } from '@mui/icons-material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const Training: React.FC = () => {
  const [value, setValue] = React.useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const trainingPlans = [
    {
      name: '5K Beginner',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Perfect for new runners aiming to complete their first 5K',
      workoutsPerWeek: 3
    },
    {
      name: '10K Intermediate',
      duration: '12 weeks', 
      level: 'Intermediate',
      description: 'Build endurance and speed for a strong 10K finish',
      workoutsPerWeek: 4
    },
    {
      name: 'Half Marathon',
      duration: '16 weeks',
      level: 'Advanced',
      description: 'Comprehensive training for 21.1K distance',
      workoutsPerWeek: 5
    }
  ]

  const todaysWorkouts = [
    {
      type: 'Easy Run',
      duration: 30,
      intensity: 'Low',
      description: 'Comfortable pace to build aerobic base'
    },
    {
      type: 'Interval Training',
      duration: 45,
      intensity: 'High',
      description: '5 x 3min at 5K pace with 2min recovery'
    },
    {
      type: 'Strength Training',
      duration: 25,
      intensity: 'Medium',
      description: 'Core and leg strength exercises'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'white', fontWeight: 700, mb: 4, textAlign: 'center' }}>
        Training Plans & Workouts
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="My Plan" />
          <Tab label="Available Plans" />
          <Tab label="Today's Workouts" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Card className="workout-card">
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
              Current Plan: 10K Intermediate
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Chip 
                label="Week 6 of 12" 
                color="primary" 
                sx={{ 
                  mr: 1, 
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                }} 
              />
              <Chip 
                label="4 workouts/week" 
                sx={{ 
                  backgroundColor: 'rgba(79, 195, 247, 0.2)',
                  color: '#4FC3F7',
                  fontWeight: 500,
                  border: '1px solid #4FC3F7',
                }}
              />
            </Box>
            <Typography paragraph sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, mb: 3 }}>
              You're doing great! 6 weeks into your 10K training plan. 
              Keep up the consistent effort.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Schedule />}
              sx={{ 
                background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #29B6F6 0%, #0277BD 100%)',
                }
              }}
            >
              View This Week's Schedule
            </Button>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={3}>
          {trainingPlans.map((plan, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {plan.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={plan.level} 
                      color={plan.level === 'Beginner' ? 'success' : 
                             plan.level === 'Intermediate' ? 'warning' : 'error'} 
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip label={plan.duration} variant="outlined" size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {plan.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>{plan.workoutsPerWeek}</strong> workouts per week
                  </Typography>
                  <Button variant="outlined" fullWidth>
                    Start Plan
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Grid container spacing={3}>
          {todaysWorkouts.map((workout, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {workout.type}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${workout.intensity} Intensity`}
                      color={workout.intensity === 'Low' ? 'success' :
                             workout.intensity === 'Medium' ? 'warning' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {workout.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Duration:</strong> {workout.duration} minutes
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={workout.type === 'Strength Training' ? <FitnessCenter /> : <PlayArrow />}
                    fullWidth
                  >
                    Start Workout
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Container>
  )
}

export default Training
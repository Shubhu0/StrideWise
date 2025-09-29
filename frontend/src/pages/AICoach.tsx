import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  DirectionsRun,
  Schedule,
  Speed,
  Timeline,
  Assignment,
  Settings as SettingsIcon,
  Refresh
} from '@mui/icons-material';
import StravaIntegration from '../components/StravaIntegration';
import AICoachPanel from '../components/AICoachPanel';

interface TrainingPlan {
  id: string;
  name: string;
  goals: string[];
  metrics: {
    weeklyVolume: number;
    avgPace: number;
    totalRuns: number;
    consistency: number;
  };
  trainingZones: {
    easy: { min: number; max: number };
    tempo: { min: number; max: number };
    threshold: { min: number; max: number };
    interval: { min: number; max: number };
  };
  adaptations: string[];
}

interface Workout {
  id: string;
  date: string;
  type: 'easy' | 'tempo' | 'interval' | 'recovery' | 'long' | 'hill' | 'fartlek';
  duration: number;
  distance?: number;
  description: string;
  intensity: 'low' | 'medium' | 'high';
  targetPace?: { min: number; max: number };
  intervals?: { reps: number; distance: number; rest: number };
  adaptations: string[];
  completed?: boolean;
}

interface UserStats {
  totalRuns: number;
  totalDistance: number;
  totalTime: number;
  averagePace: number;
  totalElevation: number;
  period: string;
}

const AICoach: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [upcomingWorkouts, setUpcomingWorkouts] = useState<Workout[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goals, setGoals] = useState({
    raceType: '',
    targetTime: '',
    raceDate: '',
    weeklyMiles: ''
  });

  // Generate/get unique user ID for this session
  const userId = React.useMemo(() => {
    const stored = localStorage.getItem('stridewise-user-id');
    if (stored) return stored;
    
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('stridewise-user-id', newId);
    return newId;
  }, []);

  // Check if user is connected to Strava
  useEffect(() => {
    checkStravaConnection();
    
    // Listen for URL changes (for Strava callback)
    const handleURLChange = () => {
      if (window.location.pathname === '/strava/callback' || window.location.search.includes('code=')) {
        // Wait a moment for callback processing, then check connection
        setTimeout(checkStravaConnection, 2000);
      }
    };

    window.addEventListener('popstate', handleURLChange);
    handleURLChange(); // Check on mount

    return () => window.removeEventListener('popstate', handleURLChange);
  }, []);

  const checkStravaConnection = async () => {
    try {
      // Check if we have user stats (indicates successful connection)
      console.log(`🔍 Checking connection for user: ${userId}`);
      const response = await fetch(`/api/strava/stats/${userId}?period=4weeks`);
      const connected = response.ok;
      
      if (connected) {
        const data = await response.json();
        // Only consider connected if we have actual activity data
        const hasData = data.data && data.data.totalRuns > 0;
        console.log('🔍 Strava connection check:', hasData ? 'Connected with data' : 'Connected but no data');
        setIsConnected(hasData);
        
        if (hasData) {
          await loadUserData();
        }
      } else {
        console.log('🔍 Strava connection check: Not connected');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking Strava connection:', error);
      setIsConnected(false);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Load user stats
      const statsResponse = await fetch(`/api/strava/stats/${userId}?period=4weeks`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        setUserStats(stats.data);
      }

      // Load current training plan
      const planResponse = await fetch(`/api/strava/training-plan/${userId}`);
      if (planResponse.ok) {
        const plan = await planResponse.json();
        setTrainingPlan(plan.data.plan);
        setUpcomingWorkouts(plan.data.upcomingWorkouts || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStravaConnected = async () => {
    console.log('🎯 Strava connection callback triggered');
    setIsConnected(true);
    // Wait a moment for backend processing, then load data
    setTimeout(async () => {
      await loadUserData();
    }, 1000);
  };

  const handleCreateTrainingPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/strava/training-plan/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goals })
      });

      if (response.ok) {
        await loadUserData();
        setShowGoalDialog(false);
      }
    } catch (error) {
      console.error('Error creating training plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/strava/sync/${userId}`, {
        method: 'POST'
      });

      if (response.ok) {
        await loadUserData();
      }
    } catch (error) {
      console.error('Error syncing activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      easy: '#4caf50',
      tempo: '#ff9800',
      interval: '#f44336',
      recovery: '#2196f3',
      long: '#9c27b0',
      hill: '#795548',
      fartlek: '#607d8b'
    };
    return colors[type] || '#757575';
  };

  const formatPace = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}/mile`;
  };

  const formatDistance = (meters: number) => {
    return `${(meters / 1609.34).toFixed(1)} miles`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (!isConnected) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
            🤖 AI Training Coach
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 800, mx: 'auto' }}>
            Connect with Strava to unlock personalized, AI-powered training plans that adapt to your real running data. 
            Our intelligent coach analyzes your performance and creates optimal training schedules that evolve with your progress.
          </Typography>
        </Box>
        
        <StravaIntegration onConnected={handleStravaConnected} />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
          🤖 AI Training Coach
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Your personalized training companion, powered by your Strava data
        </Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Quick Actions */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleSyncActivities}
          sx={{ bgcolor: '#FF4500', '&:hover': { bgcolor: '#E03E00' } }}
        >
          Sync Latest Activities
        </Button>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setShowGoalDialog(true)}
          sx={{ borderColor: 'white', color: 'white' }}
        >
          Update Goals
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Current Stats */}
        {userStats && (
          <Grid item xs={12} lg={4}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline /> Recent Performance ({userStats.period})
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                        {userStats.totalRuns}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Total Runs
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 700 }}>
                        {userStats.totalDistance.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Miles
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                        {formatPace(userStats.averagePace)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Avg Pace
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                        {Math.round(userStats.totalElevation)}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Elevation (ft)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Training Plan Overview */}
        {trainingPlan && (
          <Grid item xs={12} lg={8}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment /> Current Training Plan
                </Typography>
                <Typography variant="h5" sx={{ color: '#4caf50', mb: 2 }}>
                  {trainingPlan.name}
                </Typography>
                
                {/* Goals */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Goals:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {trainingPlan.goals.map((goal, index) => (
                      <Chip key={index} label={goal} sx={{ bgcolor: '#FF4500', color: 'white' }} />
                    ))}
                  </Box>
                </Box>

                {/* Training Zones */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Training Zones:</Typography>
                  <Grid container spacing={2}>
                    {Object.entries(trainingPlan.trainingZones).map(([zone, paces]) => (
                      <Grid item xs={6} sm={3} key={zone}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'capitalize' }}>
                            {zone}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white' }}>
                            {formatPace(paces.min)} - {formatPace(paces.max)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Recent Adaptations */}
                {trainingPlan.adaptations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>Recent AI Adaptations:</Typography>
                    {trainingPlan.adaptations.slice(0, 3).map((adaptation, index) => (
                      <Alert key={index} severity="info" sx={{ mb: 1, bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                        {adaptation}
                      </Alert>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Upcoming Workouts */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule /> This Week's Training Schedule
              </Typography>
              
              {upcomingWorkouts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    No workouts scheduled. Create a training plan to get started!
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, bgcolor: '#FF4500', '&:hover': { bgcolor: '#E03E00' } }}
                    onClick={() => setShowGoalDialog(true)}
                  >
                    Create Training Plan
                  </Button>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {upcomingWorkouts.map((workout) => (
                    <Grid item xs={12} sm={6} md={4} key={workout.id}>
                      <Card sx={{ 
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderLeft: `4px solid ${getWorkoutTypeColor(workout.type)}`,
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Chip 
                              label={workout.type.toUpperCase()} 
                              size="small"
                              sx={{ bgcolor: getWorkoutTypeColor(workout.type), color: 'white' }}
                            />
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {new Date(workout.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          
                          <Typography variant="subtitle2" sx={{ color: 'white', mb: 1 }}>
                            {workout.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Schedule sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {formatDuration(workout.duration)}
                              </Typography>
                            </Box>
                            {workout.distance && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <DirectionsRun sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                  {formatDistance(workout.distance)}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                          
                          {workout.targetPace && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                              <Speed sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Target: {formatPace(workout.targetPace.min)} - {formatPace(workout.targetPace.max)}
                              </Typography>
                            </Box>
                          )}
                          
                          {workout.intervals && (
                            <Typography variant="caption" sx={{ color: '#ff9800' }}>
                              {workout.intervals.reps}x{formatDistance(workout.intervals.distance)} 
                              @ {formatDuration(workout.intervals.rest)} rest
                            </Typography>
                          )}
                          
                          {workout.adaptations.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ color: '#4caf50' }}>
                                🤖 {workout.adaptations[0]}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Coach Panel */}
        <Grid item xs={12}>
          <AICoachPanel userId={userId} connected={isConnected} />
        </Grid>
      </Grid>      {/* Goals Dialog */}
      <Dialog open={showGoalDialog} onClose={() => setShowGoalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a1a2e', color: 'white' }}>
          Set Your Training Goals
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1a1a2e', color: 'white' }}>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Race Type</InputLabel>
                  <Select
                    value={goals.raceType}
                    onChange={(e) => setGoals({ ...goals, raceType: e.target.value })}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="5k">5K</MenuItem>
                    <MenuItem value="10k">10K</MenuItem>
                    <MenuItem value="half-marathon">Half Marathon</MenuItem>
                    <MenuItem value="marathon">Marathon</MenuItem>
                    <MenuItem value="general-fitness">General Fitness</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Target Time (e.g., 25:00)"
                  value={goals.targetTime}
                  onChange={(e) => setGoals({ ...goals, targetTime: e.target.value })}
                  sx={{ input: { color: 'white' } }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Race Date"
                  type="date"
                  value={goals.raceDate}
                  onChange={(e) => setGoals({ ...goals, raceDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ input: { color: 'white' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Weekly Mileage Goal"
                  type="number"
                  value={goals.weeklyMiles}
                  onChange={(e) => setGoals({ ...goals, weeklyMiles: e.target.value })}
                  sx={{ input: { color: 'white' } }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a2e' }}>
          <Button onClick={() => setShowGoalDialog(false)} sx={{ color: 'white' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateTrainingPlan}
            variant="contained"
            sx={{ bgcolor: '#FF4500', '&:hover': { bgcolor: '#E03E00' } }}
            disabled={loading}
          >
            Create Plan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AICoach;
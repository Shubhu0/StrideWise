import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  LinearProgress,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  PlayArrow,
  Sync,
  Settings,
  TrendingUp,
  DirectionsRun,
  Timer,
  Terrain,
  FavoriteRounded
} from '@mui/icons-material';

interface StravaData {
  connected: boolean;
  stats: {
    totalRuns: number;
    totalDistance: number;
    totalTime: number;
    averagePace: number;
    totalElevation: number;
  };
  recentActivities: any[];
  trainingPlan?: any;
}

interface TrainingGoals {
  focusArea: 'endurance' | 'speed' | 'strength' | 'general_fitness';
  targetDistance?: number;
  targetTime?: number;
  raceDate?: string;
}

interface StravaIntegrationProps {
  onConnected?: () => void;
}

const StravaIntegration: React.FC<StravaIntegrationProps> = ({ onConnected }) => {
  const [stravaData, setStravaData] = useState<StravaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoalsDialog, setShowGoalsDialog] = useState(false);
  const [goals, setGoals] = useState<TrainingGoals>({
    focusArea: 'general_fitness'
  });

  // Generate a unique user ID for this session
  const userId = React.useMemo(() => {
    // Check if we have a stored user ID, otherwise generate a new one
    const stored = localStorage.getItem('stridewise-user-id');
    if (stored) return stored;
    
    const newId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('stridewise-user-id', newId);
    return newId;
  }, []);

  useEffect(() => {
    console.log('🆔 Using user ID:', userId);
    checkStravaConnection();
    
    // Listen for URL changes or manual refresh after Strava callback
    const handleStorageChange = () => {
      console.log('🔄 Storage changed, rechecking connection...');
      checkStravaConnection();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Check every few seconds if we're waiting for a connection
    const interval = setInterval(() => {
      if (!stravaData?.connected) {
        checkStravaConnection();
      }
    }, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [userId]);

  const checkStravaConnection = async () => {
    try {
      // Check if user is connected by trying to fetch stats
      const response = await fetch(`/api/strava/stats/${userId}?period=4weeks`);
      console.log(`🔍 Checking Strava connection for ${userId}, response status:`, response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User is connected to Strava:', data.data);
        
        // Only proceed if we have actual activity data (not empty/zero stats)
        if (data.data.totalRuns > 0) {
          // User is connected with real data, load full data and trigger callback
          await loadStravaData();
          if (onConnected) {
            onConnected();
          }
          return;
        } else {
          console.log('📊 User connected but no activity data yet');
        }
      }
      
      // Not connected or no data - show connection UI
      console.log('❌ User not connected to Strava or no data available');
      setStravaData({
        connected: false,
        stats: {
          totalRuns: 0,
          totalDistance: 0,
          totalTime: 0,
          averagePace: 0,
          totalElevation: 0
        },
        recentActivities: []
      });
      setLoading(false);
    } catch (err) {
      console.error('Error checking Strava connection:', err);
      setError(null); // Don't show error for initial connection check
      setStravaData({
        connected: false,
        stats: {
          totalRuns: 0,
          totalDistance: 0,
          totalTime: 0,
          averagePace: 0,
          totalElevation: 0
        },
        recentActivities: []
      });
      setLoading(false);
    }
  };

  const connectStrava = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Connecting to Strava...');
      
      // Get authorization URL from backend
      const response = await fetch(`/api/strava/auth-url?userId=${userId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        console.log('Redirecting to:', data.authUrl);
        // Redirect to Strava authorization
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || 'Unknown error from backend');
      }
    } catch (err) {
      console.error('Strava connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to connect to Strava: ${errorMessage}`);
      setLoading(false);
    }
  };

  const syncActivities = async () => {
    try {
      setSyncing(true);
      const response = await fetch(`http://localhost:3000/api/strava/sync/${userId}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        // Refresh data after sync
        await loadStravaData();
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Failed to sync activities');
    } finally {
      setSyncing(false);
    }
  };

  const loadStravaData = async () => {
    try {
      console.log('📊 Loading Strava data...');
      
      // Load stats and activities
      const [statsResponse, activitiesResponse] = await Promise.all([
        fetch(`/api/strava/stats/${userId}?period=4weeks`),
        fetch(`/api/strava/activities/${userId}?limit=5`)
      ]);

      if (!statsResponse.ok || !activitiesResponse.ok) {
        throw new Error('Failed to fetch data from backend');
      }

      const stats = await statsResponse.json();
      const activities = await activitiesResponse.json();

      console.log('📈 Stats loaded:', stats.data);
      console.log('🏃 Activities loaded:', activities.data?.length || 0, 'activities');

      // Try to load training plan (optional)
      let trainingPlan = null;
      try {
        const planResponse = await fetch(`/api/strava/training-plan/${userId}`);
        if (planResponse.ok) {
          const planData = await planResponse.json();
          trainingPlan = planData.data;
          console.log('📋 Training plan loaded:', trainingPlan?.plan?.name);
        }
      } catch (planError) {
        console.log('No training plan found (this is normal for new connections)');
      }

      setStravaData({
        connected: true,
        stats: stats.data,
        recentActivities: activities.data || [],
        trainingPlan
      });
      
      setLoading(false);
      console.log('✅ Strava data loaded successfully');
      
    } catch (err) {
      console.error('❌ Failed to load Strava data:', err);
      setError('Failed to load Strava data');
      setLoading(false);
    }
  };

  const createTrainingPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/strava/training-plan/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ goals })
      });

      const data = await response.json();
      if (data.success) {
        await loadStravaData();
        setShowGoalsDialog(false);
        setError(null);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError('Failed to create training plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stravaData) {
    return (
      <Card className="workout-card">
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading Strava integration...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stravaData?.connected) {
    return (
      <Card className="workout-card">
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <img 
              src="/strava-logo.png" 
              alt="Strava" 
              style={{ width: 120, marginBottom: 16 }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Box>
          <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
            Connect with Strava
          </Typography>
          <Typography sx={{ mb: 3, color: '#555' }}>
            Connect your Strava account to get AI-powered training plans that adapt to your real running data.
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              🏃‍♂️ Automatic activity sync
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              🤖 AI-powered training adaptation
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
              📈 Performance analysis
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              🎯 Personalized workout plans
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={connectStrava}
            sx={{
              background: 'linear-gradient(135deg, #FC4C02 0%, #FF6B35 100%)',
              color: 'white',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #E64A19 0%, #FC4C02 100%)',
              }
            }}
          >
            Connect Strava Account
          </Button>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
          AI Training Coach
        </Typography>
        <Box>
          <IconButton 
            onClick={syncActivities} 
            disabled={syncing}
            sx={{ color: 'white', mr: 1 }}
          >
            <Sync />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => setShowGoalsDialog(true)}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            Update Goals
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card className="workout-card">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <DirectionsRun sx={{ fontSize: 40, color: '#FF6B35', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                {stravaData.stats.totalRuns}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Total Runs (4 weeks)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="workout-card">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Timer sx={{ fontSize: 40, color: '#4FC3F7', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                {stravaData.stats.totalDistance.toFixed(1)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Total Distance (km)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="workout-card">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                {stravaData.stats.averagePace.toFixed(1)}'
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Average Pace (min/km)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card className="workout-card">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Terrain sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                {stravaData.stats.totalElevation}m
              </Typography>
              <Typography variant="body2" sx={{ color: '#555' }}>
                Total Elevation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Training Plan */}
      {stravaData.trainingPlan ? (
        <Card className="workout-card" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
                Current Training Plan
              </Typography>
              <Chip 
                label={stravaData.trainingPlan.plan.goals.focusArea.replace('_', ' ').toUpperCase()}
                sx={{ 
                  background: 'linear-gradient(135deg, #4FC3F7 0%, #29B6F6 100%)',
                  color: 'white',
                  fontWeight: 600
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: '#555', mb: 2 }}>
              Your AI coach has analyzed your recent {stravaData.stats.totalRuns} runs and created a personalized training plan.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${stravaData.trainingPlan.plan.metrics.weeklyDistance.toFixed(1)} km/week`} 
                variant="outlined" 
                sx={{ borderColor: '#FF6B35', color: '#FF6B35' }}
              />
              <Chip 
                label={`${stravaData.trainingPlan.plan.metrics.weeklyRuns} runs/week`} 
                variant="outlined" 
                sx={{ borderColor: '#4FC3F7', color: '#4FC3F7' }}
              />
              <Chip 
                label={`${stravaData.trainingPlan.plan.metrics.consistencyScore}% consistency`} 
                variant="outlined" 
                sx={{ borderColor: '#4CAF50', color: '#4CAF50' }}
              />
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card className="workout-card" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <FavoriteRounded sx={{ fontSize: 60, color: '#FF6B35', mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ color: '#2c3e50', fontWeight: 600 }}>
              Ready to Create Your AI Training Plan?
            </Typography>
            <Typography sx={{ mb: 3, color: '#555' }}>
              Based on your Strava data, our AI will create a personalized training plan that adapts as you progress.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => setShowGoalsDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
                }
              }}
            >
              Create Training Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onClose={() => setShowGoalsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#2c3e50' }}>Training Goals</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Focus Area</InputLabel>
              <Select
                value={goals.focusArea}
                label="Focus Area"
                onChange={(e) => setGoals({ ...goals, focusArea: e.target.value as any })}
              >
                <MenuItem value="general_fitness">General Fitness</MenuItem>
                <MenuItem value="endurance">Endurance Building</MenuItem>
                <MenuItem value="speed">Speed Development</MenuItem>
                <MenuItem value="strength">Strength & Hills</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Target Race Distance (km)"
              type="number"
              value={goals.targetDistance || ''}
              onChange={(e) => setGoals({ ...goals, targetDistance: Number(e.target.value) || undefined })}
              sx={{ mb: 3 }}
              helperText="Optional: Leave empty for general fitness"
            />
            
            <TextField
              fullWidth
              label="Target Race Time (minutes)"
              type="number"
              value={goals.targetTime || ''}
              onChange={(e) => setGoals({ ...goals, targetTime: Number(e.target.value) || undefined })}
              sx={{ mb: 3 }}
              helperText="Optional: Your goal finishing time"
            />
            
            <TextField
              fullWidth
              label="Race Date"
              type="date"
              value={goals.raceDate || ''}
              onChange={(e) => setGoals({ ...goals, raceDate: e.target.value || undefined })}
              InputLabelProps={{ shrink: true }}
              helperText="Optional: When is your target race?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGoalsDialog(false)}>Cancel</Button>
          <Button 
            onClick={createTrainingPlan} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A65 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E64A19 0%, #FF6B35 100%)',
              }
            }}
          >
            {loading ? 'Creating...' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {syncing && (
        <Alert severity="info" sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          Syncing activities with Strava...
        </Alert>
      )}
    </Box>
  );
};

export default StravaIntegration;
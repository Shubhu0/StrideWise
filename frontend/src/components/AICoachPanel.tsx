import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Psychology as PsychologyIcon,
  FitnessCenter as FitnessCenterIcon,
  EmojiEvents as EmojiEventsIcon,
  HealthAndSafety as HealthAndSafetyIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ai-tabpanel-${index}`}
      aria-labelledby={`ai-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface AICoachPanelProps {
  userId: string;
  connected: boolean;
}

const AICoachPanel: React.FC<AICoachPanelProps> = ({ userId, connected }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiData, setAiData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [planGoals, setPlanGoals] = useState({
    type: 'general_fitness',
    targetDistance: '5k',
    targetTime: '',
    weeklyHours: 5,
    experience: 'intermediate'
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const fetchAIData = async (endpoint: string, method: string = 'GET', body?: any) => {
    if (!connected) {
      setError('Please connect to Strava first');
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3000/api/strava/ai/${endpoint}/${userId}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('AI API Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch AI data');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTrainingPlan = async () => {
    const result = await fetchAIData('training-plan', 'POST', {
      goals: planGoals,
      preferences: {
        experience: planGoals.experience,
        weeklyHours: planGoals.weeklyHours,
        age: 30 // Default age
      }
    });

    if (result) {
      setAiData((prev: any) => ({ ...prev, trainingPlan: result.data }));
      setPlanDialogOpen(false);
    }
  };

  const handleGetMotivation = async () => {
    const result = await fetchAIData('motivation');
    if (result) {
      setAiData((prev: any) => ({ ...prev, motivation: result.data }));
    }
  };

  const handleGetInjuryPrevention = async () => {
    const result = await fetchAIData('injury-prevention');
    if (result) {
      setAiData((prev: any) => ({ ...prev, injuryPrevention: result.data }));
    }
  };

  const handleAnalyzeWorkout = async () => {
    const result = await fetchAIData('workout-analysis', 'POST', {
      // Will analyze most recent activity
    });
    if (result) {
      setAiData((prev: any) => ({ ...prev, workoutAnalysis: result.data }));
    }
  };

  useEffect(() => {
    // Load motivation on component mount if connected
    if (connected && activeTab === 0) {
      handleGetMotivation();
    }
  }, [connected, activeTab]);

  if (!connected) {
    return (
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Alert severity="info">
            <Typography variant="h6" gutterBottom>
              AI Coach Not Available
            </Typography>
            <Typography>
              Please connect to Strava first to unlock AI-powered personalized coaching features.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ m: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PsychologyIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            AI Coach
          </Typography>
          <Chip 
            label="Powered by AI" 
            color="primary" 
            size="small" 
            sx={{ ml: 2 }}
            icon={<LightbulbIcon />}
          />
        </Box>

        <Tabs value={activeTab} onChange={handleTabChange} aria-label="AI coach tabs">
          <Tab label="Motivation" icon={<EmojiEventsIcon />} />
          <Tab label="Training Plans" icon={<FitnessCenterIcon />} />
          <Tab label="Workout Analysis" icon={<PsychologyIcon />} />
          <Tab label="Injury Prevention" icon={<HealthAndSafetyIcon />} />
        </Tabs>

        {/* Motivation Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleGetMotivation}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <EmojiEventsIcon />}
            >
              Get Daily Motivation
            </Button>
          </Box>
          
          {aiData.motivation && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  🎯 Today's Motivation
                </Typography>
                <Typography variant="body1" paragraph>
                  {aiData.motivation.personalizedMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {aiData.motivation.content}
                </Typography>
                {aiData.motivation.recommendations && (
                  <List dense>
                    {aiData.motivation.recommendations.map((rec: string, index: number) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckCircleIcon color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Training Plans Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              onClick={() => setPlanDialogOpen(true)}
              disabled={loading}
              startIcon={<FitnessCenterIcon />}
            >
              Generate Personalized Training Plan
            </Button>
          </Box>
          
          {aiData.trainingPlan && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  🏃‍♂️ Your AI Training Plan
                </Typography>
                <Typography variant="body1" paragraph>
                  {aiData.trainingPlan.personalizedMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {aiData.trainingPlan.content}
                </Typography>
                {aiData.trainingPlan.recommendations && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Key Recommendations:
                    </Typography>
                    <List dense>
                      {aiData.trainingPlan.recommendations.map((rec: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
                <Chip 
                  label={`Confidence: ${Math.round((aiData.trainingPlan.confidence || 0.85) * 100)}%`}
                  color="success"
                  size="small"
                  sx={{ mt: 2 }}
                />
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Workout Analysis Tab */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleAnalyzeWorkout}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
            >
              Analyze Recent Workout
            </Button>
          </Box>
          
          {aiData.workoutAnalysis && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  📊 Workout Analysis
                </Typography>
                <Typography variant="body1" paragraph>
                  {aiData.workoutAnalysis.personalizedMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {aiData.workoutAnalysis.content}
                </Typography>
                {aiData.workoutAnalysis.recommendations && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Insights & Recommendations:
                    </Typography>
                    <List dense>
                      {aiData.workoutAnalysis.recommendations.map((rec: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <InfoIcon color="info" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {/* Injury Prevention Tab */}
        <TabPanel value={activeTab} index={3}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button 
              variant="contained" 
              onClick={handleGetInjuryPrevention}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <HealthAndSafetyIcon />}
            >
              Get Injury Prevention Tips
            </Button>
          </Box>
          
          {aiData.injuryPrevention && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  🛡️ Injury Prevention
                </Typography>
                <Typography variant="body1" paragraph>
                  {aiData.injuryPrevention.personalizedMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {aiData.injuryPrevention.content}
                </Typography>
                {aiData.injuryPrevention.recommendations && (
                  <>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Prevention Tips:
                    </Typography>
                    <List dense>
                      {aiData.injuryPrevention.recommendations.map((rec: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <WarningIcon color="warning" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>

      {/* Training Plan Dialog */}
      <Dialog open={planDialogOpen} onClose={() => setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Personalized Training Plan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Goal Type</InputLabel>
                <Select
                  value={planGoals.type}
                  onChange={(e) => setPlanGoals(prev => ({ ...prev, type: e.target.value }))}
                >
                  <MenuItem value="general_fitness">General Fitness</MenuItem>
                  <MenuItem value="weight_loss">Weight Loss</MenuItem>
                  <MenuItem value="endurance">Build Endurance</MenuItem>
                  <MenuItem value="speed">Improve Speed</MenuItem>
                  <MenuItem value="race_training">Race Training</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Target Distance</InputLabel>
                <Select
                  value={planGoals.targetDistance}
                  onChange={(e) => setPlanGoals(prev => ({ ...prev, targetDistance: e.target.value }))}
                >
                  <MenuItem value="5k">5K</MenuItem>
                  <MenuItem value="10k">10K</MenuItem>
                  <MenuItem value="half_marathon">Half Marathon</MenuItem>
                  <MenuItem value="marathon">Marathon</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Target Time (optional)"
                value={planGoals.targetTime}
                onChange={(e) => setPlanGoals(prev => ({ ...prev, targetTime: e.target.value }))}
                placeholder="e.g., 25:00"
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Weekly Hours"
                type="number"
                value={planGoals.weeklyHours}
                onChange={(e) => setPlanGoals(prev => ({ ...prev, weeklyHours: Number(e.target.value) }))}
              />
            </Grid>
            
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Experience</InputLabel>
                <Select
                  value={planGoals.experience}
                  onChange={(e) => setPlanGoals(prev => ({ ...prev, experience: e.target.value }))}
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGenerateTrainingPlan} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Generate Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default AICoachPanel;
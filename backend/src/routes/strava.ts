import express from 'express';
import StravaService from '../services/stravaService';
import AITrainingService from '../services/aiTrainingService';
import aiAgentService from '../services/aiAgentService';
import StravaUser from '../models/StravaUser';
import { StravaActivity } from '../models/StravaModels';
import cron from 'node-cron';

const router = express.Router();
const stravaService = new StravaService();
const aiTrainingService = new AITrainingService();

/**
 * GET /api/strava/auth-url
 * Get Strava authorization URL
 */
router.get('/auth-url', async (req, res) => {
  try {
    console.log('🔗 Strava auth-url request received:', req.query);
    const { userId } = req.query;
    const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/strava/callback`;
    
    const authUrl = stravaService.getAuthorizationUrl(redirectUri, userId as string);
    
    console.log('✅ Generated auth URL successfully');
    res.json({ 
      success: true, 
      authUrl,
      message: 'Strava authorization URL generated successfully'
    });
  } catch (error) {
    console.error('❌ Error generating Strava auth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate authorization URL' 
    });
  }
});

/**
 * POST /api/strava/callback
 * Handle Strava OAuth callback
 */
router.post('/callback', async (req, res) => {
  try {
    const { code, state: userId = 'demo-user-123' } = req.body;
    console.log(`🔄 Processing Strava callback for user: ${userId}, code: ${code?.substring(0, 10)}...`);

    if (!code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing authorization code' 
      });
    }

    // Exchange code for tokens
    const tokens = await stravaService.exchangeCodeForTokens(code);
    console.log('✅ Successfully exchanged code for tokens');
    
    // Get athlete info
    const athlete = await stravaService.getAthlete(tokens.access_token);
    console.log(`✅ Retrieved athlete info: ${athlete.id}`);

    // Create user data structure (without _id for updates)
    const userData = {
      profile: {
        firstName: athlete.firstname || 'Demo',
        lastName: athlete.lastname || 'User',
        email: `${athlete.id}@strava.local`,
        country: athlete.country || 'US',
        state: athlete.state || '',
        city: athlete.city || '',
        sex: athlete.sex || 'M'
      },
      strava: {
        athleteId: athlete.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(tokens.expires_at * 1000),
        athlete: athlete
      }
    };

    // Check for existing user
    const existingUser = await StravaUser.findOne({
      $or: [
        { 'strava.athleteId': athlete.id },
        { 'profile.email': userData.profile.email },
        { _id: userId }
      ]
    });

    let user;
    if (existingUser) {
      // Update existing user
      user = await StravaUser.findOneAndUpdate(
        { _id: existingUser._id },
        { $set: userData },
        { new: true, runValidators: false }
      );
      console.log(`✅ User updated successfully`);
    } else {
      // Create new user with _id
      const userDataWithId = { ...userData, _id: userId };
      user = await StravaUser.create(userDataWithId);
      console.log(`✅ New user created successfully`);
    }

    res.json({ 
      success: true, 
      message: 'Strava account connected successfully',
      user: {
        id: user._id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        athleteId: user.strava.athleteId
      }
    });
  } catch (error) {
    console.error('❌ Error handling Strava callback:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      console.log('🔄 Duplicate user detected, attempting to update...');
      try {
        const { code, state: userId = 'demo-user-123' } = req.body;
        const tokens = await stravaService.exchangeCodeForTokens(code);
        const athlete = await stravaService.getAthlete(tokens.access_token);
        
        const user = await StravaUser.findOneAndUpdate(
          { 'strava.athleteId': athlete.id },
          { 
            $set: {
              'strava.accessToken': tokens.access_token,
              'strava.refreshToken': tokens.refresh_token,
              'strava.expiresAt': new Date(tokens.expires_at * 1000)
            }
          },
          { new: true, runValidators: false }
        );
        
        return res.json({ 
          success: true, 
          user: {
            id: user._id,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            athleteId: user.strava.athleteId
          }
        });
      } catch (updateError) {
        console.error('❌ Failed to update duplicate user:', updateError);
        return res.status(500).json({ error: 'Failed to handle existing user' });
      }
    }

    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to connect Strava account'
    });
  }
});

/**
 * GET /api/strava/activities/:userId
 * Get user's Strava activities
 */
router.get('/activities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Check and refresh token if needed
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      console.log('🔄 Refreshing expired access token...');
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      
      accessToken = newTokens.access_token;
      console.log('✅ Access token refreshed successfully');
    }

    const activities = await stravaService.getRecentActivities(accessToken);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('❌ Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});

/**
 * GET /api/strava/stats/:userId
 * Get user's performance stats
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '4weeks' } = req.query;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken);
    const runningActivities = activities.filter(activity => activity.type === 'Run');
    
    // Calculate stats
    const totalRuns = runningActivities.length;
    const totalDistance = runningActivities.reduce((sum, act) => sum + (act.distance / 1609.34), 0); // Convert to miles
    const totalTime = runningActivities.reduce((sum, act) => sum + act.moving_time, 0);
    const averagePace = totalDistance > 0 ? (totalTime / 60) / totalDistance * 60 : 0; // seconds per mile
    const totalElevation = runningActivities.reduce((sum, act) => sum + (act.total_elevation_gain * 3.28084), 0); // Convert to feet

    const stats = {
      totalRuns,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime,
      averagePace: Math.round(averagePace),
      totalElevation: Math.round(totalElevation),
      period
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

/**
 * GET /api/strava/training-plan/:userId
 * Get or create training plan
 */
router.get('/training-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Check if user has an existing training plan
    if (user.trainingPlan && user.trainingPlan.createdAt && 
        new Date().getTime() - user.trainingPlan.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000) { // Plan is less than 7 days old
      
      // Generate current week's workouts
      const upcomingWorkouts = aiTrainingService.generateWeeklyWorkouts(user, user.trainingPlan);
      
      return res.json({ 
        success: true, 
        data: {
          plan: user.trainingPlan,
          upcomingWorkouts
        }
      });
    }

    // Generate a basic plan if none exists
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken);
    const basicGoals = { raceType: 'general-fitness', weeklyMiles: '20' };
    
    const trainingPlan = aiTrainingService.generatePersonalizedPlan(user, activities, basicGoals);
    const upcomingWorkouts = aiTrainingService.generateWeeklyWorkouts(user, trainingPlan.plan);

    res.json({ 
      success: true, 
      data: {
        plan: trainingPlan.plan,
        upcomingWorkouts
      }
    });
  } catch (error) {
    console.error('❌ Error fetching training plan:', error);
    res.status(500).json({ error: 'Failed to fetch training plan', details: error.message });
  }
});

/**
 * POST /api/strava/training-plan/:userId
 * Generate AI training plan
 */
router.post('/training-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = req.body.goals || {};
    
    // Find user
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Check and refresh token if needed
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    // Get recent activities for analysis
    const activities = await stravaService.getRecentActivities(accessToken);
    
    // Generate training plan using AI service
    const trainingPlan = aiTrainingService.generatePersonalizedPlan(user, activities, goals);
    
    // Save training plan to user
    await StravaUser.findByIdAndUpdate(userId, {
      $set: {
        trainingPlan: {
          ...trainingPlan.plan,
          createdAt: new Date(),
          goals
        }
      }
    });

    // Generate weekly workouts
    const upcomingWorkouts = aiTrainingService.generateWeeklyWorkouts(user, trainingPlan.plan);
    
    res.json({ 
      success: true, 
      data: {
        plan: trainingPlan.plan,
        upcomingWorkouts
      }
    });
  } catch (error) {
    console.error('❌ Error generating training plan:', error);
    res.status(500).json({ error: 'Failed to generate training plan', details: error.message });
  }
});

/**
 * POST /api/strava/sync/:userId
 * Sync latest activities and update training plan
 */
router.post('/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Check and refresh token if needed
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    // Get latest activities
    const activities = await stravaService.getRecentActivities(accessToken);
    console.log(`✅ Synced ${activities.length} activities for user ${userId}`);

    // If user has a training plan, analyze and adapt it
    if (user.trainingPlan) {
      const adaptations = await aiTrainingService.analyzeProgressAndAdapt(user, activities);
      
      if (adaptations.length > 0) {
        await StravaUser.findByIdAndUpdate(userId, {
          $push: {
            'trainingPlan.adaptations': { $each: adaptations, $slice: -10 } // Keep last 10 adaptations
          },
          $set: {
            'trainingPlan.lastUpdated': new Date()
          }
        });
        console.log(`✅ Applied ${adaptations.length} training adaptations`);
      }
    }

    res.json({ 
      success: true, 
      data: { 
        activitiesSynced: activities.length,
        lastSync: new Date()
      }
    });
  } catch (error) {
    console.error('❌ Error syncing activities:', error);
    res.status(500).json({ error: 'Failed to sync activities', details: error.message });
  }
});

// Debug route to clear demo data
router.delete('/clear-demo-data', async (req, res) => {
  try {
    console.log('🧹 Clearing demo data...');
    await StravaUser.deleteMany({ _id: { $regex: /^demo-/ } });
    console.log('✅ Demo data cleared');
    res.json({ success: true, message: 'Demo data cleared' });
  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
    res.status(500).json({ error: 'Failed to clear demo data' });
  }
});

/**
 * AI Agent Routes
 */

/**
 * POST /api/strava/ai/training-plan/:userId
 * Generate AI-powered personalized training plan
 */
router.post('/ai/training-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { goals, preferences } = req.body;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Get recent activities for AI analysis
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken);
    
    const trainingPlanRequest = {
      userId: userId,
      requestType: 'training_plan' as const,
      userProfile: {
        age: preferences?.age || 30,
        fitnessLevel: preferences?.experience || 'intermediate',
        goals: Array.isArray(goals) ? goals : [goals?.type || 'general_fitness'],
        preferences: preferences || {}
      },
      runningData: {
        recentActivities: activities.slice(0, 20),
        totalRuns: activities.length,
        totalDistance: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0),
        totalTime: activities.reduce((sum, act) => sum + act.moving_time, 0),
        averagePace: activities.length > 0 ? activities.reduce((sum, act) => sum + (act.moving_time / (act.distance / 1609.34) / 60), 0) / activities.length : 0,
        totalElevation: activities.reduce((sum, act) => sum + act.total_elevation_gain, 0),
        weeklyMiles: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0) / 4 // Approximate weekly average
      },
      goals: goals
    };

    const result = await aiAgentService.generatePersonalizedTrainingPlan(trainingPlanRequest);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error generating training plan:', error);
    res.status(500).json({ 
      error: 'Failed to generate training plan',
      details: error.message 
    });
  }
});

/**
 * POST /api/strava/ai/test-training-plan
 * Test AI-powered training plan generation without Strava requirement
 */
router.post('/ai/test-training-plan', async (req, res) => {
  try {
    console.log('🧪 Testing AI training plan generation...');
    const { userProfile, runningData } = req.body;
    
    const trainingPlanRequest = {
      userId: 'test-user',
      userProfile: userProfile || {
        goals: ['general_fitness'],
        experience: 'beginner'
      },
      runningData: runningData || {
        totalRuns: 10,
        totalDistance: 50,
        averagePace: 480,
        recentActivities: []
      }
    };

    const result = await aiAgentService.generatePersonalizedTrainingPlan(trainingPlanRequest);
    
    res.json({
      success: true,
      data: result,
      testMode: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in test training plan:', error);
    res.status(500).json({ 
      error: 'Failed to generate test training plan',
      details: error.message 
    });
  }
});
router.post('/ai/training-plan/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { goals, preferences } = req.body;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Get recent activities for AI analysis
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken);
    
    const trainingPlanRequest = {
      userId: userId,
      requestType: 'training_plan' as const,
      userProfile: {
        age: preferences?.age || 30,
        fitnessLevel: preferences?.experience || 'intermediate',
        goals: Array.isArray(goals) ? goals : [goals?.type || 'general_fitness'],
        preferences: preferences || {}
      },
      runningData: {
        recentActivities: activities.slice(0, 20),
        totalRuns: activities.length,
        totalDistance: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0),
        totalTime: activities.reduce((sum, act) => sum + act.moving_time, 0),
        averagePace: activities.length > 0 ? activities.reduce((sum, act) => sum + (act.moving_time / (act.distance / 1609.34) / 60), 0) / activities.length : 0,
        totalElevation: activities.reduce((sum, act) => sum + act.total_elevation_gain, 0),
        weeklyMiles: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0) / 4 // Approximate weekly average
      },
      goals: goals
    };

    const result = await aiAgentService.generatePersonalizedTrainingPlan(trainingPlanRequest);
    
    res.json({ 
      success: true, 
      data: result.data,
      aiGenerated: true,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error generating AI training plan:', error);
    res.status(500).json({ error: 'Failed to generate AI training plan', details: error.message });
  }
});

/**
 * POST /api/strava/ai/workout-analysis/:userId
 * Get AI-powered workout analysis
 */
router.post('/ai/workout-analysis/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { activityId } = req.body;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Get the specific activity for analysis
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    let targetActivity;
    if (activityId) {
      targetActivity = await stravaService.getActivity(accessToken, activityId);
    } else {
      // Get most recent activity
      const activities = await stravaService.getRecentActivities(accessToken, 7);
      targetActivity = activities[0];
    }

    if (!targetActivity) {
      return res.status(404).json({ error: 'No activity found for analysis' });
    }

    const recentActivities = await stravaService.getRecentActivities(accessToken, 30);

    const analysisRequest = {
      userId: userId,
      requestType: 'workout_analysis' as const,
      userProfile: {
        fitnessLevel: 'intermediate' as const // Could be determined from historical data
      },
      runningData: {
        recentActivities: [targetActivity, ...recentActivities],
        totalRuns: recentActivities.length + 1,
        totalDistance: recentActivities.reduce((sum, act) => sum + (act.distance / 1609.34), 0),
        totalTime: recentActivities.reduce((sum, act) => sum + act.moving_time, 0),
        averagePace: recentActivities.length > 0 ? recentActivities.reduce((sum, act) => sum + (act.moving_time / (act.distance / 1609.34) / 60), 0) / recentActivities.length : 0,
        totalElevation: recentActivities.reduce((sum, act) => sum + act.total_elevation_gain, 0)
      },
      context: `Analyzing activity ${targetActivity.id}: ${targetActivity.name}`
    };

    const result = await aiAgentService.analyzeWorkout(analysisRequest);
    
    res.json({ 
      success: true, 
      data: result.data,
      analyzedActivity: targetActivity.id,
      aiGenerated: true,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error analyzing workout:', error);
    res.status(500).json({ error: 'Failed to analyze workout', details: error.message });
  }
});

/**
 * GET /api/strava/ai/motivation/:userId
 * Get AI-powered motivational content
 */
router.get('/ai/motivation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Get recent activities for context
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken, 14);
    
    const motivationRequest = {
      userId: userId,
      requestType: 'motivation' as const,
      userProfile: {
        goals: user.trainingPlan?.goals ? [user.trainingPlan.goals.toString()] : ['general_fitness']
      },
      runningData: {
        recentActivities: activities,
        totalRuns: activities.length,
        totalDistance: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0),
        totalTime: activities.reduce((sum, act) => sum + act.moving_time, 0),
        averagePace: activities.length > 0 ? activities.reduce((sum, act) => sum + (act.moving_time / (act.distance / 1609.34) / 60), 0) / activities.length : 0,
        totalElevation: activities.reduce((sum, act) => sum + act.total_elevation_gain, 0),
        weeklyMiles: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0) / 2 // Last 2 weeks average
      },
      context: `Motivational content for ${user.profile?.firstName || 'Runner'}`
    };

    const result = await aiAgentService.generateMotivationalContent(motivationRequest);
    
    res.json({ 
      success: true, 
      data: result.data,
      aiGenerated: true,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error generating motivation:', error);
    res.status(500).json({ error: 'Failed to generate motivation', details: error.message });
  }
});

/**
 * GET /api/strava/ai/injury-prevention/:userId
 * Get AI-powered injury prevention advice
 */
router.get('/ai/injury-prevention/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await StravaUser.findById(userId);
    if (!user || !user.strava.accessToken) {
      return res.status(401).json({ error: 'User not connected to Strava' });
    }

    // Get recent activities for injury risk analysis
    let accessToken = user.strava.accessToken;
    if (new Date() >= user.strava.expiresAt) {
      const newTokens = await stravaService.refreshAccessToken(user.strava.refreshToken);
      await StravaUser.findByIdAndUpdate(userId, {
        $set: {
          'strava.accessToken': newTokens.access_token,
          'strava.refreshToken': newTokens.refresh_token,
          'strava.expiresAt': new Date(newTokens.expires_at * 1000)
        }
      });
      accessToken = newTokens.access_token;
    }

    const activities = await stravaService.getRecentActivities(accessToken, 30);
    
    const preventionRequest = {
      userId: userId,
      requestType: 'injury_prevention' as const,
      userProfile: {
        age: 30, // Default age since not in profile model
        fitnessLevel: 'intermediate' as const
      },
      runningData: {
        recentActivities: activities,
        totalRuns: activities.length,
        totalDistance: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0),
        totalTime: activities.reduce((sum, act) => sum + act.moving_time, 0),
        averagePace: activities.length > 0 ? activities.reduce((sum, act) => sum + (act.moving_time / (act.distance / 1609.34) / 60), 0) / activities.length : 0,
        totalElevation: activities.reduce((sum, act) => sum + act.total_elevation_gain, 0),
        weeklyMiles: activities.reduce((sum, act) => sum + (act.distance / 1609.34), 0) / 4
      },
      context: 'Injury prevention analysis based on recent training patterns'
    };

    const result = await aiAgentService.provideInjuryPrevention(preventionRequest);
    
    res.json({ 
      success: true, 
      data: result.data,
      aiGenerated: true,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('❌ Error generating injury prevention advice:', error);
    res.status(500).json({ error: 'Failed to generate injury prevention advice', details: error.message });
  }
});

export default router;
# Strava Integration Setup Guide

## Quick Start for Testing

Since setting up a full Strava API integration requires developer credentials, here's how to test the system:

## Option 1: Demo Mode (Recommended for Testing)

The application includes a demo mode that simulates Strava integration with mock data:

1. **Start the Application**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Navigate to AI Coach**
   - Visit `http://localhost:5173`
   - Click on the "🤖 AI Coach" button in the navigation
   - The system will show the Strava connection interface

3. **Simulate Connection** 
   - For demo purposes, the system works with mock data
   - You can explore the training plan generation features
   - All AI coaching features are functional with simulated running data

## Option 2: Full Strava Integration

To set up real Strava integration:

### 1. Create Strava App
1. Go to [Strava Developers](https://developers.strava.com/)
2. Click "Create App"
3. Fill in details:
   - **App Name**: "StrideWise" 
   - **Website**: `http://localhost:5173`
   - **Authorization Callback Domain**: `localhost`
   - **Description**: "AI-powered running coach"

### 2. Configure Environment
1. Copy your Client ID and Client Secret
2. Update `backend/.env`:
   ```bash
   STRAVA_CLIENT_ID=your_actual_client_id
   STRAVA_CLIENT_SECRET=your_actual_client_secret
   ```

### 3. Test OAuth Flow
1. Navigate to AI Coach page
2. Click "Connect Strava Account"
3. Authorize the application on Strava
4. Return to see your real running data

## How the AI Training System Works

### 1. Data Analysis
- **Volume Analysis**: Analyzes your weekly distance and run frequency
- **Pace Trends**: Identifies your current fitness level and pace capabilities
- **Consistency Scoring**: Measures training regularity (0-100%)
- **Improvement Rate**: Tracks pace improvements over time

### 2. Training Zone Calculation
- **Easy Zone**: Aerobic base building (conversational pace)
- **Tempo Zone**: Lactate threshold training (comfortably hard)
- **Threshold Zone**: Race pace efforts
- **Interval Zone**: VO2 max training (hard efforts)
- **Recovery Zone**: Active recovery pace

### 3. Plan Generation
- **Weekly Structure**: Balances hard days with recovery
- **Progressive Overload**: Gradually increases training load
- **Goal Adaptation**: Adjusts for race training or general fitness
- **Recovery Balance**: Prevents overtraining with rest days

### 4. Continuous Learning
- **Daily Sync**: Automatically fetches new Strava activities
- **Plan Updates**: Modifies training based on recent performances
- **Adaptation Tracking**: Records why and how plans change
- **Progress Monitoring**: Long-term fitness trend analysis

## Sample AI-Generated Training Week

Based on analyzing your Strava data, the AI might generate:

**Monday**: Recovery Run - 30 min easy pace  
**Tuesday**: Interval Training - 6x400m with 90s rest  
**Wednesday**: Easy Run - 45 min conversational pace  
**Thursday**: Tempo Run - 20 min at threshold pace  
**Friday**: Rest Day or Cross Training  
**Saturday**: Easy Run - 35 min relaxed effort  
**Sunday**: Long Run - 75 min steady aerobic pace  

## Features in Action

### Adaptive Intelligence
- If you run faster than expected, zones adjust upward
- If you miss runs, the plan reduces intensity temporarily
- If you increase volume, the plan progressively adds more distance
- If performance plateaus, the plan introduces variety

### Goal-Specific Training
- **5K Focus**: More speed work and shorter intervals
- **Marathon Focus**: Higher volume with long runs
- **General Fitness**: Balanced approach with variety
- **Hill Training**: Strength-focused with elevation work

### Smart Recovery
- Detects when you need rest based on recent efforts
- Balances hard sessions with easy recovery runs
- Adjusts plan if you show signs of overtraining
- Incorporates periodization principles

## Testing Scenarios

Try these scenarios to see AI adaptation:

1. **New Runner**: Connect with minimal Strava data to see beginner plan
2. **Consistent Runner**: Use account with regular activity for advanced planning
3. **Returning Runner**: Test with gaps in training history
4. **Race Training**: Set specific race goals and dates

## API Endpoints for Testing

```bash
# Get authorization URL
GET /api/strava/auth-url?userId=demo-user

# Sync activities (requires connected account)
POST /api/strava/sync/demo-user

# Get training plan
GET /api/strava/training-plan/demo-user

# Create new training plan with goals
POST /api/strava/training-plan/demo-user
{
  "goals": {
    "focusArea": "endurance",
    "targetDistance": 21.1,
    "targetTime": 120,
    "raceDate": "2024-06-15"
  }
}

# Get running statistics
GET /api/strava/stats/demo-user?period=4weeks
```

## Troubleshooting

### Common Issues
1. **"Failed to connect to Strava"**: Check Client ID/Secret in .env
2. **"No activities found"**: Ensure Strava account has running activities
3. **"Plan generation failed"**: Check that activities are properly synced
4. **Token expired**: System automatically refreshes tokens

### Debug Mode
Add to backend/.env for detailed logging:
```bash
NODE_ENV=development
DEBUG=strava:*
```

This will show detailed API calls and AI decision-making process.

## Next Steps

Once connected, explore:
- Dashboard integration showing AI recommendations
- Workout completion tracking
- Performance trend analysis
- Goal achievement monitoring
- Plan adaptation history

The AI learns from every run, making your training smarter over time! 🏃‍♂️🤖
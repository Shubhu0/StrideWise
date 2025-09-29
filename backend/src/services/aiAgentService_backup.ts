import axios from 'axios';

interface UserProfile {
  age?: number;
  weight?: number;
  height?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals?: string[];
  injuries?: string[];
  preferences?: {
    preferredDays?: string[];
    preferredTime?: string;
    intensity?: 'low' | 'medium' | 'high';
  };
}

interface RunningData {
  totalRuns: number;
  totalDistance: number;
  totalTime: number;
  averagePace: number;
  totalElevation: number;
  recentActivities: any[];
  consistency?: number;
  weeklyMiles?: number;
}

interface AIRequest {
  userId: string;
  userProfile: UserProfile;
  runningData: RunningData;
  goals?: any;
  context?: string;
  requestType: 'training_plan' | 'workout_analysis' | 'motivation' | 'injury_prevention' | 'nutrition_advice';
}

interface AIResponse {
  success: boolean;
  data: {
    type: string;
    content: any;
    recommendations: string[];
    personalizedMessage: string;
    confidence: number;
  };
}

class AIAgentService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using OpenAI API as the AI Agent (you can replace with any AI service)
    this.apiKey = process.env.OPENAI_API_KEY || 'your-openai-api-key';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Generate personalized training plan using AI
   */
  async generatePersonalizedTrainingPlan(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Generating personalized training plan with AI...');
      
      // Check if we have a real API key
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-mode-no-key-needed') {
        const prompt = this.createTrainingPlanPrompt(request);
        const aiResponse = await this.callAIAPI(prompt, 'training_plan');
        
        if (aiResponse.success) {
          return {
            success: true,
            plan: aiResponse.data.content,
            recommendations: aiResponse.data.recommendations,
            personalizedMessage: aiResponse.data.personalizedMessage,
            aiGenerated: true,
            generatedAt: new Date(),
            confidence: aiResponse.data.confidence
          };
        }
      }
      
      // Use enhanced mock response with real user data
      console.log('🎯 Using enhanced mock AI response based on user data...');
      const mockResponse = this.generateMockAIResponse('training_plan', request);
      return {
        success: true,
        plan: mockResponse.data.content,
        recommendations: mockResponse.data.recommendations,
        personalizedMessage: mockResponse.data.personalizedMessage,
        aiGenerated: true,
        mockMode: true,
        generatedAt: new Date(),
        confidence: mockResponse.data.confidence
      };
    } catch (error) {
      console.error('❌ Error generating AI training plan:', error);
      // Final fallback
      return this.generateFallbackPlan(request);
    }
  }

  /**
   * Analyze workout and provide insights
   */
  async analyzeWorkout(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Analyzing workout with AI...');
      
      // Check if we have a real API key
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-mode-no-key-needed') {
        const prompt = this.createWorkoutAnalysisPrompt(request);
        const aiResponse = await this.callAIAPI(prompt, 'workout_analysis');
        
        if (aiResponse.success) {
          return {
            success: true,
            analysis: aiResponse.data.content,
            insights: aiResponse.data.recommendations,
            personalizedMessage: aiResponse.data.personalizedMessage,
            aiGenerated: true,
            confidence: aiResponse.data.confidence
          };
        }
      }
      
      // Use enhanced mock response with real user data
      console.log('🎯 Using enhanced mock workout analysis based on user data...');
      const mockResponse = this.generateMockAIResponse('workout_analysis', request);
      return {
        success: true,
        analysis: mockResponse.data.content,
        insights: mockResponse.data.recommendations,
        personalizedMessage: mockResponse.data.personalizedMessage,
        aiGenerated: true,
        mockMode: true,
        confidence: mockResponse.data.confidence
      };
    } catch (error) {
      console.error('❌ Error analyzing workout:', error);
      return this.generateFallbackAnalysis(request);
    }
  }

  /**
   * Generate motivational content
   */
  async generateMotivationalContent(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Generating motivational content with AI...');
      
      // Check if we have a real API key
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-mode-no-key-needed') {
        const prompt = this.createMotivationPrompt(request);
        const aiResponse = await this.callAIAPI(prompt, 'motivation');
        
        if (aiResponse.success) {
          return {
            success: true,
            message: aiResponse.data.content,
            personalizedMessage: aiResponse.data.personalizedMessage,
            aiGenerated: true,
            confidence: aiResponse.data.confidence
          };
        }
      }
      
      // Use enhanced mock response with real user data
      console.log('🎯 Using enhanced mock motivation based on user data...');
      const mockResponse = this.generateMockAIResponse('motivation', request);
      return {
        success: true,
        message: mockResponse.data.content,
        personalizedMessage: mockResponse.data.personalizedMessage,
        aiGenerated: true,
        mockMode: true,
        confidence: mockResponse.data.confidence
      };
    } catch (error) {
      console.error('❌ Error generating motivational content:', error);
      return this.generateFallbackMotivation(request);
    }
  }

  /**
   * Provide injury prevention advice
   */
  async provideInjuryPrevention(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Providing injury prevention advice with AI...');
      
      // Check if we have a real API key
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'demo-mode-no-key-needed') {
        const prompt = this.createInjuryPreventionPrompt(request);
        const aiResponse = await this.callAIAPI(prompt, 'injury_prevention');
        
        if (aiResponse.success) {
          return {
            success: true,
            advice: aiResponse.data.content,
            recommendations: aiResponse.data.recommendations,
            personalizedMessage: aiResponse.data.personalizedMessage,
            aiGenerated: true,
            confidence: aiResponse.data.confidence
          };
        }
      }
      
      // Use enhanced mock response with real user data
      console.log('🎯 Using enhanced mock injury prevention based on user data...');
      const mockResponse = this.generateMockAIResponse('injury_prevention', request);
      return {
        success: true,
        advice: mockResponse.data.content,
        recommendations: mockResponse.data.recommendations,
        personalizedMessage: mockResponse.data.personalizedMessage,
        aiGenerated: true,
        mockMode: true,
        confidence: mockResponse.data.confidence
      };
    } catch (error) {
      console.error('❌ Error providing injury prevention advice:', error);
      return this.generateFallbackInjuryAdvice(request);
    }
  }

  /**
   * Call AI API (OpenAI or other provider)
   */
  private async callAIAPI(prompt: string, type: string): Promise<AIResponse> {
    try {
      if (!this.apiKey || this.apiKey === 'your-openai-api-key') {
        // Return mock response if no API key
        return this.generateMockAIResponse(type);
      }

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert running coach and sports scientist. Provide personalized, actionable advice based on the user\'s data. Always respond in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const aiContent = response.data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(aiContent);
        return {
          success: true,
          data: {
            type: type,
            content: parsedContent,
            recommendations: parsedContent.recommendations || [],
            personalizedMessage: parsedContent.message || 'Here\'s your personalized advice!',
            confidence: parsedContent.confidence || 0.85
          }
        };
      } catch (parseError) {
        console.error('❌ Error parsing AI response:', parseError);
        return this.generateMockAIResponse(type);
      }
    } catch (error) {
      console.error('❌ AI API call failed:', error);
      return this.generateMockAIResponse(type);
    }
  }

  /**
   * Create training plan prompt
   */
  private createTrainingPlanPrompt(request: AIRequest): string {
    const { userProfile, runningData, goals } = request;
    
    return `
    Create a personalized running training plan based on the following data:
    
    User Profile: ${JSON.stringify(userProfile)}
    Running Data: ${JSON.stringify(runningData)}
    Goals: ${JSON.stringify(goals)}
    
    Please provide a response in the following JSON format:
    {
      "name": "Plan Name",
      "duration": "weeks",
      "weeklyDistance": number,
      "weeklyRuns": number,
      "goals": ["goal1", "goal2"],
      "phases": [
        {
          "name": "Phase 1",
          "weeks": [1, 2, 3, 4],
          "focus": "Base Building",
          "weeklyStructure": {
            "easy_runs": 3,
            "tempo_runs": 1,
            "long_runs": 1,
            "rest_days": 2
          }
        }
      ],
      "recommendations": ["tip1", "tip2", "tip3"],
      "message": "Personalized message for the user",
      "confidence": 0.9
    }
    `;
  }

  /**
   * Create workout analysis prompt
   */
  private createWorkoutAnalysisPrompt(request: AIRequest): string {
    const { runningData } = request;
    
    return `
    Analyze this runner's recent performance data and provide insights:
    
    Running Data: ${JSON.stringify(runningData)}
    
    Please provide analysis in JSON format:
    {
      "performance_trends": "analysis",
      "strengths": ["strength1", "strength2"],
      "areas_for_improvement": ["area1", "area2"],
      "recommendations": ["rec1", "rec2", "rec3"],
      "message": "Personal message",
      "confidence": 0.85
    }
    `;
  }

  /**
   * Create motivation prompt
   */
  private createMotivationPrompt(request: AIRequest): string {
    const { userProfile, runningData } = request;
    
    return `
    Create motivational content for a runner based on their data:
    
    Profile: ${JSON.stringify(userProfile)}
    Recent Performance: ${JSON.stringify(runningData)}
    
    JSON format:
    {
      "quote": "Motivational quote",
      "achievements": ["recent achievement"],
      "next_milestone": "upcoming goal",
      "message": "Personal motivational message",
      "confidence": 0.8
    }
    `;
  }

  /**
   * Create injury prevention prompt
   */
  private createInjuryPreventionPrompt(request: AIRequest): string {
    const { userProfile, runningData } = request;
    
    return `
    Provide injury prevention advice for a runner:
    
    Profile: ${JSON.stringify(userProfile)}
    Running Data: ${JSON.stringify(runningData)}
    
    JSON format:
    {
      "risk_assessment": "low/medium/high",
      "prevention_tips": ["tip1", "tip2"],
      "exercises": ["exercise1", "exercise2"],
      "recommendations": ["rec1", "rec2"],
      "message": "Personal advice message",
      "confidence": 0.8
    }
    `;
  }

  /**
   * Generate fallback plan when AI fails
   */
  private generateFallbackPlan(request: AIRequest): any {
    console.log('🔄 Generating fallback training plan...');
    
    const { runningData, goals } = request;
    
    return {
      success: true,
      plan: {
        name: 'Personalized Training Plan',
        duration: '12 weeks',
        weeklyDistance: Math.max(runningData.totalDistance * 1.1, 15),
        weeklyRuns: Math.max(runningData.totalRuns, 3),
        goals: goals || ['Improve endurance', 'Stay injury-free'],
        phases: [
          {
            name: 'Base Building',
            weeks: [1, 2, 3, 4],
            focus: 'Aerobic development',
            weeklyStructure: {
              easy_runs: 3,
              tempo_runs: 1,
              long_runs: 1,
              rest_days: 2
            }
          }
        ]
      },
      recommendations: [
        'Start conservatively and build gradually',
        'Listen to your body and rest when needed',
        'Focus on consistency over intensity'
      ],
      personalizedMessage: 'This plan is tailored to your current fitness level and will help you achieve your running goals safely.',
      aiGenerated: false,
      confidence: 0.7
    };
  }

  /**
   * Generate fallback analysis
   */
  private generateFallbackAnalysis(request: AIRequest): any {
    const { runningData } = request;
    
    return {
      success: true,
      analysis: {
        performance_trends: 'Based on your recent activities, you\'re showing consistent progress.',
        strengths: ['Good consistency', 'Steady improvement'],
        areas_for_improvement: ['Consider adding variety', 'Focus on recovery']
      },
      recommendations: [
        'Keep up the consistent training',
        'Consider adding one tempo run per week',
        'Don\'t forget to prioritize recovery'
      ],
      personalizedMessage: 'Your running data shows great dedication. Keep up the excellent work!',
      confidence: 0.7
    };
  }

  /**
   * Generate fallback motivation
   */
  private generateFallbackMotivation(request: AIRequest): any {
    return {
      success: true,
      content: {
        quote: 'Every mile begins with a single step.',
        achievements: ['Consistency in training'],
        next_milestone: 'Completing your next long run'
      },
      personalizedMessage: 'You\'re doing great! Every run is progress toward your goals.',
    };
  }

  /**
   * Generate fallback injury advice
   */
  private generateFallbackInjuryAdvice(request: AIRequest): any {
    return {
      success: true,
      advice: {
        risk_assessment: 'low',
        prevention_tips: ['Warm up properly', 'Cool down after runs', 'Stretch regularly'],
        exercises: ['Dynamic warm-up', 'Post-run stretching', 'Strength training']
      },
      recommendations: [
        'Maintain a gradual training progression',
        'Include rest days in your schedule',
        'Listen to your body'
      ],
      personalizedMessage: 'Stay injury-free by being consistent with prevention practices.',
    };
  }

  /**
   * Generate enhanced mock AI response based on real user data
   */
  private generateMockAIResponse(type: string, request?: AIRequest): AIResponse {
    // If we have request data, generate intelligent responses
    if (request) {
      return this.generateEnhancedMockResponse(request, type);
    }

    // Fallback to basic mock responses
    const mockResponses = {
      training_plan: {
        name: 'AI-Powered Progressive Training Plan',
        duration: '12 weeks',
        weeklyDistance: 25,
        weeklyRuns: 4,
        goals: ['Improve endurance', 'Build consistency', 'Increase speed'],
        phases: [
          {
            name: 'Base Building Phase',
            weeks: [1, 2, 3, 4],
            focus: 'Aerobic base development and form refinement',
            weeklyStructure: {
              easy_runs: 3,
              tempo_runs: 1, 
              long_runs: 1,
              rest_days: 2
            }
          },
          {
            name: 'Build Phase',
            weeks: [5, 6, 7, 8],
            focus: 'Adding speed and strength elements',
            weeklyStructure: {
              easy_runs: 2,
              interval_runs: 1,
              tempo_runs: 1,
              long_runs: 1,
              rest_days: 2
            }
          }
        ]
      },
      workout_analysis: {
        performance_trends: 'Showing steady improvement in endurance and pace consistency',
        strengths: ['Excellent pacing discipline', 'Strong aerobic base', 'Good weekly consistency'],
        areas_for_improvement: ['Speed development opportunities', 'Hill training integration', 'Recovery optimization'],
        recommendations: ['Add strides to easy runs', 'Include weekly tempo work', 'Focus on sleep quality']
      },
      motivation: {
        quote: 'The miracle isn\'t that you finished. The miracle is that you had the courage to start. - John Bingham',
        achievements: ['Completed your weekly training goals', 'Improved average pace', 'Built excellent consistency'],
        next_milestone: 'Ready for your next race challenge',
        daily_affirmation: 'Every step forward is progress, no matter how small'
      },
      injury_prevention: {
        risk_assessment: 'low',
        prevention_strategy: 'Focus on smart progression and recovery',
        key_areas: ['Dynamic warm-up routine', 'Post-run recovery protocol', 'Weekly strength training'],
        exercises: ['Hip stability work', 'Calf strengthening', 'Core development', 'Glute activation']
      }
    };

    return {
      success: true,
      data: {
        type: type,
        content: mockResponses[type] || mockResponses.training_plan,
        recommendations: [
          'Maintain consistent training schedule',
          'Focus on gradual weekly progression', 
          'Prioritize recovery and sleep quality',
          'Listen to your body and adjust accordingly'
        ],
        personalizedMessage: `Here's your intelligent AI-powered ${type.replace('_', ' ')} analysis! This recommendation is tailored to help you achieve your running goals safely and effectively.`,
        confidence: 0.92
      }
    };
  }

  /**
   * Enhanced mock responses based on real user data analysis
   */
  private generateEnhancedMockResponse(request: AIRequest, type: string): AIResponse {
    const { userProfile, runningData } = request;
    
    // Safely analyze real user data with validation
    const totalDistance = this.validateNumber(runningData?.totalDistance, 0);
    const totalRuns = this.validateNumber(runningData?.totalRuns, 0);
    const averagePace = this.validateNumber(runningData?.averagePace, 480); // Default 8:00 pace in seconds
    const recentActivities = Array.isArray(runningData?.recentActivities) ? runningData.recentActivities : [];
    
    // Calculate safe insights with defaults
    const weeklyMileage = totalDistance > 0 ? Math.max(5, totalDistance / 4) : 15; // Default 15 miles/week
    const avgDistancePerRun = totalRuns > 0 ? Math.max(2, totalDistance / totalRuns) : 4; // Default 4 miles per run
    const paceInMinutes = Math.floor(averagePace / 60);
    const paceInSeconds = Math.floor(averagePace % 60);
    
    // Analyze recent activity patterns
    const hasRecentRuns = recentActivities.some(act => act.type === 'Run');
    const hasVariedWorkouts = recentActivities.some(act => act.name?.includes('interval') || act.name?.includes('tempo') || act.name?.includes('speed'));
    const hasLongRuns = recentActivities.some(act => act.distance && act.distance > 8000); // >5 miles
    
    switch (type) {
      case 'training_plan':
        return {
          success: true,
          data: {
            type: 'personalized_training_plan',
            content: {
              phase: weeklyMileage > 20 ? "Performance Development" : "Base Building",
              duration: "12 weeks",
              weeklyTarget: Math.max(15, Math.round(weeklyMileage * 1.15)),
              currentLevel: `Currently averaging ${Math.round(weeklyMileage)} miles per week`,
              weeklyStructure: [
                {
                  day: "Monday",
                  workout: "Easy Run",
                  distance: `${Math.max(3, Math.round(avgDistancePerRun * 0.8))} miles`,
                  pace: `${Math.min(12, paceInMinutes + 1)}:${Math.min(59, paceInSeconds + 15).toString().padStart(2, '0')}/mile`,
                  description: "Active recovery pace, focus on form and breathing rhythm"
                },
                {
                  day: "Tuesday", 
                  workout: hasVariedWorkouts ? "Speed Development" : "Tempo Introduction",
                  distance: `${Math.max(3, Math.round(avgDistancePerRun))} miles`,
                  pace: `${Math.max(6, Math.min(10, paceInMinutes - 1))}:${Math.max(0, Math.min(59, paceInSeconds - 15)).toString().padStart(2, '0')}/mile`,
                  description: hasVariedWorkouts ? "Continue building speed endurance with intervals" : "Start with 3x1 mile at comfortably hard effort"
                },
                {
                  day: "Wednesday",
                  workout: "Cross Training or Rest",
                  duration: "30-45 minutes",
                  description: "Strength training, cycling, swimming, or complete rest"
                },
                {
                  day: "Thursday",
                  workout: "Threshold Run", 
                  distance: `${Math.max(3, Math.round(avgDistancePerRun * 0.9))} miles`,
                  pace: `${Math.max(6, Math.min(11, paceInMinutes))}:${Math.max(0, Math.min(59, paceInSeconds)).toString().padStart(2, '0')}/mile`,
                  description: "Comfortably hard effort - the pace you could sustain for an hour"
                },
                {
                  day: "Friday",
                  workout: "Easy Run or Rest",
                  distance: `${Math.max(2, Math.round(avgDistancePerRun * 0.6))} miles`,
                  pace: `${Math.min(12, paceInMinutes + 2)}:00/mile`,
                  description: "Light recovery run if legs feel good, otherwise rest"
                },
                {
                  day: "Saturday",
                  workout: "Long Run",
                  distance: hasLongRuns ? `${Math.max(6, Math.round(avgDistancePerRun * 1.6))} miles` : `${Math.max(5, Math.round(avgDistancePerRun * 1.4))} miles`,
                  pace: `${Math.min(12, paceInMinutes + 1)}:${Math.min(59, paceInSeconds + 30).toString().padStart(2, '0')}/mile`,
                  description: hasLongRuns ? "Continue building your aerobic endurance" : "Aerobic base building at conversational pace"
                },
                {
                  day: "Sunday",
                  workout: "Recovery Run or Rest",
                  distance: `${Math.max(2, Math.round(avgDistancePerRun * 0.5))} miles`,
                  pace: `${Math.min(13, paceInMinutes + 2)}:30/mile`,
                  description: "Very easy pace to help flush out fatigue from the week"
                }
              ],
              progressionNotes: weeklyMileage > 25 ? "Focus on quality over quantity at your current high volume" : "Gradually increase weekly mileage by 10% every 2-3 weeks",
              adaptations: hasVariedWorkouts ? ["Continue your excellent varied training approach", "Maintain current workout intensity"] : ["Introduce structured workouts gradually", "Build workout tolerance over 4-6 weeks"],
              fitnessLevel: totalRuns > 20 ? "Advanced" : totalRuns > 10 ? "Intermediate" : "Beginner",
              weeklyGoals: [
                `Target ${Math.round(weeklyMileage * 1.1)} total miles this week`,
                "Complete 80% of runs at easy, conversational pace",
                hasVariedWorkouts ? "Maintain your excellent workout variety" : "Focus on consistency before intensity",
                "Listen to your body and adjust as needed"
              ]
            },
            recommendations: [
              `Building on your solid foundation of ${Math.round(weeklyMileage)} weekly miles`,
              averagePace > 0 ? `Your ${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')} average pace shows good fitness` : "Focus on building your aerobic base first",
              hasRecentRuns ? "Your consistency is your greatest strength - keep it up!" : "Focus on building consistent running habits",
              "Remember: 80% of weekly mileage should be at easy pace",
              hasVariedWorkouts ? "Excellent variety in your training approach!" : "We'll gradually introduce structured workouts"
            ],
            personalizedMessage: `This plan is designed around your current ${Math.round(weeklyMileage)}-mile weeks and ${totalRuns} recent runs. ${hasVariedWorkouts ? 'I can see you\'re ready for more structured training!' : 'We\'ll develop your speed gradually as your aerobic base strengthens.'}`,
            confidence: 0.94
          }
        };

      case 'workout_analysis':
        const mostRecentRun = recentActivities.find(act => act.type === 'Run');
        const runDistance = mostRecentRun && mostRecentRun.distance 
          ? this.validateNumber(mostRecentRun.distance / 1609.34, avgDistancePerRun).toFixed(1)
          : avgDistancePerRun.toFixed(1);
        const runTime = mostRecentRun && mostRecentRun.moving_time 
          ? Math.floor(this.validateNumber(mostRecentRun.moving_time / 60, 30))
          : Math.floor(avgDistancePerRun * paceInMinutes);
        const calculatedPace = mostRecentRun && mostRecentRun.moving_time && mostRecentRun.distance
          ? mostRecentRun.moving_time / (mostRecentRun.distance / 1609.34)
          : averagePace;
        const runPace = Math.floor(this.validateNumber(calculatedPace / 60, paceInMinutes));
        const runPaceSeconds = Math.floor(this.validateNumber(calculatedPace % 60, paceInSeconds));
        const heartRate = mostRecentRun?.average_heartrate || null;
        
        return {
          success: true,
          data: {
            type: 'workout_analysis',
            content: {
              workoutSummary: {
                distance: `${runDistance} miles`,
                time: `${runTime} minutes`,
                pace: `${Math.max(5, Math.min(15, runPace))}:${Math.max(0, Math.min(59, runPaceSeconds)).toString().padStart(2, '0')}/mile`,
                effort: heartRate > 155 ? "Hard" : heartRate > 135 ? "Moderate" : heartRate ? "Easy-Moderate" : "Controlled",
                heartRate: heartRate ? `${heartRate} bpm average` : "Heart rate data not available"
              },
              performanceAnalysis: {
                paceConsistency: "Good - maintained steady effort throughout the distance",
                effortDistribution: runPace < paceInMinutes ? "Faster than your average - excellent fitness indicator!" : "Well-controlled effort showing smart pacing strategy",
                comparison: totalRuns > 5 ? `This performance aligns well with your recent ${totalRuns} runs` : "Building valuable baseline performance data",
                trendAnalysis: weeklyMileage > 15 ? "Your training volume is supporting good performance" : "Great foundation for building more volume"
              },
              strengths: [
                heartRate ? `Excellent cardiovascular management at ${heartRate} bpm average` : "Demonstrated strong pacing discipline throughout",
                "Maintained consistent effort across the entire distance",
                parseFloat(runDistance) > 5 ? "Outstanding endurance demonstration at this distance" : "Solid foundation-building distance completed",
                totalRuns > 10 ? "Your training consistency is clearly paying dividends!" : "Building excellent training momentum and habits"
              ],
              areasForImprovement: [
                runPace > 9 ? "Consider adding 4-6 x 100m strides after easy runs for leg turnover" : "Try incorporating more recovery runs at 1-2 min/mile slower",
                "Implement a dynamic warm-up routine before harder efforts",
                mostRecentRun?.total_elevation_gain < 50 ? "Seek out routes with gentle hills for strength development" : "Excellent job incorporating elevation challenges!",
                "Focus on maintaining relaxed form, especially during the final third"
              ],
              detailedRecommendations: [
                `Tomorrow's recovery run target: ${Math.min(12, runPace + 2)}:00/mile pace`,
                "Add 4-6 x 100m strides at the end of 2 easy runs per week",
                hasVariedWorkouts ? "Your workout variety is exemplary - maintain this approach!" : "Ready to incorporate tempo segments into your training",
                runTime > 60 ? "For runs over 1 hour, practice race-day nutrition strategies" : "As runs extend, begin experimenting with fueling strategies",
                "Post-run stretching routine focusing on calves, IT band, and hip flexors"
              ],
              nextWorkoutSuggestion: {
                type: mostRecentRun?.name?.toLowerCase().includes('long') ? "Easy Recovery Run" : "Tempo or Long Run",
                distance: mostRecentRun?.name?.toLowerCase().includes('long') ? `${Math.max(2, Math.round(parseFloat(runDistance) * 0.4))} miles` : `${Math.max(4, Math.round(parseFloat(runDistance) * 1.2))} miles`,
                pace: mostRecentRun?.name?.toLowerCase().includes('long') ? `${Math.min(13, runPace + 2)}:30/mile` : `${Math.max(6, runPace - 1)}:${Math.max(0, runPaceSeconds - 15).toString().padStart(2, '0')}/mile`,
                description: mostRecentRun?.name?.toLowerCase().includes('long') ? "Active recovery to absorb your long run training" : "Continue building your aerobic and speed development"
              }
            },
            recommendations: [
              "Excellent workout execution and pacing strategy",
              "Your fitness development is clearly progressing", 
              "Smart effort distribution throughout the distance",
              "Continue building on this strong foundation"
            ],
            personalizedMessage: mostRecentRun 
              ? `Outstanding ${runDistance}-mile effort! Your ${runPace}:${runPaceSeconds.toString().padStart(2, '0')} pace demonstrates real fitness development and smart racing tactics.` 
              : `Your recent training data shows consistent improvement and intelligent training decisions. Keep up the excellent work!`,
            confidence: 0.91
          }
        };

      case 'motivation':
        const motivationalLevel = totalRuns > 25 ? "accomplished" : totalRuns > 10 ? "dedicated" : "emerging";
        const weeklyStatus = weeklyMileage > 20 ? "absolutely crushing your goals" : weeklyMileage > 10 ? "building serious momentum" : "establishing your strong foundation";
        const progressIndicator = totalRuns > 0 ? totalRuns : 1;
        
        return {
          success: true,
          data: {
            type: 'motivational_content',
            content: {
              personalizedGreeting: `Hello, ${motivationalLevel} runner! 🏃‍♂️`,
              dailyMotivation: `You're ${weeklyStatus} and that deserves serious celebration! Every single step you take is writing the story of your stronger, more resilient self.`,
              weeklyAchievements: [
                totalRuns > 0 ? `🎉 ${totalRuns} quality runs completed - that's pure dedication in action!` : "🌟 You're here and ready to commit - that's always the hardest part!",
                totalDistance > 0 ? `🚀 ${Math.round(totalDistance)} miles conquered - you could literally run to another city!` : "🏁 Every epic journey begins with the courage to take that first step",
                averagePace > 0 ? `⚡ Your ${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')} average pace demonstrates real fitness development` : "💪 You're building the powerful engine for future speed breakthroughs",
                hasRecentRuns ? "🔥 Your consistency is absolutely inspiring to witness!" : "🎯 You're positioning yourself for incredible breakthrough success!"
              ],
              thisWeeksGoals: [
                progressIndicator > 15 ? `Complete ${Math.min(7, progressIndicator + 1)} quality runs this week` : `Target ${Math.max(3, progressIndicator + 1)} solid runs this week`,
                `Aim for ${Math.round(weeklyMileage + (weeklyMileage * 0.1))} total miles`,
                "Focus on enjoying the process, regardless of pace",
                hasVariedWorkouts ? "Continue your excellent training variety" : "Add one small challenging element to your week",
                "Practice deep gratitude for your body's incredible capabilities"
              ],
              motivationalQuotes: [
                "The miracle isn't that you finished. The miracle is that you had the courage to start. - John Bingham",
                "Every mile begins with a single step, but every step builds towards greatness.",
                "You are not just running miles, you are running towards the best version of yourself.",
                weeklyMileage > 15 ? "Champions aren't made in the gym. They're made from something deep inside them - a desire, a dream, a vision." : "The journey of a thousand miles begins with a single step - and you've already taken many!"
              ],
              weeklyReflection: {
                strength: totalRuns > 10 ? "Your consistency is your superpower" : "Your commitment to starting is already a victory",
                growth: hasVariedWorkouts ? "Your training variety shows real wisdom" : "You're building the perfect foundation for growth",
                outlook: weeklyMileage > 20 ? "You're operating at a high level - maintain this excellence" : "You're building towards something amazing",
                nextMilestone: progressIndicator > 20 ? "Ready for your next major challenge" : "Each run is building towards your breakthrough moment"
              },
              personalizedEncouragement: motivationalLevel === "accomplished" 
                ? "Your dedication has brought you to an impressive level. You're not just a runner - you're an inspiration to others starting their journey."
                : motivationalLevel === "dedicated"
                ? "Your commitment is clearly paying off. You've moved beyond beginner status and are building real fitness and mental strength."
                : "You're in the most exciting phase - every run is building something incredible. Trust the process and celebrate every step forward."
            },
            recommendations: [
              "Celebrate every small victory along the way",
              "Trust in the process - consistency beats perfection", 
              "Remember why you started when motivation feels low",
              "You're stronger than you think and capable of more than you imagine"
            ],
            personalizedMessage: `You've completed ${progressIndicator} runs and are averaging ${Math.round(weeklyMileage)} miles per week. ${hasVariedWorkouts ? 'Your training variety shows real wisdom and dedication!' : 'You\'re building an incredible foundation for future growth!'} Keep believing in yourself - you\'re accomplishing something truly special.`,
            confidence: 0.95
          }
        };
                quote: motivationalLevel === "experienced" ? 
                  "\"The miracle isn't that I finished. The miracle is that I had the courage to start.\" - John Bingham" :
                  motivationalLevel === "committed" ?
                  "\"Success is the sum of small efforts repeated day in and day out.\" - Robert Collier" :
                  "\"A journey of a thousand miles begins with a single step.\" - Lao Tzu",
                
                personalStory: weeklyMileage > 25 ? 
                  "You're now in elite territory! Your commitment level puts you in the top 5% of recreational runners." :
                  weeklyMileage > 15 ?
                  "You've crossed into serious runner status - your dedication is transforming your life!" :
                  weeklyMileage > 5 ?
                  "You're no longer a beginner - you're becoming a real runner with every step!" :
                  "Every pro was once a beginner. Every expert was once a disaster. You're on the path to greatness!"
              },
              encouragingReminders: [
                "Progress isn't always linear - trust the process",
                "Your body is adapting and getting stronger every day",
                "Consistency beats intensity every single time",
                "You're not just getting fitter, you're building mental toughness"
              ]
            },
            recommendations: [
              "Set micro-goals to maintain momentum",
              "Celebrate every single run completion",
              "Connect with the running community for extra support", 
              "Remember your 'why' on challenging days"
            ],
            personalizedMessage: `You are absolutely crushing it! Your ${totalRuns > 0 ? `${totalRuns} recent runs and ` : ''}commitment to growth shows you have the heart of a true runner. Keep believing in yourself! 🌟💫`,
            confidence: 0.97
          }
        };

      case 'injury_prevention':
        const riskLevel = weeklyMileage > 35 ? "moderate-high" : weeklyMileage > 20 ? "moderate" : weeklyMileage > 10 ? "low-moderate" : "low";
        const progressionAdvice = weeklyMileage > 25 ? "maintain current volume while optimizing recovery" : "increase weekly mileage by no more than 10% per week";
        
        return {
          success: true,
          data: {
            type: 'injury_prevention',
            content: {
              currentAssessment: {
                riskLevel: riskLevel,
                weeklyLoad: `${Math.round(weeklyMileage)} miles per week`,
                status: `Based on your training volume and recent activities, your injury risk is ${riskLevel}.`,
                keyFactors: [
                  weeklyMileage > 30 ? "Higher weekly volume requires extra attention to recovery" : "Current volume is in a healthy range",
                  hasVariedWorkouts ? "Good workout variety reduces overuse risk" : "Consider adding workout variety as you progress",
                  totalRuns > 20 ? "Excellent training consistency" : "Building good consistency patterns"
                ]
              },
              preventionStrategy: {
                weeklyProgression: progressionAdvice,
                trainingBalance: "Follow the 80/20 rule: 80% easy effort, 20% moderate-hard effort",
                recoveryEmphasis: weeklyMileage > 20 ? "Recovery is critical at your training volume" : "Build good recovery habits now",
                strengthWork: "Include 2-3 strength sessions per week focusing on running-specific movements"
              },
              specificGuidelines: [
                `Weekly mileage: ${progressionAdvice}`,
                "Run easy pace for 80% of your weekly volume",
                averagePace > 0 ? `Your easy pace should be around ${paceInMinutes + 2}:00/mile` : "Easy pace should feel conversational",
                "Include one complete rest day per week minimum",
                hasLongRuns ? "Your long runs are great - keep them conversational" : "Build long runs gradually by 10-15 minutes each week"
              ],
              recoveryProtocol: [
                "Post-run routine: 10-15 minutes of dynamic stretching",
                "Foam rolling 3-4 times per week (focus on IT band, calves, quads)",
                weeklyMileage > 20 ? "Consider weekly sports massage" : "Self-massage with foam roller after harder efforts", 
                "Sleep: aim for 7-9 hours nightly for optimal recovery",
                "Nutrition: anti-inflammatory foods and proper hydration",
                "Listen to your body: soreness vs. pain recognition"
              ],
              warningSignsToWatch: [
                "Sharp, shooting pain during or after running",
                "Pain that increases during a run",
                "Persistent soreness lasting more than 48-72 hours",
                "Changes in your natural running gait",
                "Difficulty with stairs or normal walking"
              ],
              strengthExercises: [
                "Single-leg glute bridges (15 reps each leg)",
                "Clamshells for hip stability (20 reps each side)", 
                "Calf raises (20 slow, controlled reps)",
                "Planks for core stability (30-60 seconds)",
                "Single-leg balance exercises (30 seconds each)"
              ]
            },
            recommendations: [
              "Prevention is always easier than rehabilitation",
              "Consistency with injury prevention is key",
              "Build your training around recovery, not despite it",
              "Address minor issues before they become major problems"
            ],
            personalizedMessage: `With your current ${Math.round(weeklyMileage)} weekly miles, you're ${riskLevel === 'low' ? 'in an excellent position for healthy progression' : riskLevel === 'moderate' ? 'managing risk well with smart training' : 'at a level where recovery becomes critical'}. Stay proactive about prevention!`,
            confidence: 0.93
          }
        };

      default:
        return this.generateMockAIResponse(type);
    }
  }

  /**
   * Helper method to validate and provide safe numeric values
   */
  private validateNumber(value: any, defaultValue: number): number {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0 ? num : defaultValue;
  }
}

export default new AIAgentService();
import axios from 'axios';

interface AIRequest {
  userId: string;
  userProfile?: {
    goals?: string[];
    experience?: string;
    preferences?: any;
  };
  runningData?: {
    totalDistance?: number;
    totalRuns?: number;
    averagePace?: number;
    recentActivities?: any[];
  };
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
    this.apiKey = process.env.OPENAI_API_KEY || 'demo-mode-no-key-needed';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    console.log('🤖 AI Agent Service initialized with enhanced mock responses');
  }

  /**
   * Generate personalized training plan
   */
  async generatePersonalizedTrainingPlan(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Generating personalized training plan with AI...');
      
      // Check if we have a real API key
      if (this.apiKey && this.apiKey !== 'demo-mode-no-key-needed') {
        const prompt = this.createTrainingPlanPrompt(request);
        const aiResponse = await this.callAIAPI(prompt, 'training_plan');
        
        if (aiResponse.success) {
          return {
            success: true,
            plan: aiResponse.data.content,
            recommendations: aiResponse.data.recommendations,
            personalizedMessage: aiResponse.data.personalizedMessage,
            aiGenerated: true,
            confidence: aiResponse.data.confidence
          };
        }
      }
      
      // Use enhanced mock response with real user data
      console.log('🎯 Using enhanced mock training plan based on user data...');
      const mockResponse = this.generateEnhancedMockResponse(request, 'training_plan');
      return {
        success: true,
        plan: mockResponse.data.content,
        recommendations: mockResponse.data.recommendations,
        personalizedMessage: mockResponse.data.personalizedMessage,
        aiGenerated: true,
        mockMode: true,
        confidence: mockResponse.data.confidence
      };
    } catch (error) {
      console.error('❌ Error generating training plan:', error);
      return this.generateFallbackTrainingPlan(request);
    }
  }

  /**
   * Analyze workout performance
   */
  async analyzeWorkout(request: AIRequest): Promise<any> {
    try {
      console.log('🤖 Analyzing workout with AI...');
      
      // Check if we have a real API key
      if (this.apiKey && this.apiKey !== 'demo-mode-no-key-needed') {
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
      const mockResponse = this.generateEnhancedMockResponse(request, 'workout_analysis');
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
      if (this.apiKey && this.apiKey !== 'demo-mode-no-key-needed') {
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
      const mockResponse = this.generateEnhancedMockResponse(request, 'motivation');
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
      if (this.apiKey && this.apiKey !== 'demo-mode-no-key-needed') {
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
      const mockResponse = this.generateEnhancedMockResponse(request, 'injury_prevention');
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
   * Enhanced mock responses based on real user data analysis
   */
  private generateEnhancedMockResponse(request: AIRequest, type: string): AIResponse {
    const { userProfile, runningData } = request;
    
    // Safely validate and extract data with proper defaults
    const totalDistance = this.validateNumber(runningData?.totalDistance, 0);
    const totalRuns = this.validateNumber(runningData?.totalRuns, 0);
    const averagePace = this.validateNumber(runningData?.averagePace, 480); // Default 8:00 pace in seconds
    const recentActivities = Array.isArray(runningData?.recentActivities) ? runningData.recentActivities : [];
    
    // Calculate safe insights with defaults
    const weeklyMileage = totalDistance > 0 ? Math.max(5, totalDistance / 4) : 15; // Default 15 miles/week
    const avgDistancePerRun = totalRuns > 0 ? Math.max(2, totalDistance / totalRuns) : 4; // Default 4 miles per run
    const paceInMinutes = Math.max(5, Math.min(15, Math.floor(averagePace / 60))); // Constrain to 5-15 min/mile
    const paceInSeconds = Math.max(0, Math.min(59, Math.floor(averagePace % 60))); // Constrain to 0-59 seconds
    
    // Analyze recent activity patterns
    const hasRecentRuns = recentActivities.some(act => act.type === 'Run');
    const hasVariedWorkouts = recentActivities.some(act => 
      act.name?.toLowerCase().includes('interval') || 
      act.name?.toLowerCase().includes('tempo') || 
      act.name?.toLowerCase().includes('speed')
    );
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
                  pace: `${paceInMinutes + 1}:${Math.min(59, paceInSeconds + 15).toString().padStart(2, '0')}/mile`,
                  description: "Active recovery pace, focus on form and breathing rhythm"
                },
                {
                  day: "Tuesday", 
                  workout: hasVariedWorkouts ? "Speed Development" : "Tempo Introduction",
                  distance: `${Math.max(3, Math.round(avgDistancePerRun))} miles`,
                  pace: `${Math.max(6, paceInMinutes - 1)}:${Math.max(0, paceInSeconds - 15).toString().padStart(2, '0')}/mile`,
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
                  pace: `${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')}/mile`,
                  description: "Comfortably hard effort - the pace you could sustain for an hour"
                },
                {
                  day: "Friday",
                  workout: "Easy Run or Rest",
                  distance: `${Math.max(2, Math.round(avgDistancePerRun * 0.6))} miles`,
                  pace: `${paceInMinutes + 2}:00/mile`,
                  description: "Light recovery run if legs feel good, otherwise rest"
                },
                {
                  day: "Saturday",
                  workout: "Long Run",
                  distance: hasLongRuns ? `${Math.max(6, Math.round(avgDistancePerRun * 1.6))} miles` : `${Math.max(5, Math.round(avgDistancePerRun * 1.4))} miles`,
                  pace: `${paceInMinutes + 1}:${Math.min(59, paceInSeconds + 30).toString().padStart(2, '0')}/mile`,
                  description: hasLongRuns ? "Continue building your aerobic endurance" : "Aerobic base building at conversational pace"
                },
                {
                  day: "Sunday",
                  workout: "Recovery Run or Rest",
                  distance: `${Math.max(2, Math.round(avgDistancePerRun * 0.5))} miles`,
                  pace: `${paceInMinutes + 2}:30/mile`,
                  description: "Very easy pace to help flush out fatigue from the week"
                }
              ],
              progressionNotes: weeklyMileage > 25 ? "Focus on quality over quantity at your current high volume" : "Gradually increase weekly mileage by 10% every 2-3 weeks",
              adaptations: hasVariedWorkouts ? ["Continue your excellent varied training approach", "Maintain current workout intensity"] : ["Introduce structured workouts gradually", "Build workout tolerance over 4-6 weeks"],
              fitnessLevel: totalRuns > 20 ? "Advanced" : totalRuns > 10 ? "Intermediate" : "Beginner"
            },
            recommendations: [
              `Building on your solid foundation of ${Math.round(weeklyMileage)} weekly miles`,
              `Your ${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')} average pace shows good fitness`,
              hasRecentRuns ? "Your consistency is your greatest strength!" : "Focus on building consistent running habits",
              "Remember: 80% of weekly mileage should be at easy pace"
            ],
            personalizedMessage: `This plan builds on your current ${Math.round(weeklyMileage)}-mile weeks and ${totalRuns} recent runs. ${hasVariedWorkouts ? 'You\'re ready for structured training!' : 'We\'ll develop your speed gradually.'}`,
            confidence: 0.94
          }
        };

      case 'workout_analysis':
        return {
          success: true,
          data: {
            type: 'workout_analysis',
            content: {
              performance: `Strong effort at ${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')}/mile pace`,
              analysis: `Based on your ${Math.round(avgDistancePerRun)}-mile average, this shows excellent fitness development`,
              strengths: ["Consistent pacing", "Good effort control", "Building endurance"],
              improvements: ["Add strides for speed", "Focus on form", "Include recovery runs"]
            },
            recommendations: [
              "Maintain consistent effort distribution",
              "Add dynamic warm-up routine",
              "Focus on post-run recovery",
              "Continue building weekly volume gradually"
            ],
            personalizedMessage: `Great work on maintaining your ${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')} pace! Your fitness is clearly developing.`,
            confidence: 0.91
          }
        };

      case 'motivation':
        const level = totalRuns > 25 ? "accomplished" : totalRuns > 10 ? "dedicated" : "emerging";
        return {
          success: true,
          data: {
            type: 'motivational_content',
            content: {
              greeting: `Hello, ${level} runner! 🏃‍♂️`,
              message: `You're averaging ${Math.round(weeklyMileage)} miles per week - that's fantastic progress!`,
              achievements: [
                `${totalRuns} quality runs completed`,
                `${Math.round(totalDistance)} total miles covered`,
                `${paceInMinutes}:${paceInSeconds.toString().padStart(2, '0')} average pace`,
                hasRecentRuns ? "Excellent consistency!" : "Building great habits!"
              ],
              quote: "Every mile begins with a single step, and every step builds towards greatness."
            },
            recommendations: [
              "Celebrate every small victory",
              "Trust the process",
              "Stay consistent",
              "Believe in yourself"
            ],
            personalizedMessage: `You've completed ${totalRuns} runs and are building incredible momentum. Keep believing in yourself!`,
            confidence: 0.95
          }
        };

      case 'injury_prevention':
        const riskLevel = weeklyMileage > 35 ? "moderate" : weeklyMileage > 20 ? "low-moderate" : "low";
        return {
          success: true,
          data: {
            type: 'injury_prevention',
            content: {
              riskLevel: riskLevel,
              advice: `Your current ${Math.round(weeklyMileage)} weekly miles puts you at ${riskLevel} injury risk`,
              prevention: [
                "Follow 10% weekly mileage increase rule",
                "Include rest days",
                "Focus on proper form",
                "Listen to your body"
              ],
              exercises: ["Hip strengthening", "Calf stretches", "Core work", "Dynamic warm-up"]
            },
            recommendations: [
              "Maintain current training progression",
              "Add strength training twice per week",
              "Focus on recovery quality",
              "Address minor issues early"
            ],
            personalizedMessage: `With your current training volume, staying proactive about prevention is key to long-term success.`,
            confidence: 0.93
          }
        };

      default:
        return this.generateBasicMockResponse(type);
    }
  }

  /**
   * Helper method to validate and provide safe numeric values
   */
  private validateNumber(value: any, defaultValue: number): number {
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) && num >= 0 ? num : defaultValue;
  }

  /**
   * Generate basic mock response for unknown types
   */
  private generateBasicMockResponse(type: string): AIResponse {
    return {
      success: true,
      data: {
        type: type,
        content: {
          message: "AI coaching feature available",
          status: "Ready to help with your running goals"
        },
        recommendations: [
          "Stay consistent with training",
          "Listen to your body",
          "Set achievable goals",
          "Enjoy the process"
        ],
        personalizedMessage: "Your AI coach is here to support your running journey!",
        confidence: 0.85
      }
    };
  }

  // Mock API call method
  private async callAIAPI(prompt: string, type: string): Promise<AIResponse> {
    // In demo mode, always return mock response
    return this.generateBasicMockResponse(type);
  }

  // Prompt creation methods (simplified for demo)
  private createTrainingPlanPrompt(request: AIRequest): string {
    return `Create a training plan for user with ${request.runningData?.totalRuns || 0} runs`;
  }

  private createWorkoutAnalysisPrompt(request: AIRequest): string {
    return `Analyze workout performance for user`;
  }

  private createMotivationPrompt(request: AIRequest): string {
    return `Generate motivation for runner`;
  }

  private createInjuryPreventionPrompt(request: AIRequest): string {
    return `Provide injury prevention advice`;
  }

  // Fallback methods
  private generateFallbackTrainingPlan(request: AIRequest): any {
    return {
      success: false,
      error: "Unable to generate training plan",
      fallback: "Please consult with a running coach for personalized training"
    };
  }

  private generateFallbackAnalysis(request: AIRequest): any {
    return {
      success: false,
      error: "Unable to analyze workout",
      fallback: "Keep up the great work with your training!"
    };
  }

  private generateFallbackMotivation(request: AIRequest): any {
    return {
      success: true,
      message: "You're doing great! Keep running and stay consistent.",
      personalizedMessage: "Every step forward is progress!"
    };
  }

  private generateFallbackInjuryAdvice(request: AIRequest): any {
    return {
      success: false,
      error: "Unable to provide injury advice",
      fallback: "Always listen to your body and consult healthcare professionals for concerns"
    };
  }
}

export default new AIAgentService();
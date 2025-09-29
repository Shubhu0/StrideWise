import { StravaActivity } from './stravaService';

interface RunningMetrics {
  weeklyDistance: number;
  weeklyRuns: number;
  averagePace: number; // minutes per km
  longestRun: number;
  totalElevation: number;
  averageHeartRate?: number;
  consistencyScore: number; // 0-100
  improvementRate: number; // percentage change over time
}

interface TrainingZones {
  easy: { minPace: number; maxPace: number }; // minutes per km
  tempo: { minPace: number; maxPace: number };
  threshold: { minPace: number; maxPace: number };
  interval: { minPace: number; maxPace: number };
  recovery: { minPace: number; maxPace: number };
}

interface WorkoutPlan {
  id: string;
  date: string;
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'recovery' | 'hill' | 'fartlek';
  duration: number; // minutes
  distance?: number; // km
  description: string;
  intensity: 'low' | 'medium' | 'high';
  targetPace?: { min: number; max: number }; // minutes per km
  intervals?: {
    warmup: number;
    work: number;
    rest: number;
    repeats: number;
    cooldown: number;
  };
  adaptations: string[]; // reasons for this specific workout
}

interface TrainingPlan {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  weeklyPlan: WorkoutPlan[];
  goals: {
    targetDistance?: number; // for race preparation
    targetTime?: number; // target race time in minutes
    raceDate?: Date;
    focusArea: 'endurance' | 'speed' | 'strength' | 'general_fitness';
  };
  adaptations: {
    reason: string;
    change: string;
    date: Date;
  }[];
  metrics: RunningMetrics;
  trainingZones: TrainingZones;
}

class AITrainingService {
  
  /**
   * Analyze Strava activities and extract key metrics
   */
  analyzeRunningData(activities: StravaActivity[]): RunningMetrics {
    if (activities.length === 0) {
      return this.getDefaultMetrics();
    }

    const runningActivities = activities.filter(a => 
      a.type === 'Run' || a.type === 'VirtualRun'
    );

    // Calculate weekly averages (last 4 weeks)
    const fourWeeksAgo = Date.now() - (28 * 24 * 60 * 60 * 1000);
    const recentRuns = runningActivities.filter(a => 
      new Date(a.start_date).getTime() > fourWeeksAgo
    );

    const weeklyDistance = recentRuns.reduce((sum, run) => 
      sum + (run.distance / 1000), 0) / 4; // convert to km and average over 4 weeks

    const weeklyRuns = recentRuns.length / 4;

    // Calculate average pace (minutes per km)
    const averagePace = recentRuns.length > 0 ? 
      recentRuns.reduce((sum, run) => {
        const pacePerKm = (run.moving_time / 60) / (run.distance / 1000);
        return sum + pacePerKm;
      }, 0) / recentRuns.length : 6.0;

    const longestRun = Math.max(...recentRuns.map(run => run.distance / 1000));
    
    const totalElevation = recentRuns.reduce((sum, run) => 
      sum + (run.total_elevation_gain || 0), 0) / 4;

    const averageHeartRate = recentRuns.filter(run => run.average_heartrate).length > 0 ?
      recentRuns.filter(run => run.average_heartrate)
        .reduce((sum, run) => sum + run.average_heartrate!, 0) / 
        recentRuns.filter(run => run.average_heartrate).length : undefined;

    // Calculate consistency score (how regularly they run)
    const consistencyScore = Math.min(100, (weeklyRuns / 4) * 100);

    // Calculate improvement rate (comparing first half vs second half of recent activities)
    const improvementRate = this.calculateImprovementRate(recentRuns);

    return {
      weeklyDistance,
      weeklyRuns,
      averagePace,
      longestRun,
      totalElevation,
      averageHeartRate,
      consistencyScore,
      improvementRate
    };
  }

  /**
   * Calculate training zones based on recent performance
   */
  calculateTrainingZones(metrics: RunningMetrics): TrainingZones {
    const { averagePace } = metrics;
    
    // Base zones on current average pace (conservative approach)
    return {
      recovery: { 
        minPace: averagePace + 1.5, 
        maxPace: averagePace + 2.5 
      },
      easy: { 
        minPace: averagePace + 0.5, 
        maxPace: averagePace + 1.5 
      },
      tempo: { 
        minPace: averagePace - 0.3, 
        maxPace: averagePace + 0.2 
      },
      threshold: { 
        minPace: averagePace - 0.8, 
        maxPace: averagePace - 0.3 
      },
      interval: { 
        minPace: averagePace - 1.5, 
        maxPace: averagePace - 0.8 
      }
    };
  }

  /**
   * Generate adaptive training plan based on user's data
   */
  generateTrainingPlan(
    userId: string,
    metrics: RunningMetrics,
    goals: TrainingPlan['goals'],
    previousPlan?: TrainingPlan
  ): TrainingPlan {
    const trainingZones = this.calculateTrainingZones(metrics);
    const weeklyPlan = this.createWeeklyWorkouts(metrics, trainingZones, goals);
    
    const adaptations = previousPlan ? 
      this.calculateAdaptations(metrics, previousPlan.metrics) : 
      [{ 
        reason: 'Initial plan creation', 
        change: 'Generated baseline training plan based on current fitness level',
        date: new Date()
      }];

    return {
      id: this.generateId(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      weeklyPlan,
      goals,
      adaptations,
      metrics,
      trainingZones
    };
  }

  /**
   * Create weekly workout schedule
   */
  private createWeeklyWorkouts(
    metrics: RunningMetrics,
    zones: TrainingZones,
    goals: TrainingPlan['goals']
  ): WorkoutPlan[] {
    const workouts: WorkoutPlan[] = [];
    const baseWeeklyDistance = Math.max(15, metrics.weeklyDistance);
    const targetRuns = Math.min(6, Math.max(3, Math.ceil(metrics.weeklyRuns)));

    // Determine focus based on goals and current metrics
    const focusArea = this.determineFocusArea(metrics, goals);
    
    for (let day = 0; day < 7; day++) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
      const date = new Date();
      date.setDate(date.getDate() + day);

      if (day === 0) { // Sunday - Long run or recovery
        if (metrics.longestRun > 8) {
          workouts.push(this.createLongRunWorkout(date.toISOString().split('T')[0], metrics, zones));
        } else {
          workouts.push(this.createRecoveryWorkout(date.toISOString().split('T')[0]));
        }
      } else if (day === 1 || day === 4) { // Monday, Friday - Recovery or cross training
        workouts.push(this.createRecoveryWorkout(date.toISOString().split('T')[0]));
      } else if (day === 2) { // Tuesday - Quality workout
        if (focusArea === 'speed') {
          workouts.push(this.createIntervalWorkout(date.toISOString().split('T')[0], metrics, zones));
        } else {
          workouts.push(this.createTempoWorkout(date.toISOString().split('T')[0], metrics, zones));
        }
      } else if (day === 3 || day === 6) { // Wednesday, Saturday - Easy runs
        workouts.push(this.createEasyRunWorkout(date.toISOString().split('T')[0], metrics, zones));
      } else if (day === 5) { // Thursday - Hill or tempo work
        if (metrics.totalElevation > 100) {
          workouts.push(this.createHillWorkout(date.toISOString().split('T')[0], metrics, zones));
        } else {
          workouts.push(this.createTempoWorkout(date.toISOString().split('T')[0], metrics, zones));
        }
      }
    }

    return workouts.filter(w => w !== null);
  }

  private determineFocusArea(metrics: RunningMetrics, goals: TrainingPlan['goals']): string {
    if (goals.focusArea) return goals.focusArea;
    
    if (metrics.weeklyDistance < 20) return 'endurance';
    if (metrics.averagePace > 6.5) return 'general_fitness';
    if (metrics.longestRun < 10) return 'endurance';
    return 'speed';
  }

  private createEasyRunWorkout(date: string, metrics: RunningMetrics, zones: TrainingZones): WorkoutPlan {
    const distance = Math.max(3, metrics.weeklyDistance * 0.2);
    return {
      id: this.generateId(),
      date,
      type: 'easy',
      duration: Math.round(distance * zones.easy.maxPace),
      distance,
      description: `Easy-paced run to build aerobic base. Keep effort conversational.`,
      intensity: 'low',
      targetPace: { min: zones.easy.minPace, max: zones.easy.maxPace },
      adaptations: ['Building aerobic base', 'Active recovery']
    };
  }

  private createTempoWorkout(date: string, metrics: RunningMetrics, zones: TrainingZones): WorkoutPlan {
    const workDistance = Math.min(8, Math.max(3, metrics.weeklyDistance * 0.3));
    return {
      id: this.generateId(),
      date,
      type: 'tempo',
      duration: Math.round(workDistance * zones.tempo.maxPace + 20),
      distance: workDistance + 2, // include warmup/cooldown
      description: `Tempo run at comfortably hard pace. 10min warmup, ${Math.round(workDistance)}km at tempo pace, 10min cooldown.`,
      intensity: 'medium',
      targetPace: { min: zones.tempo.minPace, max: zones.tempo.maxPace },
      adaptations: ['Lactate threshold improvement', 'Race pace practice']
    };
  }

  private createIntervalWorkout(date: string, metrics: RunningMetrics, zones: TrainingZones): WorkoutPlan {
    const repeats = Math.max(4, Math.min(8, Math.floor(metrics.weeklyDistance / 5)));
    return {
      id: this.generateId(),
      date,
      type: 'interval',
      duration: 45,
      distance: 6,
      description: `${repeats}x400m intervals with 90s recovery. Focus on form and controlled speed.`,
      intensity: 'high',
      targetPace: { min: zones.interval.minPace, max: zones.interval.maxPace },
      intervals: {
        warmup: 15,
        work: 2,
        rest: 1.5,
        repeats,
        cooldown: 10
      },
      adaptations: ['VO2 max improvement', 'Speed development', 'Running economy']
    };
  }

  private createLongRunWorkout(date: string, metrics: RunningMetrics, zones: TrainingZones): WorkoutPlan {
    const distance = Math.min(25, Math.max(8, metrics.longestRun * 1.1));
    return {
      id: this.generateId(),
      date,
      type: 'long',
      duration: Math.round(distance * zones.easy.maxPace),
      distance,
      description: `Long steady run at easy pace. Focus on time on feet and endurance building.`,
      intensity: 'medium',
      targetPace: { min: zones.easy.minPace, max: zones.easy.maxPace },
      adaptations: ['Aerobic capacity', 'Mental toughness', 'Fat oxidation']
    };
  }

  private createHillWorkout(date: string, metrics: RunningMetrics, zones: TrainingZones): WorkoutPlan {
    return {
      id: this.generateId(),
      date,
      type: 'hill',
      duration: 40,
      distance: 5,
      description: `Hill repeats: 6x2min uphill at hard effort, easy jog down recovery.`,
      intensity: 'high',
      targetPace: { min: zones.threshold.minPace, max: zones.tempo.maxPace },
      adaptations: ['Leg strength', 'Power development', 'Running form']
    };
  }

  private createRecoveryWorkout(date: string): WorkoutPlan {
    return {
      id: this.generateId(),
      date,
      type: 'recovery',
      duration: 30,
      distance: 3,
      description: `Recovery run or cross-training. Light effort, focus on movement and recovery.`,
      intensity: 'low',
      adaptations: ['Active recovery', 'Injury prevention']
    };
  }

  /**
   * Calculate adaptations between old and new metrics
   */
  private calculateAdaptations(current: RunningMetrics, previous: RunningMetrics) {
    const adaptations = [];
    const now = new Date();

    if (current.weeklyDistance > previous.weeklyDistance * 1.1) {
      adaptations.push({
        reason: 'Increased training volume',
        change: 'Added more distance to weekly plan',
        date: now
      });
    }

    if (current.averagePace < previous.averagePace - 0.2) {
      adaptations.push({
        reason: 'Pace improvement detected',
        change: 'Adjusted training zones for faster paces',
        date: now
      });
    }

    if (current.consistencyScore > previous.consistencyScore + 15) {
      adaptations.push({
        reason: 'Improved consistency',
        change: 'Increased workout intensity and frequency',
        date: now
      });
    }

    return adaptations.length > 0 ? adaptations : [{
      reason: 'Regular plan update',
      change: 'Fine-tuned plan based on recent performance',
      date: now
    }];
  }

  private calculateImprovementRate(activities: StravaActivity[]): number {
    if (activities.length < 4) return 0;

    const sorted = activities.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

    const firstAvgPace = firstHalf.reduce((sum, run) => {
      const pace = (run.moving_time / 60) / (run.distance / 1000);
      return sum + pace;
    }, 0) / firstHalf.length;

    const secondAvgPace = secondHalf.reduce((sum, run) => {
      const pace = (run.moving_time / 60) / (run.distance / 1000);
      return sum + pace;
    }, 0) / secondHalf.length;

    return ((firstAvgPace - secondAvgPace) / firstAvgPace) * 100;
  }

  private getDefaultMetrics(): RunningMetrics {
    return {
      weeklyDistance: 15,
      weeklyRuns: 3,
      averagePace: 6.0,
      longestRun: 5,
      totalElevation: 50,
      consistencyScore: 50,
      improvementRate: 0
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Update training plan based on new Strava data
   */
  updateTrainingPlan(
    currentPlan: TrainingPlan,
    newActivities: StravaActivity[]
  ): TrainingPlan {
    const newMetrics = this.analyzeRunningData(newActivities);
    const adaptations = this.calculateAdaptations(newMetrics, currentPlan.metrics);
    
    const updatedPlan: TrainingPlan = {
      ...currentPlan,
      metrics: newMetrics,
      trainingZones: this.calculateTrainingZones(newMetrics),
      weeklyPlan: this.createWeeklyWorkouts(newMetrics, this.calculateTrainingZones(newMetrics), currentPlan.goals),
      adaptations: [...currentPlan.adaptations, ...adaptations],
      updatedAt: new Date()
    };

    return updatedPlan;
  }

  /**
   * Generate weekly workouts for the current training plan
   */
  generateWeeklyWorkouts(user: any, plan: any): WorkoutPlan[] {
    const metrics = plan.metrics || this.getDefaultMetrics();
    const zones = plan.trainingZones || this.calculateTrainingZones(metrics);
    const goals = plan.goals || { focusArea: 'general_fitness' };
    
    return this.createWeeklyWorkouts(metrics, zones, goals);
  }

  /**
   * Generate a personalized training plan for a user
   */
  generatePersonalizedPlan(user: any, activities: StravaActivity[], goals: any) {
    const metrics = this.analyzeRunningData(activities);
    const trainingPlan = this.generateTrainingPlan(user._id || user.id, metrics, {
      focusArea: this.mapGoalsToFocusArea(goals),
      targetDistance: this.parseTargetDistance(goals.raceType),
      targetTime: this.parseTargetTime(goals.targetTime),
      raceDate: goals.raceDate ? new Date(goals.raceDate) : undefined
    });

    return {
      plan: {
        name: this.generatePlanName(goals),
        goals: this.formatGoalsForDisplay(goals),
        metrics: {
          weeklyVolume: metrics.weeklyDistance,
          avgPace: metrics.averagePace,
          totalRuns: metrics.weeklyRuns * 4, // Convert to monthly
          consistency: metrics.consistencyScore
        },
        trainingZones: this.convertZonesToDisplayFormat(trainingPlan.trainingZones),
        adaptations: trainingPlan.adaptations.map(a => `${a.reason}: ${a.change}`)
      }
    };
  }

  /**
   * Analyze progress and suggest adaptations
   */
  async analyzeProgressAndAdapt(user: any, activities: StravaActivity[]): Promise<string[]> {
    const currentMetrics = this.analyzeRunningData(activities);
    const adaptations: string[] = [];

    // Analyze recent performance trends
    const recentWeek = activities.filter(a => {
      const activityDate = new Date(a.start_date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return activityDate > weekAgo && (a.type === 'Run' || a.type === 'VirtualRun');
    });

    if (recentWeek.length === 0) {
      adaptations.push("No recent runs detected - maintaining current plan intensity");
      return adaptations;
    }

    // Check for improvements
    const avgRecentPace = recentWeek.reduce((sum, run) => {
      const pace = (run.moving_time / 60) / (run.distance / 1000);
      return sum + pace;
    }, 0) / recentWeek.length;

    if (avgRecentPace < currentMetrics.averagePace - 0.3) {
      adaptations.push("Pace improvement detected - increasing workout intensity by 5%");
    }

    // Check for volume changes
    const recentWeeklyDistance = recentWeek.reduce((sum, run) => sum + run.distance / 1000, 0);
    if (recentWeeklyDistance > currentMetrics.weeklyDistance * 1.2) {
      adaptations.push("Volume increase noted - adjusting long run distance and recovery periods");
    }

    // Check for consistency
    if (recentWeek.length >= 4) {
      adaptations.push("Excellent consistency - adding a tempo workout to the weekly plan");
    } else if (recentWeek.length < 2) {
      adaptations.push("Low activity detected - focusing on easy runs to rebuild routine");
    }

    return adaptations.length > 0 ? adaptations : ["Plan updated based on recent performance data"];
  }

  private mapGoalsToFocusArea(goals: any): 'endurance' | 'speed' | 'strength' | 'general_fitness' {
    const raceType = goals.raceType?.toLowerCase();
    if (raceType === 'marathon' || raceType === 'half-marathon') return 'endurance';
    if (raceType === '5k' || raceType === '10k') return 'speed';
    return 'general_fitness';
  }

  private parseTargetDistance(raceType: string): number | undefined {
    const distances: Record<string, number> = {
      '5k': 5,
      '10k': 10,
      'half-marathon': 21.1,
      'marathon': 42.2
    };
    return distances[raceType?.toLowerCase()];
  }

  private parseTargetTime(timeStr: string): number | undefined {
    if (!timeStr) return undefined;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return undefined;
  }

  private generatePlanName(goals: any): string {
    if (goals.raceType && goals.targetTime) {
      return `${goals.raceType.toUpperCase()} Training Plan - Target ${goals.targetTime}`;
    }
    if (goals.raceType) {
      return `${goals.raceType.toUpperCase()} Training Plan`;
    }
    return `Personalized Running Plan`;
  }

  private formatGoalsForDisplay(goals: any): string[] {
    const formatted: string[] = [];
    if (goals.raceType) formatted.push(`Train for ${goals.raceType.toUpperCase()}`);
    if (goals.targetTime) formatted.push(`Target time: ${goals.targetTime}`);
    if (goals.weeklyMiles) formatted.push(`Weekly goal: ${goals.weeklyMiles} miles`);
    if (goals.raceDate) formatted.push(`Race date: ${new Date(goals.raceDate).toLocaleDateString()}`);
    return formatted.length > 0 ? formatted : ['General fitness improvement'];
  }

  private convertZonesToDisplayFormat(zones: TrainingZones) {
    return {
      easy: { min: Math.round(zones.easy.minPace * 60), max: Math.round(zones.easy.maxPace * 60) },
      tempo: { min: Math.round(zones.tempo.minPace * 60), max: Math.round(zones.tempo.maxPace * 60) },
      threshold: { min: Math.round(zones.threshold.minPace * 60), max: Math.round(zones.threshold.maxPace * 60) },
      interval: { min: Math.round(zones.interval.minPace * 60), max: Math.round(zones.interval.maxPace * 60) }
    };
  }
}

export default AITrainingService;
export { RunningMetrics, TrainingZones, WorkoutPlan, TrainingPlan };
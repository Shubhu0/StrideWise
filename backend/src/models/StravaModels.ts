import mongoose, { Document, Schema } from 'mongoose';

// User model with Strava integration
interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  stravaId?: number;
  stravaTokens?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  stravaConnected: boolean;
  profile: {
    age?: number;
    gender?: 'male' | 'female' | 'other';
    weight?: number; // kg
    height?: number; // cm
    runningExperience?: 'beginner' | 'intermediate' | 'advanced';
    weeklyGoal?: number; // km per week
  };
  preferences: {
    units: 'metric' | 'imperial';
    timezone: string;
    notifications: {
      workouts: boolean;
      achievements: boolean;
      weekly_summary: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  stravaId: { type: Number, unique: true, sparse: true },
  stravaTokens: {
    access_token: String,
    refresh_token: String,
    expires_at: Number
  },
  stravaConnected: { type: Boolean, default: false },
  profile: {
    age: Number,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    weight: Number,
    height: Number,
    runningExperience: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    weeklyGoal: { type: Number, default: 20 }
  },
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      workouts: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      weekly_summary: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
});

// Training Plan model
interface ITrainingPlan extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  goals: {
    targetDistance?: number;
    targetTime?: number;
    raceDate?: Date;
    focusArea: 'endurance' | 'speed' | 'strength' | 'general_fitness';
  };
  metrics: {
    weeklyDistance: number;
    weeklyRuns: number;
    averagePace: number;
    longestRun: number;
    totalElevation: number;
    averageHeartRate?: number;
    consistencyScore: number;
    improvementRate: number;
  };
  trainingZones: {
    easy: { minPace: number; maxPace: number };
    tempo: { minPace: number; maxPace: number };
    threshold: { minPace: number; maxPace: number };
    interval: { minPace: number; maxPace: number };
    recovery: { minPace: number; maxPace: number };
  };
  adaptations: [{
    reason: string;
    change: string;
    date: Date;
  }];
}

const trainingPlanSchema = new Schema<ITrainingPlan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  goals: {
    targetDistance: Number,
    targetTime: Number,
    raceDate: Date,
    focusArea: { 
      type: String, 
      enum: ['endurance', 'speed', 'strength', 'general_fitness'],
      default: 'general_fitness'
    }
  },
  metrics: {
    weeklyDistance: { type: Number, required: true },
    weeklyRuns: { type: Number, required: true },
    averagePace: { type: Number, required: true },
    longestRun: { type: Number, required: true },
    totalElevation: { type: Number, required: true },
    averageHeartRate: Number,
    consistencyScore: { type: Number, required: true },
    improvementRate: { type: Number, required: true }
  },
  trainingZones: {
    easy: { minPace: Number, maxPace: Number },
    tempo: { minPace: Number, maxPace: Number },
    threshold: { minPace: Number, maxPace: Number },
    interval: { minPace: Number, maxPace: Number },
    recovery: { minPace: Number, maxPace: Number }
  },
  adaptations: [{
    reason: { type: String, required: true },
    change: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Workout model
interface IWorkout extends Document {
  userId: mongoose.Types.ObjectId;
  trainingPlanId: mongoose.Types.ObjectId;
  date: Date;
  type: 'easy' | 'tempo' | 'interval' | 'long' | 'recovery' | 'hill' | 'fartlek';
  duration: number; // minutes
  distance?: number; // km
  description: string;
  intensity: 'low' | 'medium' | 'high';
  targetPace?: { min: number; max: number };
  intervals?: {
    warmup: number;
    work: number;
    rest: number;
    repeats: number;
    cooldown: number;
  };
  completed: boolean;
  actualData?: {
    duration: number;
    distance: number;
    averagePace: number;
    averageHeartRate?: number;
    stravaActivityId?: number;
  };
  adaptations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const workoutSchema = new Schema<IWorkout>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  trainingPlanId: { type: Schema.Types.ObjectId, ref: 'TrainingPlan', required: true },
  date: { type: Date, required: true },
  type: { 
    type: String, 
    enum: ['easy', 'tempo', 'interval', 'long', 'recovery', 'hill', 'fartlek'],
    required: true 
  },
  duration: { type: Number, required: true },
  distance: Number,
  description: { type: String, required: true },
  intensity: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    required: true 
  },
  targetPace: {
    min: Number,
    max: Number
  },
  intervals: {
    warmup: Number,
    work: Number,
    rest: Number,
    repeats: Number,
    cooldown: Number
  },
  completed: { type: Boolean, default: false },
  actualData: {
    duration: Number,
    distance: Number,
    averagePace: Number,
    averageHeartRate: Number,
    stravaActivityId: Number
  },
  adaptations: [String]
}, {
  timestamps: true
});

// Strava Activity model (cached data)
interface IStravaActivity extends Document {
  userId: mongoose.Types.ObjectId;
  stravaId: number;
  name: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  type: string;
  startDate: Date;
  averageSpeed: number;
  maxSpeed: number;
  averageHeartrate?: number;
  maxHeartrate?: number;
  sufferScore?: number;
  kudosCount: number;
  athleteCount: number;
  processed: boolean; // whether this activity has been used for plan updates
  createdAt: Date;
  updatedAt: Date;
}

const stravaActivitySchema = new Schema<IStravaActivity>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stravaId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  distance: { type: Number, required: true },
  movingTime: { type: Number, required: true },
  elapsedTime: { type: Number, required: true },
  totalElevationGain: { type: Number, required: true },
  type: { type: String, required: true },
  startDate: { type: Date, required: true },
  averageSpeed: { type: Number, required: true },
  maxSpeed: { type: Number, required: true },
  averageHeartrate: Number,
  maxHeartrate: Number,
  sufferScore: Number,
  kudosCount: { type: Number, default: 0 },
  athleteCount: { type: Number, default: 1 },
  processed: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ stravaId: 1 });
trainingPlanSchema.index({ userId: 1, active: 1 });
workoutSchema.index({ userId: 1, date: 1 });
workoutSchema.index({ trainingPlanId: 1 });
stravaActivitySchema.index({ userId: 1, startDate: -1 });
stravaActivitySchema.index({ stravaId: 1 });
stravaActivitySchema.index({ processed: 1 });

// Avoid recompilation error in development
const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
const TrainingPlan = mongoose.models.TrainingPlan || mongoose.model<ITrainingPlan>('TrainingPlan', trainingPlanSchema);
const Workout = mongoose.models.Workout || mongoose.model<IWorkout>('Workout', workoutSchema);
const StravaActivity = mongoose.models.StravaActivity || mongoose.model<IStravaActivity>('StravaActivity', stravaActivitySchema);

export { User, TrainingPlan, Workout, StravaActivity };
export { IUser, ITrainingPlan, IWorkout, IStravaActivity };
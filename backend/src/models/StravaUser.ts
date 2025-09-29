import { Schema, model, Document } from 'mongoose';

export interface IStravaUser extends Document {
  _id: string;
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    country?: string;
    state?: string;
    city?: string;
    sex?: string;
  };
  strava: {
    athleteId: number;
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    athlete: any;
  };
  trainingPlan?: {
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
    createdAt: Date;
    lastUpdated?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const StravaUserSchema = new Schema<IStravaUser>({
  _id: {
    type: String,
    required: true
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      default: 'Demo'
    },
    lastName: {
      type: String,
      required: true,
      default: 'User'
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    country: String,
    state: String,
    city: String,
    sex: String
  },
  strava: {
    athleteId: {
      type: Number,
      required: true,
      unique: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    athlete: Schema.Types.Mixed
  },
  trainingPlan: {
    name: String,
    goals: [String],
    metrics: {
      weeklyVolume: Number,
      avgPace: Number,
      totalRuns: Number,
      consistency: Number
    },
    trainingZones: {
      easy: { min: Number, max: Number },
      tempo: { min: Number, max: Number },
      threshold: { min: Number, max: Number },
      interval: { min: Number, max: Number }
    },
    adaptations: [String],
    createdAt: Date,
    lastUpdated: Date
  }
}, {
  timestamps: true,
  _id: false // We'll manage the _id manually
});

// Indexes
StravaUserSchema.index({ 'strava.athleteId': 1 });
StravaUserSchema.index({ 'profile.email': 1 });
StravaUserSchema.index({ createdAt: -1 });

export default model<IStravaUser>('StravaUser', StravaUserSchema);
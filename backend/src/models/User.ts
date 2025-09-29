import { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  password?: string
  profileImage?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  height?: number // in cm
  weight?: number // in kg
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  currentTrainingPlan?: Schema.Types.ObjectId
  preferences: {
    units: 'metric' | 'imperial'
    notifications: boolean
    privacy: 'public' | 'friends' | 'private'
  }
  stats: {
    totalRuns: number
    totalDistance: number // in km
    totalTime: number // in minutes
    personalBests: {
      distance: number // in km
      time: number // in seconds
    }[]
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  height: {
    type: Number,
    min: 100,
    max: 250
  },
  weight: {
    type: Number,
    min: 30,
    max: 300
  },
  fitnessLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  goals: [{
    type: String,
    enum: ['weight_loss', 'endurance', 'speed', 'strength', '5k', '10k', 'half_marathon', 'marathon']
  }],
  currentTrainingPlan: {
    type: Schema.Types.ObjectId,
    ref: 'TrainingPlan',
    default: null
  },
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    privacy: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    }
  },
  stats: {
    totalRuns: {
      type: Number,
      default: 0
    },
    totalDistance: {
      type: Number,
      default: 0
    },
    totalTime: {
      type: Number,
      default: 0
    },
    personalBests: [{
      distance: {
        type: Number,
        required: true
      },
      time: {
        type: Number,
        required: true
      }
    }]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password
      return ret
    }
  }
})

// Indexes
UserSchema.index({ email: 1 })
UserSchema.index({ createdAt: -1 })

export const User = model<IUser>('User', UserSchema)
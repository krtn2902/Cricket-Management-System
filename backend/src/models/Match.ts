import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  title: string;
  team1: mongoose.Types.ObjectId;
  team2: mongoose.Types.ObjectId;
  venue: string;
  date: Date;
  overs: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  winner?: mongoose.Types.ObjectId;
  team1Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  team2Score?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  tournament?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const scoreSchema = new Schema({
  runs: {
    type: Number,
    default: 0,
    min: [0, 'Runs cannot be negative'],
  },
  wickets: {
    type: Number,
    default: 0,
    min: [0, 'Wickets cannot be negative'],
    max: [10, 'Wickets cannot exceed 10'],
  },
  overs: {
    type: Number,
    default: 0,
    min: [0, 'Overs cannot be negative'],
  },
}, { _id: false });

const matchSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Match title is required'],
    trim: true,
  },
  team1: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team 1 is required'],
  },
  team2: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: [true, 'Team 2 is required'],
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Match date is required'],
  },
  overs: {
    type: Number,
    required: [true, 'Number of overs is required'],
    min: [1, 'Overs must be at least 1'],
    max: [50, 'Overs cannot exceed 50'],
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  team1Score: scoreSchema,
  team2Score: scoreSchema,
  tournament: {
    type: Schema.Types.ObjectId,
    ref: 'Tournament',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Validate that team1 and team2 are different
matchSchema.pre('save', function (next) {
  if ((this.team1 as mongoose.Types.ObjectId).equals(this.team2 as mongoose.Types.ObjectId)) {
    next(new Error('Team 1 and Team 2 must be different'));
  } else {
    next();
  }
});

export default mongoose.model<IMatch>('Match', matchSchema);

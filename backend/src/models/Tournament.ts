import mongoose, { Document, Schema } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  teams: mongoose.Types.ObjectId[];
  matches: mongoose.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed';
  winner?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
}

const tournamentSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team',
  }],
  matches: [{
    type: Schema.Types.ObjectId,
    ref: 'Match',
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Validate dates
tournamentSchema.pre('save', function (next) {
  if ((this.endDate as Date) <= (this.startDate as Date)) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

export default mongoose.model<ITournament>('Tournament', tournamentSchema);

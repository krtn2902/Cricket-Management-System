import mongoose, { Document, Schema } from 'mongoose';

export interface IPlayer extends Document {
  name: string;
  age: number;
  position: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingHand: 'left' | 'right';
  bowlingStyle?: 'fast' | 'medium' | 'spin' | 'off-spin' | 'leg-spin';
  team?: mongoose.Types.ObjectId;
  experience: number;
  createdBy: mongoose.Types.ObjectId;
}

const playerSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Player age is required'],
    min: [15, 'Player must be at least 15 years old'],
    max: [50, 'Player age cannot exceed 50 years'],
  },
  position: {
    type: String,
    enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper'],
    required: [true, 'Player position is required'],
  },
  battingHand: {
    type: String,
    enum: ['left', 'right'],
    required: [true, 'Batting hand is required'],
  },
  bowlingStyle: {
    type: String,
    enum: ['fast', 'medium', 'spin', 'off-spin', 'leg-spin'],
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IPlayer>('Player', playerSchema);

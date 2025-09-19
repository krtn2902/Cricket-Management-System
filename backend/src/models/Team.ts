import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  city: string;
  players: mongoose.Types.ObjectId[];
  captain?: string;
  coach?: string;
  founded: Date;
  createdBy: mongoose.Types.ObjectId;
}

const teamSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    unique: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Player',
  }],
  captain: {
    type: String,
    trim: true,
  },
  coach: {
    type: String,
    trim: true,
  },
  founded: {
    type: Date,
    required: [true, 'Founded date is required'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<ITeam>('Team', teamSchema);

import { Schema, model, models, Document } from 'mongoose';

export interface IPlayerValuation extends Document {
  playerId: number;
  playerFirstName?: string;
  playerLastName?: string;
  year: number;
  month: number;
  value: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerValuationSchema = new Schema(
  {
    playerId: { type: Number, required: true },
    playerFirstName: { type: String },
    playerLastName: { type: String },
    year: { type: Number, required: true, min: 1900 },
    month: { type: Number, required: true, min: 1, max: 12 },
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'EUR', trim: true, uppercase: true },
  },
  { timestamps: true },
);

// Unikalny wpis na (playerId, year, month)
PlayerValuationSchema.index({ playerId: 1, year: 1, month: 1 }, { unique: true });
PlayerValuationSchema.index({ playerId: 1, year: -1, month: -1 });

const PlayerValuation = models.PlayerValuation || model<IPlayerValuation>('PlayerValuation', PlayerValuationSchema);

export default PlayerValuation;

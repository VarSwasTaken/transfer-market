import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IScoutingReport extends Document {
  playerId: number;
  scoutName: string;
  date: Date;
  rating?: number;
  potential?: 'Low' | 'Medium' | 'High' | 'World Class';
  pros: string[];
  cons: string[];
  notes?: string;
  attributes?: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScoutingReportSchema = new Schema({
  playerId: { type: Number, required: true }, 
  scoutName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  
  // Przykładowe dane skautowe
  rating: { type: Number, min: 1, max: 100 },
  potential: { type: String, enum: ['Low', 'Medium', 'High', 'World Class'] },
  
  // Zalety i wady (elastyczna tablica)
  pros: [String],
  cons: [String],
  
  notes: String,
  
  // Dynamiczne atrybuty (tu NoSQL pokazuje siłę)
  attributes: {
    pace: Number,
    shooting: Number,
    passing: Number,
    dribbling: Number,
    defending: Number,
    physical: Number
  }
}, { timestamps: true });

// Index dla szybszych zapytań po playerId
ScoutingReportSchema.index({ playerId: 1 });

// Jeśli model już istnieje (np. po hot-reload), użyj go, w przeciwnym razie stwórz nowy
const ScoutingReport = models.ScoutingReport || model<IScoutingReport>('ScoutingReport', ScoutingReportSchema);

export default ScoutingReport;
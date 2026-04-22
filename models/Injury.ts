import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IInjury extends Document {
  playerId: number;
  type: string;
  severity: 'Lekka' | 'Średnia' | 'Poważna' | 'Krytyczna';
  startDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  status: 'W trakcie leczenia' | 'Rehabilitacja' | 'Wyleczona';
  description?: string;
  treatment?: string;
  reportedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InjurySchema = new Schema({
  playerId: { type: Number, required: true },
  
  // Szczegóły kontuzji
  type: { type: String, required: true }, // np. "Zerwanie więzadeł", "Uraz ścięgna podkolanowego"
  severity: { 
    type: String, 
    enum: ['Lekka', 'Średnia', 'Poważna', 'Krytyczna'],
    required: true 
  },
  
  // Ramy czasowe
  startDate: { type: Date, required: true },
  expectedReturnDate: { type: Date }, // Przewidywana data powrotu
  actualReturnDate: { type: Date },   // Kiedy faktycznie wrócił na boisko
  
  // Status
  status: { 
    type: String, 
    enum: ['W trakcie leczenia', 'Rehabilitacja', 'Wyleczona'], 
    default: 'W trakcie leczenia' 
  },

  // Dodatkowe informacje (siła NoSQL - możemy tu wpisać cokolwiek)
  description: String,
  treatment: String, // Opis leczenia/operacji
  
  // Opcjonalnie: kto zgłosił (np. lekarz klubowy)
  reportedBy: String
}, { timestamps: true });

// Indeksy dla szybszych zapytań
InjurySchema.index({ playerId: 1 });
InjurySchema.index({ status: 1 });
InjurySchema.index({ playerId: 1, status: 1 });

// Zabezpieczenie przed ponownym tworzeniem modelu w Next.js
const Injury = models.Injury || model<IInjury>('Injury', InjurySchema);

export default Injury;
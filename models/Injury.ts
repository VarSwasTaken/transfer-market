import { Schema, model, models, Document } from 'mongoose';

export interface IInjury extends Document {
  playerId: number;
  playerFirstName?: string;
  playerLastName?: string;
  type_PL: string;
  type_EN: string;
  severity: 'Lekka' | 'Średnia' | 'Poważna' | 'Krytyczna';
  startDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  status: 'W trakcie leczenia' | 'Rehabilitacja' | 'Wyleczona';
  description_PL?: string;
  description_EN?: string;
  treatment_PL?: string;
  treatment_EN?: string;
  reportedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InjurySchema = new Schema(
  {
    playerId: { type: Number, required: true },
    playerFirstName: { type: String },
    playerLastName: { type: String },

    // Szczegóły kontuzji
    type_PL: { type: String, required: true }, // np. "Zerwanie więzadeł"
    type_EN: { type: String, required: true }, // np. "Ligament rupture"
    severity: {
      type: String,
      enum: ['Lekka', 'Średnia', 'Poważna', 'Krytyczna'],
      required: true,
    },

    // Ramy czasowe
    startDate: { type: Date, required: true },
    expectedReturnDate: { type: Date }, // Przewidywana data powrotu
    actualReturnDate: { type: Date }, // Kiedy faktycznie wrócił na boisko

    // Status
    status: {
      type: String,
      enum: ['W trakcie leczenia', 'Rehabilitacja', 'Wyleczona'],
      default: 'W trakcie leczenia',
    },

    // Dodatkowe informacje (siła NoSQL - możemy tu wpisać cokolwiek)
    description_PL: String,
    description_EN: String,
    treatment_PL: String,
    treatment_EN: String,

    // Opcjonalnie: kto zgłosił (np. lekarz klubowy)
    reportedBy: String,
  },
  { timestamps: true },
);

// Indeksy dla szybszych zapytań
InjurySchema.index({ playerId: 1 });
InjurySchema.index({ status: 1 });
InjurySchema.index({ playerId: 1, status: 1 });

// Zabezpieczenie przed ponownym tworzeniem modelu w Next.js
const Injury = models.Injury || model<IInjury>('Injury', InjurySchema);

export default Injury;

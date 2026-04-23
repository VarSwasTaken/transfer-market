import { Schema, model, models, Document } from 'mongoose';

export interface ITransferRumor extends Document {
  playerId: number;
  fromClubId?: number;
  toClubId?: number;
  source: string;
  credibility: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Confirmed' | 'Denied' | 'Expired';
  rumorType: 'Transfer' | 'Loan' | 'Swap';
  rumoredFee?: number;
  rumoredLoanFee?: number;
  salaryExpectation?: number;
  contractYears?: number;
  currency: string;
  links: string[];
  notes?: string;
  publishedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransferRumorSchema = new Schema(
  {
    playerId: { type: Number, required: true },
    fromClubId: { type: Number },
    toClubId: { type: Number },

    source: { type: String, required: true, trim: true },
    credibility: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Active', 'Confirmed', 'Denied', 'Expired'],
      default: 'Active',
    },
    rumorType: {
      type: String,
      enum: ['Transfer', 'Loan', 'Swap'],
      default: 'Transfer',
    },

    rumoredFee: { type: Number, min: 0 },
    rumoredLoanFee: { type: Number, min: 0 },
    salaryExpectation: { type: Number, min: 0 },
    contractYears: { type: Number, min: 1, max: 10 },
    currency: { type: String, default: 'EUR', trim: true, uppercase: true },

    links: { type: [String], default: [] },
    notes: { type: String },
    publishedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

TransferRumorSchema.index({ playerId: 1, status: 1 });
TransferRumorSchema.index({ toClubId: 1, status: 1 });
TransferRumorSchema.index({ credibility: 1, publishedAt: -1 });
TransferRumorSchema.index({ publishedAt: -1 });

const TransferRumor =
  models.TransferRumor || model<ITransferRumor>('TransferRumor', TransferRumorSchema);

export default TransferRumor;

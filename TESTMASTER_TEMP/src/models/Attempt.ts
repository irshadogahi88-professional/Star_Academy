import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  mode: "timed" | "practice" | "exam";
  startedAt: Date;
  submittedAt?: Date;
  answers: {
    mcqId: mongoose.Types.ObjectId;
    selectedIndex: number;
    correct: boolean;
    timeTakenSec: number;
  }[];
  score?: number;
  totalQuestions?: number;
  percentage?: number;
}

const AttemptSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  mode: { type: String, enum: ["timed", "practice", "exam"], required: true },
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  answers: [{
    mcqId: { type: Schema.Types.ObjectId, ref: 'MCQ', required: true },
    selectedIndex: { type: Number, required: true },
    correct: { type: Boolean, required: true },
    timeTakenSec: { type: Number, default: 0 }
  }],
  score: { type: Number },
  totalQuestions: { type: Number },
  percentage: { type: Number }
});

export const Attempt: Model<IAttempt> = mongoose.models.Attempt || mongoose.model<IAttempt>("Attempt", AttemptSchema);

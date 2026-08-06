import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMCQ extends Document {
  subjectId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  order: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  tags?: string[];
  sourceRef?: string;
  isActive: boolean;
  createdAt: Date;
}

const MCQSchema: Schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  order: { type: Number, default: 0 },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String },
  tags: [{ type: String }],
  sourceRef: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const MCQ: Model<IMCQ> = mongoose.models.MCQ || mongoose.model<IMCQ>("MCQ", MCQSchema);

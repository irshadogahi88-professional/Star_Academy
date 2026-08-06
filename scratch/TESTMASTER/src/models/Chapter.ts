import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChapter extends Document {
  subjectId: mongoose.Types.ObjectId;
  name: string;
  order: number;
  sourceFileName?: string;
  createdAt: Date;
}

const ChapterSchema: Schema = new Schema({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  sourceFileName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Chapter: Model<IChapter> = mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITest extends Document {
  title: string;
  subjectId: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  mcqIds?: mongoose.Types.ObjectId[];
  durationMinutes?: number;
  createdBy: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
}

const TestSchema: Schema = new Schema({
  title: { type: String, required: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' },
  mcqIds: [{ type: Schema.Types.ObjectId, ref: 'MCQ' }],
  durationMinutes: { type: Number },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const Test: Model<ITest> = mongoose.models.Test || mongoose.model<ITest>("Test", TestSchema);

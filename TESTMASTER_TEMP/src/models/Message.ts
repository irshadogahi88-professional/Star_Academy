import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage extends Document {
  name: string;
  emailOrNumber: string;
  title: string;
  details: string;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  name: { type: String, required: true },
  emailOrNumber: { type: String, required: true },
  title: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

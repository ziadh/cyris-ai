import mongoose from 'mongoose';

export interface IMessage {
  role: string;
  content: string;
  modelId?: string;
}

export interface IChat {
  id: string;
  title: string;
  messages: IMessage[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  userId: { type: String, required: true, index: true },
}, {
  timestamps: true
});

export const Chat = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);
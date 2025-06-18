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
  isShared?: boolean;
  shareId?: string;
  sharedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema({
  role: { type: String, required: true },
  content: { type: String, required: true },
  modelId: { type: String, required: false }
}, { _id: false });

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  messages: [messageSchema],
  userId: { type: String, required: true, index: true },
  isShared: { type: Boolean, default: false },
  shareId: { type: String, unique: true, sparse: true },
  sharedAt: { type: Date },
}, {
  timestamps: true
});

// Add index for shareId for faster lookups
chatSchema.index({ shareId: 1 }, { sparse: true });

// Force recreation of the model to ensure schema changes are applied
if (mongoose.models.Chat) {
  delete mongoose.models.Chat;
}

export const Chat = mongoose.model<IChat>('Chat', chatSchema);

// Debug: Log the schema to verify it includes modelId
console.log('📋 Message schema paths:', Object.keys(messageSchema.paths));
console.log('🔍 modelId field in schema:', messageSchema.paths.modelId ? 'YES' : 'NO');
import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  userCount: { type: Number, default: 0 },
  numVideos: { type: Number, default: 0 },
  numImages: { type: Number, default: 0 },
  numLinks: { type: Number, default: 0 },

  subscribedUsers: [{ type: String }], // New field to store subscribed users' emails or usernames
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Tier || mongoose.model('Tier', tierSchema);

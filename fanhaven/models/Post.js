import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  tierId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tier',
    // No required condition here, validation will be done in the API logic
  },
  type: { type: String, required: true }, // Type to indicate if it's an image, video, etc.
  contentUrl: String,
  description: String,
  username: String,
  
  // Store the user IDs of those who liked or disliked the post
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  seenBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Users who have seen this post
  ],
  isFree: { type: Boolean, default: false }, // Flag for free posts
  
  // Auto-manage createdAt and updatedAt timestamps
}, { timestamps: true });

// Virtual fields for computed properties like counts
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('dislikesCount').get(function() {
  return this.dislikes.length;
});

export default mongoose.models.Post || mongoose.model('Post', postSchema);

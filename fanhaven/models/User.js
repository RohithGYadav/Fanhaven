import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  username: { type: String, unique: true },
  phone: String,
  domain: String,
  profilePic: String,
  coverPic: String,
  bio: { type: String, maxLength: 100 },
  followersCount: { type: Number, default: 0 },
  subscriptionsCount: { type: Number, default: 0 },
  moneyThisMonth: { type: Number, default: 0 },
  totalMoney: { type: Number, default: 0 },
  premiumCost: { type: Number, default: -1 }, // Premium content cost
  socialMediaLinks: [
    {
      name: String,
      link: String,
    },
  ],
  razorpayId: { type: String, default: '' },
  razorpaySecret: { type: String, default: '' },

  // Following array with only userId
  following: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }
  ],

  // Subscribed array with only userId
  subscribed: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    }
  ],

  // Followers field with userId and subscribed status, but no username
  followers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      subscribed: { type: Boolean, default: false },
      expiryDate: { type: Date, default: null },
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update `updatedAt` on save
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.User || mongoose.model('User', userSchema);

import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  payerId: { type: mongoose.Schema.Types.ObjectId, required: true },  // ID of the user who made the payment
  payeeId: { type: mongoose.Schema.Types.ObjectId, required: true },  // ID of the user who received the payment
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentMethod: String,
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

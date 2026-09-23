import mongoose from 'mongoose';
const { Schema } = mongoose;

const itemSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: ['electronics', 'clothing', 'documents', 'accessories', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['lost', 'found', 'claimed'],
      default: 'lost',
    },
    location: {
      type: String,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// same title can't be reported twice at the same location
itemSchema.index({ title: 1, location: 1 }, { unique: true });

export default mongoose.model('Item', itemSchema);
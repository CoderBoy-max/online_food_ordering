import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 60 },
  },
  { timestamps: true }
);

// A restaurant cannot have two sections with the same name.
categorySchema.index({ restaurant: 1, name: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);

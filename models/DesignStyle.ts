import mongoose, { Schema, Document } from 'mongoose';

export interface IDesignStyle extends Document {
  name: string;
  slug: string;
  description: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignStyleSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Crear índices para mejor rendimiento
DesignStyleSchema.index({ slug: 1 });
DesignStyleSchema.index({ category: 1 });
DesignStyleSchema.index({ isActive: 1 });

export default mongoose.models.DesignStyle || mongoose.model<IDesignStyle>('DesignStyle', DesignStyleSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  issue?: string;
}

export interface IDesign extends Document {
  filename: string;
  status: 'pending' | 'processed' | 'error';
  svgWidth?: number;
  svgHeight?: number;
  items?: IRectangle[];
  itemsCount: number;
  coverageRatio?: number;
  issues: string[];
  rawSvgPath: string;
  createdAt: Date;
}

const RectangleSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fill: { type: String, required: true },
  issue: { type: String }
}, { _id: false });

const DesignSchema = new Schema({
  filename: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processed', 'error'], default: 'pending' },
  svgWidth: { type: Number },
  svgHeight: { type: Number },
  items: [RectangleSchema],
  itemsCount: { type: Number, default: 0 },
  coverageRatio: { type: Number },
  issues: [{ type: String }],
  rawSvgPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Design = mongoose.model<IDesign>('Design', DesignSchema);
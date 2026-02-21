/**
 * Import mongoose and required types for MongoDB object modeling
 * Schema: Used to define document structure
 * Document: Provides TypeScript typing for MongoDB documents
 */
import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a rectangle element extracted from an SVG design
 * Used to store individual shape data within a design document
 */
export interface IRectangle {
  x: number;           // X-coordinate position of the rectangle
  y: number;           // Y-coordinate position of the rectangle
  width: number;       // Width of the rectangle in pixels/units
  height: number;      // Height of the rectangle in pixels/units
  fill: string;        // Fill color (hex code, rgb, or color name)
  issue?: string;      // Optional field to flag any problems with this rectangle
}

/**
 * Main interface for Design documents in MongoDB
 * Extends Document to inherit MongoDB document properties (_id, etc.)
 */
export interface IDesign extends Document {
  filename: string;                    // Original uploaded SVG filename
  status: 'pending' | 'processed' | 'error';  // Current processing state
  svgWidth?: number;                   // Width of the SVG canvas (optional)
  svgHeight?: number;                  // Height of the SVG canvas (optional)
  items?: IRectangle[];                // Array of extracted rectangles
  itemsCount: number;                  // Number of rectangles found (redundant but useful for quick queries)
  coverageRatio?: number;              // Percentage of canvas covered by rectangles (optional)
  issues: string[];                    // Array of processing issues/warnings
  rawSvgPath: string;                  // File path to the stored SVG file
  createdAt: Date;                     // Timestamp of document creation
}

/**
 * Schema definition for rectangle subdocuments
 * _id: false prevents creating separate ObjectIds for each rectangle (saves space)
 */
const RectangleSchema = new Schema({
  x: { type: Number, required: true },      // X position is mandatory
  y: { type: Number, required: true },      // Y position is mandatory
  width: { type: Number, required: true },  // Width is mandatory
  height: { type: Number, required: true }, // Height is mandatory
  fill: { type: String, required: true },   // Fill color is mandatory
  issue: { type: String }                    // Issue is optional
}, { _id: false });  // Disable automatic _id generation for subdocuments

/**
 * Main schema definition for Design collection
 * Defines structure, validation, and default values for design documents
 */
const DesignSchema = new Schema({
  // Filename of the uploaded SVG - required field
  filename: { type: String, required: true },

  // Processing status with predefined enum values, defaults to 'pending'
  status: { type: String, enum: ['pending', 'processed', 'error'], default: 'pending' },

  // SVG canvas dimensions - optional as they may not be available initially
  svgWidth: { type: Number },
  svgHeight: { type: Number },

  // Array of rectangle subdocuments using the RectangleSchema
  items: [RectangleSchema],

  // Count of items, defaults to 0 (useful for sorting/filtering without counting array)
  itemsCount: { type: Number, default: 0 },

  // Optional coverage ratio (0-1 range) indicating how much of the canvas is covered
  coverageRatio: { type: Number },

  // Array of strings to store any processing issues or warnings
  issues: [{ type: String }],

  // File system path to the raw SVG file - required
  rawSvgPath: { type: String, required: true },

  // Creation timestamp with automatic default to current date/time
  createdAt: { type: Date, default: Date.now }
});

/**
 * Create and export the Mongoose model
 * This model provides the interface to interact with the 'designs' collection in MongoDB
 * Type parameter IDesign ensures TypeScript type safety when using the model
 */
export const Design = mongoose.model<IDesign>('Design', DesignSchema);
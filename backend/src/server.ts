/**
 * Main Express Server Application
 * Handles SVG file uploads, processing, and database operations
 * Designed to be compatible with both local development and Vercel deployment
 */

import express from 'express';           // Web framework for REST APIs
import mongoose from 'mongoose';         // MongoDB ODM for data modeling
import cors from 'cors';                 // Enable Cross-Origin Resource Sharing
import multer from 'multer';              // Handle multipart/form-data for file uploads
import { Design } from './models/Design'; // MongoDB model for design documents
import { processSVG } from './services/svgProcessor'; // SVG parsing and analysis

// Initialize Express application
const app = express();
// Use environment variable for port or default to 5000
const PORT = process.env.PORT || 5000;

// ============= MIDDLEWARE CONFIGURATION =============

// Enable CORS for all routes (allows frontend from different domains to access API)
app.use(cors());
// Parse JSON request bodies (for non-file API endpoints)
app.use(express.json());

/**
 * Configure multer for file upload handling
 * Using memory storage instead of disk storage for Vercel compatibility
 * Vercel's serverless environment has read-only filesystem
 */
const storage = multer.memoryStorage();
const upload = multer({
  storage,  // Store files in memory as Buffer objects
  // Limit file size to 5MB to prevent abuse and memory issues
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB in bytes
  /**
   * Custom file filter to validate file types
   * Only accept SVG files (by MIME type or file extension)
   */
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/svg+xml' || file.originalname.endsWith('.svg')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Only SVG files allowed')); // Reject with error
    }
  }
});

// ============= DATABASE HELPER FUNCTIONS =============

/**
 * Wait for MongoDB connection to be ready
 * Essential for serverless environments where connection might not be immediate
 * 
 * @param timeout - Maximum time to wait in milliseconds (default: 30 seconds)
 * @returns Promise<boolean> - true if connected, false if timeout reached
 */
const waitForConnection = async (timeout = 30000): Promise<boolean> => {
  const start = Date.now();
  // Check connection state every 500ms
  while (mongoose.connection.readyState !== 1) { // 1 = connected
    if (Date.now() - start > timeout) {
      console.error('Connection timeout after', timeout, 'ms');
      return false;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  return true;
};

/**
 * Process SVG from buffer and save to database with retry logic
 * Designed for serverless environments where operations may need retries
 * 
 * @param buffer - Raw SVG file buffer from multer
 * @param originalName - Original filename for reference
 * @returns Saved Design document
 * @throws Error if processing or saving fails
 */
async function processSVGFromBuffer(buffer: Buffer, originalName: string) {
  // Ensure database connection is ready before proceeding
  const isConnected = await waitForConnection(30000);
  if (!isConnected) {
    throw new Error('Database connection not ready after 30 seconds');
  }

  // Convert buffer to string for XML parsing
  const fileContent = buffer.toString('utf-8');

  // Parse and analyze SVG content
  const result = await processSVG(fileContent);

  // Create new design document with processed data
  const design = new Design({
    filename: `${Date.now()}-${originalName}`, // Add timestamp to avoid collisions
    originalName: originalName,                 // Keep original name for display
    status: 'processed',                         // Mark as successfully processed
    svgWidth: result.svgWidth,                   // Canvas dimensions
    svgHeight: result.svgHeight,
    items: result.items,                          // Extracted rectangles
    itemsCount: result.itemsCount,                // Count for quick queries
    coverageRatio: result.coverageRatio,          // Coverage percentage
    issues: result.issues,                         // Any processing warnings
    rawSvgPath: 'memory',                          // Indicates in-memory processing
    createdAt: new Date()
  });

  /**
   * Implement retry logic for database saves
   * Useful for handling transient connection issues in serverless environments
   */
  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      await design.save();
      return design; // Success - return saved document
    } catch (err) {
      lastError = err;
      console.log(`Save attempt ${i + 1} failed, retrying...`);
      // Exponential backoff: wait 1s, 2s, 3s between retries
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  // If all retries failed, throw the last error
  throw lastError || new Error('Failed to save after 3 attempts');
}

// ============= API ROUTES =============

/**
 * Test endpoint to verify server is running
 * Useful for health checks and debugging
 */
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

/**
 * SVG Upload Endpoint
 * Accepts SVG file uploads, processes them, and stores results in database
 * 
 * POST /api/designs/upload
 * Content-Type: multipart/form-data
 * Body: { svg: File }
 */
app.post('/api/designs/upload', upload.single('svg'), async (req, res) => {
  try {
    // Validate file presence
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Process SVG from memory buffer (no temporary file storage)
      const design = await processSVGFromBuffer(req.file.buffer, req.file.originalname);

      // Return success response with document ID
      res.json({
        message: 'Upload successful',
        id: design._id
      });
    } catch (err) {
      // Processing failed - log error and create error record
      console.error('Processing error:', err);

      // Create error record to track failed uploads
      const design = new Design({
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        status: 'error',                          // Mark as failed
        issues: ['PROCESSING_FAILED'],             // Add specific error flag
        rawSvgPath: 'memory',
        createdAt: new Date()
      });

      // Try to save error record (with retry logic inside)
      try {
        await design.save();
      } catch (saveErr) {
        console.error('Could not save error record:', saveErr);
      }

      res.status(500).json({ error: 'Failed to process SVG' });
    }

  } catch (error) {
    // Handle any unexpected errors
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * Get all designs (summary view)
 * Returns basic info for all designs, sorted newest first
 */
app.get('/api/designs', async (req, res) => {
  try {
    const designs = await Design.find()
      .sort({ createdAt: -1 })                    // Newest first
      .select('filename originalName status itemsCount issues createdAt'); // Limit fields
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

/**
 * Get single design by ID (detailed view)
 * Returns complete design document including all extracted rectangles
 */
app.get('/api/designs/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design); // Return full document with all fields
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// ============= DATABASE CONNECTION =============

/**
 * MongoDB Connection Setup
 * Environment variable priority:
 * 1. DATABASE_URL (Vercel environment)
 * 2. MONGODB_URI (local development)
 * 3. Default localhost fallback
 */
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/svg-processor';

/**
 * Connect to MongoDB with optimized settings for serverless
 * Configuration balances reliability with performance
 */
mongoose.connect(MONGODB_URI, {
  dbName: 'svg_designs',               // Database name
  authSource: 'admin',                   // Authentication database
  // Timeout settings (generous for serverless cold starts)
  serverSelectionTimeoutMS: 30000,       // Time to select server
  socketTimeoutMS: 120000,                // Time for socket operations
  connectTimeoutMS: 30000,                // Initial connection timeout
  // Connection pool settings
  minPoolSize: 1,                         // Maintain at least one connection
  maxPoolSize: 10,                         // Maximum concurrent connections
  // Reliability settings
  retryWrites: true,                       // Retry failed writes
  retryReads: true,                        // Retry failed reads
  // Operation buffering
  bufferCommands: true,                    // Buffer commands when disconnected
  // Keep-alive settings
  heartbeatFrequencyMS: 5000                // Check connection health every 5s
})
  .then(() => {
    console.log('✅ MongoDB connected');
    // Only start HTTP server in development (not on Vercel)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// Export for Vercel serverless deployment
export default app;
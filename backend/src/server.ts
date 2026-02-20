import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import { Design } from './models/Design';
import { processSVG } from './services/svgProcessor';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for memory storage (works on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/svg+xml' || file.originalname.endsWith('.svg')) {
      cb(null, true);
    } else {
      cb(new Error('Only SVG files allowed'));
    }
  }
});

// Helper function to process SVG from buffer
async function processSVGFromBuffer(buffer: Buffer, originalName: string) {
  const fileContent = buffer.toString('utf-8');
  
  // Parse the SVG
  const result = await processSVG(fileContent);
  
  // Create design record (no file path needed)
  const design = new Design({
    filename: `${Date.now()}-${originalName}`,
    originalName: originalName,
    status: 'processed',
    svgWidth: result.svgWidth,
    svgHeight: result.svgHeight,
    items: result.items,
    itemsCount: result.itemsCount,
    coverageRatio: result.coverageRatio,
    issues: result.issues,
    rawSvgPath: 'memory', // Indicates it was processed from memory
    createdAt: new Date()
  });

  await design.save();
  return design;
}

// ============= API ROUTES =============

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Upload SVG
app.post('/api/designs/upload', upload.single('svg'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
      // Process SVG directly from memory buffer
      const design = await processSVGFromBuffer(req.file.buffer, req.file.originalname);
      
      res.json({ 
        message: 'Upload successful', 
        id: design._id 
      });
    } catch (err) {
      console.error('Processing error:', err);
      
      // Create error record
      const design = new Design({
        filename: `${Date.now()}-${req.file.originalname}`,
        originalName: req.file.originalname,
        status: 'error',
        issues: ['PROCESSING_FAILED'],
        rawSvgPath: 'memory',
        createdAt: new Date()
      });
      await design.save();
      
      res.status(500).json({ error: 'Failed to process SVG' });
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all designs
app.get('/api/designs', async (req, res) => {
  try {
    const designs = await Design.find()
      .sort({ createdAt: -1 })
      .select('filename originalName status itemsCount issues createdAt');
    res.json(designs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch designs' });
  }
});

// Get single design
app.get('/api/designs/:id', async (req, res) => {
  try {
    const design = await Design.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }
    res.json(design);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch design' });
  }
});

// Connect to MongoDB
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/svg-processor';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    // Only listen when not on Vercel
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// Export for Vercel
export default app;

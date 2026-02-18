import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Design } from './models/Design';
import { processSVG } from './services/svgProcessor';

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/svg+xml' || file.originalname.endsWith('.svg')) {
      cb(null, true);
    } else {
      cb(new Error('Only SVG files allowed'));
    }
  }
});

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

    // Create design record
    const design = new Design({
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'pending',
      rawSvgPath: req.file.path,
      itemsCount: 0,
      issues: []
    });

    await design.save();

    // Try to process the SVG
    try {
      const result = await processSVG(req.file.path);
      
      // Update with processed data
      design.status = 'processed';
      design.svgWidth = result.svgWidth;
      design.svgHeight = result.svgHeight;
      design.items = result.items;
      design.itemsCount = result.itemsCount;
      design.coverageRatio = result.coverageRatio;
      design.issues = result.issues;
      
      await design.save();
    } catch (err) {
      design.status = 'error';
      design.issues = ['PROCESSING_FAILED'];
      await design.save();
    }

    res.json({ 
      message: 'Upload successful', 
      id: design._id 
    });

  } catch (error) {
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

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/svg-processor')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
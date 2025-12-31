const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

const PORT = process.env.PORT || 5000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/pastebin';

mongoose.connect(MONGO_URI).then(() => {
    console.log('MongoDB database connection established successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Using in-memory fallback for demo');
});

// Paste Schema
const PasteSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => Math.random().toString(36).substr(2, 9),
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    index: { expires: '1m' }, // TTL index
  },
  viewsLimit: Number,
  views: {
    type: Number,
    default: 0,
  },
});

const Paste = mongoose.model('Paste', PasteSchema);

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// API Routes
app.post('/api/pastes', async (req, res) => {
  try {
    const { content, expiry, viewsLimit } = req.body;
    const newPaste = new Paste({
      content,
      viewsLimit: viewsLimit ? parseInt(viewsLimit, 10) : null,
    });

    if (expiry) {
      const expirySeconds = parseInt(expiry, 10);
      newPaste.expiresAt = new Date(Date.now() + expirySeconds * 1000);
      console.log(`Paste created with expiry: ${expirySeconds}s, expires at: ${newPaste.expiresAt}`);
    }

    await newPaste.save();
    console.log(`Paste saved with ID: ${newPaste._id}`);
    res.json({ id: newPaste._id });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/pastes/:id', async (req, res) => {
  try {
    console.log(`Fetching paste with ID: ${req.params.id}`);
    const paste = await Paste.findById(req.params.id);
    
    if (!paste) {
      console.log(`Paste ${req.params.id} not found in database`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    console.log(`Found paste: ${paste._id}, views: ${paste.views}, limit: ${paste.viewsLimit}, expiresAt: ${paste.expiresAt}`);

    // Check if paste has expired
    if (paste.expiresAt && new Date() > paste.expiresAt) {
      console.log(`Paste ${paste._id} expired at ${paste.expiresAt}, current time: ${new Date()}`);
      await paste.remove();
      return res.status(404).json({ error: 'Paste not found' });
    }

    if (paste.viewsLimit) {
      // 1. Check if views are available
      if (paste.views >= paste.viewsLimit) {
        console.log(`View limit exceeded: ${paste.views}/${paste.viewsLimit}`);
        return res.status(403).json({ error: "View limit exceeded" });
      }

      // 2. Show paste content (will happen below)
      console.log(`Views available: ${paste.views}/${paste.viewsLimit}`);
      
      // 3. Decrease views AFTER showing
      paste.views += 1;
      await paste.save();
      console.log(`Views updated: ${paste.views}/${paste.viewsLimit}`);
    }

    console.log(`Serving paste ${paste._id} successfully`);
    res.json(paste);
  } catch (error) {
    console.error('ERROR IN GET ROUTE:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});


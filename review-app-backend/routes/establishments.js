const express = require('express');
const Establishment = require('../models/Establishment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'establishments');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get all establishments
router.get('/', async (req, res) => {
  try {
    const establishments = await Establishment.find()
      .populate('owner', 'username')
      .select('-password');
    res.json(establishments);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching establishments' });
  }
});

// Get single establishment
router.get('/:id', async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id)
      .populate('owner', 'username')
      .select('-password');
    
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    res.json(establishment);
  } catch (err) {
    res.status(500).json({ message: 'Server error while fetching establishment' });
  }
});

// Update establishment details
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, phoneNumber, website } = req.body;
    
    // Find the establishment and verify ownership
    const establishment = await Establishment.findById(id);
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    if (establishment.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this establishment' });
    }

    // Update fields
    const updateData = {
      name,
      description,
      address,
      phoneNumber,
      website
    };

    // Handle logo upload if provided
    if (req.file) {
      // Delete old logo if it exists
      if (establishment.logo) {
        const oldLogoPath = path.join(__dirname, '..', establishment.logo);
        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        } catch (err) {
          console.error('Error deleting old logo:', err);
        }
      }
      
      // Store relative path in database
      updateData.logo = path.join('uploads', 'establishments', req.file.filename).replace(/\\/g, '/');
    }

    // Update the establishment
    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate('owner', 'username')
     .select('-password');

    res.json(updatedEstablishment);
  } catch (err) {
    console.error('Error updating establishment:', err);
    if (req.file) {
      // Clean up uploaded file if update fails
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error cleaning up file:', unlinkErr);
      }
    }
    res.status(500).json({ message: 'Server error while updating establishment' });
  }
});

module.exports = router;

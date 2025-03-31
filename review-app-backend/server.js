require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import models
const User = require("./models/User");
const Review = require("./models/Review");
const Establishment = require("./models/Establishment");

const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/review-app")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Configure multer for memory storage instead of disk storage
const storage = multer.memoryStorage();
const upload = multer({storage});

// Create API endpoint to serve images from MongoDB
app.get('/api/images/:type/:id/:field', async (req, res) => {
  try {
    const { type, id, field } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID');
    }
    
    let item;
    
    // Determine which model to query based on type
    if (type === 'user') {
      item = await User.findById(id);
      if (!item || !item.avatar || !item.avatar.data) {
        return res.status(404).send('Image not found');
      }
      res.set('Content-Type', item.avatar.contentType);
      return res.send(item.avatar.data);
    } 
    else if (type === 'establishment') {
      item = await Establishment.findById(id);
      if (!item) {
        return res.status(404).send('Establishment not found');
      }
      
      if (field === 'logo') {
        if (!item.logo || !item.logo.data) {
          // Instead of returning 404, serve a default logo
          const defaultLogoPath = path.join(__dirname, 'uploads', 'default-logo.png');
          if (fs.existsSync(defaultLogoPath)) {
            res.set('Content-Type', 'image/png');
            return res.send(fs.readFileSync(defaultLogoPath));
          } else {
            return res.status(404).send('Logo not found and no default logo available');
          }
        }
        res.set('Content-Type', item.logo.contentType);
        return res.send(item.logo.data);
      } 
      else if (field.startsWith('photo')) {
        const photoIndex = parseInt(field.replace('photo', ''), 10);
        if (isNaN(photoIndex) || !item.photos || photoIndex >= item.photos.length || !item.photos[photoIndex].data) {
          return res.status(404).send('Photo not found');
        }
        res.set('Content-Type', item.photos[photoIndex].contentType);
        return res.send(item.photos[photoIndex].data);
      }
      else if (field.startsWith('menu')) {
        const menuIndex = parseInt(field.replace('menu', ''), 10);
        if (isNaN(menuIndex) || !item.menu || menuIndex >= item.menu.length || !item.menu[menuIndex].data) {
          return res.status(404).send('Menu image not found');
        }
        res.set('Content-Type', item.menu[menuIndex].contentType);
        return res.send(item.menu[menuIndex].data);
      }
    }
    else if (type === 'review') {
      item = await Review.findById(id);
      if (!item) {
        return res.status(404).send('Review not found');
      }
      
      if (field.startsWith('photo')) {
        const photoIndex = parseInt(field.replace('photo', ''), 10);
        if (isNaN(photoIndex) || !item.photos || photoIndex >= item.photos.length || !item.photos[photoIndex].data) {
          return res.status(404).send('Photo not found');
        }
        res.set('Content-Type', item.photos[photoIndex].contentType);
        return res.send(item.photos[photoIndex].data);
      }
    }
    
    return res.status(400).send('Invalid request');
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).send('Server error');
  }
});

// Get establishment by id
app.get('/api/establishments/:id', async (req, res) => {
  try {
    console.log("establishment ENTERED!!!");
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid establishment ID format' });
    }

    // Find establishment by ID and populate owner information
    const establishment = await Establishment.findById(id)
      .populate('owner', '_id name email')
      .lean();

    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }

    // Transform the response to include image URLs instead of binary data
    const transformedEstablishment = {
      ...establishment,
      logoUrl: `/api/images/establishment/${id}/logo`,
      photoUrls: establishment.photos && establishment.photos.length > 0 
        ? establishment.photos.map((photo, index) => 
            `/api/images/establishment/${id}/photo${index}`)
        : []
    };
    
    res.json(transformedEstablishment);
  } catch (error) {
    console.error('Error fetching establishment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Search establishments
app.get('/api/establishments/:search', async (req, res) => {
  try {
    const establishments = await Establishment.find({
      name: { $regex: req.params.search, $options: "i" }
    })
      .lean()
      .select('name description rating reviewCount logo photos')
      .sort({ name: 1 });
    
    // Transform the response to include image URLs instead of binary data
    const transformedEstablishments = establishments.map(est => {
      return {
        ...est,
        logoUrl: est._id ? `/api/images/establishment/${est._id}/logo` : null,
        photoUrls: est.photos && est.photos.length > 0 
          ? Array.from({ length: est.photos.length }, (_, i) => `/api/images/establishment/${est._id}/photo${i}`) 
          : []
      };
    });
    
    res.json(transformedEstablishments);
  } catch (error) {
    console.error('Error fetching establishments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single establishment by ID
app.get('/api/establishments/:id', async (req, res) => {
  try {
    const establishment = await Establishment.findById(req.params.id)
      .lean()
      .populate('owner', '_id username')
      .select('name description address rating reviewCount logo photos menu owner phoneNumber website hours');
    
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    // Transform the response to include image URLs instead of binary data
    const transformedEstablishment = {
      ...establishment,
      logoUrl: establishment._id ? `/api/images/establishment/${establishment._id}/logo` : null,
      photoUrls: establishment.photos && establishment.photos.length > 0 
        ? Array.from({ length: establishment.photos.length }, (_, i) => `/api/images/establishment/${establishment._id}/photo${i}`) 
        : [],
      menuUrls: establishment.menu && establishment.menu.length > 0 
        ? Array.from({ length: establishment.menu.length }, (_, i) => `/api/images/establishment/${establishment._id}/menu${i}`) 
        : []
    };
    
    res.json(transformedEstablishment);
  } catch (error) {
    console.error('Error fetching establishment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Check if it's a Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    console.log("🔍 Login attempt received for:", { username, userType });
    console.log("🔍 Password received:", password);

    if (!username || !password || !userType) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "All fields are required." });
    }

    let user;
    
    // Fetch user from correct collection and include password
    if (userType === "establishment") {
      user = await Establishment.findOne({ username }).select("+password");
    } else {
      user = await User.findOne({ username, userType }).select("+password");
    }

    if (!user) {
      console.log("❌ User not found in database");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("✅ User found:", user.username);
    console.log("🔍 Stored Hashed Password:", user.password);

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password does not match!");
      return res.status(401).json({ message: "Invalid username or password" });
    }

    console.log("✅ Password matched, generating token...");

    // Generate JWT Token
    const tokenPayload = {
      userId: user._id,
      userType,
      username: user.username
    };

    // For establishments, include establishment ID
    if (userType === "establishment") {
      tokenPayload.establishmentId = user._id;
    }

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Prepare user data to return (excluding sensitive info)
    const userData = {
      _id: user._id,
      username: user.username,
      userType,
      description: user.description || "",
      ...(userType === "establishment"
        ? {
            name: user.name,
            logo: user.logo || "default-establishment.jpg",
            address: user.address,
            phoneNumber: user.phoneNumber,
            website: user.website || ""
          }
        : {
            avatar: user.avatar || "default-avatar.jpg"
          }
      )
    };

    console.log("✅ Login successful! Sending response...");

    res.json({
      token: `Bearer ${token}`,
      user: userData
    });

  } catch (err) {
    console.error("❌ Server error during login:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});


// Signup Route with file upload
app.post("/api/signup", upload.single("avatar"), async (req, res) => {
  try {
    console.log("Received Signup Request Body:", req.body);
    console.log("Received File:", req.file);

    const { username, password, userType, description } = req.body;

    // Validate required fields
    if (!username || !password || !userType) {
      const missingFields = [];
      if (!username) missingFields.push('username');
      if (!password) missingFields.push('password');
      if (!userType) missingFields.push('userType');
      
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fields: missingFields
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.error("Username already exists:", username);
      return res.status(400).json({ message: "Username already taken." });
    }

    // Process avatar
    let avatar;
    if (req.file) {
      avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    } else {
      avatar = {
        data: fs.readFileSync(path.join(__dirname, 'default.jpg')),
        contentType: 'image/jpeg'
      };
    }

    // Create new user
    const newUser = new User({
      username,
      password,
      userType,
      avatar,
      description: description || ""
    });
    
    await newUser.save();
    console.log("User saved to database:", newUser);

    // Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, userType: newUser.userType }, 
      process.env.JWT_SECRET, 
      { expiresIn: "3h" }
    );

    console.log("Generated token and sending response");
    
    // Send success response
    res.status(201).json({ 
      message: "Signup successful",
      success: true,
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        userType: newUser.userType,
        avatar: newUser.avatar,
        description: newUser.description
      }
    });

  } catch (err) {
    console.error("Server Error in /api/signup:", err);
    res.status(500).json({ 
      message: "Internal server error", 
      error: err.message 
    });
  }
});

// Register Establishment Route
app.post("/api/register-establishment", upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'photos', maxCount: 5 },
  { name: 'menu', maxCount: 5 }
]), async (req, res) => {
  try {
    console.log("Received Establishment Registration Request:", req.body);
    console.log("Received Files:", req.files);

    const { 
      username, 
      password, 
      email,
      name, 
      description,
      address,
      phoneNumber,
      website,
      categories,
      hours,
      facilities
    } = req.body;

    // Validate required fields
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!password) missingFields.push('password');
    if (!email) missingFields.push('email');
    if (!name) missingFields.push('name');
    if (!address) missingFields.push('address');
    if (!phoneNumber) missingFields.push('phoneNumber');
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        fields: missingFields
      });
    }

    // Check if establishment already exists
    const existingEstablishment = await Establishment.findOne({ username });
    if (existingEstablishment) {
      console.error("Username already exists:", username);
      return res.status(400).json({ message: "Username already taken." });
    }

    // Process uploaded files
    let logo;
    if (req.files && req.files.logo && req.files.logo[0]) {
      logo = {
        data: req.files.logo[0].buffer,
        contentType: req.files.logo[0].mimetype,
        originalName: req.files.logo[0].originalname
      };
    } else {
      // Try to read the default logo from uploads directory
      const defaultLogoPath = path.join(__dirname, 'uploads', 'default-logo.png');
      try {
        if (fs.existsSync(defaultLogoPath)) {
          logo = {
            data: fs.readFileSync(defaultLogoPath),
            contentType: 'image/png',
            originalName: 'default-logo.png'
          };
        } else {
          // Create an empty logo object if default logo doesn't exist
          logo = {
            data: Buffer.from([]),
            contentType: 'image/png',
            originalName: 'default-logo.png'
          };
          console.warn('Default logo file not found at:', defaultLogoPath);
        }
      } catch (err) {
        console.error('Error reading default logo:', err);
        logo = {
          data: Buffer.from([]),
          contentType: 'image/png',
          originalName: 'default-logo.png'
        };
      }
    }

    // Process photos
    let photos = [];
    if (req.files && req.files.photos) {
      for (let i = 0; i < req.files.photos.length; i++) {
        photos.push({
          data: req.files.photos[i].buffer,
          contentType: req.files.photos[i].mimetype
        });
      }
    }

    // Process menu
    let menu = [];
    if (req.files && req.files.menu) {
      for (let i = 0; i < req.files.menu.length; i++) {
        menu.push({
          data: req.files.menu[i].buffer,
          contentType: req.files.menu[i].mimetype
        });
      }
    }

    // Create new establishment
    const newEstablishment = new Establishment({
      username,
      password, // TODO: Hash password before saving
      email,
      name,
      description: description || "",
      owner: req.userId, // Add owner reference if available from token
      logo,
      photos,
      menu,
      address,
      phoneNumber,
      website: website || "",
      categories: categories ? categories.split(',').map(cat => cat.trim()) : [],
      hours: hours ? JSON.parse(hours) : [],
      facilities: facilities ? JSON.parse(facilities) : []
    });

    await newEstablishment.save();
    console.log("Created new establishment:", newEstablishment.name);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newEstablishment._id, userType: 'establishment' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response
    res.status(201).json({
      message: "Establishment registered successfully",
      token,
      user: {
        _id: newEstablishment._id,
        username: newEstablishment.username,
        userType: 'establishment',
        name: newEstablishment.name,
        logo: newEstablishment.logo
      }
    });
  } catch (error) {
    console.error("Error in /api/register-establishment:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Edit User Account with file upload
app.post("/api/edit-account", upload.single("avatar"), async (req, res) => {
  try {
    console.log("Received Edit Account Request:", req.body);
    console.log("Received File:", req.file);
    
    const { id, username, oldPassword, password, description } = req.body;
    
    // Find the user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        status: "error", 
        message: "User not found" 
      });
    }

    if (oldPassword.trim() == "") {
      return res.status(400).json({ 
        status: "error", 
        message: "Input your password to proceed" 
      });
    }
    
    // Verify old password
    if (oldPassword !== user.password) {
      return res.status(400).json({ 
        status: "error", 
        message: "Current password is incorrect" 
      });
    }
    
    // Prepare update object
    const updateData = {};
    
    if (username && username.trim() !== "") {
      // Check if username is already taken by another user
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          status: "error", 
          message: "Username is already taken" 
        });
      }
      
      updateData.username = username;
    }
    
    if (password && password.trim() !== "") {
      updateData.password = password;
    }
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    // Handle avatar file upload
    if (req.file) {
      updateData.avatar = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    // Update the user
    await User.updateOne({ _id: id }, { $set: updateData });
    
    // Get the updated user data to return
    const updatedUser = await User.findById(id);
    
    return res.json({ 
      status: "success", 
      message: "Account updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        userType: updatedUser.userType,
        avatar: updatedUser.avatar,
        description: updatedUser.description
      }
    });
  } catch (error) {
    console.error("Error updating account:", error);
    return res.status(500).json({ 
      status: "error", 
      message: "An error occurred while updating the account" 
    });
  }
});

// Create a new review
app.post('/api/reviews', verifyToken, upload.array('photos', 5), async (req, res) => {
  try {
    const { title, body, rating, establishmentId } = req.body;
    
    if (!title || !body || !rating || !establishmentId) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Get photo paths if any were uploaded
    let photos = [];
    if (req.files) {
      for (let i = 0; i <req.files.length; i++) {
        photos.push({
          data: req.files[i].buffer,
          contentType: req.files[i].mimetype
        });
      }
    }
    
    const newReview = new Review({
      title,
      body,
      rating: Number(rating),
      photos,
      user: req.userId,
      establishment: establishmentId,
    });
    
    await newReview.save();   
    // Update establishment rating
    const establishment = await Establishment.findById(establishmentId);
    if (establishment) {
      const allReviews = await Review.find({ establishment: establishmentId });
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      establishment.rating = totalRating / allReviews.length;
      establishment.reviewCount = allReviews.length;
      await establishment.save();
    }
    // Populate user and establishment details
    const populatedReview = await Review.findById(newReview._id)
      .populate('user', 'username avatar')
      .populate('establishment', 'name logo');
    
    res.status(201).json(populatedReview);
  } catch (err) {
    console.error('Error creating review!!!!:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('establishment', 'name logo');
    
    // Transform the response to include image URLs instead of binary data
    const transformedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      
      // Add avatar URL for user
      if (reviewObj.user && reviewObj.user._id) {
        reviewObj.user.avatarUrl = `/api/images/user/${reviewObj.user._id}/avatar`;
        delete reviewObj.user.avatar; // Remove binary data
      }
      
      // Add logo URL for establishment
      if (reviewObj.establishment && reviewObj.establishment._id) {
        reviewObj.establishment.logoUrl = `/api/images/establishment/${reviewObj.establishment._id}/logo`;
        delete reviewObj.establishment.logo; // Remove binary data
      }
      
      // Add photo URLs for review
      if (reviewObj.photos && reviewObj.photos.length > 0) {
        reviewObj.photoUrls = reviewObj.photos.map((_, index) => 
          `/api/images/review/${reviewObj._id}/photo/${index}`
        );
      } else {
        reviewObj.photoUrls = [];
      }
      
      return reviewObj;
    });
    
    res.json(transformedReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this endpoint to serve review photos
app.get('/api/images/review/:reviewId/photo/:index', async (req, res) => {
  try {
    console.log('Entered Photos!')
    const review = await Review.findById(req.params.reviewId);
    const index = parseInt(req.params.index, 10);
    
    // Variable name mismatch: "photoIndex" vs "index"
    if (!review || !review.photos || !review.photos[index]) {
      return res.status(404).send('Photo not found');
    }
    
    // Set the appropriate content type
    res.set('Content-Type', review.photos[index].contentType);

    console.log('Review photos in API:', review.photos);
    console.log('Photos length in API:', review.photos ? review.photos.length : 'null');
    // Send the binary data
    res.send(review.photos[index].data);
  } catch (error) {
    console.error('Error fetching review photo:', error);
    res.status(500).send('Server error');
  }
});

// Get reviews by establishment ID
app.get('/api/reviews/establishment/:establishmentId', async (req, res) => {
  try {
    const { establishmentId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(establishmentId)) {
      return res.status(400).json({ message: 'Invalid establishment ID' });
    }
    
    const reviews = await Review.find({ establishment: establishmentId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('establishment', 'name logo');
    
    // Transform the response to include image URLs instead of binary data
    const transformedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      
      // Add avatar URL for user
      if (reviewObj.user && reviewObj.user._id) {
        reviewObj.user.avatarUrl = `/api/images/user/${reviewObj.user._id}/avatar`;
        delete reviewObj.user.avatar; // Remove binary data
      }
      
      // Add logo URL for establishment
      if (reviewObj.establishment && reviewObj.establishment._id) {
        reviewObj.establishment.logoUrl = `/api/images/establishment/${reviewObj.establishment._id}/logo`;
        delete reviewObj.establishment.logo; // Remove binary data
      }
      
      // Add photo URLs for review
      if (reviewObj.photos && reviewObj.photos.length > 0) {
        reviewObj.photoUrls = Array.from(
          { length: reviewObj.photos.length }, 
          (_, i) => `/api/images/review/${reviewObj._id}/photo/${i}`
        );
        // Don't delete photos, but replace binary data with empty objects to maintain the array length
        reviewObj.photos = Array(reviewObj.photos.length).fill({});
      } else {
        reviewObj.photoUrls = [];
        reviewObj.photos = [];
      }
      
      return reviewObj;
    });
    
    res.json(transformedReviews);
  } catch (err) {
    console.error('Error fetching reviews by establishment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reviews by user ID
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar')
      .populate('establishment', 'name logo');
    
    // Transform the response to include image URLs instead of binary data
    const transformedReviews = reviews.map(review => {
      const reviewObj = review.toObject();
      
      // Add avatar URL for user
      if (reviewObj.user && reviewObj.user._id) {
        reviewObj.user.avatarUrl = `/api/images/user/${reviewObj.user._id}/avatar`;
        delete reviewObj.user.avatar; // Remove binary data
      }
      
      // Add logo URL for establishment
      if (reviewObj.establishment && reviewObj.establishment._id) {
        reviewObj.establishment.logoUrl = `/api/images/establishment/${reviewObj.establishment._id}/logo`;
        delete reviewObj.establishment.logo; // Remove binary data
      }
      
      // Add photo URLs for review
      if (reviewObj.photos && reviewObj.photos.length > 0) {
        reviewObj.photoUrls = Array.from(
          { length: reviewObj.photos.length }, 
          (_, i) => `/api/images/review/${reviewObj._id}/photo/${i}`
        );
        // Don't delete photos, but replace binary data with empty objects to maintain the array length
        reviewObj.photos = Array(reviewObj.photos.length).fill({});
      } else {
        reviewObj.photoUrls = [];
        reviewObj.photos = [];
      }
      
      return reviewObj;
    });
    
    res.json(transformedReviews);
  } catch (err) {
    console.error('Error fetching reviews by user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
app.put('/api/reviews/:reviewId', verifyToken, upload.array('photos', 5), async (req, res) => {
  try {
    const { title, body, rating } = req.body;
    const reviewId = req.params.reviewId;
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user owns the review
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update review fields
    review.title = title || review.title;
    review.body = body || review.body;
    review.rating = rating ? Number(rating) : review.rating;
    
    // Add new photos if any were uploaded
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        review.photos.push({
          data: req.files[i].buffer,
          contentType: req.files[i].mimetype
        });
      }
    }
    
    await review.save();
    
    // Update establishment rating
    const establishment = await Establishment.findById(review.establishment);
    if (establishment) {
      const allReviews = await Review.find({ establishment: review.establishment });
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      establishment.rating = totalRating / allReviews.length;
      await establishment.save();
    }
    
    // Populate user and establishment details
    const populatedReview = await Review.findById(reviewId)
      .populate('user', 'username avatar')
      .populate('establishment', 'name logo');
    
    res.json(populatedReview);
  } catch (err) {
    console.error('Error updating review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get establishments owned by a specific user
app.get('/api/establishments/owner/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify that the requesting user is the same as the userId in the request
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    console.log(`Fetching establishments for user: ${userId}`);
    
    // Find establishments where the owner field matches the userId
    // OR where the _id matches the userId (for backward compatibility)
    const establishments = await Establishment.find({ 
      $or: [
        { owner: userId },
        { _id: userId } // For backward compatibility with old data structure
      ]
    })
      .populate('owner', '_id username')
      .lean();

    if (!establishments || establishments.length === 0) {
      return res.status(404).json({ message: 'No establishments found for this user' });
    }

    // Transform establishments to include image URLs
    const transformedEstablishments = establishments.map(est => ({
      ...est,
      logoUrl: est._id ? `/api/images/establishment/${est._id}/logo` : null,
      photoUrls: est.photos && est.photos.length > 0 
        ? Array.from({ length: est.photos.length }, (_, i) => `/api/images/establishment/${est._id}/photo${i}`) 
        : []
    }));

    res.json(transformedEstablishments);
  } catch (error) {
    console.error('Error fetching owner establishments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
app.delete('/api/reviews/:id', verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id;
    
    // Find the review first to get the establishment ID for rating recalculation
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if the user is the owner of the review
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    // Store the establishment ID before deleting
    const establishmentId = review.establishment;
    
    // Delete the review
    await Review.findByIdAndDelete(reviewId);
    
    // Update establishment rating
    const establishment = await Establishment.findById(establishmentId);
    if (establishment) {
      const allReviews = await Review.find({ establishment: establishmentId });
      
      if (allReviews.length > 0) {
        // Recalculate average rating if there are still reviews
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        establishment.rating = totalRating / allReviews.length;
      } else {
        // Reset rating if no reviews left
        establishment.rating = 0;
      }
      
      establishment.reviewCount = allReviews.length;
      await establishment.save();
    }
    
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update establishment details
app.put('/api/establishments/:id', verifyToken, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, address, phoneNumber, website } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid establishment ID' });
    }
    
    // Find the establishment
    const establishment = await Establishment.findById(id);
    
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    // Update the establishment fields
    const updateData = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (address) updateData.address = address;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (website) updateData.website = website;
    
    // Handle logo upload if provided
    if (req.file) {
      updateData.logo = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    // Update the establishment
    const updatedEstablishment = await Establishment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).populate('owner', 'username');
    
    res.json(updatedEstablishment);
  } catch (error) {
    console.error('Error updating establishment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.put('/api/reviews/:id', verifyToken, async (req, res) => {
  try {
    const { title, body, rating } = req.body;
    
    if (updateData.logo && typeof updateData.logo !== "string") {
      delete updateData.logo; // Remove 'logo' field on the backend
  }
    // Find the review
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the authenticated user is the review owner
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      { title, body, rating },
      { new: true }
    );
    
    const reviewWithEstablishment = await Review.findById(updatedReview._id).populate("establishment");
    
    if (reviewWithEstablishment.establishment?.logo) {
      reviewWithEstablishment.establishment.logo = {
        data: reviewWithEstablishment.establishment.logo.data.toString("base64"), // Convert binary to base64
        contentType: reviewWithEstablishment.establishment.logo.contentType,
      };
    }
    
    res.json(reviewWithEstablishment);
    
    

    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found after update" });
    }

    // Convert Mongoose document to a plain object
    let updatedReviewObject = updatedReview.toObject();

    // Ensure `logo` is removed from `establishment`
    if (updatedReviewObject.establishment) {
      delete updatedReviewObject.establishment.logo;
    }

    // Log the response being sent
    console.log("Updated review response:", updatedReviewObject);

    res.json(updatedReviewObject); // Send the cleaned response

  } catch (err) {
    console.error("Error updating review:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Upload establishment photos
app.post('/api/establishments/:id/photos', verifyToken, upload.array('photos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid establishment ID' });
    }
    
    // Find the establishment
    const establishment = await Establishment.findById(id);
    
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    // Check if the user is the owner
    if (req.userId !== establishment.owner.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this establishment' });
    }
    
    // Process uploaded photos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }
    
    const photos = req.files.map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    }));
    
    // Add new photos to the establishment
    establishment.photos = establishment.photos || [];
    establishment.photos.push(...photos);
    
    await establishment.save();
    
    res.json({ message: 'Photos uploaded successfully', photoCount: establishment.photos.length });
  } catch (error) {
    console.error('Error uploading establishment photos:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete establishment photo
app.delete('/api/establishments/:id/photos/:photoIndex', verifyToken, async (req, res) => {
  try {
    const { id, photoIndex } = req.params;
    const index = parseInt(photoIndex, 10);
    
    if (!mongoose.Types.ObjectId.isValid(id) || isNaN(index)) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }
    
    // Find the establishment
    const establishment = await Establishment.findById(id);
    
    if (!establishment) {
      return res.status(404).json({ message: 'Establishment not found' });
    }
    
    // Check if the user is the owner
    if (req.userId !== establishment.owner.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this establishment' });
    }
    
    // Check if the photo exists
    if (!establishment.photos || index >= establishment.photos.length) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    // Remove the photo
    establishment.photos.splice(index, 1);
    await establishment.save();
    
    res.json({ message: 'Photo deleted successfully', photoCount: establishment.photos.length });
  } catch (error) {
    console.error('Error deleting establishment photo:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/reviews/:reviewId/vote', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { vote } = req.body;
    
    console.log('Vote request received:', { 
      reviewId, 
      vote, 
      userId: req.userId,
      userIdType: typeof req.userId 
    });

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    console.log('Review votes before update:', { 
      _id: review._id,
      helpfulCount: review.helpfulCount, 
      unhelpfulCount: review.unhelpfulCount,
      votesCount: review.votes.length
    });
    
    // Check if the user has already voted on this review
    const existingVoteIndex = review.votes.findIndex(
      v => v.user.toString() === req.userId
    );
    
    console.log('Existing vote check:', { 
      existingVoteIndex, 
      hasVoted: existingVoteIndex !== -1,
      requestUserId: req.userId,
      allVoteUserIds: review.votes.map(v => v.user.toString())
    });
    
    let updatedVoteType = vote;
    
    if (existingVoteIndex !== -1) {
      // User has already voted
      const existingVote = review.votes[existingVoteIndex];
      console.log('Existing vote found:', { 
        existingVoteType: existingVote.voteType, 
        newVoteType: vote 
      });
      
      // If same vote, remove the vote and decrement count
      if (existingVote.voteType === vote) {
        review.votes.splice(existingVoteIndex, 1);
        if (vote === 'helpful') {
          review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        } else {
          review.unhelpfulCount = Math.max(0, review.unhelpfulCount - 1);
        }
        updatedVoteType = null; // Removed vote
      } 
      // If different vote, update the vote and adjust counts
      else {
        if (existingVote.voteType === 'helpful') {
          review.helpfulCount = Math.max(0, review.helpfulCount - 1);
          review.unhelpfulCount += 1;
        } else {
          review.unhelpfulCount = Math.max(0, review.unhelpfulCount - 1);
          review.helpfulCount += 1;
        }
        existingVote.voteType = vote;
      }
    } 
    // New vote
    else {
      review.votes.push({ 
        user: req.userId, 
        voteType: vote 
      });
      
      // Increment appropriate count
      if (vote === 'helpful') {
        review.helpfulCount += 1;
      } else {
        review.unhelpfulCount += 1;
      }
    }
    
    console.log('Review after update (before save):', { 
      helpfulCount: review.helpfulCount, 
      unhelpfulCount: review.unhelpfulCount,
      votesCount: review.votes.length
    });
    
    // Save the review
    await review.save();
    
    // Fetch the fresh review to confirm changes were saved
    const updatedReview = await Review.findById(reviewId);
    console.log('Review after save:', { 
      helpfulCount: updatedReview.helpfulCount, 
      unhelpfulCount: updatedReview.unhelpfulCount,
      votesCount: updatedReview.votes.length
    });
    
    console.log('User vote lookup:', {
      userId: req.userId,
      votes: updatedReview.votes.map(v => ({
        voteUser: v.user.toString(),
        voteType: v.voteType,
        matches: v.user.toString() === req.userId
      }))
    });

    // Find user's current vote
    const userVote = updatedReview.votes.find(
      v => v.user.toString() === req.userId
    )?.voteType || null;
    
    console.log('Response being sent:', { 
      reviewId, 
      userVote: userVote ? userVote.voteType : null,
      helpfulCount: updatedReview.helpfulCount, 
      unhelpfulCount: updatedReview.unhelpfulCount 
    });
    
    res.json({ 
      reviewId,
      userVote: userVote ? userVote.voteType : null,
      helpfulCount: updatedReview.helpfulCount,
      unhelpfulCount: updatedReview.unhelpfulCount
    });
  } catch (err) {
    console.error('Error processing review vote:', err);
    res.status(500).json({ message: 'Server error processing vote' });
  }
});

app.get('/api/reviews/:reviewId/votes', async (req, res) => {
  try {
    const { reviewId } = req.params;
    let userId = null;
    
    // Optional: Get the user ID from token if available
    // This allows returning the user's vote status if they're logged in
    try {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      }
    } catch (tokenErr) {
      // If token is invalid, just continue without user identification
      console.log('Token validation error:', tokenErr.message);
    }
    
    console.log('Votes retrieval request:', { 
      reviewId, 
      authenticatedUser: userId ? true : false
    });

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Get the user's vote if they're logged in
    let userVote = null;
    if (userId) {
      const userVoteObj = review.votes.find(
        v => v.user.toString() === userId
      );
      userVote = userVoteObj ? userVoteObj.voteType : null;
    }
    
    console.log('Sending review vote data:', {
      reviewId,
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
      userVote,
      totalVotes: review.votes.length
    });
    
    // Return the vote counts and user's vote if available
    res.json({
      reviewId,
      helpfulCount: review.helpfulCount,
      unhelpfulCount: review.unhelpfulCount,
      userVote
    });
    
  } catch (err) {
    console.error('Error retrieving review votes:', err);
    res.status(500).json({ message: 'Server error retrieving votes' });
  }
});

// Get all establishments
app.get('/api/establishments', async (req, res) => {
  try {
    const establishments = await Establishment.find()
      .lean()
      .select('name description rating reviewCount logo photos')
      .sort({ name: 1 });
    
    // Transform the response to include image URLs instead of binary data
    const transformedEstablishments = establishments.map(est => {
      return {
        ...est,
        logoUrl: est._id ? `/api/images/establishment/${est._id}/logo` : null,
        photoUrls: est.photos && est.photos.length > 0 
          ? Array.from({ length: est.photos.length }, (_, i) => `/api/images/establishment/${est._id}/photo${i}`) 
          : []
      };
    });
    
    res.json(transformedEstablishments);
  } catch (error) {
    console.error('Error fetching establishments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/reviews/:reviewId/reply', verifyToken, async (req, res) => {
  console.log("Received reply request for review ID:", req.params.reviewId);
  try {
    const { reviewId } = req.params;
    const { content, establishmentId } = req.body;
    
    // Verify the user is the establishment owner

    const reply = {
      reviewId,
      content,
      establishmentId,
      createdAt: new Date()
    };

    await reply.save().catch(error => console.error("Database save error:", error));

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $push: { replies: reply } },
      { new: true }
    );

    res.json(reply);
  } catch (error) {
    res.status(500).json({ message: 'Error adding reply' });
  }
});

app.get('/:reviewId/replies', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    res.json(review.replies || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching replies' });
  }
});

// Set the port for the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


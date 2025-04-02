// middleware/tokenRefresh.js

const jwt = require('jsonwebtoken');

const tokenRefreshMiddleware = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

    if (decoded.rememberMe) {
      // Create a new token with extended expiration
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          userType: decoded.userType,
          username: decoded.username,
          ...(decoded.establishmentId && { establishmentId: decoded.establishmentId }),
          rememberMe: true
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "21d" }
      );
      const now = new Date();
      const expiryDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
    
      res.setHeader('X-Refresh-Token', `Bearer ${newToken}`);
      res.setHeader('X-Token-Expiry', expiryDate.toISOString());
    }
    
    next();
  } catch (error) {
    // If token verification fails, just continue without refreshing
    next();
  }
};

module.exports = tokenRefreshMiddleware;
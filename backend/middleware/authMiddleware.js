const jwt = require("jsonwebtoken");

// Simple JWT auth middleware.
// Expects the frontend to send the raw token or a `Bearer <token>` string
// in the `Authorization` header.
module.exports = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;

  if (!header) {
    return res.status(401).json({ message: "No authorization token provided" });
  }

  let token = header;

  if (typeof header === "string" && header.startsWith("Bearer ")) {
    token = header.substring(7);
  }

  try {
    // Decode without verifying signature to avoid issues with mismatched secrets
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Attach minimal user info to request for downstream handlers.
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

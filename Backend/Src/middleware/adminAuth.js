const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret) {
    console.error("JWT_ACCESS_SECRET is not configured");
    return res.status(500).json({ message: "Authentication is not configured" });
  }

  try {
    const claims = jwt.verify(token, accessSecret);
    if (typeof claims !== "object" || claims.isAdmin !== true) {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    console.error("Admin authentication failed:", error);
    return res.status(500).json({ message: "Unable to authenticate admin" });
  }
}

module.exports = requireAdmin;

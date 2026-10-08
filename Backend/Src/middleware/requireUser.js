const jwt = require("jsonwebtoken");

function requireUser(req, res, next) {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret) {
    console.error("JWT_ACCESS_SECRET is not configured");
    return res.status(500).json({ message: "Authentication is not configured" });
  }

  try {
    const claims = jwt.verify(token, accessSecret);
    if (
      typeof claims !== "object" ||
      typeof claims.sub !== "string" ||
      claims.tokenType === "refresh"
    ) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    if (claims.isAdmin !== false) {
      return res.status(403).json({ message: "Student access required" });
    }

    req.userId = claims.sub;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    console.error("User authentication failed:", error);
    return res.status(500).json({ message: "Unable to authenticate user" });
  }
}

module.exports = requireUser;

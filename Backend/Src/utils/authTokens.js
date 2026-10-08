const jwt = require("jsonwebtoken");

function createAuthTokens(user) {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!accessSecret || accessSecret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must contain at least 32 characters");
  }

  if (!refreshSecret || refreshSecret.length < 32) {
    throw new Error("JWT_REFRESH_SECRET must contain at least 32 characters");
  }

  if (accessSecret === refreshSecret) {
    throw new Error("JWT access and refresh secrets must be different");
  }

  const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const claims = {
    sub: user._id.toString(),
    isAdmin: user.isAdmin,
  };

  return {
    accessToken: jwt.sign(claims, accessSecret, { expiresIn: accessExpiresIn }),
    refreshToken: jwt.sign(
      { ...claims, tokenType: "refresh" },
      refreshSecret,
      { expiresIn: refreshExpiresIn },
    ),
    accessTokenExpiresIn: accessExpiresIn,
    refreshTokenExpiresIn: refreshExpiresIn,
  };
}

module.exports = createAuthTokens;

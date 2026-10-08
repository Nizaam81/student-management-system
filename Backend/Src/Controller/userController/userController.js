const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../../model/userSchema");
const createAuthTokens = require("../../utils/authTokens");

async function getCurrentUser(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const user = await User.findById(req.userId).select(
      "studentId name email phone isAdmin createdAt",
    );

    if (!user || user.isAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Fetching user profile failed:", error);
    return res.status(500).json({ message: "Unable to fetch user profile" });
  }
}

async function updateProfile(req, res) {
  const { name, phone } = req.body ?? {};
  const errors = {};
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedPhone = typeof phone === "string" ? phone.trim() : "";

  if (normalizedName.length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }

  if (!/^[1-9]\d{9}$/.test(normalizedPhone)) {
    errors.phone = "Phone must be a positive 10-digit number";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { name: normalizedName, phone: normalizedPhone } },
      { returnDocument: "after", runValidators: true },
    ).select("studentId name email phone isAdmin createdAt");

    if (!user || user.isAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.phone) {
      return res.status(409).json({ message: "Phone number is already registered" });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.fromEntries(
        Object.entries(error.errors).map(([field, validationError]) => [
          field,
          validationError.message,
        ]),
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    console.error("Updating user profile failed:", error);
    return res.status(500).json({ message: "Unable to update user profile" });
  }
}

async function signup(req, res) {
  const { name, email, phone, password } = req.body ?? {};
  const errors = {};

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone =
    typeof phone === "string"
      ? phone.trim()
      : typeof phone === "number" && Number.isSafeInteger(phone)
        ? String(phone)
        : "";

  if (normalizedName.length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!/^[1-9]\d{9}$/.test(normalizedPhone)) {
    errors.phone = "Phone must be a positive 10-digit number";
  }

  if (typeof password !== "string" || password.trim().length === 0) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    })
      .select("email phone")
      .lean();

    if (existingUser) {
      const duplicateErrors = {};
      if (existingUser.email === normalizedEmail) {
        duplicateErrors.email = "Email address is already registered";
      }
      if (existingUser.phone === normalizedPhone) {
        duplicateErrors.phone = "Phone number is already registered";
      }

      return res.status(409).json({
        message: "Email address or phone number is already registered",
        errors: duplicateErrors,
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern ?? {})[0];
      const label = field === "phone" ? "Phone number" : "Email address";
      return res.status(409).json({ message: `${label} is already registered` });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const validationErrors = Object.fromEntries(
        Object.entries(error.errors).map(([field, validationError]) => [
          field,
          validationError.message,
        ]),
      );
      return res.status(400).json({
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    console.error("Signup failed:", error);
    return res.status(500).json({ message: "Unable to create account" });
  }
}

async function login(req, res) {
  const { email, password } = req.body ?? {};
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({
      message: "Validation failed",
      errors: { email: "Enter a valid email address" },
    });
  }

  if (typeof password !== "string" || password.length === 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: { password: "Password is required" },
    });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: "Admin users are not allowed to log in here" });
    }

    const tokens = createAuthTokens(user);
    return res.status(200).json({
      message: "Login successful",
      tokens,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
}

module.exports = { signup, login, getCurrentUser, updateProfile };

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../../model/userSchema");
const createAuthTokens = require("../../utils/authTokens");

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

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    const tokens = createAuthTokens(user);
    return res.status(200).json({
      message: "Admin login successful",
      tokens,
      user: {
        id: user._id,
        studentId: user.studentId,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    return res.status(500).json({ message: "Unable to log in" });
  }
}

async function addStudent(req, res) {
  const {
    name,
    email,
    phone,
    password,
  } = req.body ?? {};
  const errors = {};

  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedEmail =
    typeof email === "string" ? email.trim().toLowerCase() : "";
  const normalizedPhone =
    typeof phone === "string" ? phone.replace(/[\s().-]/g, "") : "";

  if (normalizedName.length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!/^\+?[1-9]\d{6,14}$/.test(normalizedPhone)) {
    errors.phone = "Enter a valid phone number";
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
    const student = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      isAdmin: false,
    });

    return res.status(201).json({
      message: "Student added successfully",
      user: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        createdAt: student.createdAt,
        isAdmin: student.isAdmin,
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

    console.error("Adding student failed:", error);
    return res.status(500).json({ message: "Unable to add student" });
  }
}

async function getStudents(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const students = await User.find({ isAdmin: { $ne: true } })
      .select("studentId name email phone createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ users: students });
  } catch (error) {
    console.error("Fetching students failed:", error);
    return res.status(500).json({ message: "Unable to fetch students" });
  }
}

async function updateStudent(req, res) {
  const { studentId } = req.params;
  const { name, phone } = req.body ?? {};
  const errors = {};
  const normalizedName = typeof name === "string" ? name.trim() : "";
  const normalizedPhone =
    typeof phone === "string" ? phone.replace(/[\s().-]/g, "") : "";
  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  if (normalizedName.length < 3) {
    errors.name = "Name must be at least 3 characters long";
  }
  if (!/^\+?[1-9]\d{6,14}$/.test(normalizedPhone)) {
    errors.phone = "Enter a valid phone number";
  }
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: "Validation failed", errors });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const student = await User.findOne({
      _id: studentId,
      isAdmin: { $ne: true },
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.name = normalizedName;
    student.phone = normalizedPhone;
    await student.save();

    return res.status(200).json({
      message: "Student updated successfully",
      user: {
        id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        phone: student.phone,
        createdAt: student.createdAt,
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

    console.error("Updating student failed:", error);
    return res.status(500).json({ message: "Unable to update student" });
  }
}

async function deleteStudent(req, res) {
  const { studentId } = req.params;

  if (!mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ message: "Invalid student ID" });
  }

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: "Database is not connected" });
  }

  try {
    const student = await User.findOneAndDelete({
      _id: studentId,
      isAdmin: { $ne: true },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Deleting student failed:", error);
    return res.status(500).json({ message: "Unable to delete student" });
  }
}

module.exports = {
  login,
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
};

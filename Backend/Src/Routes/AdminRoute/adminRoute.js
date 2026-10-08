const express = require("express");
const router = express.Router();

const adminController = require("../../Controller/AdminController/adminController");
const requireAdmin = require("../../middleware/adminAuth");

router.post("/login", adminController.login);
router.get("/students", requireAdmin, adminController.getStudents);
router.post("/add-student", requireAdmin, adminController.addStudent);
router.patch("/students/:studentId", requireAdmin, adminController.updateStudent);
router.delete("/students/:studentId", requireAdmin, adminController.deleteStudent);

module.exports = router;
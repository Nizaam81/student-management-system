const express = require("express");
const router = express.Router();

const userController = require("../../Controller/userController/userController");
const requireUser = require("../../middleware/requireUser");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/me", requireUser, userController.getCurrentUser);
router.patch("/profile", requireUser, userController.updateProfile);

module.exports = router;
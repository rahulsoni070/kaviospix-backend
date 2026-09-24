const express = require("express");
const { protect } = require("../middleware/auth");
const { getUsers } = require("../controllers/user.controller");

const router = express.Router();

router.get("/", protect, getUsers);

module.exports = router;
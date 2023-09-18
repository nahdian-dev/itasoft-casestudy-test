const express = require("express");
const MainController = require("../controllers/main.controller");

// Instance
const router = express.Router();

router.get("/", MainController.main);

module.exports = router;
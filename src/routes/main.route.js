const express = require("express");
const MainController = require("../controllers/main.controller");

// Instance
const router = express.Router();

router.post("/daftar", MainController.daftar);

module.exports = router;
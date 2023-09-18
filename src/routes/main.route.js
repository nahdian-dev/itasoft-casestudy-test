const express = require("express");
const MainController = require("../controllers/main.controller");

// Instance
const router = express.Router();

router.post("/daftar", MainController.daftar);
router.post("/tabung", MainController.tabung);
router.post("/tarik", MainController.tarik);
router.get("/saldo/:no_rekening", MainController.saldo);

module.exports = router;
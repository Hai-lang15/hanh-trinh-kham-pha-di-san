const express = require("express");
const router = express.Router();
const diSanController = require("../Controller/disanController");
const upload = require("../middleware/upload");

router.get("/", diSanController.getAllDiSan);
router.get("/:id", diSanController.getDiSanById);
router.post("/",upload.single("hinh_anh"),diSanController.createDiSan);
router.put("/:id",upload.single("hinh_anh"),diSanController.updateDiSan);
router.delete("/:id", diSanController.deleteDiSan);

module.exports = router;
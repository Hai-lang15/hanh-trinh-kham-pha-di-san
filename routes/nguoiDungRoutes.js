const express = require("express");
const router = express.Router();
const nguoiDungController = require("../Controller/nguoiDungController");
const { kiemTraAdmin } = require("../middleware/auth");

router.get("/", kiemTraAdmin, nguoiDungController.getAllNguoiDung);
router.get("/:id", kiemTraAdmin, nguoiDungController.getNguoiDungById);
router.post("/", kiemTraAdmin, nguoiDungController.createNguoiDung);
router.put("/:id", kiemTraAdmin, nguoiDungController.updateNguoiDung);
router.delete("/:id", kiemTraAdmin, nguoiDungController.deleteNguoiDung);

module.exports = router;
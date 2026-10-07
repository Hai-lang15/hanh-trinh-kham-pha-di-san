const express = require("express");
const router = express.Router();
const authController = require("../Controller/authController");
router.post("/dang-ky", authController.dangKy);
router.post("/dang-nhap", authController.dangNhap);
router.post("/dang-xuat", authController.dangXuat);
router.get("/toi", authController.kiemTraDangNhap);
module.exports = router;
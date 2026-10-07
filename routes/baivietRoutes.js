const express = require("express");
const router = express.Router();
const baiVietController = require("../Controller/baiVietController");
const upload = require("../middleware/upload");
const { kiemTraDangNhap, kiemTraAdmin } = require("../middleware/auth");

router.get("/", baiVietController.getAllBaiViet);
router.get("/:id", baiVietController.getBaiVietById);

router.post("/", kiemTraDangNhap, upload.array("hinh_anh", 20), (req, res, next) => {
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);
    next();
}, baiVietController.createBaiViet);

router.put("/:id", kiemTraAdmin, upload.array("hinh_anh", 20), baiVietController.updateBaiViet);
router.delete("/:id", kiemTraAdmin, baiVietController.deleteBaiViet);

module.exports = router;
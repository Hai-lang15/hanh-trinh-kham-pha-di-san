const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../Controller/noiDungBaiVietController");
const { kiemTraAdmin } = require("../middleware/auth");

router.get("/:baiVietId", controller.getByBaiVietId);
router.post("/:baiVietId", kiemTraAdmin, upload.any(), controller.create);

module.exports = router;
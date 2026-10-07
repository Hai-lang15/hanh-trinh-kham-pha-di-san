const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const controller = require("../Controller/hinhAnhDiSanController");

router.get("/:diSanId", controller.getByDiSanId);
router.post("/:diSanId", upload.array("hinh_anh", 20), controller.create);
router.delete("/:id", controller.remove);

module.exports = router;
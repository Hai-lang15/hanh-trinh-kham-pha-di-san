const express = require("express");
const router = express.Router();

const uploadVideo = require("../middleware/uploadVideo");
const controller = require("../Controller/videoDiSanController");

router.get("/:diSanId", controller.getByDiSanId);

router.post(
    "/:diSanId",
    uploadVideo.array("video", 10),
    controller.create
);

router.delete("/:id", controller.remove);

module.exports = router;
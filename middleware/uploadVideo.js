const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/videos/");
    },

    filename: function (req, file, cb) {
        const tenFile = Date.now() + path.extname(file.originalname);
        cb(null, tenFile);
    }
});

const uploadVideo = multer({
    storage: storage,

    limits: {
        fileSize: 100 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {
        const duoiFile = path.extname(file.originalname).toLowerCase();

        const dinhDangVideo = [
            ".mp4",
            ".webm",
            ".mov"
        ];

        if (dinhDangVideo.includes(duoiFile)) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ được upload MP4, WEBM hoặc MOV"));
        }
    }
});

module.exports = uploadVideo;
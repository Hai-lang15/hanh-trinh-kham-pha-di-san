const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        const tenFile = Date.now() + path.extname(file.originalname);
        cb(null, tenFile);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: function (req, file, cb) {
        const duoiFile = path.extname(file.originalname).toLowerCase();

        if ([".jpg", ".jpeg", ".png", ".webp"].includes(duoiFile)) {
            cb(null, true);
        } else {
            cb(new Error("Chỉ được upload JPG, JPEG, PNG hoặc WEBP"));
        }
    }
});

module.exports = upload;
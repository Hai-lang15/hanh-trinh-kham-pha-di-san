const express = require("express");
const router = express.Router();

const khaoSatController = require("../Controller/khaoSatController");

const kiemTraAdminAPI = (req, res, next) => {
    if (!req.session || !req.session.nguoiDung) {
        return res.status(401).json({
            message: "Bạn cần đăng nhập để xem kết quả khảo sát"
        });
    }

    if (req.session.nguoiDung.vai_tro !== "quan_tri_vien") {
        return res.status(403).json({
            message: "Bạn không có quyền xem kết quả khảo sát"
        });
    }

    next();
};

// Người dùng có thể gửi phản hồi công khai
router.post("/", khaoSatController.createKhaoSat);

// Chỉ quản trị viên được xem các phản hồi
router.get("/", kiemTraAdminAPI, khaoSatController.getAllKhaoSat);

module.exports = router;
const khaoSatModel = require("../Model/khaoSatModel");

const doiTuongHopLe = [
    "Sinh viên",
    "Người dân",
    "Giáo viên",
    "Khác"
];

const mucDichHopLe = [
    "Tìm hiểu di sản",
    "Tra cứu địa chỉ, bản đồ",
    "Xem hình ảnh, video",
    "Đọc bài viết",
    "Phục vụ học tập / giảng dạy",
    "Khác"
];

const cacTieuChi = [
    "giao_dien",
    "de_su_dung",
    "noi_dung",
    "hinh_anh_ban_do",
    "toc_do"
];

const getAllKhaoSat = (req, res) => {
    khaoSatModel.getAll((err, result) => {
        if (err) {
            console.error("Lỗi lấy khảo sát:", err);
            return res.status(500).json({
                message: "Không thể lấy danh sách khảo sát"
            });
        }

        res.json(result);
    });
};

const createKhaoSat = (req, res) => {
    const body = req.body || {};

    const doiTuong = String(body.doi_tuong || "").trim();
    const mucDich = String(body.muc_dich || "").trim();
    const hoTen = String(body.ho_ten || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const gopY = String(body.gop_y || "").trim();

    const dongY =
        body.dong_y === true ||
        body.dong_y === 1 ||
        body.dong_y === "1" ||
        body.dong_y === "true";

    if (!doiTuongHopLe.includes(doiTuong)) {
        return res.status(400).json({
            message: "Đối tượng khảo sát không hợp lệ"
        });
    }

    if (!mucDichHopLe.includes(mucDich)) {
        return res.status(400).json({
            message: "Mục đích truy cập không hợp lệ"
        });
    }

    if (!dongY) {
        return res.status(400).json({
            message: "Bạn cần đồng ý gửi phản hồi"
        });
    }

    if (hoTen.length > 100) {
        return res.status(400).json({
            message: "Họ tên không được vượt quá 100 ký tự"
        });
    }

    if (email.length > 150) {
        return res.status(400).json({
            message: "Email không được vượt quá 150 ký tự"
        });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Email không đúng định dạng"
        });
    }

    if (gopY.length > 2000) {
        return res.status(400).json({
            message: "Ý kiến không được vượt quá 2000 ký tự"
        });
    }

    const diemSo = {};

    for (const key of cacTieuChi) {
        const value = body[key];

        if (
            value === undefined ||
            value === null ||
            value === "" ||
            !Number.isInteger(Number(value)) ||
            Number(value) < 1 ||
            Number(value) > 5
        ) {
            return res.status(400).json({
                message: `Điểm "${key}" phải là số nguyên từ 1 đến 5`
            });
        }

        diemSo[key] = Number(value);
    }

    const data = {
        doi_tuong: doiTuong,
        ho_ten: hoTen || null,
        email: email || null,
        muc_dich: mucDich,
        ...diemSo,
        gop_y: gopY || null,
        dong_y: 1
    };

    khaoSatModel.create(data, (err, result) => {
        if (err) {
            console.error("Lỗi lưu khảo sát:", err);

            return res.status(500).json({
                message: "Không thể lưu phản hồi khảo sát"
            });
        }

        res.status(201).json({
            message: "Cảm ơn bạn! Phản hồi đã được lưu thành công.",
            id: result.insertId
        });
    });
};

module.exports = {
    getAllKhaoSat,
    createKhaoSat
};
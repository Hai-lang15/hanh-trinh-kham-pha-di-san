const diSanModel = require("../Model/disanModel");
const getAllDiSan = (req, res) => {
    diSanModel.getAll((err, result) => {
        if (err) {
            console.log("Lỗi lấy danh sách di sản:", err);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách di sản" });
        }
        res.json(result);
    });
};
const getDiSanById = (req, res) => {
    const id = req.params.id;
    diSanModel.getById(id, (err, result) => {
        if (err) {
            console.log("Lỗi lấy di sản:", err);
            return res.status(500).json({ message: "Lỗi khi lấy di sản" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy di sản" });
        }
        res.json(result[0]);
    });
};
const createDiSan = (req, res) => {
    const data = req.body;
    if (!data.ten_di_san || !data.dia_chi) {
        return res.status(400).json({ message: "Tên di sản và địa chỉ là bắt buộc" });
    }
    if (req.file) {
        data.hinh_anh = "/uploads/" + req.file.filename;
    } else {
        data.hinh_anh = null;
    }
    diSanModel.create(data, (err, result) => {
        if (err) {
            console.log("Lỗi thêm di sản:", err);
            return res.status(500).json({ message: "Không thể thêm di sản" });
        }
        res.status(201).json({ message: "Thêm di sản thành công", id: result.insertId });
    });
};
const updateDiSan = (req, res) => {
    const id = req.params.id;
    const data = req.body;
    diSanModel.getById(id, (err, result) => {
        if (err) {
            console.log("Lỗi lấy di sản:", err);
            return res.status(500).json({ message: "Lỗi khi lấy di sản" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy di sản" });
        }
        if (req.file) {
            data.hinh_anh = "/uploads/" + req.file.filename;
        } else {
            data.hinh_anh = result[0].hinh_anh;
        }
        diSanModel.update(id, data, (err, updateResult) => {
            if (err) {
                console.log("Lỗi cập nhật:", err);
                return res.status(500).json({ message: "Không thể cập nhật di sản" });
            }
            res.json({ message: "Cập nhật di sản thành công" });
        });
    });
};
const deleteDiSan = (req, res) => {
    const id = req.params.id;
    diSanModel.remove(id, (err, result) => {
        if (err) {
            console.log("Lỗi xóa di sản:", err);
            return res.status(500).json({ message: "Không thể xóa di sản" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy di sản" });
        }
        res.json({ message: "Xóa di sản thành công" });
    });
};
module.exports = {
    getAllDiSan,
    getDiSanById,
    createDiSan,
    updateDiSan,
    deleteDiSan
};
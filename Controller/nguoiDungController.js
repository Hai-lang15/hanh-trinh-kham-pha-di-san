const bcrypt = require("bcryptjs");
const nguoiDungModel = require("../Model/nguoiDungModel");
const getAllNguoiDung = (req, res) => {
    nguoiDungModel.getAll((err, result) => {
        if (err) {
            console.log("Lỗi lấy người dùng:", err);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng" });
        }
        res.json(result);
    });
};
const getNguoiDungById = (req, res) => {
    const id = req.params.id;
    nguoiDungModel.getById(id, (err, result) => {
        if (err) {
            console.log("Lỗi:", err);
            return res.status(500).json({ message: "Lỗi khi lấy người dùng" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.json(result[0]);
    });
};
const createNguoiDung = async (req, res) => {
    const data = req.body;
    if (!data.ho_ten || !data.email || !data.mat_khau) {
        return res.status(400).json({ message: "Họ tên, email và mật khẩu là bắt buộc" });
    }
    try {
        data.mat_khau = await bcrypt.hash(data.mat_khau, 10);
        nguoiDungModel.create(data, (err, result) => {
            if (err) {
                console.log("Lỗi thêm người dùng:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email đã tồn tại" });
                }
                return res.status(500).json({ message: "Không thể thêm người dùng" });
            }
            res.status(201).json({ message: "Thêm người dùng thành công", id: result.insertId });
        });
    } catch (error) {
        console.log("Lỗi mã hóa mật khẩu:", error);
        res.status(500).json({ message: "Không thể mã hóa mật khẩu" });
    }
};
const updateNguoiDung = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    if (!data.ho_ten || !data.email) {
        return res.status(400).json({ message: "Họ tên và email là bắt buộc" });
    }
    try {
        if (data.mat_khau) {
            data.mat_khau = await bcrypt.hash(data.mat_khau, 10);
        } else {
            const nguoiDung = await new Promise((resolve, reject) => {
                nguoiDungModel.getById(id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            if (nguoiDung.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            data.mat_khau = nguoiDung[0].mat_khau;
        }
        nguoiDungModel.update(id, data, (err, result) => {
            if (err) {
                console.log("Lỗi cập nhật:", err);
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email đã tồn tại" });
                }
                return res.status(500).json({ message: "Không thể cập nhật người dùng" });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }
            res.json({ message: "Cập nhật người dùng thành công" });
        });
    } catch (error) {
        console.log("Lỗi:", error);
        res.status(500).json({ message: "Không thể cập nhật người dùng" });
    }
};
const deleteNguoiDung = (req, res) => {
    const id = req.params.id;
    nguoiDungModel.remove(id, (err, result) => {
        if (err) {
            console.log("Lỗi xóa:", err);
            return res.status(500).json({ message: "Không thể xóa người dùng" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.json({ message: "Xóa người dùng thành công" });
    });
};
module.exports = { getAllNguoiDung, getNguoiDungById, createNguoiDung, updateNguoiDung, deleteNguoiDung };
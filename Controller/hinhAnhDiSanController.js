const hinhAnhDiSanModel = require("../Model/hinhAnhDiSanModel");

const getByDiSanId = (req, res) => {
    const diSanId = req.params.diSanId;
    hinhAnhDiSanModel.getByDiSanId(diSanId, (err, result) => {
        if (err) {
            console.log("Lỗi lấy hình ảnh:", err);
            return res.status(500).json({ message: "Lỗi lấy hình ảnh" });
        }
        res.json(result);
    });
};

const create = (req, res) => {
    const diSanId = req.params.diSanId;
    const files = req.files || [];

    if (files.length === 0) {
        return res.status(400).json({ message: "Vui lòng chọn hình ảnh" });
    }

    const danhSachAnh = files.map((file) => ({
        di_san_id: diSanId,
        duong_dan: `/uploads/${file.filename}`,
        mo_ta: req.body.mo_ta || null
    }));

    // Ảnh đầu tiên được chọn làm ảnh đại diện nếu di sản chưa có ảnh
    const anhDaiDien = danhSachAnh[0].duong_dan;

    const capNhatAnhDaiDien = `
        UPDATE di_san
        SET hinh_anh = COALESCE(NULLIF(hinh_anh, ''), ?)
        WHERE id = ?
    `;

    const db = require("../config/database");

    db.query(capNhatAnhDaiDien, [anhDaiDien, diSanId], (err) => {
        if (err) {
            console.log("Lỗi cập nhật ảnh đại diện:", err);
            return res.status(500).json({ message: "Không thể cập nhật ảnh đại diện" });
        }

        let daLuu = 0;
        const ketQuaAnh = [];
        let daTraLoi = false;

        danhSachAnh.forEach((data, index) => {
            hinhAnhDiSanModel.create(data, (err, result) => {
                if (daTraLoi) return;

                if (err) {
                    daTraLoi = true;
                    console.log("Lỗi thêm hình:", err);
                    return res.status(500).json({ message: "Không thể thêm hình ảnh" });
                }

                daLuu++;
                ketQuaAnh[index] = {
                    id: result.insertId,
                    duong_dan: data.duong_dan
                };

                if (daLuu === danhSachAnh.length) {
                    res.status(201).json({
                        message: "Thêm hình ảnh thành công",
                        hinh_anh: ketQuaAnh
                    });
                }
            });
        });
    });
};

const remove = (req, res) => {
    const id = req.params.id;
    hinhAnhDiSanModel.remove(id, (err, result) => {
        if (err) {
            console.log("Lỗi xóa hình:", err);
            return res.status(500).json({ message: "Không thể xóa hình ảnh" });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy hình ảnh" });
        res.json({ message: "Xóa hình ảnh thành công" });
    });
};

module.exports = { getByDiSanId, create, remove };
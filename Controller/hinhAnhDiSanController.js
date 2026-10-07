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

    let daLuu = 0;
    const danhSachAnh = [];

    files.forEach((file) => {
        const data = {
            di_san_id: diSanId,
            duong_dan: `/uploads/${file.filename}`,
            mo_ta: req.body.mo_ta || null
        };

        hinhAnhDiSanModel.create(data, (err, result) => {
            if (err) {
                console.log("Lỗi thêm hình:", err);
                return res.status(500).json({ message: "Không thể thêm hình ảnh" });
            }

            daLuu++;

            danhSachAnh.push({
                id: result.insertId,
                duong_dan: data.duong_dan
            });

            if (daLuu === files.length) {
                res.status(201).json({
                    message: "Thêm hình ảnh thành công",
                    hinh_anh: danhSachAnh
                });
            }
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
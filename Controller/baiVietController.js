const baiVietModel = require("../Model/baiVietModel");
const hinhAnhBaiVietModel = require("../Model/hinhAnhBaiVietModel");

const getAllBaiViet = (req, res) => {
    baiVietModel.getAll((err, result) => {
        if (err) {
            console.log("Lỗi lấy bài viết:", err);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết" });
        }
        res.json(result);
    });
};

const getBaiVietById = (req, res) => {
    const id = req.params.id;
    baiVietModel.getById(id, (err, result) => {
        if (err) {
            console.log("Lỗi:", err);
            return res.status(500).json({ message: "Lỗi khi lấy bài viết" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        hinhAnhBaiVietModel.getByBaiVietId(id, (err, hinhAnh) => {
            if (err) {
                console.log("Lỗi lấy hình ảnh:", err);
                return res.status(500).json({ message: "Lỗi khi lấy hình ảnh bài viết" });
            }

            res.json({
                ...result[0],
                hinh_anh_list: hinhAnh
            });
        });
    });
};

const createBaiViet = (req, res) => {
    if (!req.session.nguoiDung) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }

    const data = req.body;
    data.ma_nguoi_dung = req.session.nguoiDung.id;

    if (!data.tieu_de) {
        return res.status(400).json({ message: "Tiêu đề là bắt buộc" });
    }

    if (req.files && req.files.length > 0) {
        data.hinh_anh = "/uploads/" + req.files[0].filename;
    } else {
        data.hinh_anh = null;
    }

    baiVietModel.create(data, (err, result) => {
        if (err) {
            console.log("Lỗi MYSQL thêm bài viết:", err);
            return res.status(500).json({ message: "Không thể thêm bài viết" });
        }

        const baiVietId = result.insertId;
        const files = req.files || [];

        if (files.length === 0) {
            return res.status(201).json({ message: "Thêm bài viết thành công", id: baiVietId });
        }

        let daLuu = 0;
        files.forEach((file) => {
            const dataAnh = {
                bai_viet_id: baiVietId,
                duong_dan: "/uploads/" + file.filename
            };

            hinhAnhBaiVietModel.create(dataAnh, (err) => {
                if (err) {
                    console.log("Lỗi lưu hình ảnh:", err);
                    return res.status(500).json({ message: "Thêm bài viết nhưng không thể lưu hình ảnh" });
                }

                daLuu++;
                if (daLuu === files.length) {
                    res.status(201).json({ message: "Thêm bài viết thành công", id: baiVietId });
                }
            });
        });
    });
};

const updateBaiViet = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    baiVietModel.getById(id, (err, result) => {
        if (err) {
            console.log("Lỗi lấy bài viết:", err);
            return res.status(500).json({ message: "Lỗi khi lấy bài viết" });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        if (req.files && req.files.length > 0) {
            data.hinh_anh = "/uploads/" + req.files[0].filename;
        } else {
            data.hinh_anh = result[0].hinh_anh;
        }

        baiVietModel.update(id, data, (err) => {
            if (err) {
                console.log("Lỗi cập nhật:", err);
                return res.status(500).json({ message: "Không thể cập nhật bài viết" });
            }

            const files = req.files || [];

            if (files.length === 0) {
                return res.json({ message: "Cập nhật bài viết thành công" });
            }

            let daLuu = 0;

            files.forEach((file) => {
                const dataAnh = {
                    bai_viet_id: id,
                    duong_dan: "/uploads/" + file.filename
                };

                hinhAnhBaiVietModel.create(dataAnh, (err) => {
                    if (err) {
                        console.log("Lỗi lưu hình ảnh:", err);
                        return res.status(500).json({ message: "Cập nhật bài viết nhưng không thể lưu hình ảnh" });
                    }

                    daLuu++;

                    if (daLuu === files.length) {
                        res.json({ message: "Cập nhật bài viết thành công" });
                    }
                });
            });
        });
    });
};

const deleteBaiViet = (req, res) => {
    const id = req.params.id;

    baiVietModel.remove(id, (err, result) => {
        if (err) {
            console.log("Lỗi xóa:", err);
            return res.status(500).json({ message: "Không thể xóa bài viết" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }

        res.json({ message: "Xóa bài viết thành công" });
    });
};

module.exports = {
    getAllBaiViet,
    getBaiVietById,
    createBaiViet,
    updateBaiViet,
    deleteBaiViet
};
const baiVietModel = require("../Model/baiVietModel");
const hinhAnhBaiVietModel = require("../Model/hinhAnhBaiVietModel");
const noiDungBaiVietModel = require("../Model/noiDungBaiVietModel");
const binhLuanModel = require("../Model/baiVietBinhLuanModel");

const getAllBaiViet = (req, res) => {
    baiVietModel.getAll((err, result) => {
        if (err) {
            console.log("Lỗi lấy bài viết:", err);
            return res.status(500).json({ message: "Lỗi khi lấy danh sách bài viết" });
        }
        const admin = req.session.nguoiDung?.vai_tro === "quan_tri_vien";
        const publicRows = admin ? result : result.filter((row) =>
            ["da_duyet", "da_xuat_ban", "published", "đã duyệt", "đã xuất bản"].includes(String(row.trang_thai || "").trim().toLowerCase())
        );
        res.json(publicRows);
    });
};




const getBaiVietById = (req, res) => {
    const id = req.params.id;

    baiVietModel.getById(id, (err, result) => {
        if (err) return res.status(500).json({ message: "Lỗi lấy bài viết" });
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài viết" });
        }
        const published = ["da_duyet", "da_xuat_ban", "published", "đã duyệt", "đã xuất bản"].includes(String(result[0].trang_thai || "").trim().toLowerCase());
        const admin = req.session.nguoiDung?.vai_tro === "quan_tri_vien";
        if (!published && !admin) return res.status(404).json({ message: "Bài viết chưa được xuất bản hoặc không tồn tại." });

        noiDungBaiVietModel.getByBaiVietId(id, (err, noiDung) => {
            if (err) return res.status(500).json({ message: "Lỗi lấy nội dung bài viết" });

            hinhAnhBaiVietModel.getByBaiVietId(id, (err, hinhAnh) => {
                if (err) return res.status(500).json({ message: "Lỗi lấy hình ảnh bài viết" });

                res.json({
                    ...result[0],
                    noi_dung_block: noiDung || [],
                    noi_dung_tong_hop: (noiDung || [])
                        .filter(block => block.loai === "text")
                        .map(block => block.noi_dung)
                        .filter(Boolean)
                        .join("\n\n"),
                    hinh_anh_list: hinhAnh || []
                });
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
    if (req.session.nguoiDung.vai_tro !== "quan_tri_vien") data.trang_thai = "cho_duyet";
    else if (!["cho_duyet", "da_duyet", "tu_choi", "ban_nhap"].includes(String(data.trang_thai || ""))) data.trang_thai = "cho_duyet";

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


const isPublished = (status) => ["da_duyet", "da_xuat_ban", "published", "đã duyệt", "đã xuất bản"].includes(String(status || "").trim().toLowerCase());

const updateStatus = (req, res) => {
    const status = String(req.body.trang_thai || "").trim();
    const allowed = ["cho_duyet", "da_duyet", "tu_choi", "ban_nhap"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Trạng thái bài viết không hợp lệ." });
    const db = require("../config/database");
    db.query("UPDATE bai_viet SET trang_thai = ? WHERE id = ?", [status, req.params.id], (err, result) => {
        if (err) { console.error("Lỗi cập nhật trạng thái bài viết:", err); return res.status(500).json({ message: "Không thể cập nhật trạng thái bài viết." }); }
        if (!result.affectedRows) return res.status(404).json({ message: "Không tìm thấy bài viết." });
        res.json({ message: "Đã cập nhật trạng thái bài viết.", trang_thai: status });
    });
};

const getComments = (req, res) => {
    baiVietModel.getById(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ message: "Không thể kiểm tra bài viết." });
        if (!rows.length || (!isPublished(rows[0].trang_thai) && req.session.nguoiDung?.vai_tro !== "quan_tri_vien")) {
            return res.status(404).json({ message: "Không tìm thấy bài viết đã xuất bản." });
        }
        binhLuanModel.getForArticle(req.params.id, (commentErr, comments) => {
            if (commentErr) { console.error(commentErr); return res.status(500).json({ message: "Không thể tải bình luận. Hãy chạy file SQL cập nhật hệ thống." }); }
            res.json(comments);
        });
    });
};

const addComment = (req, res) => {
    const noi_dung = String(req.body.noi_dung || "").trim();
    if (!noi_dung) return res.status(400).json({ message: "Vui lòng nhập nội dung bình luận." });
    if (noi_dung.length > 1000) return res.status(400).json({ message: "Bình luận tối đa 1.000 ký tự." });
    baiVietModel.getById(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ message: "Không thể kiểm tra bài viết." });
        if (!rows.length || !isPublished(rows[0].trang_thai)) return res.status(404).json({ message: "Bài viết chưa được xuất bản hoặc không tồn tại." });
        binhLuanModel.add({ bai_viet_id: req.params.id, nguoi_dung_id: req.session.nguoiDung.id, noi_dung }, (insertErr, result) => {
            if (insertErr) { console.error(insertErr); return res.status(500).json({ message: "Không thể gửi bình luận. Hãy kiểm tra bảng bình luận trong cơ sở dữ liệu." }); }
            res.status(201).json({ message: "Đã gửi bình luận.", id: result.insertId });
        });
    });
};

const deleteComment = (req, res) => {
    binhLuanModel.getById(req.params.id, (err, rows) => {
        if (err) return res.status(500).json({ message: "Không thể kiểm tra bình luận." });
        if (!rows.length) return res.status(404).json({ message: "Không tìm thấy bình luận." });
        const user = req.session.nguoiDung;
        if (user.vai_tro !== "quan_tri_vien" && Number(rows[0].nguoi_dung_id) !== Number(user.id)) {
            return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này." });
        }
        binhLuanModel.remove(req.params.id, (deleteErr) => {
            if (deleteErr) return res.status(500).json({ message: "Không thể xóa bình luận." });
            res.json({ message: "Đã xóa bình luận." });
        });
    });
};

module.exports = {
    getAllBaiViet,
    getBaiVietById,
    createBaiViet,
    updateBaiViet,
    deleteBaiViet,
    updateStatus,
    getComments,
    addComment,
    deleteComment
};
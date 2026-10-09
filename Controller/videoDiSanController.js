const videoDiSanModel = require("../Model/videoDiSanModel");

const getByDiSanId = (req, res) => {
    const diSanId = req.params.diSanId;

    videoDiSanModel.getByDiSanId(diSanId, (err, result) => {
        if (err) {
            console.log("Lỗi lấy video:", err);
            return res.status(500).json({
                message: "Lỗi lấy video"
            });
        }

        res.json(result);
    });
};

const create = (req, res) => {
    const diSanId = req.params.diSanId;
    const files = req.files || [];

    if (files.length === 0) {
        return res.status(400).json({
            message: "Vui lòng chọn video"
        });
    }

    const tieuDe = req.body.tieu_de || "";
    const moTa = req.body.mo_ta || "";

    let daLuu = 0;
    const danhSachVideo = [];

    files.forEach((file) => {
        const data = {
            di_san_id: diSanId,
            duong_dan: `/uploads/videos/${file.filename}`,
            tieu_de: tieuDe,
            mo_ta: moTa
        };

        videoDiSanModel.create(data, (err, result) => {
            if (err) {
                console.log("Lỗi thêm video:", err);

                return res.status(500).json({
                    message: "Không thể thêm video"
                });
            }

            daLuu++;

            danhSachVideo.push({
                id: result.insertId,
                duong_dan: data.duong_dan,
                tieu_de: data.tieu_de,
                mo_ta: data.mo_ta
            });

            if (daLuu === files.length) {
                res.status(201).json({
                    message: "Thêm video thành công",
                    video: danhSachVideo
                });
            }
        });
    });
};

const remove = (req, res) => {
    const id = req.params.id;

    videoDiSanModel.remove(id, (err, result) => {
        if (err) {
            console.log("Lỗi xóa video:", err);

            return res.status(500).json({
                message: "Không thể xóa video"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Không tìm thấy video"
            });
        }

        res.json({
            message: "Xóa video thành công"
        });
    });
};

module.exports = {
    getByDiSanId,
    create,
    remove
};
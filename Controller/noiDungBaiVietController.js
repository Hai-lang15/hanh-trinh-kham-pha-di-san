const noiDungModel = require("../Model/noiDungBaiVietModel");

const getByBaiVietId = (req, res) => {
    const baiVietId = req.params.baiVietId;
    noiDungModel.getByBaiVietId(baiVietId, (err, result) => {
        if (err) {
            console.log("Lỗi lấy nội dung bài viết:", err);
            return res.status(500).json({ message: "Không thể lấy nội dung bài viết" });
        }
        res.json(result);
    });
};

const create = (req, res) => {
    const baiVietId = req.params.baiVietId;
    let blocks = [];

    try {
        blocks = JSON.parse(req.body.noi_dung_blocks || "[]");
    } catch (error) {
        return res.status(400).json({ message: "Dữ liệu nội dung không hợp lệ" });
    }

    if (!Array.isArray(blocks)) return res.status(400).json({ message: "Danh sách block không hợp lệ" });

    const files = req.files || [];
    const fileMap = {};
    files.forEach(file => fileMap[file.fieldname] = "/uploads/" + file.filename);

    blocks.forEach(block => {
        if (block.loai === "image" && block.file_key && fileMap[block.file_key]) block.noi_dung = fileMap[block.file_key];
    });

    noiDungModel.removeByBaiVietId(baiVietId, (err) => {
        if (err) {
            console.log("Lỗi xóa nội dung cũ:", err);
            return res.status(500).json({ message: "Không thể lưu nội dung bài viết" });
        }

        if (blocks.length === 0) return res.json({ message: "Lưu nội dung bài viết thành công" });

        let daLuu = 0;
        let loi = false;

        blocks.forEach((block, index) => {
            if (loi) return;
            if (!block.loai || !["text", "image", "link"].includes(block.loai)) return;

            const data = {
                bai_viet_id: baiVietId,
                loai: block.loai,
                noi_dung: block.noi_dung || "",
                thu_tu: index + 1
            };

            noiDungModel.create(data, (err) => {
                if (loi) return;
                if (err) {
                    loi = true;
                    console.log("Lỗi lưu block:", err);
                    return res.status(500).json({ message: "Không thể lưu nội dung bài viết" });
                }
                daLuu++;
                if (daLuu === blocks.length) res.json({ message: "Lưu nội dung bài viết thành công" });
            });
        });
    });
};

module.exports = { getByBaiVietId, create };
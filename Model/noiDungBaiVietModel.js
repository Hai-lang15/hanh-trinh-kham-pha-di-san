const db = require("../config/database");

const getByBaiVietId = (baiVietId, callback) => {
    const sql = "SELECT * FROM noi_dung_bai_viet WHERE bai_viet_id = ? ORDER BY thu_tu ASC";
    db.query(sql, [baiVietId], callback);
};

const create = (data, callback) => {
    const sql = "INSERT INTO noi_dung_bai_viet (bai_viet_id, loai, noi_dung, thu_tu) VALUES (?, ?, ?, ?)";
    db.query(sql, [data.bai_viet_id, data.loai, data.noi_dung, data.thu_tu], callback);
};

const removeByBaiVietId = (baiVietId, callback) => {
    const sql = "DELETE FROM noi_dung_bai_viet WHERE bai_viet_id = ?";
    db.query(sql, [baiVietId], callback);
};

module.exports = { getByBaiVietId, create, removeByBaiVietId };
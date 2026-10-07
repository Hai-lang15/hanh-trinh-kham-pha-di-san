const db = require("../config/database");

const create = (data, callback) => {
    const sql = `INSERT INTO hinh_anh_bai_viet (bai_viet_id, duong_dan, mo_ta) VALUES (?, ?, ?)`;
    const values = [data.bai_viet_id, data.duong_dan, data.mo_ta || null];
    db.query(sql, values, callback);
};

const getByBaiVietId = (baiVietId, callback) => {
    const sql = `SELECT * FROM hinh_anh_bai_viet WHERE bai_viet_id = ? ORDER BY id ASC`;
    db.query(sql, [baiVietId], callback);
};

const removeByBaiVietId = (baiVietId, callback) => {
    const sql = `DELETE FROM hinh_anh_bai_viet WHERE bai_viet_id = ?`;
    db.query(sql, [baiVietId], callback);
};

module.exports = { create, getByBaiVietId, removeByBaiVietId };
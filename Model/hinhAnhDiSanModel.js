const db = require("../config/database");

const getByDiSanId = (diSanId, callback) => {
    const sql = "SELECT * FROM hinh_anh_di_san WHERE di_san_id = ? ORDER BY id DESC";
    db.query(sql, [diSanId], callback);
};

const create = (data, callback) => {
    const sql = "INSERT INTO hinh_anh_di_san (di_san_id, duong_dan, mo_ta) VALUES (?, ?, ?)";
    db.query(sql, [data.di_san_id, data.duong_dan, data.mo_ta || null], callback);
};

const remove = (id, callback) => {
    const sql = "DELETE FROM hinh_anh_di_san WHERE id = ?";
    db.query(sql, [id], callback);
};

const removeByDiSanId = (diSanId, callback) => {
    const sql = "DELETE FROM hinh_anh_di_san WHERE di_san_id = ?";
    db.query(sql, [diSanId], callback);
};

const getAll = (callback) => {
    const sql = `
        SELECT ha.id, ha.di_san_id, ha.duong_dan, ha.mo_ta,
               ds.ten_di_san
        FROM hinh_anh_di_san ha
        LEFT JOIN di_san ds ON ha.di_san_id = ds.id
        ORDER BY ha.id DESC
    `;
    db.query(sql, callback);
};
module.exports = { getByDiSanId, create, remove, removeByDiSanId, getAll };
const db = require("../config/database");
const getByEmail = (email, callback) => {
    const sql = "SELECT * FROM nguoi_dung WHERE email = ?";
    db.query(sql, [email], callback);
};
const getById = (id, callback) => {
    const sql = "SELECT * FROM nguoi_dung WHERE id = ?";
    db.query(sql, [id], callback);
};
const create = (data, callback) => {
    const sql = "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?, ?)";
    const values = [data.ho_ten, data.email, data.mat_khau, data.vai_tro || "nguoi_dung", data.trang_thai || "hoat_dong"];
    db.query(sql, values, callback);
};
module.exports = { getByEmail, getById, create };
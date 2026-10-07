const db = require("../config/database");

const getAll = (callback) => {
    const sql = `
        SELECT
            id,
            ho_ten,
            email,
            anh_dai_dien,
            vai_tro,
            trang_thai,
            ngay_tao
        FROM nguoi_dung
        ORDER BY id DESC
    `;
    db.query(sql, callback);
};

const getById = (id, callback) => {
    const sql = `
        SELECT *
        FROM nguoi_dung
        WHERE id = ?
    `;
    db.query(sql, [id], callback);
};

const create = (data, callback) => {
    const sql = `
        INSERT INTO nguoi_dung (
            ho_ten,
            email,
            mat_khau,
            anh_dai_dien,
            vai_tro,
            trang_thai
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.ho_ten,
        data.email,
        data.mat_khau || null,
        data.anh_dai_dien || null,
        data.vai_tro || "nguoi_dung",
        data.trang_thai || "hoat_dong"
    ];

    db.query(sql, values, callback);
};

const update = (id, data, callback) => {
    const sql = `UPDATE nguoi_dung SET ho_ten = ?, email = ?, mat_khau = ?, anh_dai_dien = ?, vai_tro = ?, trang_thai = ? WHERE id = ?`;
    const values = [data.ho_ten, data.email, data.mat_khau, data.anh_dai_dien || null, data.vai_tro, data.trang_thai];
    db.query(sql, [...values, id], callback);
};

const remove = (id, callback) => {
    const sql = `
        DELETE FROM nguoi_dung
        WHERE id = ?
    `;

    db.query(sql, [id], callback);
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};
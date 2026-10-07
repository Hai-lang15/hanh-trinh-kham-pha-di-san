const db = require("../config/database");

const getAll = (callback) => {
    const sql = `
        SELECT *
        FROM di_san
        ORDER BY id DESC
    `;

    db.query(sql, callback);
};



const getById = (id, callback) => {
    const sql = `
        SELECT *
        FROM di_san
        WHERE id = ?
    `;

    db.query(sql, [id], callback);
};

const create = (data, callback) => {
    const sql = `
        INSERT INTO di_san (
            ten_di_san, dia_chi, lich_su_hinh_thanh, nhan_vat_lien_quan,
            su_kien_lich_su, gia_tri_van_hoa, kien_truc, xep_hang,
            don_vi_quan_ly, hinh_anh, vi_do, kinh_do
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.ten_di_san,
        data.dia_chi,
        data.lich_su_hinh_thanh,
        data.nhan_vat_lien_quan,
        data.su_kien_lich_su,
        data.gia_tri_van_hoa,
        data.kien_truc,
        data.xep_hang,
        data.don_vi_quan_ly,
        data.hinh_anh,
        data.vi_do || null,
        data.kinh_do || null
    ];

    db.query(sql, values, callback);
};



const update = (id, data, callback) => {
    const sql = `
        UPDATE di_san
        SET
            ten_di_san = ?,
            dia_chi = ?,
            lich_su_hinh_thanh = ?,
            nhan_vat_lien_quan = ?,
            su_kien_lich_su = ?,
            gia_tri_van_hoa = ?,
            kien_truc = ?,
            xep_hang = ?,
            don_vi_quan_ly = ?,
            hinh_anh = ?,
            vi_do = ?,
            kinh_do = ?
        WHERE id = ?
    `;

    const values = [
        data.ten_di_san,
        data.dia_chi,
        data.lich_su_hinh_thanh,
        data.nhan_vat_lien_quan,
        data.su_kien_lich_su,
        data.gia_tri_van_hoa,
        data.kien_truc,
        data.xep_hang,
        data.don_vi_quan_ly,
        data.hinh_anh,
        data.vi_do || null,
        data.kinh_do || null,
        id
    ];

    db.query(sql, values, callback);
};



const remove = (id, callback) => {
    const sql = `
        DELETE FROM di_san
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
const db = require("../config/database");

const getAll = (callback) => {
    const sql = `
        SELECT
            bv.id,
            bv.tieu_de,
            bv.noi_dung,
            bv.hinh_anh,
            bv.trang_thai,
            bv.ngay_tao,
            nd.ho_ten,
            ds.ten_di_san,
            (
                SELECT ndbv.noi_dung
                FROM noi_dung_bai_viet ndbv
                WHERE ndbv.bai_viet_id = bv.id
                AND ndbv.loai = 'image'
                ORDER BY ndbv.thu_tu ASC
                LIMIT 1
            ) AS hinh_anh_block
        FROM bai_viet bv
        LEFT JOIN nguoi_dung nd ON bv.ma_nguoi_dung = nd.id
        LEFT JOIN di_san ds ON bv.ma_di_san = ds.id
        ORDER BY bv.id DESC
    `;
    db.query(sql, callback);
};

const getById = (id, callback) => {
    const sql = `
        SELECT *
        FROM bai_viet
        WHERE id = ?
    `;
    db.query(sql, [id], callback);
};

const create = (data, callback) => {
    const sql = `
        INSERT INTO bai_viet (
            ma_nguoi_dung,
            ma_di_san,
            tieu_de,
            noi_dung,
            hinh_anh,
            trang_thai
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.ma_nguoi_dung,
        data.ma_di_san || null,
        data.tieu_de,
        data.noi_dung,
        data.hinh_anh || null,
        data.trang_thai || "cho_duyet"
    ];

    db.query(sql, values, callback);
};

const update = (id, data, callback) => {
    const sql = `
        UPDATE bai_viet
        SET
            ma_di_san = ?,
            tieu_de = ?,
            noi_dung = ?,
            hinh_anh = ?,
            trang_thai = ?
        WHERE id = ?
    `;

    const values = [
        data.ma_di_san || null,
        data.tieu_de,
        data.noi_dung,
        data.hinh_anh || null,
        data.trang_thai
    ];

    db.query(sql, [...values, id], callback);
};

const remove = (id, callback) => {
    const sql = `
        DELETE FROM bai_viet
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
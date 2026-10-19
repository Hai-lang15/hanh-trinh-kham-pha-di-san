const db = require("../config/database");

const getAll = (callback) => {
    const sql = `
        SELECT
            id,
            doi_tuong,
            ho_ten,
            email,
            muc_dich,
            giao_dien,
            de_su_dung,
            noi_dung,
            hinh_anh_ban_do,
            toc_do,
            gop_y,
            dong_y,
            ngay_tao
        FROM khao_sat
        ORDER BY ngay_tao DESC, id DESC
    `;

    db.query(sql, callback);
};

const create = (data, callback) => {
    const sql = `
        INSERT INTO khao_sat (
            doi_tuong,
            ho_ten,
            email,
            muc_dich,
            giao_dien,
            de_su_dung,
            noi_dung,
            hinh_anh_ban_do,
            toc_do,
            gop_y,
            dong_y
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.doi_tuong,
        data.ho_ten,
        data.email,
        data.muc_dich,
        data.giao_dien,
        data.de_su_dung,
        data.noi_dung,
        data.hinh_anh_ban_do,
        data.toc_do,
        data.gop_y,
        data.dong_y
    ];

    db.query(sql, values, callback);
};

module.exports = {
    getAll,
    create
};
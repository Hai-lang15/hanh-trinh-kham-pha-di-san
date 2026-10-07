const db = require("../config/database");

const create = (data, callback) => {
    const sql = `
        INSERT INTO ma_otp
        (email, ma_otp, ho_ten, mat_khau, thoi_gian_het_han)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        data.email,
        data.ma_otp,
        data.ho_ten,
        data.mat_khau,
        data.thoi_gian_het_han
    ];
    db.query(sql, values, callback);
};

const getOTP = (email, ma_otp, callback) => {
    const sql = `
        SELECT * FROM ma_otp
        WHERE email = ?
        AND ma_otp = ?
        AND da_su_dung = 0
        AND thoi_gian_het_han > NOW()
        ORDER BY id DESC
        LIMIT 1
    `;
    db.query(sql, [email, ma_otp], callback);
};

const danhDauDaSuDung = (id, callback) => {
    const sql = "UPDATE ma_otp SET da_su_dung = 1 WHERE id = ?";
    db.query(sql, [id], callback);
};

module.exports = {
    create,
    getOTP,
    danhDauDaSuDung
};
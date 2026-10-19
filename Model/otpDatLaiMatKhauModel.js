
const db = require("../config/database");

const taoOTP = (data, callback) => {
    const sql = `
        INSERT INTO otp_dat_lai_mat_khau
        (email, ma_otp, thoi_gian_het_han)
        VALUES (?, ?, ?)
    `;
    db.query(sql, [
        data.email,
        data.ma_otp,
        data.thoi_gian_het_han
    ], callback);
};

const layOTPHopLe = (email, maOTP, callback) => {
    const sql = `
        SELECT * FROM otp_dat_lai_mat_khau
        WHERE email = ?
          AND ma_otp = ?
          AND da_su_dung = 0
          AND thoi_gian_het_han > NOW()
          AND so_lan_thu < 5
        ORDER BY id DESC
        LIMIT 1
    `;
    db.query(sql, [email, maOTP], callback);
};

const tangSoLanThu = (id, callback) => {
    const sql = `
        UPDATE otp_dat_lai_mat_khau
        SET so_lan_thu = so_lan_thu + 1
        WHERE id = ? AND da_su_dung = 0
    `;
    db.query(sql, [id], callback);
};

const danhDauDaSuDung = (id, callback) => {
    const sql = `
        UPDATE otp_dat_lai_mat_khau
        SET da_su_dung = 1
        WHERE id = ? AND da_su_dung = 0
    `;
    db.query(sql, [id], callback);
};

const demOTPTrongPhut = (email, callback) => {
    const sql = `
        SELECT COUNT(*) AS tong
        FROM otp_dat_lai_mat_khau
        WHERE email = ?
          AND ngay_tao >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
    `;
    db.query(sql, [email], callback);
};

module.exports = {
    taoOTP,
    layOTPHopLe,
    tangSoLanThu,
    danhDauDaSuDung,
    demOTPTrongPhut
};

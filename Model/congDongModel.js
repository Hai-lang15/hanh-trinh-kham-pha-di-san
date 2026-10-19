const db = require('../config/database');

const getAll = (callback) => {
  const sql = `SELECT cs.id, cs.nguoi_dung_id, cs.ten_dia_diem, cs.dia_chi, cs.mo_ta, cs.hinh_anh, cs.lien_ket_ban_do, cs.ngay_tao, nd.ho_ten,
    (SELECT COUNT(*) FROM binh_luan_di_san bl WHERE bl.chia_se_id = cs.id AND bl.trang_thai = 'hien') AS so_binh_luan
    FROM chia_se_di_san cs JOIN nguoi_dung nd ON nd.id = cs.nguoi_dung_id
    WHERE cs.trang_thai = 'da_duyet' ORDER BY cs.ngay_tao DESC`;
  db.query(sql, callback);
};

const getById = (id, callback) => {
  db.query(`SELECT cs.id, cs.nguoi_dung_id, cs.ten_dia_diem, cs.dia_chi, cs.mo_ta, cs.hinh_anh, cs.lien_ket_ban_do, cs.ngay_tao, nd.ho_ten
    FROM chia_se_di_san cs JOIN nguoi_dung nd ON nd.id = cs.nguoi_dung_id
    WHERE cs.id = ? AND cs.trang_thai = 'da_duyet'`, [id], callback);
};

const create = (data, callback) => {
  db.query(`INSERT INTO chia_se_di_san (nguoi_dung_id, ten_dia_diem, dia_chi, mo_ta, hinh_anh, lien_ket_ban_do, trang_thai)
    VALUES (?, ?, ?, ?, ?, ?, 'cho_duyet')`,
  [data.nguoi_dung_id, data.ten_dia_diem, data.dia_chi, data.mo_ta, data.hinh_anh || null, data.lien_ket_ban_do || null], callback);
};

const getComments = (id, callback) => {
  db.query(`SELECT bl.id, bl.nguoi_dung_id, bl.noi_dung, bl.ngay_tao, nd.ho_ten
    FROM binh_luan_di_san bl JOIN nguoi_dung nd ON nd.id = bl.nguoi_dung_id
    WHERE bl.chia_se_id = ? AND bl.trang_thai = 'hien' ORDER BY bl.ngay_tao ASC`, [id], callback);
};

const addComment = (data, callback) => {
  db.query(`INSERT INTO binh_luan_di_san (chia_se_id, nguoi_dung_id, noi_dung) VALUES (?, ?, ?)`,
    [data.chia_se_id, data.nguoi_dung_id, data.noi_dung], callback);
};

const removeComment = (id, callback) => db.query('DELETE FROM binh_luan_di_san WHERE id = ?', [id], callback);
const getCommentOwner = (id, callback) => db.query('SELECT nguoi_dung_id FROM binh_luan_di_san WHERE id = ?', [id], callback);

module.exports = { getAll, getById, create, getComments, addComment, removeComment, getCommentOwner };

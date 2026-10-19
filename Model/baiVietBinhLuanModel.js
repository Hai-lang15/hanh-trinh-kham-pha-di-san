const db = require("../config/database");

const getForArticle = (articleId, callback) => db.query(
  `SELECT c.id, c.bai_viet_id, c.nguoi_dung_id, c.noi_dung, c.ngay_tao, u.ho_ten
   FROM bai_viet_binh_luan c
   JOIN nguoi_dung u ON u.id = c.nguoi_dung_id
   WHERE c.bai_viet_id = ? AND c.trang_thai = 'hien'
   ORDER BY c.ngay_tao ASC`,
  [articleId], callback
);

const add = (data, callback) => db.query(
  `INSERT INTO bai_viet_binh_luan (bai_viet_id, nguoi_dung_id, noi_dung, trang_thai)
   VALUES (?, ?, ?, 'hien')`,
  [data.bai_viet_id, data.nguoi_dung_id, data.noi_dung], callback
);

const getById = (id, callback) => db.query(
  `SELECT id, bai_viet_id, nguoi_dung_id FROM bai_viet_binh_luan WHERE id = ?`,
  [id], callback
);

const remove = (id, callback) => db.query(
  `DELETE FROM bai_viet_binh_luan WHERE id = ?`, [id], callback
);

module.exports = { getForArticle, add, getById, remove };

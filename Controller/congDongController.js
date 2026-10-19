const model = require('../Model/congDongModel');

const getAll = (req, res) => model.getAll((err, rows) => {
  if (err) { console.error(err); return res.status(500).json({ message: 'Không thể tải bài chia sẻ.' }); }
  res.json(rows);
});

const getById = (req, res) => model.getById(req.params.id, (err, rows) => {
  if (err) { console.error(err); return res.status(500).json({ message: 'Không thể tải địa điểm.' }); }
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy bài chia sẻ.' });
  res.json(rows[0]);
});

const create = (req, res) => {
  const { ten_dia_diem, dia_chi, mo_ta, lien_ket_ban_do } = req.body;
  if (!String(ten_dia_diem || '').trim() || !String(dia_chi || '').trim() || !String(mo_ta || '').trim()) {
    return res.status(400).json({ message: 'Vui lòng nhập tên địa điểm, địa chỉ và mô tả.' });
  }
  if (lien_ket_ban_do && !/^https?:\/\//i.test(lien_ket_ban_do)) {
    return res.status(400).json({ message: 'Liên kết bản đồ phải bắt đầu bằng http:// hoặc https://.' });
  }
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  model.create({ nguoi_dung_id: req.session.nguoiDung.id, ten_dia_diem: ten_dia_diem.trim(), dia_chi: dia_chi.trim(), mo_ta: mo_ta.trim(), hinh_anh: image, lien_ket_ban_do: lien_ket_ban_do?.trim() || null }, (err, result) => {
    if (err) { console.error(err); return res.status(500).json({ message: 'Không thể gửi bài chia sẻ.' }); }
    res.status(201).json({ message: 'Đã gửi chia sẻ. Bài viết sẽ hiển thị sau khi được duyệt.', id: result.insertId });
  });
};

const getComments = (req, res) => model.getById(req.params.id, (err, posts) => {
  if (err) { console.error(err); return res.status(500).json({ message: 'Không thể tải địa điểm.' }); }
  if (!posts.length) return res.status(404).json({ message: 'Không tìm thấy bài chia sẻ.' });
  model.getComments(req.params.id, (commentErr, rows) => {
    if (commentErr) { console.error(commentErr); return res.status(500).json({ message: 'Không thể tải bình luận.' }); }
    res.json(rows);
  });
});

const addComment = (req, res) => {
  const noi_dung = String(req.body.noi_dung || '').trim();
  if (!noi_dung) return res.status(400).json({ message: 'Vui lòng nhập nội dung bình luận.' });
  if (noi_dung.length > 1000) return res.status(400).json({ message: 'Bình luận tối đa 1.000 ký tự.' });
  model.getById(req.params.id, (err, rows) => {
    if (err) { console.error(err); return res.status(500).json({ message: 'Không thể kiểm tra bài chia sẻ.' }); }
    if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy bài chia sẻ.' });
    model.addComment({ chia_se_id: req.params.id, nguoi_dung_id: req.session.nguoiDung.id, noi_dung }, (insertErr, result) => {
      if (insertErr) { console.error(insertErr); return res.status(500).json({ message: 'Không thể gửi bình luận.' }); }
      res.status(201).json({ message: 'Đã gửi bình luận.', id: result.insertId });
    });
  });
};

const deleteComment = (req, res) => model.getCommentOwner(req.params.id, (err, rows) => {
  if (err) { console.error(err); return res.status(500).json({ message: 'Không thể kiểm tra bình luận.' }); }
  if (!rows.length) return res.status(404).json({ message: 'Không tìm thấy bình luận.' });
  const user = req.session.nguoiDung;
  if (user.vai_tro !== 'quan_tri_vien' && Number(rows[0].nguoi_dung_id) !== Number(user.id)) {
    return res.status(403).json({ message: 'Bạn không có quyền xóa bình luận này.' });
  }
  model.removeComment(req.params.id, (deleteErr) => {
    if (deleteErr) { console.error(deleteErr); return res.status(500).json({ message: 'Không thể xóa bình luận.' }); }
    res.json({ message: 'Đã xóa bình luận.' });
  });
});

module.exports = { getAll, getById, create, getComments, addComment, deleteComment };

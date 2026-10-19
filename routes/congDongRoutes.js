const express = require('express');
const router = express.Router();
const controller = require('../Controller/congDongController');
const upload = require('../middleware/upload');
const { kiemTraDangNhap } = require('../middleware/auth');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', kiemTraDangNhap, upload.single('hinh_anh'), controller.create);
router.get('/:id/binh-luan', controller.getComments);
router.post('/:id/binh-luan', kiemTraDangNhap, controller.addComment);
router.delete('/binh-luan/:id', kiemTraDangNhap, controller.deleteComment);

module.exports = router;

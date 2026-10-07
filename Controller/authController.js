const bcrypt = require("bcryptjs");
const nguoiDungModel = require("../Model/authModel");
const dangKy = (req, res) => {
    const { ho_ten, email, mat_khau } = req.body;
    if (!ho_ten || !email || !mat_khau) {
        return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }
    nguoiDungModel.getByEmail(email, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
        if (result.length > 0) {
            return res.status(400).json({ message: "Email đã được sử dụng" });
        }
        const matKhauMaHoa = await bcrypt.hash(mat_khau, 10);
        const data = { ho_ten, email, mat_khau: matKhauMaHoa, vai_tro: "nguoi_dung", trang_thai: "hoat_dong" };
        nguoiDungModel.create(data, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ message: "Đăng ký thất bại" });
            }
            res.status(201).json({ message: "Đăng ký thành công" });
        });
    });
};
const dangNhap = (req, res) => {
    const { email, mat_khau } = req.body;
    if (!email || !mat_khau) {
        return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
    }
    nguoiDungModel.getByEmail(email, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
        if (result.length === 0) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const nguoiDung = result[0];
        if (nguoiDung.trang_thai === "bi_khoa") {
            return res.status(403).json({ message: "Tài khoản đã bị khóa" });
        }
        const dungMatKhau = await bcrypt.compare(mat_khau, nguoiDung.mat_khau);
        if (!dungMatKhau) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        req.session.nguoiDung = { id: nguoiDung.id, ho_ten: nguoiDung.ho_ten, email: nguoiDung.email, vai_tro: nguoiDung.vai_tro };
        res.json({ message: "Đăng nhập thành công", nguoiDung: req.session.nguoiDung });
    });
};
const dangXuat = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Đăng xuất thất bại" });
        }
        res.json({ message: "Đăng xuất thành công" });
    });
};
const kiemTraDangNhap = (req, res) => {
    if (!req.session.nguoiDung) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    res.json(req.session.nguoiDung);
};
module.exports = { dangKy, dangNhap, dangXuat, kiemTraDangNhap };
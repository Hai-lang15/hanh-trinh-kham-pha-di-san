const kiemTraDangNhap = (req, res, next) => {
    if (!req.session.nguoiDung) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập" });
    }
    next();
};
const kiemTraAdmin = (req, res, next) => {
    if (!req.session.nguoiDung) {
        return res.redirect("/user/auth.html");
    }
    if (req.session.nguoiDung.vai_tro !== "quan_tri_vien") {
        return res.redirect("/user/index.html");
    }
    next();
};
module.exports = { kiemTraDangNhap, kiemTraAdmin };
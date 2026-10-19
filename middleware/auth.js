const isApiRequest = (req) =>
  req.path.startsWith("/api/") ||
  (req.headers.accept && req.headers.accept.includes("application/json"));

const kiemTraDangNhap = (req, res, next) => {
    if (!req.session.nguoiDung) {
        if (isApiRequest(req)) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập" });
        }
        return res.redirect("/user/auth.html");
    }
    next();
};
const kiemTraAdmin = (req, res, next) => {
    if (!req.session.nguoiDung) {
        if (isApiRequest(req)) {
            return res.status(401).json({ message: "Bạn chưa đăng nhập" });
        }
        return res.redirect("/user/auth.html");
    }
    if (req.session.nguoiDung.vai_tro !== "quan_tri_vien") {
        if (isApiRequest(req)) {
            return res.status(403).json({ message: "Bạn không có quyền quản trị" });
        }
        return res.redirect("/user/index.html");
    }
    next();
};
module.exports = { kiemTraDangNhap, kiemTraAdmin };
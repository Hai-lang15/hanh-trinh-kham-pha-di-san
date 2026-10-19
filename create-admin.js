require("dotenv").config();
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const email = "admin@htkpds.com";
const matKhau = "admin123";
const hoTen = "Quản trị viên";
const vaiTro = "quan_tri_vien";
const trangThai = "hoat_dong";

(async () => {
    try {
        const hash = await bcrypt.hash(matKhau, 10);
        db.query(
            "INSERT INTO nguoi_dung (ho_ten, email, mat_khau, vai_tro, trang_thai) VALUES (?, ?, ?, ?, ?)",
            [hoTen, email, hash, vaiTro, trangThai],
            (err, result) => {
                if (err) {
                    console.error("❌ Lỗi tạo admin:", err.message);
                } else {
                    console.log("✅ Đã tạo tài khoản admin:");
                    console.log("   Email:", email);
                    console.log("   Mật khẩu:", matKhau);
                    console.log("   Vai trò:", vaiTro);
                    console.log("   ID:", result.insertId);
                }
                db.end();
            }
        );
    } catch (e) {
        console.error("❌ Lỗi:", e.message);
        db.end();
    }
})();

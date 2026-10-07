const express = require("express");
const path = require("path");

const diSanRoutes = require("./routes/disanRoutes");
const baiVietRoutes = require("./routes/baivietRoutes");
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const { kiemTraAdmin } = require("./middleware/auth");
const hinhAnhDiSanRoutes = require("./routes/hinhAnhDiSanRoutes");
const noiDungBaiVietRoutes = require("./routes/noiDungBaiVietRoutes");

const app = express();
app.use(express.json());
app.use(session({ secret: "HTKPDS_SECRET_2026", resave: false, saveUninitialized: false, cookie: { maxAge: 24 * 60 * 60 * 1000 } }));


app.use("/admin", kiemTraAdmin ,express.static(path.join(__dirname, "View/admin")));
app.use("/user", express.static(path.join(__dirname, "View/user")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/hinh-anh-di-san", hinhAnhDiSanRoutes);
app.use("/api/noi-dung-bai-viet", noiDungBaiVietRoutes);
app.use("/api/di-san",diSanRoutes);
app.use("/api/bai-viet", baiVietRoutes);
app.use("/api/nguoi-dung", nguoiDungRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send(`
        <h1>Hành trình khám phá Di sản</h1>
        <p>Server đang hoạt động.</p>
    `);

});


app.listen(3000, () => {
    console.log("Server đang chạy tại http://localhost:3000");
    console.log("Admin: http://localhost:3000/admin");
});


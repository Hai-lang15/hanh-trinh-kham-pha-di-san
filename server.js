
require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");

const diSanRoutes = require("./routes/disanRoutes");
const baiVietRoutes = require("./routes/baivietRoutes");
const nguoiDungRoutes = require("./routes/nguoiDungRoutes");
const authRoutes = require("./routes/authRoutes");
const hinhAnhDiSanRoutes = require("./routes/hinhAnhDiSanRoutes");
const noiDungBaiVietRoutes = require("./routes/noiDungBaiVietRoutes");
const videoDiSanRoutes = require("./routes/videoDiSanRoutes");
const { kiemTraAdmin } = require("./middleware/auth");
const khaoSatRoutes = require("./routes/khaoSatRoutes");
const timKiemAiRoutes = require("./routes/timKiemAiRoutes");
const congDongRoutes = require("./routes/congDongRoutes");
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173",credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "doi_chuoi_bi_mat_nay",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  }
}));
app.use("/admin", kiemTraAdmin, express.static(path.join(__dirname, "View/admin")));
app.use("/user", express.static(path.join(__dirname, "View/user")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/hinh-anh-di-san", hinhAnhDiSanRoutes);
app.use("/api/noi-dung-bai-viet", noiDungBaiVietRoutes);
app.use("/api/di-san", diSanRoutes);
app.use("/api/bai-viet", baiVietRoutes);
app.use("/api/nguoi-dung", nguoiDungRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/video-di-san", videoDiSanRoutes);
app.use("/api/khao-sat", khaoSatRoutes);
app.use("/api/tim-kiem-ai", timKiemAiRoutes);
app.use("/api/cong-dong", congDongRoutes);
app.get("/", (req, res) => { res.json({ message: "API Hành trình khám phá Di sản đang hoạt động" });});
app.listen(process.env.PORT || 3000, () => { console.log(`Server đang chạy tại http://localhost:${process.env.PORT || 3000}`);});

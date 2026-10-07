const bcrypt = require("bcryptjs");
const nguoiDungModel = require("../Model/authModel");
const otpModel = require("../Model/otpModel");
const { guiOTP } = require("../config/email");

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
        return res.status(400).json({
        message: "Email này đã được đăng ký. Vui lòng sử dụng email khác."
    });
}

        try {
            const matKhauMaHoa = await bcrypt.hash(mat_khau, 10);

            const maOTP = Math.floor(100000 + Math.random() * 900000).toString();

            const thoiGianHetHan = new Date(Date.now() + 5 * 60 * 1000);

            const data = {
                email,
                ma_otp: maOTP,
                ho_ten,
                mat_khau: matKhauMaHoa,
                thoi_gian_het_han: thoiGianHetHan
            };

            otpModel.create(data, async (err) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Không thể tạo mã OTP" });
                }

                try {
                    await guiOTP(email, maOTP);

                    res.status(200).json({
                        message: "Mã OTP đã được gửi đến email của bạn"
                    });
                } catch (error) {
                    console.log(error);
                    return res.status(500).json({
                        message: "Không thể gửi mã OTP"
                    });
                }
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Đăng ký thất bại"
            });
        }
    });
};

const xacThucOTP = (req, res) => {
    const { email, ma_otp } = req.body;

    if (!email || !ma_otp) {
        return res.status(400).json({
            message: "Vui lòng nhập email và mã OTP"
        });
    }

    otpModel.getOTP(email, ma_otp, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi máy chủ"
            });
        }

        if (result.length === 0) {
            return res.status(400).json({
                message: "Mã OTP không đúng hoặc đã hết hạn"
            });
        }

        const otpData = result[0];

        const data = {
            ho_ten: otpData.ho_ten,
            email: otpData.email,
            mat_khau: otpData.mat_khau,
            vai_tro: "nguoi_dung",
            trang_thai: "hoat_dong"
        };

        nguoiDungModel.create(data, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Không thể tạo tài khoản"
                });
            }

            otpModel.danhDauDaSuDung(otpData.id, (err) => {
                if (err) {
                    console.log(err);
                }

                res.status(201).json({
                    message: "Xác thực OTP thành công. Đăng ký tài khoản thành công!"
                });
            });
        });
    });
};

const dangNhap = (req, res) => {
    const { email, mat_khau } = req.body;

    if (!email || !mat_khau) {
        return res.status(400).json({
            message: "Vui lòng nhập email và mật khẩu"
        });
    }

    nguoiDungModel.getByEmail(email, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Lỗi máy chủ"
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        const nguoiDung = result[0];

        if (nguoiDung.trang_thai === "bi_khoa") {
            return res.status(403).json({
                message: "Tài khoản đã bị khóa"
            });
        }

        const dungMatKhau = await bcrypt.compare(
            mat_khau,
            nguoiDung.mat_khau
        );

        if (!dungMatKhau) {
            return res.status(401).json({
                message: "Email hoặc mật khẩu không đúng"
            });
        }

        req.session.nguoiDung = {
            id: nguoiDung.id,
            ho_ten: nguoiDung.ho_ten,
            email: nguoiDung.email,
            vai_tro: nguoiDung.vai_tro
        };

        res.json({
            message: "Đăng nhập thành công",
            nguoiDung: req.session.nguoiDung
        });
    });
};

const dangXuat = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                message: "Đăng xuất thất bại"
            });
        }

        res.json({
            message: "Đăng xuất thành công"
        });
    });
};

const kiemTraDangNhap = (req, res) => {
    if (!req.session.nguoiDung) {
        return res.status(401).json({
            message: "Chưa đăng nhập"
        });
    }

    res.json(req.session.nguoiDung);
};

module.exports = {
    dangKy,
    xacThucOTP,
    dangNhap,
    dangXuat,
    kiemTraDangNhap
};
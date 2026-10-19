const bcrypt = require("bcryptjs");
const nguoiDungModel = require("../Model/authModel");
const otpModel = require("../Model/otpModel");
const { guiOTP } = require("../config/email");
const otpDatLaiMatKhauModel = require("../Model/otpDatLaiMatKhauModel");

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

// 1. Gửi OTP đặt lại mật khẩu
const quenMatKhau = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Vui lòng nhập email" });
    }

    nguoiDungModel.getByEmail(email, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }

        // Không tiết lộ email có tồn tại hay không
        if (result.length === 0) {
            return res.json({
                message: "Nếu email hợp lệ, mã OTP sẽ được gửi đến hộp thư của bạn."
            });
        }

        try {
            const demOTP = (callback) => {
                const db = require("../config/database");
                db.query(
                    `SELECT COUNT(*) AS tong FROM otp_dat_lai_mat_khau
                     WHERE email = ? AND ngay_tao >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)`,
                    [email],
                    callback
                );
            };

            demOTP((err, rows) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Lỗi máy chủ" });
                }

                if (rows[0].tong >= 3) {
                    return res.status(429).json({
                        message: "Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau."
                    });
                }

                const db = require("../config/database");
                db.query(
                    "UPDATE otp_dat_lai_mat_khau SET da_su_dung = 1 WHERE email = ? AND da_su_dung = 0",
                    [email],
                    async (err) => {
                        if (err) {
                            console.log(err);
                            return res.status(500).json({ message: "Lỗi máy chủ" });
                        }

                        const maOTP = Math.floor(100000 + Math.random() * 900000).toString();
                        const hetHan = new Date(Date.now() + 5 * 60 * 1000);

                        otpDatLaiMatKhauModel.taoOTP({
                            email,
                            ma_otp: maOTP,
                            thoi_gian_het_han: hetHan
                        }, async (err) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({ message: "Không thể tạo OTP" });
                            }

                            try {
                                await guiOTP(email, maOTP, "dat_lai_mat_khau");
                                return res.json({
                                    message: "Nếu email hợp lệ, mã OTP sẽ được gửi đến hộp thư của bạn."
                                });
                            } catch (error) {
                                console.log(error);
                                return res.status(500).json({ message: "Không thể gửi OTP" });
                            }
                        });
                    }
                );
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }
    });
};

// 2. Đặt lại mật khẩu bằng email + OTP + mật khẩu mới
const datLaiMatKhau = (req, res) => {
    const { email, ma_otp, mat_khau_moi } = req.body;

    if (!email || !ma_otp || !mat_khau_moi) {
        return res.status(400).json({
            message: "Vui lòng nhập email, OTP và mật khẩu mới"
        });
    }

    if (!/^\d{6}$/.test(String(ma_otp))) {
        return res.status(400).json({ message: "Mã OTP phải gồm 6 chữ số" });
    }

    if (String(mat_khau_moi).length < 6) {
        return res.status(400).json({
            message: "Mật khẩu mới phải có ít nhất 6 ký tự"
        });
    }

    otpDatLaiMatKhauModel.layOTPHopLe(email, String(ma_otp), async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Lỗi máy chủ" });
        }

        if (!result || result.length === 0) {
            // Tăng số lần thử của OTP mới nhất còn hiệu lực
            const db = require("../config/database");
            db.query(
                `UPDATE otp_dat_lai_mat_khau
                 SET so_lan_thu = so_lan_thu + 1
                 WHERE email = ? AND da_su_dung = 0
                   AND thoi_gian_het_han > NOW() AND so_lan_thu < 5`,
                [email],
                () => res.status(400).json({
                    message: "Mã OTP không đúng, đã hết hạn hoặc vượt quá số lần thử."
                })
            );
            return;
        }

        try {
            const matKhauMaHoa = await bcrypt.hash(mat_khau_moi, 10);

            nguoiDungModel.capNhatMatKhau(email, matKhauMaHoa, (err, resultCapNhat) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: "Không thể cập nhật mật khẩu" });
                }

                if (!resultCapNhat || resultCapNhat.affectedRows === 0) {
                    return res.status(400).json({ message: "Không tìm thấy tài khoản" });
                }

                otpDatLaiMatKhauModel.danhDauDaSuDung(result[0].id, (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: "Mật khẩu đã cập nhật nhưng không thể khóa OTP"
                        });
                    }

                    return res.json({ message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập." });
                });
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Không thể đặt lại mật khẩu" });
        }
    });
};

module.exports = {
    dangKy,
    xacThucOTP,
    dangNhap,
    dangXuat,
    kiemTraDangNhap,
    quenMatKhau,
    datLaiMatKhau
};
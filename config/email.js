const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const guiOTP = async (email, maOTP) => {
    await transporter.sendMail({
        from: `"Hành Trình Khám Phá Di Sản" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Mã xác nhận đăng ký tài khoản",
        html: `
            <h2>Hành Trình Khám Phá Di Sản</h2>
            <p>Mã OTP xác nhận đăng ký tài khoản của bạn là:</p>
            <h1>${maOTP}</h1>
            <p>Mã OTP có hiệu lực trong 5 phút.</p>
        `
    });
};

module.exports = { guiOTP };
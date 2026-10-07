const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const otpForm = document.getElementById("otpForm");

const loginMessage = document.getElementById("loginMessage");
const registerMessage = document.getElementById("registerMessage");
const otpMessage = document.getElementById("otpMessage");

let emailDangKy = "";

function hienThiThongBao(element, message, type = "error") {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function xoaThongBao() {
    loginMessage.textContent = "";
    registerMessage.textContent = "";
    otpMessage.textContent = "";

    loginMessage.className = "form-message";
    registerMessage.className = "form-message";
    otpMessage.className = "form-message";
}

tabLogin.addEventListener("click", function () {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");

    loginForm.style.display = "block";
    registerForm.style.display = "none";
    otpForm.style.display = "none";

    xoaThongBao();
});

tabRegister.addEventListener("click", function () {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");

    registerForm.style.display = "block";
    loginForm.style.display = "none";
    otpForm.style.display = "none";

    xoaThongBao();
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    xoaThongBao();

    const email = document.getElementById("loginEmail").value.trim();
    const mat_khau = document.getElementById("loginPassword").value;

    try {
        const response = await fetch("/api/auth/dang-nhap", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                mat_khau
            })
        });

        const data = await response.json();

        if (!response.ok) {
            hienThiThongBao(
                loginMessage,
                data.message || "Email hoặc mật khẩu không đúng"
            );
            return;
        }

        hienThiThongBao(
            loginMessage,
            "Đăng nhập thành công!",
            "success"
        );

        setTimeout(function () {
            if (data.nguoiDung.vai_tro === "quan_tri_vien") {
                window.location.href = "/admin";
            } else {
                window.location.href = "index.html";
            }
        }, 500);

    } catch (error) {
        console.log(error);

        hienThiThongBao(
            loginMessage,
            "Không thể kết nối đến server!"
        );
    }
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    xoaThongBao();

    const ho_ten = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const mat_khau = document.getElementById("registerPassword").value;

    try {
        const response = await fetch("/api/auth/dang-ky", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ho_ten,
                email,
                mat_khau
            })
        });

        const data = await response.json();

        if (!response.ok) {
            hienThiThongBao(
                registerMessage,
                data.message || "Đăng ký thất bại"
            );
            return;
        }

        emailDangKy = email;

        registerForm.style.display = "none";
        otpForm.style.display = "block";

        hienThiThongBao(
            otpMessage,
            "Mã OTP đã được gửi đến email của bạn!",
            "success"
        );

    } catch (error) {
        console.log(error);

        hienThiThongBao(
            registerMessage,
            "Không thể kết nối đến server!"
        );
    }
});

otpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const ma_otp = document.getElementById("otpCode").value.trim();

    otpMessage.textContent = "";
    otpMessage.className = "form-message";

    if (!/^\d{6}$/.test(ma_otp)) {
        hienThiThongBao(
            otpMessage,
            "Vui lòng nhập đúng mã OTP gồm 6 chữ số!"
        );
        return;
    }

    try {
        const response = await fetch("/api/auth/xac-thuc-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: emailDangKy,
                ma_otp
            })
        });

        const data = await response.json();

        if (!response.ok) {
            hienThiThongBao(
                otpMessage,
                data.message || "Xác thực OTP thất bại"
            );
            return;
        }

        hienThiThongBao(
            otpMessage,
            "Đăng ký tài khoản thành công!",
            "success"
        );

        setTimeout(function () {
            otpForm.reset();
            registerForm.reset();

            emailDangKy = "";

            otpForm.style.display = "none";
            loginForm.style.display = "block";

            tabLogin.classList.add("active");
            tabRegister.classList.remove("active");

            xoaThongBao();
        }, 1500);

    } catch (error) {
        console.log(error);

        hienThiThongBao(
            otpMessage,
            "Không thể kết nối đến server!"
        );
    }
});
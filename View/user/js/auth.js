const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
tabLogin.addEventListener("click", function () {
    tabLogin.classList.add("active");
    tabRegister.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
});
tabRegister.addEventListener("click", function () {
    tabRegister.classList.add("active");
    tabLogin.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
});
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const mat_khau = document.getElementById("loginPassword").value;
    try {
        const response = await fetch("/api/auth/dang-nhap", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, mat_khau }) });
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Đăng nhập thất bại");
            return;
        }
        alert("Đăng nhập thành công!");
        if (data.nguoiDung.vai_tro === "quan_tri_vien") {
            window.location.href = "/admin";
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
});
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const ho_ten = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const mat_khau = document.getElementById("registerPassword").value;
    try {
        const response = await fetch("/api/auth/dang-ky", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ho_ten, email, mat_khau }) });
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Đăng ký thất bại");
            return;
        }
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        tabLogin.click();
        registerForm.reset();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
});
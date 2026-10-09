const tongDiSan = document.getElementById("tongDiSan");
const tongBaiViet = document.getElementById("tongBaiViet");
const tongNguoiDung = document.getElementById("tongNguoiDung");
const tongChoDuyet = document.getElementById("tongChoDuyet");

async function layThongKe() {
    try {
        const [diSanResponse, baiVietResponse, nguoiDungResponse] = await Promise.all([
            fetch("/api/di-san"),
            fetch("/api/bai-viet"),
            fetch("/api/nguoi-dung")
        ]);

        if (!diSanResponse.ok || !baiVietResponse.ok || !nguoiDungResponse.ok) {
            throw new Error("Không thể lấy dữ liệu thống kê");
        }

        const diSan = await diSanResponse.json();
        const baiViet = await baiVietResponse.json();
        const nguoiDung = await nguoiDungResponse.json();

        tongDiSan.textContent = diSan.length;
        tongBaiViet.textContent = baiViet.length;
        tongNguoiDung.textContent = nguoiDung.length;

        const choDuyet = baiViet.filter(function (bai) {
            return bai.trang_thai === "cho_duyet";
        });

        tongChoDuyet.textContent = choDuyet.length;
    } catch (error) {
        console.log("Lỗi lấy thống kê:", error);
    }
}

layThongKe();

function formatNgay(ngay) {
    if (!ngay) return "Chưa cập nhật";
    return new Date(ngay).toLocaleDateString("vi-VN");
}


const btnDangXuat = document.getElementById("btnDangXuat");

if (btnDangXuat) {
    btnDangXuat.addEventListener("click", dangXuat);
}

function dangXuat() {
    const overlay = document.createElement("div");
    overlay.className = "logout-overlay";
    overlay.innerHTML = `
        <div class="logout-modal">
            <div class="logout-icon">🚪</div>
            <h3>Đăng xuất</h3>
            <p>Bạn có chắc muốn đăng xuất khỏi trang quản trị?</p>
            <div class="logout-actions">
                <button class="btn-cancel" id="btnHuyDangXuat">Hủy</button>
                <button class="btn-confirm" id="btnXacNhanDangXuat">Đăng xuất</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btnHuyDangXuat").addEventListener("click", function () {
        overlay.remove();
    });

    document.getElementById("btnXacNhanDangXuat").addEventListener("click", async function () {
        const btn = this;
        btn.disabled = true;
        btn.textContent = "Đang đăng xuất...";

        try {
            const response = await fetch("/api/auth/dang-xuat", { method: "POST" });
            const data = await response.json();

            overlay.remove();

            if (!response.ok) {
                hienThongBao(data.message || "Đăng xuất thất bại", "error");
                return;
            }

            hienThongBao("Đăng xuất thành công!", "success");

            setTimeout(function () {
                window.location.href = "/user/auth.html";
            }, 1000);
        } catch (error) {
            console.log(error);
            overlay.remove();
            hienThongBao("Không thể kết nối đến server!", "error");
        }
    });
}

function hienThongBao(message, type = "success") {
    const thongBaoCu = document.querySelector(".toast");
    if (thongBaoCu) thongBaoCu.remove();

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("hide");
        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 2500);
}


layDanhSachDiSan();
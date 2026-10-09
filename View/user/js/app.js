const API_URL = "/api/di-san";
let danhSachDiSan = [];
let diSanDangChon = null;

const tamThuPopup = document.getElementById("tamThuPopup");
const btnDongTamThu = document.getElementById("btnDongTamThu");
const btnKhamPha = document.getElementById("btnKhamPha");
const btnGopYTamThu = document.getElementById("btnGopYTamThu");

const emailNhom = "hanhtrinhkhamphadisan@gmail.com";
const khoaTamThu = "htkpds_da_xem_tam_thu";

async function loadDiSan() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Không thể lấy dữ liệu di sản");
        danhSachDiSan = await response.json();
        console.log("Dữ liệu từ Database:", danhSachDiSan);
        hienThiDiSan();
        hienThiBanDo();
        hienThiGallery();
        if (danhSachDiSan.length > 0) chonDiSan(danhSachDiSan[0]);
    } catch (error) {
        console.error(error);
        const heritageGrid = document.getElementById("heritageGrid");
        if (heritageGrid) heritageGrid.innerHTML = `<p style="color:red">Không thể tải dữ liệu di sản.</p>`;
    }
}

function getImageUrl(image) {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    if (image.startsWith("/uploads/")) return image;
    if (image.startsWith("uploads/")) return "/" + image;
    return "/uploads/" + image;
}

function hienThiDiSan() {
    const container = document.getElementById("heritageGrid");
    if (!container) return;
    container.innerHTML = "";

    danhSachDiSan.forEach(function (diSan) {
        const card = document.createElement("article");
        card.className = "heritage-card";
        const imageUrl = getImageUrl(diSan.hinh_anh);

        card.innerHTML = `
            <div class="card-image" style="background-image:url('${imageUrl}')">
                <span class="badge">${diSan.xep_hang || "Di tích"}</span>
            </div>
            <div class="card-body">
                <p class="location">QUẬN 12 • TP. HỒ CHÍ MINH</p>
                <h3>${diSan.ten_di_san || "Chưa có tên"}</h3>
                <p>${diSan.gia_tri_van_hoa || "Chưa có thông tin"}</p>
                <a href="chitiet_sp.html?id=${diSan.id}" class="card-link">Khám phá →</a>
            </div>
        `;

        container.appendChild(card);
    });
}

function hienThiBanDo() {
    const mapList = document.getElementById("mapList");
    if (!mapList) return;
    mapList.innerHTML = "";

    danhSachDiSan.forEach(function (diSan, index) {
        const button = document.createElement("button");
        button.className = "map-place";
        button.dataset.id = diSan.id;

        button.innerHTML = `
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div>
                <strong>${diSan.ten_di_san}</strong>
                <small>${diSan.dia_chi || "Địa điểm di sản"}</small>
            </div>
        `;

        button.addEventListener("click", function () {
            document.querySelectorAll(".map-place").forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");
            chonDiSan(diSan);
        });

        mapList.appendChild(button);
    });
}

function chonDiSan(diSan) {
    diSanDangChon = diSan;

    const googleMap = document.getElementById("googleMap");

    if (googleMap) {
        if (diSan.vi_do && diSan.kinh_do) {
            googleMap.src = `https://www.google.com/maps?q=${diSan.vi_do},${diSan.kinh_do}&output=embed`;
        } else {
            const diaChi = diSan.dia_chi || diSan.ten_di_san;
            googleMap.src = `https://www.google.com/maps?q=${encodeURIComponent(diaChi)}&output=embed`;
        }
    }

    document.querySelectorAll(".map-place").forEach(function (item) {
        item.classList.toggle("active", Number(item.dataset.id) === Number(diSan.id));
    });
}

function hienThiGallery() {
    const gallery = document.getElementById("galleryGrid");
    if (!gallery) return;
    gallery.innerHTML = "";

    danhSachDiSan.forEach(function (diSan, index) {
        if (!diSan.hinh_anh) return;

        const item = document.createElement("div");
        item.className = "gallery-item";

        if (index === 0) {
            item.classList.add("large");
        }

        item.style.backgroundImage = `url('${getImageUrl(diSan.hinh_anh)}')`;
        item.innerHTML = `<span>${diSan.ten_di_san}</span>`;

        gallery.appendChild(item);
    });
}

const shareButton = document.getElementById("shareButton");

if (shareButton) {
    shareButton.addEventListener("click", function () {
        hienThongBao("Tính năng đăng bài sẽ được kết nối với hệ thống tài khoản người dùng.", "info");
    });
}

const searchButton = document.querySelector(".search-btn");

if (searchButton) {
    searchButton.addEventListener("click", function () {
        const keyword = prompt("Bạn muốn tìm địa điểm nào?");
        if (!keyword) return;

        const ketQua = danhSachDiSan.filter(function (diSan) {
            return diSan.ten_di_san && diSan.ten_di_san.toLowerCase().includes(keyword.toLowerCase());
        });

        if (ketQua.length === 0) {
            hienThongBao("Không tìm thấy di sản: " + keyword, "error");
            return;
        }

        const heritageGrid = document.getElementById("heritageGrid");
        heritageGrid.innerHTML = "";

        ketQua.forEach(function (diSan) {
            const card = document.createElement("article");
            card.className = "heritage-card";

            const imageUrl = getImageUrl(diSan.hinh_anh);

            card.innerHTML = `
                <div class="card-image" style="background-image:url('${imageUrl}')">
                    <span class="badge">${diSan.xep_hang || "Di tích"}</span>
                </div>
                <div class="card-body">
                    <p class="location">QUẬN 12 • TP. HỒ CHÍ MINH</p>
                    <h3>${diSan.ten_di_san}</h3>
                    <p>${diSan.gia_tri_van_hoa || ""}</p>
                    <a href="chitiet_sp.html?id=${diSan.id}" class="card-link">Khám phá →</a>
                </div>
            `;

            heritageGrid.appendChild(card);
        });
    });
}

async function kiemTraTaiKhoan() {
    try {
        const response = await fetch("/api/auth/toi");

        const khuVuc = document.getElementById("khuVucTaiKhoan");

        if (!khuVuc) return;

        if (!response.ok) {
            khuVuc.innerHTML = `<a href="auth.html" class="login-btn">Đăng nhập</a>`;
            return;
        }

        const nguoiDung = await response.json();

        khuVuc.innerHTML = `
            <div class="user-account">
                <span class="user-name">${nguoiDung.ho_ten || nguoiDung.email || "Người dùng"}</span>
                <button class="logout-user-btn" id="btnDangXuatUser">Đăng xuất</button>
            </div>
        `;

        document.getElementById("btnDangXuatUser").addEventListener("click", dangXuat);
    } catch (error) {
        console.log("Không thể kiểm tra tài khoản:", error);
    }
}

function dangXuat() {
    const overlay = document.createElement("div");

    overlay.className = "user-logout-overlay";

    overlay.innerHTML = `
        <div class="user-logout-modal">
            <div class="user-logout-icon">🚪</div>
            <h3>Đăng xuất</h3>
            <p>Bạn có chắc muốn đăng xuất khỏi tài khoản?</p>
            <div class="user-logout-actions">
                <button class="user-btn-cancel" id="btnHuyDangXuatUser">Hủy</button>
                <button class="user-btn-confirm" id="btnXacNhanDangXuatUser">Đăng xuất</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btnHuyDangXuatUser").addEventListener("click", function () {
        overlay.remove();
    });

    document.getElementById("btnXacNhanDangXuatUser").addEventListener("click", async function () {
        const button = this;
        button.disabled = true;
        button.textContent = "Đang đăng xuất...";

        try {
            const response = await fetch("/api/auth/dang-xuat", {
                method: "POST"
            });

            const data = await response.json();

            overlay.remove();

            if (!response.ok) {
                hienThongBao(data.message || "Đăng xuất thất bại", "error");
                return;
            }

            hienThongBao("Đăng xuất thành công!", "success");

            setTimeout(function () {
                window.location.href = "index.html";
            }, 1000);
        } catch (error) {
            console.log(error);
            overlay.remove();
            hienThongBao("Không thể kết nối đến server!", "error");
        }
    });
}

function hienThongBao(message, type = "success") {
    const thongBaoCu = document.querySelector(".user-toast");

    if (thongBaoCu) {
        thongBaoCu.remove();
    }

    const toast = document.createElement("div");

    toast.className = `user-toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("hide");

        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 2500);
}


if (btnGopYTamThu) {
    const subject = "Góp ý, đính chính thông tin - Hành trình khám phá Di sản";
    const body = `Kính gửi nhóm Hành trình khám phá Di sản,

Tôi muốn góp ý hoặc đính chính thông tin sau:

Tên di sản:
Nội dung hiện tại cần xem xét:
Thông tin đề xuất điều chỉnh:
Nguồn tham khảo (nếu có):

Trân trọng!`;

    const gmailURL = "https://mail.google.com/mail/?view=cm&fs=1"
        + "&to=" + encodeURIComponent(emailNhom)
        + "&su=" + encodeURIComponent(subject)
        + "&body=" + encodeURIComponent(body);

    btnGopYTamThu.href = gmailURL;
    btnGopYTamThu.target = "_blank";
    btnGopYTamThu.rel = "noopener noreferrer";
}

function dongTamThu() {
    if (!tamThuPopup) return;

    tamThuPopup.classList.remove("show");
    tamThuPopup.setAttribute("aria-hidden", "true");
    localStorage.setItem(khoaTamThu, "true");
}

if (tamThuPopup && !localStorage.getItem(khoaTamThu)) {
    tamThuPopup.classList.add("show");
    tamThuPopup.setAttribute("aria-hidden", "false");
}

if (btnDongTamThu) {
    btnDongTamThu.addEventListener("click", dongTamThu);
}

if (btnKhamPha) {
    btnKhamPha.addEventListener("click", dongTamThu);
}

if (tamThuPopup) {
    tamThuPopup.addEventListener("click", function (event) {
        if (event.target === tamThuPopup) {
            dongTamThu();
        }
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && tamThuPopup?.classList.contains("show")) {
        dongTamThu();
    }
});

const btnMoGopY = document.getElementById("btnMoGopY");

if (btnMoGopY) {
    btnMoGopY.addEventListener("click", function () {
        const email = "hanhtrinhkhamphadisan@gmail.com";
        const subject = "Góp ý, đính chính thông tin - Hành trình khám phá Di sản";
        const body = "Tên di sản:\nNội dung cần đính chính:\nThông tin đề xuất:\nNguồn tham khảo:";

        const gmailURL = "https://mail.google.com/mail/?view=cm&fs=1"
            + "&to=" + encodeURIComponent(email)
            + "&su=" + encodeURIComponent(subject)
            + "&body=" + encodeURIComponent(body);

        window.open(gmailURL, "_blank", "noopener,noreferrer");
    });
}

kiemTraTaiKhoan();
loadDiSan();
const API_URL = "/api/di-san";
let danhSachDiSan = [];
let diSanDangChon = null;

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

    danhSachDiSan.forEach((diSan) => {
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
                <a href="#" class="card-link" onclick="xemChiTiet(${diSan.id}); return false;">Khám phá →</a>
            </div>
        `;

        container.appendChild(card);
    });
}

function hienThiBanDo() {
    const mapList = document.getElementById("mapList");
    if (!mapList) return;
    mapList.innerHTML = "";

    danhSachDiSan.forEach((diSan, index) => {
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

        button.addEventListener("click", () => {
            document.querySelectorAll(".map-place").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            chonDiSan(diSan);
        });

        mapList.appendChild(button);
    });
}

function chonDiSan(diSan) {
    diSanDangChon = diSan;

    const selectedPlace = document.getElementById("selectedPlace");
    const selectedAddress = document.getElementById("selectedAddress");

    if (selectedPlace) selectedPlace.textContent = diSan.ten_di_san;
    if (selectedAddress) selectedAddress.textContent = diSan.dia_chi || "Chưa có địa chỉ";

    document.querySelectorAll(".map-place").forEach(item => {
        item.classList.toggle("active", Number(item.dataset.id) === Number(diSan.id));
    });
}

const mapButton = document.getElementById("mapButton");

if (mapButton) {
    mapButton.addEventListener("click", () => {
        if (!diSanDangChon) {
            alert("Vui lòng chọn một di sản.");
            return;
        }

        const diaChi = diSanDangChon.dia_chi || diSanDangChon.ten_di_san;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(diaChi)}`;
        window.open(url, "_blank");
    });
}

function hienThiGallery() {
    const gallery = document.getElementById("galleryGrid");
    if (!gallery) return;
    gallery.innerHTML = "";

    danhSachDiSan.forEach((diSan, index) => {
        if (!diSan.hinh_anh) return;

        const item = document.createElement("div");
        item.className = "gallery-item";
        if (index === 0) item.classList.add("large");

        item.style.backgroundImage = `url('${getImageUrl(diSan.hinh_anh)}')`;
        item.innerHTML = `<span>${diSan.ten_di_san}</span>`;

        gallery.appendChild(item);
    });
}

function xemChiTiet(id) {
    window.location.href = `detail.html?id=${id}`;
}

const shareButton = document.getElementById("shareButton");

if (shareButton) {
    shareButton.addEventListener("click", () => {
        alert("Tính năng đăng bài sẽ được kết nối với hệ thống tài khoản người dùng.");
    });
}

const searchButton = document.querySelector(".search-btn");

if (searchButton) {
    searchButton.addEventListener("click", () => {
        const keyword = prompt("Bạn muốn tìm địa điểm nào?");
        if (!keyword) return;

        const ketQua = danhSachDiSan.filter(diSan => diSan.ten_di_san && diSan.ten_di_san.toLowerCase().includes(keyword.toLowerCase()));

        if (ketQua.length === 0) {
            alert("Không tìm thấy di sản: " + keyword);
            return;
        }

        const heritageGrid = document.getElementById("heritageGrid");
        heritageGrid.innerHTML = "";

        ketQua.forEach(diSan => {
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
                    <a href="#" class="card-link" onclick="xemChiTiet(${diSan.id}); return false;">Khám phá →</a>
                </div>
            `;

            heritageGrid.appendChild(card);
        });
    });
}

async function kiemTraTaiKhoan() {
    try {
        const response = await fetch("/api/auth/toi");
        if (!response.ok) return;
        const nguoiDung = await response.json();
        const khuVuc = document.getElementById("khuVucTaiKhoan");
        if (!khuVuc) return;
        khuVuc.innerHTML = `<button id="btnDangXuat">Đăng xuất</button>`;
        document.getElementById("btnDangXuat").addEventListener("click", dangXuat);
    } catch (error) {
        console.log(error);
    }
}
async function dangXuat() {
    try {
        const response = await fetch("/api/auth/dang-xuat", { method: "POST" });
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Đăng xuất thất bại");
            return;
        }
        alert("Đăng xuất thành công!");
        window.location.href = "index.html";
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
}

kiemTraTaiKhoan();
loadDiSan();
const modal = document.getElementById("modal");
const btnThem = document.getElementById("btnThem");
const btnDong = document.getElementById("btnDong");
const btnHuy = document.getElementById("btnHuy");
const formDiSan = document.getElementById("formDiSan");
const danhSachDiSan = document.getElementById("danhSachDiSan");
const tongDiSan = document.getElementById("tongDiSan");

let idDangSua = null;


btnThem.addEventListener("click", function () {
    idDangSua = null;
    formDiSan.reset();
    modal.classList.add("show");
});

btnDong.addEventListener("click", function () {
    modal.classList.remove("show");
});

btnHuy.addEventListener("click", function () {
    modal.classList.remove("show");
});

async function layDanhSachDiSan() {
    try {
        const response = await fetch("/api/di-san");
        const data = await response.json();
        tongDiSan.textContent = data.length;
        danhSachDiSan.innerHTML = "";
        if (data.length === 0) {
            danhSachDiSan.innerHTML = `<tr><td colspan="6" class="loading">Chưa có di sản nào</td></tr>`;
            return;
        }
        data.forEach(function (diSan) {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${diSan.id}</td><td><strong>${diSan.ten_di_san}</strong></td><td>${diSan.dia_chi}</td><td>${diSan.xep_hang || "Chưa cập nhật"}</td><td>${formatNgay(diSan.ngay_tao)}</td><td><button onclick="suaDiSan(${diSan.id})">✏️</button><button onclick="xoaDiSan(${diSan.id})">🗑️</button></td>`;
            danhSachDiSan.appendChild(row);
        });
    } catch (error) {
        console.log(error);
        danhSachDiSan.innerHTML = `<tr><td colspan="6" class="loading">Không thể tải dữ liệu</td></tr>`;
    }
}

formDiSan.addEventListener("submit", async function (event) {
    event.preventDefault();
    const duLieu = {
        ten_di_san: document.getElementById("ten_di_san").value,
        dia_chi: document.getElementById("dia_chi").value,
        lich_su_hinh_thanh: document.getElementById("lich_su_hinh_thanh").value,
        nhan_vat_lien_quan: document.getElementById("nhan_vat_lien_quan").value,
        su_kien_lich_su: document.getElementById("su_kien_lich_su").value,
        gia_tri_van_hoa: document.getElementById("gia_tri_van_hoa").value,
        kien_truc: document.getElementById("kien_truc").value,
        xep_hang: document.getElementById("xep_hang").value,
        don_vi_quan_ly: document.getElementById("don_vi_quan_ly").value,
        hinh_anh: document.getElementById("hinh_anh").value
    };
    try {
        const url = idDangSua === null ? "/api/di-san" : `/api/di-san/${idDangSua}`;
        const method = idDangSua === null ? "POST" : "PUT";
        const response = await fetch(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(duLieu) });
        const ketQua = await response.json();
        if (!response.ok) {
            alert(ketQua.message || "Thao tác thất bại");
            return;
        }
        alert(idDangSua === null ? "Thêm di sản thành công!" : "Cập nhật di sản thành công!");
        formDiSan.reset();
        modal.classList.remove("show");
        idDangSua = null;
        layDanhSachDiSan();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
});

async function suaDiSan(id) {
    try {
        const response = await fetch(`/api/di-san/${id}`);
        const diSan = await response.json();
        if (!response.ok) {
            alert(diSan.message || "Không tìm thấy di sản");
            return;
        }
        idDangSua = id;
        document.getElementById("ten_di_san").value = diSan.ten_di_san || "";
        document.getElementById("dia_chi").value = diSan.dia_chi || "";
        document.getElementById("lich_su_hinh_thanh").value = diSan.lich_su_hinh_thanh || "";
        document.getElementById("nhan_vat_lien_quan").value = diSan.nhan_vat_lien_quan || "";
        document.getElementById("su_kien_lich_su").value = diSan.su_kien_lich_su || "";
        document.getElementById("gia_tri_van_hoa").value = diSan.gia_tri_van_hoa || "";
        document.getElementById("kien_truc").value = diSan.kien_truc || "";
        document.getElementById("xep_hang").value = diSan.xep_hang || "";
        document.getElementById("don_vi_quan_ly").value = diSan.don_vi_quan_ly || "";
        document.getElementById("hinh_anh").value = diSan.hinh_anh || "";
        modal.classList.add("show");
    } catch (error) {
        console.log(error);
        alert("Không thể lấy thông tin di sản!");
    }
}

async function xoaDiSan(id) {
    const xacNhan = confirm("Bạn có chắc chắn muốn xóa di sản này không?");
    if (!xacNhan) return;
    try {
        const response = await fetch(`/api/di-san/${id}`, { method: "DELETE" });
        const ketQua = await response.json();
        if (!response.ok) {
            alert(ketQua.message || "Xóa di sản thất bại");
            return;
        }
        alert("Xóa di sản thành công!");
        layDanhSachDiSan();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
}

function formatNgay(ngay) {
    if (!ngay) return "";
    const date = new Date(ngay);
    return date.toLocaleDateString("vi-VN");
}

const btnDangXuat = document.getElementById("btnDangXuat");
if (btnDangXuat) {
    btnDangXuat.addEventListener("click", dangXuat);
}
async function dangXuat() {
    const xacNhan = confirm("Bạn có chắc muốn đăng xuất không?");
    if (!xacNhan) return;
    try {
        const response = await fetch("/api/auth/dang-xuat", { method: "POST" });
        const data = await response.json();
        if (!response.ok) {
            alert(data.message || "Đăng xuất thất bại");
            return;
        }
        alert("Đăng xuất thành công!");
        window.location.href = "/user/auth.html";
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
}

layDanhSachDiSan();
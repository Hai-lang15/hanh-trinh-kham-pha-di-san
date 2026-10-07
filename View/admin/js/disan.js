const modal = document.getElementById("modal");
const btnThem = document.getElementById("btnThem");
const btnDong = document.getElementById("btnDong");
const btnHuy = document.getElementById("btnHuy");
const formDiSan = document.getElementById("formDiSan");
const danhSachDiSan = document.getElementById("danhSachDiSan");
let idDangSua = null;

btnThem.addEventListener("click", function () {
    idDangSua = null;
    formDiSan.reset();
    document.getElementById("hinh_anh").value = "";
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
    const formData = new FormData();
    formData.append("ten_di_san", document.getElementById("ten_di_san").value);
    formData.append("dia_chi", document.getElementById("dia_chi").value);
    formData.append("vi_do", document.getElementById("vi_do").value);
    formData.append("kinh_do", document.getElementById("kinh_do").value);
    formData.append("lich_su_hinh_thanh", document.getElementById("lich_su_hinh_thanh").value);
    formData.append("nhan_vat_lien_quan", document.getElementById("nhan_vat_lien_quan").value);
    formData.append("su_kien_lich_su", document.getElementById("su_kien_lich_su").value);
    formData.append("gia_tri_van_hoa", document.getElementById("gia_tri_van_hoa").value);
    formData.append("kien_truc", document.getElementById("kien_truc").value);
    formData.append("xep_hang", document.getElementById("xep_hang").value);
    formData.append("don_vi_quan_ly", document.getElementById("don_vi_quan_ly").value);
    const fileAnh = document.getElementById("hinh_anh").files[0];
    if (fileAnh) {
        formData.append("hinh_anh", fileAnh);
    }
    try {
        const url = idDangSua === null ? "/api/di-san" : `/api/di-san/${idDangSua}`;
        const method = idDangSua === null ? "POST" : "PUT";
        const response = await fetch(url, { method: method, body: formData });
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
        document.getElementById("vi_do").value = diSan.vi_do || "";
        document.getElementById("kinh_do").value = diSan.kinh_do || "";
        document.getElementById("lich_su_hinh_thanh").value = diSan.lich_su_hinh_thanh || "";
        document.getElementById("nhan_vat_lien_quan").value = diSan.nhan_vat_lien_quan || "";
        document.getElementById("su_kien_lich_su").value = diSan.su_kien_lich_su || "";
        document.getElementById("gia_tri_van_hoa").value = diSan.gia_tri_van_hoa || "";
        document.getElementById("kien_truc").value = diSan.kien_truc || "";
        document.getElementById("xep_hang").value = diSan.xep_hang || "";
        document.getElementById("don_vi_quan_ly").value = diSan.don_vi_quan_ly || "";
        document.getElementById("hinh_anh").value = "";
        modal.classList.add("show");
    } catch (error) {
        console.log(error);
        alert("Không thể lấy thông tin di sản!");
    }
}

async function xoaDiSan(id) {
    const xacNhan = confirm("Bạn có chắc chắn muốn xóa di sản này không?");
    if (!xacNhan) {
        return;
    }
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
    if (!ngay) {
        return "";
    }
    const date = new Date(ngay);
    return date.toLocaleDateString("vi-VN");
}

layDanhSachDiSan();
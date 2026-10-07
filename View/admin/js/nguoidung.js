const modal = document.getElementById("modal");
const btnThem = document.getElementById("btnThem");
const btnDong = document.getElementById("btnDong");
const btnHuy = document.getElementById("btnHuy");
const formNguoiDung = document.getElementById("formNguoiDung");
const danhSachNguoiDung = document.getElementById("danhSachNguoiDung");
const tieuDeModal = document.getElementById("tieuDeModal");

let idDangSua = null;

btnThem.addEventListener("click", function () {
    idDangSua = null;
    formNguoiDung.reset();
    tieuDeModal.textContent = "Thêm người dùng";
    modal.classList.add("show");
});

btnDong.addEventListener("click", function () {
    modal.classList.remove("show");
});

btnHuy.addEventListener("click", function () {
    modal.classList.remove("show");
});

async function layDanhSachNguoiDung() {
    try {
        const response = await fetch("/api/nguoi-dung");
        const data = await response.json();

        danhSachNguoiDung.innerHTML = "";

        if (data.length === 0) {
            danhSachNguoiDung.innerHTML = `
                <tr>
                    <td colspan="7" class="loading">
                        Chưa có người dùng nào
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(function (nguoiDung) {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${nguoiDung.id}</td>
                <td><strong>${nguoiDung.ho_ten}</strong></td>
                <td>${nguoiDung.email}</td>
                <td>${hienThiVaiTro(nguoiDung.vai_tro)}</td>
                <td>${hienThiTrangThai(nguoiDung.trang_thai)}</td>
                <td>${formatNgay(nguoiDung.ngay_tao)}</td>
                <td>
                    <button onclick="suaNguoiDung(${nguoiDung.id})">✏️</button>
                    <button onclick="xoaNguoiDung(${nguoiDung.id})">🗑️</button>
                </td>
            `;

            danhSachNguoiDung.appendChild(row);
        });
    } catch (error) {
        console.log(error);

        danhSachNguoiDung.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Không thể tải dữ liệu
                </td>
            </tr>
        `;
    }
}

formNguoiDung.addEventListener("submit", async function (event) {
    event.preventDefault();

    const duLieu = {
        ho_ten: document.getElementById("ho_ten").value,
        email: document.getElementById("email").value,
        mat_khau: document.getElementById("mat_khau").value,
        anh_dai_dien: document.getElementById("anh_dai_dien").value,
        vai_tro: document.getElementById("vai_tro").value,
        trang_thai: document.getElementById("trang_thai").value
    };

    try {
        const url = idDangSua === null
            ? "/api/nguoi-dung"
            : `/api/nguoi-dung/${idDangSua}`;

        const method = idDangSua === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(duLieu)
        });

        const ketQua = await response.json();

        if (!response.ok) {
            alert(ketQua.message || "Thao tác thất bại");
            return;
        }

        alert(
            idDangSua === null
                ? "Thêm người dùng thành công!"
                : "Cập nhật người dùng thành công!"
        );

        formNguoiDung.reset();
        modal.classList.remove("show");
        idDangSua = null;

        layDanhSachNguoiDung();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
});

async function suaNguoiDung(id) {
    try {
        const response = await fetch(`/api/nguoi-dung/${id}`);
        const nguoiDung = await response.json();

        if (!response.ok) {
            alert(nguoiDung.message || "Không tìm thấy người dùng");
            return;
        }

        idDangSua = id;

        tieuDeModal.textContent = "Sửa người dùng";

        document.getElementById("ho_ten").value = nguoiDung.ho_ten || "";
        document.getElementById("email").value = nguoiDung.email || "";
        document.getElementById("mat_khau").value = "";
        document.getElementById("anh_dai_dien").value = nguoiDung.anh_dai_dien || "";
        document.getElementById("vai_tro").value = nguoiDung.vai_tro || "nguoi_dung";
        document.getElementById("trang_thai").value = nguoiDung.trang_thai || "hoat_dong";

        modal.classList.add("show");
    } catch (error) {
        console.log(error);
        alert("Không thể lấy thông tin người dùng!");
    }
}

async function xoaNguoiDung(id) {
    const xacNhan = confirm(
        "Bạn có chắc chắn muốn xóa người dùng này không?"
    );

    if (!xacNhan) {
        return;
    }

    try {
        const response = await fetch(`/api/nguoi-dung/${id}`, {
            method: "DELETE"
        });

        const ketQua = await response.json();

        if (!response.ok) {
            alert(ketQua.message || "Xóa người dùng thất bại");
            return;
        }

        alert("Xóa người dùng thành công!");

        layDanhSachNguoiDung();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
}

function hienThiVaiTro(vaiTro) {
    if (vaiTro === "quan_tri_vien") {
        return "Quản trị viên";
    }

    return "Người dùng";
}

function hienThiTrangThai(trangThai) {
    if (trangThai === "bi_khoa") {
        return "Bị khóa";
    }

    return "Hoạt động";
}

function formatNgay(ngay) {
    if (!ngay) {
        return "";
    }

    const date = new Date(ngay);
    return date.toLocaleDateString("vi-VN");
}

layDanhSachNguoiDung();
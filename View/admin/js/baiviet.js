const modal = document.getElementById("modal");
const btnThem = document.getElementById("btnThem");
const btnDong = document.getElementById("btnDong");
const btnHuy = document.getElementById("btnHuy");
const formBaiViet = document.getElementById("formBaiViet");
const danhSachBaiViet = document.getElementById("danhSachBaiViet");
const tieuDeModal = document.getElementById("tieuDeModal");
const danhSachBlock = document.getElementById("danhSachBlock");
const btnThemText = document.getElementById("btnThemText");
const btnThemImage = document.getElementById("btnThemImage");
const btnThemLink = document.getElementById("btnThemLink");

let idDangSua = null;

btnThem.addEventListener("click", function () {
    idDangSua = null;
    formBaiViet.reset();
    danhSachBlock.innerHTML = "";
    document.getElementById("ma_nguoi_dung").value = "1";
    tieuDeModal.textContent = "Thêm bài viết";
    modal.classList.add("show");
});

btnDong.addEventListener("click", function () {
    modal.classList.remove("show");
});

btnHuy.addEventListener("click", function () {
    modal.classList.remove("show");
});

async function layDanhSachBaiViet() {
    try {
        const response = await fetch("/api/bai-viet");
        const data = await response.json();
        danhSachBaiViet.innerHTML = "";

        if (data.length === 0) {
            danhSachBaiViet.innerHTML = `<tr><td colspan="7" class="loading">Chưa có bài viết nào</td></tr>`;
            return;
        }

        data.forEach(function (baiViet) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${baiViet.id}</td>
                <td><strong>${baiViet.tieu_de}</strong></td>
                <td>${baiViet.ho_ten || "Chưa có"}</td>
                <td>${baiViet.ten_di_san || "Không liên quan"}</td>
                <td>${hienThiTrangThai(baiViet.trang_thai)}</td>
                <td>${formatNgay(baiViet.ngay_tao)}</td>
                <td>
                    <button onclick="suaBaiViet(${baiViet.id})">✏️</button>
                    <button onclick="xoaBaiViet(${baiViet.id})">🗑️</button>
                </td>`;
            danhSachBaiViet.appendChild(row);
        });
    } catch (error) {
        console.log(error);
        danhSachBaiViet.innerHTML = `<tr><td colspan="7" class="loading">Không thể tải dữ liệu</td></tr>`;
    }
}

formBaiViet.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        const formData = new FormData();
        formData.append("ma_nguoi_dung", document.getElementById("ma_nguoi_dung").value);
        formData.append("ma_di_san", document.getElementById("ma_di_san").value);
        formData.append("tieu_de", document.getElementById("tieu_de").value);
        formData.append("noi_dung", "");
        formData.append("trang_thai", document.getElementById("trang_thai").value);

        const url = idDangSua === null ? "/api/bai-viet" : `/api/bai-viet/${idDangSua}`;
        const method = idDangSua === null ? "POST" : "PUT";

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        const ketQua = await response.json();

        if (!response.ok) {
            alert(ketQua.message || "Thao tác thất bại");
            return;
        }

        const baiVietId = idDangSua === null ? ketQua.id : idDangSua;

        const formDataBlock = new FormData();
        const danhSachNoiDung = [];
        const blocks = document.querySelectorAll(".noi-dung-block");

        blocks.forEach(function (block, index) {
            const loai = block.dataset.loai;

            if (loai === "text") {
                const noiDung = block.querySelector(".block-text").value.trim();

                if (noiDung) {
                    danhSachNoiDung.push({
                        loai: "text",
                        noi_dung: noiDung,
                        thu_tu: index + 1
                    });
                }
            }

            if (loai === "image") {
                const fileInput = block.querySelector(".block-image");
                const file = fileInput.files[0];
                const anhCu = block.querySelector(".block-image-old").value;
                const fileKey = `block_image_${index}`;

                if (file) {
                    formDataBlock.append(fileKey, file);

                    danhSachNoiDung.push({
                        loai: "image",
                        noi_dung: "",
                        thu_tu: index + 1,
                        file_key: fileKey
                    });
                } else if (anhCu) {
                    danhSachNoiDung.push({
                        loai: "image",
                        noi_dung: anhCu,
                        thu_tu: index + 1
                    });
                }
            }

            if (loai === "link") {
                const link = block.querySelector(".block-link").value.trim();

                if (link) {
                    danhSachNoiDung.push({
                        loai: "link",
                        noi_dung: link,
                        thu_tu: index + 1
                    });
                }
            }
        });

        formDataBlock.append("noi_dung_blocks", JSON.stringify(danhSachNoiDung));

        const responseBlock = await fetch(`/api/noi-dung-bai-viet/${baiVietId}`, {
            method: "POST",
            body: formDataBlock
        });

        const ketQuaBlock = await responseBlock.json();

        if (!responseBlock.ok) {
            alert(ketQuaBlock.message || "Lưu nội dung bài viết thất bại");
            return;
        }

        alert(idDangSua === null ? "Thêm bài viết thành công!" : "Cập nhật bài viết thành công!");

        formBaiViet.reset();
        danhSachBlock.innerHTML = "";
        document.getElementById("ma_nguoi_dung").value = "1";
        modal.classList.remove("show");
        idDangSua = null;

        layDanhSachBaiViet();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
});

async function suaBaiViet(id) {
    try {
        const response = await fetch(`/api/bai-viet/${id}`);
        const baiViet = await response.json();

        if (!response.ok) {
            alert(baiViet.message || "Không tìm thấy bài viết");
            return;
        }

        idDangSua = id;
        tieuDeModal.textContent = "Sửa bài viết";

        document.getElementById("ma_nguoi_dung").value = baiViet.ma_nguoi_dung || "1";
        document.getElementById("ma_di_san").value = baiViet.ma_di_san || "";
        document.getElementById("tieu_de").value = baiViet.tieu_de || "";
        document.getElementById("trang_thai").value = baiViet.trang_thai || "cho_duyet";

        danhSachBlock.innerHTML = "";

        const responseBlock = await fetch(`/api/noi-dung-bai-viet/${id}`);
        const blocks = await responseBlock.json();

        if (responseBlock.ok && Array.isArray(blocks)) {
            blocks.forEach(function (block) {
                themBlock(block.loai, block.noi_dung);
            });
        }

        modal.classList.add("show");
    } catch (error) {
        console.log(error);
        alert("Không thể lấy thông tin bài viết!");
    }
}

async function xoaBaiViet(id) {
    const xacNhan = confirm("Bạn có chắc chắn muốn xóa bài viết này không?");

    if (!xacNhan) return;

    try {
        const response = await fetch(`/api/bai-viet/${id}`, {
            method: "DELETE"
        });

        const ketQua = await response.json();

        if (!response.ok) {
            alert(ketQua.message || "Xóa bài viết thất bại");
            return;
        }

        alert("Xóa bài viết thành công!");
        layDanhSachBaiViet();
    } catch (error) {
        console.log(error);
        alert("Không thể kết nối đến server!");
    }
}

async function layDanhSachDiSan() {
    try {
        const response = await fetch("/api/di-san");
        const data = await response.json();

        const selectDiSan = document.getElementById("ma_di_san");
        selectDiSan.innerHTML = `<option value="">-- Chọn di sản --</option>`;

        data.forEach(function (diSan) {
            selectDiSan.innerHTML += `<option value="${diSan.id}">${diSan.ten_di_san}</option>`;
        });
    } catch (error) {
        console.log("Lỗi lấy danh sách di sản:", error);
    }
}

function themBlock(loai, duLieu = "") {
    const block = document.createElement("div");
    block.className = "noi-dung-block";
    block.dataset.loai = loai;

    if (loai === "text") {
        block.innerHTML = `
            <div class="block-header">
                <strong>📝 Đoạn văn</strong>
                <button type="button" class="btn-xoa-block">×</button>
            </div>
            <textarea class="block-text" placeholder="Nhập nội dung đoạn văn...">${duLieu}</textarea>
        `;
    }

    if (loai === "image") {
        block.innerHTML = `
            <div class="block-header">
                <strong>🖼️ Hình ảnh</strong>
                <button type="button" class="btn-xoa-block">×</button>
            </div>
            <input type="file" class="block-image" accept="image/*">
            <input type="hidden" class="block-image-old" value="${duLieu}">
            ${duLieu ? `<img src="${duLieu}" class="block-preview">` : ""}
        `;
    }

    if (loai === "link") {
        block.innerHTML = `
            <div class="block-header">
                <strong>🔗 Link cuối bài</strong>
                <button type="button" class="btn-xoa-block">×</button>
            </div>
            <input type="url" class="block-link" placeholder="https://..." value="${duLieu}">
        `;
    }

    danhSachBlock.appendChild(block);
}

btnThemText.addEventListener("click", function () {
    themBlock("text");
});

btnThemImage.addEventListener("click", function () {
    themBlock("image");
});

btnThemLink.addEventListener("click", function () {
    themBlock("link");
});

danhSachBlock.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-xoa-block")) {
        event.target.closest(".noi-dung-block").remove();
    }
});

function hienThiTrangThai(trangThai) {
    if (trangThai === "da_duyet") return "Đã duyệt";
    if (trangThai === "tu_choi") return "Từ chối";
    return "Chờ duyệt";
}

function formatNgay(ngay) {
    if (!ngay) return "";
    const date = new Date(ngay);
    return date.toLocaleDateString("vi-VN");
}

layDanhSachDiSan();
layDanhSachBaiViet();
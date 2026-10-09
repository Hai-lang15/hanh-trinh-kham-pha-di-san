const mediaGrid = document.getElementById("mediaGrid");
const selectDiSan = document.getElementById("selectDiSan");
const mediaModal = document.getElementById("mediaModal");
const formMedia = document.getElementById("formMedia");
const mediaFiles = document.getElementById("mediaFiles");
const mediaTieuDe = document.getElementById("mediaTieuDe");
const mediaMoTa = document.getElementById("mediaMoTa");
const mediaPreview = document.getElementById("mediaPreview");
const btnThemMedia = document.getElementById("btnThemMedia");
const btnDongModal = document.getElementById("btnDongModal");
const btnHuyMedia = document.getElementById("btnHuyMedia");
const tongHinhAnh = document.getElementById("tongHinhAnh");
const tongVideo = document.getElementById("tongVideo");
const tongMedia = document.getElementById("tongMedia");

let danhSachDiSan = [];
let danhSachMedia = [];
let loaiMedia = "image";
let boLoc = "all";

async function layDanhSachDiSan() {
    try {
        const response = await fetch("/api/di-san");

        if (!response.ok) {
            throw new Error("Không thể lấy danh sách di sản");
        }

        danhSachDiSan = await response.json();

        selectDiSan.innerHTML = `
            <option value="">Tất cả di sản</option>
        `;

        const mediaDiSan = document.getElementById("mediaDiSan");

        mediaDiSan.innerHTML = `
            <option value="">-- Chọn di sản --</option>
        `;

        danhSachDiSan.forEach(function (diSan) {
            const option = document.createElement("option");
            option.value = diSan.id;
            option.textContent = diSan.ten_di_san;
            selectDiSan.appendChild(option);

            const optionUpload = option.cloneNode(true);
            mediaDiSan.appendChild(optionUpload);
        });
    } catch (error) {
        console.log(error);
        hienThongBao("Không thể tải danh sách di sản", "error");
    }
}

async function layTatCaMedia() {
    try {
        danhSachMedia = [];

        for (const diSan of danhSachDiSan) {
            const [hinhAnhResponse, videoResponse] = await Promise.all([
                fetch(`/api/hinh-anh-di-san/${diSan.id}`),
                fetch(`/api/video-di-san/${diSan.id}`)
            ]);

            const hinhAnh = hinhAnhResponse.ok ? await hinhAnhResponse.json() : [];
            const video = videoResponse.ok ? await videoResponse.json() : [];

            hinhAnh.forEach(function (item) {
                danhSachMedia.push({
                    id: item.id,
                    loai: "image",
                    duong_dan: item.duong_dan,
                    tieu_de: item.mo_ta || "Hình ảnh di sản",
                    mo_ta: item.mo_ta || "",
                    di_san_id: diSan.id,
                    ten_di_san: diSan.ten_di_san
                });
            });

            video.forEach(function (item) {
                danhSachMedia.push({
                    id: item.id,
                    loai: "video",
                    duong_dan: item.duong_dan,
                    tieu_de: item.tieu_de || "Video di sản",
                    mo_ta: item.mo_ta || "",
                    di_san_id: diSan.id,
                    ten_di_san: diSan.ten_di_san
                });
            });
        }

        hienThiMedia();
    } catch (error) {
        console.log(error);

        mediaGrid.innerHTML = `
            <div class="media-empty">
                <span>⚠️</span>
                <p>Không thể tải thư viện media.</p>
            </div>
        `;
    }
}

function hienThiMedia() {
    const diSanId = selectDiSan.value;

    const ketQua = danhSachMedia.filter(function (media) {
        const dungLoai = boLoc === "all" || media.loai === boLoc;
        const dungDiSan = !diSanId || Number(media.di_san_id) === Number(diSanId);
        return dungLoai && dungDiSan;
    });

    tongHinhAnh.textContent = danhSachMedia.filter(item => item.loai === "image").length;
    tongVideo.textContent = danhSachMedia.filter(item => item.loai === "video").length;
    tongMedia.textContent = danhSachMedia.length;

    mediaGrid.innerHTML = "";

    if (ketQua.length === 0) {
        mediaGrid.innerHTML = `
            <div class="media-empty">
                <span>📁</span>
                <p>Chưa có media nào.</p>
            </div>
        `;
        return;
    }

    ketQua.forEach(function (media) {
        const card = document.createElement("article");
        card.className = "media-card";

        let preview = "";

        if (media.loai === "image") {
            preview = `
                <img src="${media.duong_dan}" alt="${media.tieu_de}">
                <span class="media-type-label">🖼️ Hình ảnh</span>
            `;
        } else {
            preview = `
                <video src="${media.duong_dan}" controls preload="metadata"></video>
                <span class="media-type-label">🎬 Video</span>
            `;
        }

        card.innerHTML = `
            <div class="media-card-preview">
                ${preview}
            </div>

            <div class="media-card-body">
                <span class="media-card-disan">${media.ten_di_san}</span>
                <h3>${media.tieu_de}</h3>
                ${media.mo_ta ? `<p>${media.mo_ta}</p>` : ""}
                <button class="media-delete-btn" data-id="${media.id}" data-type="${media.loai}">
                    🗑️ Xóa
                </button>
            </div>
        `;

        const btnXoa = card.querySelector(".media-delete-btn");

        btnXoa.addEventListener("click", function () {
            xoaMedia(media.id, media.loai);
        });

        mediaGrid.appendChild(card);
    });
}

document.querySelectorAll(".media-tab").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll(".media-tab").forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        boLoc = button.dataset.filter;
        hienThiMedia();
    });
});

selectDiSan.addEventListener("change", function () {
    hienThiMedia();
});

document.querySelectorAll(".media-type").forEach(function (button) {
    button.addEventListener("click", function () {
        document.querySelectorAll(".media-type").forEach(function (item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        loaiMedia = button.dataset.type;
        mediaFiles.value = "";
        mediaPreview.innerHTML = "";

        if (loaiMedia === "image") {
            mediaFiles.accept = "image/jpeg,image/png,image/webp";
            document.getElementById("mediaHint").textContent = "Có thể chọn nhiều hình ảnh JPG, PNG, WEBP.";
        } else {
            mediaFiles.accept = "video/mp4,video/webm,video/quicktime";
            document.getElementById("mediaHint").textContent = "Có thể chọn nhiều video MP4, WEBM hoặc MOV. Tối đa 100MB/video.";
        }
    });
});

mediaFiles.addEventListener("change", function () {
    mediaPreview.innerHTML = "";

    const files = mediaFiles.files;

    Array.from(files).forEach(function (file) {
        const previewItem = document.createElement("div");
        previewItem.className = "preview-item";

        if (loaiMedia === "image") {
            const img = document.createElement("img");
            img.src = URL.createObjectURL(file);
            previewItem.appendChild(img);
        } else {
            const video = document.createElement("video");
            video.src = URL.createObjectURL(file);
            video.controls = true;
            previewItem.appendChild(video);
        }

        const size = document.createElement("span");
        size.textContent = formatDungLuong(file.size);
        previewItem.appendChild(size);
        mediaPreview.appendChild(previewItem);
    });
});

btnThemMedia.addEventListener("click", function () {
    formMedia.reset();
    mediaPreview.innerHTML = "";
    loaiMedia = "image";

    document.querySelectorAll(".media-type").forEach(function (button) {
        button.classList.toggle("active", button.dataset.type === "image");
    });

    mediaFiles.accept = "image/jpeg,image/png,image/webp";
    mediaModal.classList.add("show");
});

btnDongModal.addEventListener("click", function () {
    mediaModal.classList.remove("show");
});

btnHuyMedia.addEventListener("click", function () {
    mediaModal.classList.remove("show");
});

formMedia.addEventListener("submit", async function (event) {
    event.preventDefault();

    const diSanId = document.getElementById("mediaDiSan").value;

    if (!diSanId) {
        hienThongBao("Vui lòng chọn di sản", "error");
        return;
    }

    const files = mediaFiles.files;

    if (files.length === 0) {
        hienThongBao("Vui lòng chọn file", "error");
        return;
    }

    try {
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            if (loaiMedia === "image") {
                formData.append("hinh_anh", files[i]);
            } else {
                formData.append("video", files[i]);
            }
        }

        formData.append("tieu_de", mediaTieuDe.value);
        formData.append("mo_ta", mediaMoTa.value);

        const url = loaiMedia === "image"
            ? `/api/hinh-anh-di-san/${diSanId}`
            : `/api/video-di-san/${diSanId}`;

        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            hienThongBao(data.message || "Upload thất bại", "error");
            return;
        }

        hienThongBao(
            loaiMedia === "image"
                ? "Upload hình ảnh thành công!"
                : "Upload video thành công!",
            "success"
        );

        mediaModal.classList.remove("show");
        formMedia.reset();
        mediaPreview.innerHTML = "";

        await layTatCaMedia();
    } catch (error) {
        console.log(error);
        hienThongBao("Không thể kết nối đến server!", "error");
    }
});

function xoaMedia(id, loai) {
    const overlay = document.createElement("div");

    overlay.className = "delete-overlay";

    overlay.innerHTML = `
        <div class="delete-modal">
            <div class="delete-icon">🗑️</div>
            <h3>Xóa media</h3>
            <p>Bạn có chắc chắn muốn xóa media này không?</p>

            <div class="delete-actions">
                <button class="delete-cancel" id="btnHuyXoa">Hủy</button>
                <button class="delete-confirm" id="btnXacNhanXoa">Xóa</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btnHuyXoa").addEventListener("click", function () {
        overlay.remove();
    });

    document.getElementById("btnXacNhanXoa").addEventListener("click", async function () {
        const btn = this;

        btn.disabled = true;
        btn.textContent = "Đang xóa...";

        try {
            const url = loai === "image"
                ? `/api/hinh-anh-di-san/${id}`
                : `/api/video-di-san/${id}`;

            const response = await fetch(url, {
                method: "DELETE"
            });

            const data = await response.json();

            overlay.remove();

            if (!response.ok) {
                hienThongBao(data.message || "Không thể xóa media", "error");
                return;
            }

            hienThongBao("Xóa media thành công!", "success");

            await layTatCaMedia();
        } catch (error) {
            console.log(error);
            overlay.remove();
            hienThongBao("Không thể kết nối đến server!", "error");
        }
    });
}

function formatDungLuong(bytes) {
    if (bytes === 0) {
        return "0 Bytes";
    }

    const units = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + units[i];
}

function hienThongBao(message, type = "success") {
    const thongBaoCu = document.querySelector(".admin-toast");

    if (thongBaoCu) {
        thongBaoCu.remove();
    }

    const toast = document.createElement("div");
    toast.className = `admin-toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function () {
        toast.classList.add("hide");

        setTimeout(function () {
            toast.remove();
        }, 300);
    }, 2500);
}

async function khoiDongMedia() {
    await layDanhSachDiSan();
    await layTatCaMedia();
}

khoiDongMedia();
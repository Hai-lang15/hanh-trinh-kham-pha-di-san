const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const container = document.getElementById("noiDungDiSan");

async function layChiTietDiSan() {
    if (!id) {
        container.innerHTML = `<div class="error">Không tìm thấy mã di sản.</div>`;
        return;
    }

    try {
        const [diSanResponse, hinhAnhResponse, videoResponse] = await Promise.all([
                fetch(`/api/di-san/${id}`),
                fetch(`/api/hinh-anh-di-san/${id}`),
                fetch(`/api/video-di-san/${id}`)
            ]);

        if (!diSanResponse.ok) {
            throw new Error("Không thể lấy thông tin di sản");
        }

        const diSan = await diSanResponse.json();
        const hinhAnh = hinhAnhResponse.ok ? await hinhAnhResponse.json() : [];
        const videoDiSan = videoResponse.ok ? await videoResponse.json() : [];

        const danhSachAnh = [];

        if (diSan.hinh_anh) {
            danhSachAnh.push({
                duong_dan: diSan.hinh_anh,
                mo_ta: diSan.ten_di_san
            });
        }

        hinhAnh.forEach(function (item) {
            danhSachAnh.push(item);
        });

        const videoHTML = videoDiSan.length > 0
    ? videoDiSan.map(function (video) {
        return `
            <article class="video-card">
                <div class="video-wrapper">
                    <video controls preload="metadata">
                        <source
                            src="${video.duong_dan}"
                            type="video/mp4"
                        >
                        Trình duyệt của bạn không hỗ trợ video.
                    </video>
                </div>

                <div class="video-content">
                    <h3>${video.tieu_de || "Video di sản"}</h3>

                    ${
                        video.mo_ta
                            ? `<p>${video.mo_ta}</p>`
                            : ""
                    }
                </div>
            </article>
        `;
    }).join("")
    : `
        <div class="video-empty">
            <span>🎬</span>
            <p>Chưa có video cho di sản này.</p>
        </div>
    `;

        const gallery = danhSachAnh.length > 0
            ? danhSachAnh.map(function (item, index) {
                return `
                    <div class="gallery-item ${index === 0 ? "gallery-main" : ""}" data-image="${item.duong_dan}" data-alt="${item.mo_ta || diSan.ten_di_san}">
                        <img src="${item.duong_dan}" alt="${item.mo_ta || diSan.ten_di_san}">
                        <div class="gallery-overlay">
                            <span class="gallery-zoom">⌕</span>
                            ${item.mo_ta ? `<p>${item.mo_ta}</p>` : ""}
                        </div>
                    </div>
                `;
            }).join("")
            : `
                <div class="gallery-empty">
                    <span>📷</span>
                    <p>Chưa có hình ảnh bổ sung.</p>
                </div>
            `;

        const mapUrl = diSan.vi_do && diSan.kinh_do
            ? `https://www.google.com/maps?q=${diSan.vi_do},${diSan.kinh_do}&z=17&output=embed`
            : `https://www.google.com/maps?q=${encodeURIComponent(diSan.dia_chi || diSan.ten_di_san)}&output=embed`;

        container.innerHTML = `
            <section class="detail-hero">
                <div class="container">
                    <p class="eyebrow">DI SẢN QUẬN 12</p>
                    <h1>${diSan.ten_di_san || "Chưa có tên di sản"}</h1>
                    <p class="detail-address">
                        📍 ${diSan.dia_chi || "Chưa cập nhật địa chỉ"}
                    </p>
                </div>
            </section>

            <section class="detail-overview">
                <div class="container">
                    <div class="overview-grid">
                        <div class="detail-cover-wrapper">
                            <img
                                class="detail-cover"
                                src="${diSan.hinh_anh || "/uploads/no-image.jpg"}"
                                alt="${diSan.ten_di_san}"
                            >
                            <div class="cover-label">
                                <span>HÀNH TRÌNH DI SẢN</span>
                            </div>
                        </div>

                        <div class="overview-info">
                            <div class="section-title">
                                <p class="eyebrow brown">THÔNG TIN KHÁI QUÁT</p>
                                <h2>Thông tin di sản</h2>
                            </div>

                            <div class="overview-list">
                                <div class="overview-item">
                                    <span class="overview-icon">🏛</span>
                                    <div>
                                        <small>Xếp hạng</small>
                                        <strong>${diSan.xep_hang || "Đang cập nhật"}</strong>
                                    </div>
                                </div>

                                <div class="overview-item">
                                    <span class="overview-icon">🏢</span>
                                    <div>
                                        <small>Đơn vị quản lý</small>
                                        <strong>${diSan.don_vi_quan_ly || "Đang cập nhật"}</strong>
                                    </div>
                                </div>

                                <div class="overview-item">
                                    <span class="overview-icon">📍</span>
                                    <div>
                                        <small>Địa chỉ</small>
                                        <strong>${diSan.dia_chi || "Đang cập nhật"}</strong>
                                    </div>
                                </div>
                            </div>

                            <a href="disan.html" class="back-link">
                                ← Quay lại danh sách di sản
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <section class="content-section history-section">
                <div class="container">
                    <div class="content-card">
                        <div class="content-heading">
                            <span class="content-icon">📜</span>
                            <div>
                                <p class="eyebrow brown">DẤU ẤN THỜI GIAN</p>
                                <h2>Lịch sử hình thành</h2>
                            </div>
                        </div>

                        <p class="content-text">
                            ${diSan.lich_su_hinh_thanh || "Thông tin đang được cập nhật."}
                        </p>
                    </div>
                </div>
            </section>

            <section class="content-section light-section">
                <div class="container">
                    <div class="two-column-content">
                        <div class="content-card">
                            <div class="content-heading">
                                <span class="content-icon">👤</span>
                                <div>
                                    <p class="eyebrow brown">NHỮNG DẤU ẤN</p>
                                    <h2>Nhân vật liên quan</h2>
                                </div>
                            </div>

                            <p class="content-text">
                                ${diSan.nhan_vat_lien_quan || "Thông tin đang được cập nhật."}
                            </p>
                        </div>

                        <div class="content-card">
                            <div class="content-heading">
                                <span class="content-icon">🕰</span>
                                <div>
                                    <p class="eyebrow brown">DÒNG CHẢY LỊCH SỬ</p>
                                    <h2>Sự kiện lịch sử</h2>
                                </div>
                            </div>

                            <p class="content-text">
                                ${diSan.su_kien_lich_su || "Thông tin đang được cập nhật."}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="content-section">
                <div class="container">
                    <div class="content-card feature-card">
                        <div class="content-heading">
                            <span class="content-icon">🌿</span>
                            <div>
                                <p class="eyebrow brown">GIÁ TRỊ DI SẢN</p>
                                <h2>Giá trị văn hóa</h2>
                            </div>
                        </div>

                        <p class="content-text">
                            ${diSan.gia_tri_van_hoa || "Thông tin đang được cập nhật."}
                        </p>
                    </div>
                </div>
            </section>

            <section class="content-section light-section">
                <div class="container">
                    <div class="content-card feature-card">
                        <div class="content-heading">
                            <span class="content-icon">🏯</span>
                            <div>
                                <p class="eyebrow brown">KHÔNG GIAN DI SẢN</p>
                                <h2>Kiến trúc</h2>
                            </div>
                        </div>

                        <p class="content-text">
                            ${diSan.kien_truc || "Thông tin đang được cập nhật."}
                        </p>
                    </div>
                </div>
            </section>

            <section class="detail-gallery">
                <div class="container">
                    <div class="gallery-heading">
                        <div>
                            <p class="eyebrow brown">HÌNH ẢNH</p>
                            <h2>Khoảnh khắc di sản</h2>
                        </div>

                        <span class="gallery-count">
                            ${danhSachAnh.length} hình ảnh
                        </span>
                    </div>

                    <div class="gallery-grid">
                        ${gallery}
                    </div>
                </div>
            </section>

            <section class="detail-video">
                <div class="container">

                    <div class="video-heading">
                        <p class="eyebrow brown">VIDEO</p>

                        <h2>Khoảnh khắc chuyển động</h2>

                        <p>
                            Cùng khám phá không gian và những câu chuyện
                            của di sản qua hình ảnh chuyển động.
                        </p>
                    </div>

                    <div class="video-grid">
                        ${videoHTML}
                    </div>

                </div>
            </section>

            <section class="detail-map">
                <div class="container">
                    <div class="map-heading">
                        <p class="eyebrow brown">ĐỊNH VỊ DI SẢN</p>
                        <h2>Vị trí di sản</h2>
                        <p class="map-address">
                            📍 ${diSan.dia_chi || "Chưa cập nhật địa chỉ"}
                        </p>
                    </div>

                    <div class="map-wrapper">
                        <iframe
                            class="map-box"
                            src="${mapUrl}"
                            loading="lazy"
                            allowfullscreen
                            referrerpolicy="no-referrer-when-downgrade">
                        </iframe>
                    </div>
                </div>
            </section>
        `;

        ganSuKienGallery();

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <div class="error">
                Không thể tải thông tin di sản.
            </div>
        `;
    }
}

function ganSuKienGallery() {
    const galleryItems = document.querySelectorAll(".gallery-item");

    galleryItems.forEach(function (item) {
        item.addEventListener("click", function () {
            const src = item.dataset.image;
            const alt = item.dataset.alt;

            moAnhLon(src, alt);
        });
    });
}

function moAnhLon(src, alt) {
    const lightbox = document.createElement("div");

    lightbox.className = "image-lightbox";

    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">×</button>
            <img src="${src}" alt="${alt}">
        </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = "hidden";

    lightbox.addEventListener("click", function (event) {
        if (
            event.target === lightbox ||
            event.target.classList.contains("lightbox-close")
        ) {
            dongAnhLon(lightbox);
        }
    });
}

function dongAnhLon(lightbox) {
    lightbox.remove();
    document.body.style.overflow = "";
}

layChiTietDiSan();
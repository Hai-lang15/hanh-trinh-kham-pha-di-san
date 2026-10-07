const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const container = document.getElementById("noiDungDiSan");


async function layChiTietDiSan() {
  if (!id) {
    container.innerHTML = `<div class="error">Không tìm thấy mã di sản.</div>`;
    return;
  }

  try {
    const [diSanResponse, hinhAnhResponse] = await Promise.all([
      fetch(`/api/di-san/${id}`),
      fetch(`/api/hinh-anh-di-san/${id}`)
    ]);

    if (!diSanResponse.ok) throw new Error("Không thể lấy thông tin di sản");

    const diSan = await diSanResponse.json();
    const hinhAnh = hinhAnhResponse.ok ? await hinhAnhResponse.json() : [];

    const gallery = hinhAnh.length > 0 ? hinhAnh.map(item => `
      <div class="gallery-item">
        <img src="${item.duong_dan}" alt="${item.mo_ta || diSan.ten_di_san}">
        ${item.mo_ta ? `<p class="gallery-caption">${item.mo_ta}</p>` : ""}
      </div>
    `).join("") : `<p>Chưa có hình ảnh bổ sung.</p>`;

    const mapUrl = diSan.vi_do && diSan.kinh_do ? `https://www.google.com/maps?q=${diSan.vi_do},${diSan.kinh_do}&z=17&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(diSan.dia_chi || diSan.ten_di_san)}&output=embed`;

    container.innerHTML = `
      <section class="detail-hero">
        <div class="container">
          <p class="eyebrow">DI SẢN QUẬN 12</p>
          <h1>${diSan.ten_di_san}</h1>
          <p class="detail-address">📍 ${diSan.dia_chi || "Chưa cập nhật địa chỉ"}</p>
        </div>
      </section>

      <section class="detail-section">
        <div class="container detail-layout">
          <div>
            <img class="detail-cover" src="${diSan.hinh_anh || "/uploads/no-image.jpg"}" alt="${diSan.ten_di_san}">
          </div>
          <div class="detail-info">
            <h2>Thông tin di sản</h2>

            <div class="detail-item">
              <h3>Lịch sử hình thành</h3>
              <p>${diSan.lich_su_hinh_thanh || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Nhân vật liên quan</h3>
              <p>${diSan.nhan_vat_lien_quan || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Sự kiện lịch sử</h3>
              <p>${diSan.su_kien_lich_su || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Giá trị văn hóa</h3>
              <p>${diSan.gia_tri_van_hoa || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Kiến trúc</h3>
              <p>${diSan.kien_truc || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Xếp hạng</h3>
              <p>${diSan.xep_hang || "Đang cập nhật."}</p>
            </div>

            <div class="detail-item">
              <h3>Đơn vị quản lý</h3>
              <p>${diSan.don_vi_quan_ly || "Đang cập nhật."}</p>
            </div>

            <a href="disan.html" class="back-link">← Quay lại danh sách</a>
          </div>
        </div>
      </section>

      <section class="detail-gallery">
        <div class="container">
          <p class="eyebrow brown">HÌNH ẢNH</p>
          <h2>Khoảnh khắc di sản</h2>
          <div class="gallery-grid">${gallery}</div>
        </div>
      </section>

      <section class="detail-map">
        <div class="container">
            <p class="eyebrow brown">BẢN ĐỒ</p>
            <h2>Vị trí di sản</h2>
            <p class="map-address">📍 ${diSan.dia_chi || "Chưa cập nhật địa chỉ"}</p>
            <iframe class="map-box" src="${mapUrl}" loading="lazy"></iframe>
        </div>
      </section>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="error">Không thể tải thông tin di sản.</div>`;
  }
}

layChiTietDiSan();
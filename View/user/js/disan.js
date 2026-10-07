const API_URL = "/api/di-san";

async function layDanhSachDiSan() {
  const container = document.getElementById("danhSachDiSan");

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Không thể lấy dữ liệu di sản");
    }

    const data = await response.json();

    if (data.length === 0) {
      container.innerHTML = `<p class="loading">Chưa có di sản nào.</p>`;
      return;
    }

    container.innerHTML = data.map(diSan => {
      const hinhAnh = diSan.hinh_anh || "/uploads/no-image.jpg";
      const moTa = diSan.gia_tri_van_hoa || diSan.lich_su_hinh_thanh || "Đang cập nhật thông tin di sản.";

      return `
        <article class="heritage-card">
          <img src="${hinhAnh}" alt="${diSan.ten_di_san}" class="heritage-card-image">
          <div class="heritage-card-content">
            <h3>${diSan.ten_di_san}</h3>
            <p class="heritage-card-address">📍 ${diSan.dia_chi || "Chưa cập nhật địa chỉ"}</p>
            <p class="heritage-card-description">${moTa}</p>
            <a href="chitiet_sp.html?id=${diSan.id}" class="heritage-detail-btn">Xem chi tiết →</a>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    console.error("Lỗi:", error);
    container.innerHTML = `<p class="error">Không thể tải danh sách di sản.</p>`;
  }
}

layDanhSachDiSan();
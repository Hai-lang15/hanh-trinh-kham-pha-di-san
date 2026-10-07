const params = new URLSearchParams(window.location.search);
const baiVietId = params.get("id");

async function taiBaiViet() {
  if (!baiVietId) {
    hienThiLoi("Không tìm thấy bài viết.");
    return;
  }

  try {
    const response = await fetch(`/api/bai-viet/${baiVietId}`);

    if (!response.ok) {
      throw new Error("Không tìm thấy bài viết");
    }

    const baiViet = await response.json();

    document.getElementById("tieuDe").textContent = baiViet.tieu_de || "Không có tiêu đề";
    document.getElementById("nguoiDang").textContent = baiViet.ho_ten || "Admin";
    document.getElementById("ngayTao").textContent = formatNgay(baiViet.ngay_tao);
    document.getElementById("tenDiSan").textContent = baiViet.ten_di_san || "Di sản";
    document.getElementById("sidebarNguoiDang").textContent = baiViet.ho_ten || "Admin";
    document.getElementById("sidebarNgayTao").textContent = formatNgay(baiViet.ngay_tao);
    document.getElementById("sidebarDiSan").textContent = baiViet.ten_di_san || "Không xác định";

    await taiNoiDung();
    await taiBaiVietLienQuan();
  } catch (error) {
    console.log(error);
    hienThiLoi("Không thể tải bài viết.");
  }
}

async function taiNoiDung() {
  const response = await fetch(`/api/noi-dung-bai-viet/${baiVietId}`);

  if (!response.ok) {
    throw new Error("Không thể lấy nội dung bài viết");
  }

  const blocks = await response.json();
  const container = document.getElementById("noiDungBaiViet");

  container.innerHTML = "";

  if (!blocks.length) {
    container.innerHTML = `<p class="article-loading">Bài viết chưa có nội dung.</p>`;
    return;
  }

  blocks.forEach(function (block) {
    if (block.loai === "text") {
      const p = document.createElement("p");
      p.className = "article-block-text";
      p.textContent = block.noi_dung;
      container.appendChild(p);
    }

    if (block.loai === "image") {
      const div = document.createElement("div");
      div.className = "article-block-image";

      const img = document.createElement("img");
      img.src = block.noi_dung;
      img.alt = "Hình ảnh bài viết";
      img.loading = "lazy";

      div.appendChild(img);
      container.appendChild(div);
    }

    if (block.loai === "link") {
      const div = document.createElement("div");
      div.className = "article-block-link";

      const a = document.createElement("a");
      a.href = block.noi_dung;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "🔗 Xem thêm thông tin";

      div.appendChild(a);
      container.appendChild(div);
    }
  });
}

async function taiBaiVietLienQuan() {
  try {
    const response = await fetch("/api/bai-viet");
    if (!response.ok) return;

    const data = await response.json();
    const container = document.getElementById("baiVietLienQuan");

    const baiVietKhac = data.filter(item => String(item.id) !== String(baiVietId)).slice(0, 3);

    container.innerHTML = "";

   baiVietKhac.forEach(function (baiViet) {
  const card = document.createElement("a");
  card.href = `baiviet_chitiet.html?id=${baiViet.id}`;
  card.className = "related-card";

  const hinhAnh = baiViet.hinh_anh || baiViet.hinh_anh_block || "/uploads/default.jpg";

      card.innerHTML = `
        <img src="${hinhAnh}" class="related-card-image" alt="${baiViet.tieu_de}">
        <div class="related-card-content">
          <h3>${baiViet.tieu_de}</h3>
          <p>${formatNgay(baiViet.ngay_tao)}</p>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.log("Không thể tải bài viết liên quan:", error);
  }
}

function formatNgay(ngay) {
  if (!ngay) return "--/--/----";
  return new Date(ngay).toLocaleDateString("vi-VN");
}

function hienThiLoi(message) {
  document.getElementById("tieuDe").textContent = "Không thể tải bài viết";
  document.getElementById("noiDungBaiViet").innerHTML = `<p class="article-error">${message}</p>`;
}

function chiaSeFacebook() {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    alert("Đã sao chép liên kết bài viết!");
  } catch (error) {
    alert("Không thể sao chép liên kết.");
  }
}

taiBaiViet();
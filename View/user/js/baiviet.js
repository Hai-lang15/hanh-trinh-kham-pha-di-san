const danhSachBaiViet = document.getElementById("danhSachBaiViet");

function formatNgay(ngay) {
    if (!ngay) return "-";
    return new Date(ngay).toLocaleDateString("vi-VN");
}

async function loadBaiViet() {
    try {
        const res = await fetch("/api/bai-viet");
        if (!res.ok) throw new Error("Không thể lấy danh sách bài viết");

        const data = await res.json();
        danhSachBaiViet.innerHTML = "";

        if (data.length === 0) {
            danhSachBaiViet.innerHTML = `<p class="empty">Chưa có bài viết nào.</p>`;
            return;
        }

        data.forEach(function(baiViet) {
            const card = document.createElement("article");
            card.className = "baiviet-card";

            const duongDanAnh = baiViet.hinh_anh || baiViet.hinh_anh_block;

            const hinhAnh = duongDanAnh
                ? `<img src="${duongDanAnh}" alt="${baiViet.tieu_de}" class="baiviet-image">`
                : `<div class="baiviet-no-image">HÀNH TRÌNH DI SẢN</div>`;

            card.innerHTML = `
                ${hinhAnh}
                <div class="baiviet-content">
                    <span class="baiviet-category">${baiViet.ten_di_san || "Di sản"}</span>
                    <h2><a href="baiviet_chitiet.html?id=${baiViet.id}">${baiViet.tieu_de}</a></h2>
                    <div class="baiviet-meta">
                        <span>${baiViet.ho_ten || "Người dùng"}</span>
                        <span>${formatNgay(baiViet.ngay_tao)}</span>
                    </div>
                    <a href="baiviet_chitiet.html?id=${baiViet.id}" class="xem-bai-viet">Đọc bài viết →</a>
                </div>
            `;

            danhSachBaiViet.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        danhSachBaiViet.innerHTML = `<p class="empty">Không thể tải danh sách bài viết.</p>`;
    }
}

loadBaiViet();
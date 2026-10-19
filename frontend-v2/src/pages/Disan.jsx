
import { useEffect, useMemo, useState } from "react";
import { api, API_URL } from "../services/api";
import { Search, MapPin, ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { timKiemThongMinh } from "../utils/timKiemThongMinh";

function chuanHoaLoai(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const items = [
  {
    name: "Chùa Tường Quang",
    type: "Di tích tôn giáo",
    area: "An Phú Đông",
    img: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1000&q=85",
    desc: "Không gian sinh hoạt tín ngưỡng gắn với đời sống văn hóa địa phương."
  },
  {
    name: "Đình Tân Hội",
    type: "Di tích lịch sử",
    area: "Đông Hưng Thuận",
    img: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1000&q=85",
    desc: "Dấu ấn kiến trúc đình làng và truyền thống cộng đồng qua nhiều thế hệ."
  },
  {
    name: "Miếu Cây Quéo",
    type: "Di tích tín ngưỡng",
    area: "Trung Mỹ Tây",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85",
    desc: "Một địa điểm lưu giữ nét đẹp tín ngưỡng dân gian của cư dân địa phương."
  },
  {
    name: "Nhà tưởng niệm Nguyễn An Ninh",
    type: "Địa điểm lịch sử",
    area: "Quận 12",
    img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=85",
    desc: "Không gian tìm hiểu cuộc đời, tư tưởng và đóng góp của nhà yêu nước."
  }
];

export default function DiSan() {
    const [q, setQ] = useState("");
    const [type, setType] = useState("Tất cả");
    const [diSan, setDiSan] = useState(items);
    const [apiState, setApiState] = useState("loading");
  useEffect(() => {
    let active = true;

    api.getDiSan()
      .then(rows => {
        if (!active) return;

        const list = Array.isArray(rows) ? rows : (rows?.data || []);

        if (list.length) {
          setDiSan(list.map(d => ({
            id: d.id,
            name: d.ten_di_san || d.name || "Di sản",
            type: d.xep_hang || "Di sản văn hóa",
            area: d.dia_chi || "Quận 12",
            img: d.hinh_anh
            ? (String(d.hinh_anh).startsWith("http")
                ? d.hinh_anh
                : `${API_URL}/${String(d.hinh_anh).replace(/^\/+/, "")}`)
            : items[0].img,
            desc: d.gia_tri_van_hoa || d.lich_su_hinh_thanh || "Thông tin di sản đang được cập nhật."
          })));
        } else {
          setDiSan([]);
        }

        setApiState("ok");
      })
      .catch(() => {
        if (active) setApiState("offline");
      });

    return () => {
      active = false;
    };
  }, []);

    const shown = useMemo(() => {
        const ketQua = timKiemThongMinh(
            diSan,
            q,
            ["name", "area", "type", "desc"]
        );

        return ketQua.filter(item =>
            type === "Tất cả" ||
            chuanHoaLoai(item.type) === chuanHoaLoai(type)
        );
        }, [diSan, q, type]);

  const chiTietUrl = id => `/di-san/chi-tiet?id=${id}`;

  return (
    <main className="inner-page">
      <section className="page-hero">
        <div>
          <span className="section-label">KHO TÀNG VĂN HÓA ĐỊA PHƯƠNG</span>
          <h1>Khám phá <em>di sản</em></h1>
          <p>Mỗi địa điểm là một lát cắt lịch sử, một câu chuyện đang chờ được kể.</p>
          <div className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span>/</span>
            Di sản
          </div>
        </div>
        <div className="page-hero-mark">
          
        </div>
      </section>

      <section className="content-wrap">
        <div className="listing-toolbar">
          <div>
            <h2>Những điểm đến nổi bật</h2>
            <p>{shown.length} địa điểm trong bộ sưu tập</p>
          </div>

          <div className="filter-row">
            <label className="search-box">
              <Search size={18} />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Tìm theo tên hoặc khu vực"
              />
            </label>

            <label className="select-wrap">
              <SlidersHorizontal size={16} />
              <select value={type} onChange={e => setType(e.target.value)}>
                <option>Tất cả</option>
                <option>Di tích lịch sử</option>
                <option>Di tích tôn giáo</option>
                <option>Di tích tín ngưỡng</option>
                <option>Địa điểm lịch sử</option>
              </select>
            </label>
          </div>
        </div>

        <div className="destination-grid">
          {shown.map((x, i) => (
            <article className="destination-card" key={x.id ?? x.name}>
              <a className="destination-image" href={chiTietUrl(x.id)}>
                <img src={x.img} alt={x.name} />
                <span className="image-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="image-open"><ArrowUpRight size={20} /></span>
              </a>

              <div className="destination-info">
                <span className="card-category">{x.type}</span>
                <h3><a href={chiTietUrl(x.id)}>{x.name}</a></h3>
                <p><MapPin size={14} />{x.area}</p>

                <div className="destination-bottom">
                  <span>{x.desc}</span>
                  <a href={chiTietUrl(x.id)} aria-label={`Xem ${x.name}`}>
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {shown.length === 0 && (
          <div className="empty-panel">
            Không tìm thấy địa điểm phù hợp. Hãy thử từ khóa khác nhé.
          </div>
        )}

        <p className="demo-note">
          {apiState === "loading"
            ? "Đang tải dữ liệu từ API..."
            : apiState === "offline"
              ? "Chưa kết nối được API; đang hiển thị dữ liệu minh họa. Hãy kiểm tra backend và VITE_API_URL."
              : "Dữ liệu di sản được tải từ API backend."}
        </p>
      </section>
    </main>
  );
}

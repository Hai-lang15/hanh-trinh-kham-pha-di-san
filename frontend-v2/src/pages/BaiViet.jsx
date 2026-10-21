
import { useEffect, useState } from "react";
import { api, API_URL } from "../services/api";
import { ArrowUpRight, CalendarDays, Clock3, Search } from "lucide-react";
import { timKiemThongMinh } from "../utils/timKiemThongMinh";



function plainText(value) {
  if (!value) return "";
  const parsed = typeof window !== "undefined" ? new DOMParser().parseFromString(String(value), "text/html") : null;
  return (parsed?.body?.textContent || String(value).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

export default function BaiViet() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState([]);
  const [apiState, setApiState] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.getBaiViet()
      .then((rows) => {
        if (!active) return;

        const list = Array.isArray(rows) ? rows : rows?.data || [];

        const published = list.filter((p) => {
          const status = String(p.trang_thai || "").trim().toLowerCase();
          return ["da_duyet", "da_xuat_ban", "published", "đã duyệt", "đã xuất bản"].includes(status);
        });

        const mapped = published.map((p) => {
          const image = p.hinh_anh || p.hinh_anh_block || "";
          const imageUrl = image
            ? (/^https?:\/\//i.test(String(image))
                ? String(image)
                : `${API_URL}/${String(image).replace(/^\/+/, "")}`)
            : "";

          return {
            id: p.id,
            tag: p.ten_di_san || "CÂU CHUYỆN DI SẢN",
            title: p.tieu_de || p.title || "Bài viết",
            desc: plainText(p.description || p.mo_ta || p.tom_tat || "") || "Nội dung bài viết đang được cập nhật.",
            date: p.ngay_tao
              ? new Date(p.ngay_tao).toLocaleDateString("vi-VN")
              : "",
            time: "Bài viết",
            img: imageUrl
          };
        });

        setPosts(mapped);
        setApiState("ok");
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setPosts([]);
        setApiState("offline");
        setError(err.message || "Không thể tải bài viết từ máy chủ.");
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = timKiemThongMinh( posts, query,["title", "desc", "tag"]);

  const featured = filtered[0] || null;
  const others = filtered.slice(1);

 const chiTietUrl = (id) =>
  id != null ? `/bai-viet/chi-tiet?id=${encodeURIComponent(id)}` : "/bai-viet";

  const renderImage = (post, className) => (
    <div className={className}>
      {post.img ? (
        <img
          src={post.img}
          alt={post.title}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="article-no-image">HÀNH TRÌNH KHÁM PHÁ DI SẢN</div>
      )}
    </div>
  );

  return (
    <main className="inner-page">
      <section className="page-hero">
        <div>
          <span className="section-label">TẠP CHÍ DI SẢN</span>
          <h1>Những câu chuyện <em>được kể</em></h1>
          <p>Góc nhìn, kiến thức và câu chuyện về lịch sử, văn hóa của vùng đất.</p>
          <div className="breadcrumb">
            <a href="/">Trang chủ</a><span>/</span>Bài viết
          </div>
        </div>
        <div className="page-hero-mark"></div>
      </section>

      <section className="content-wrap">
        <div className="listing-toolbar">
          <div>
            <h2>Đọc và khám phá</h2>
            <p>{posts.length} bài viết đã được duyệt</p>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài viết..."
            />
          </label>
        </div>

        {apiState === "loading" && (
          <p className="empty-state">Đang tải bài viết từ cơ sở dữ liệu...</p>
        )}

        {apiState === "offline" && (
          <p className="empty-state">
            Không tải được bài viết: {error}
          </p>
        )}

        {apiState === "ok" && featured && (
          <>
            <div className="article-feature">
              {renderImage(featured, "article-feature-image")}
              <div className="article-feature-copy">
                <span className="section-label">BÀI VIẾT NỔI BẬT</span>
                <h2>{featured.title}</h2>
                <p>{featured.desc}</p>
                <div className="article-meta">
                  <span><CalendarDays size={15} /> {featured.date}</span>
                  <span><Clock3 size={15} /> {featured.time}</span>
                </div>
                <a href={chiTietUrl(featured.id)} className="btn-primary">
                  Đọc câu chuyện <ArrowUpRight size={17} />
                </a>
              </div>
            </div>

            <div className="article-grid">
              {others.map((p) => (
                <article className="article-card" key={p.id}>
                  <a className="article-card-image" href={chiTietUrl(p.id)}>
                    {p.img ? (
                      <img
                        src={p.img}
                        alt={p.title}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="article-no-image">DI SẢN VĂN HÓA</div>
                    )}
                  </a>
                  <div className="article-card-body">
                    <span className="card-category">{p.tag}</span>
                    <h3><a href={chiTietUrl(p.id)}>{p.title}</a></h3>
                    <p>{p.desc}</p>
                    <div className="article-meta">
                      <span><CalendarDays size={14} /> {p.date}</span>
                      <span><Clock3 size={14} /> {p.time}</span>
                    </div>
                    <a href={chiTietUrl(p.id)} className="text-link">
                      Đọc tiếp <ArrowUpRight size={16} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {apiState === "ok" && !featured && (
          <p className="empty-state">
            {posts.length === 0
              ? "Chưa có bài viết nào được duyệt để hiển thị."
              : "Không tìm thấy bài viết phù hợp. Hãy thử từ khóa khác."}
          </p>
        )}

        <p className="demo-note">
          {apiState === "loading"
            ? "Đang kết nối API..."
            : apiState === "offline"
              ? "Kết nối API thất bại."
              : `Đã tải ${posts.length} bài viết được duyệt từ API.`}
        </p>
      </section>
    </main>
  );
}

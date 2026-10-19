import { useState, useEffect } from "react";
import "./HomeCinematic.css";
import { API_URL } from "../services/api";
// import {
//   MapPin, ArrowRight, Compass, Landmark,
//   BookOpen, Camera, Search
// } from "lucide-react";
import {
  MapPin, ArrowRight, Compass, Landmark, Castle, Church,
  BookOpen, Camera, Search
} from "lucide-react";


function Home() {
  const [tuKhoa, setTuKhoa] = useState("");
  const [diSan, setDiSan] = useState([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState("");

  useEffect(() => {
    const layDiSan = async () => {
      try {
        const response = await fetch(`${API_URL}/api/di-san`);
        if (!response.ok) throw new Error("Không thể tải danh sách di sản");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Dữ liệu API không đúng định dạng");
        setDiSan(data);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu di sản:", error);
        setLoi("Không thể tải dữ liệu di sản. Hãy kiểm tra kết nối Backend.");
      } finally {
        setDangTai(false);
      }
    };
    layDiSan();
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll(".home-cinematic [data-reveal]");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    targets.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [diSan.length]);

  const danhSachLoc = diSan.filter((item) =>
    (item.ten_di_san || "").toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <main className="home-cinematic">
      <section className="hero cinematic-hero" id="trang-chu">
        {/* === ĐÃ THÊM LỚP SƯƠNG MỜ CINEMATIC Ở ĐÂY === */}
        <div className="cinematic-fog-layer" aria-hidden="true">
          <div className="fog-cloud fog-cloud-1" />
          <div className="fog-cloud fog-cloud-2" />
        </div>

        <div className="hero-atmosphere" aria-hidden="true">
          <div className="cinematic-moon" />
          <div className="mist mist-one" />
          <div className="mist mist-two" />
          <div className="light-beam light-beam-one" />
          <div className="light-beam light-beam-two" />
          <div className="star-field">
            {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ "--star-index": i, top: `${(i * 37 + 7) % 91}%`, left: `${(i * 53 + 11) % 97}%`, animationDuration: `${2500 + (i % 5) * 450}ms`, animationDelay: `${i * -170}ms` }} />)}
          </div>
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="eyebrow"><span></span> GÌN GIỮ GIÁ TRỊ VIỆT</span>
          <h1>Mỗi di sản<br />là một câu chuyện.</h1>
          <p>Cùng khám phá những dấu ấn lịch sử, văn hóa và kiến trúc làm nên bản sắc của vùng đất Quận 12.</p>
          <div className="hero-actions">
            <a className="btn-primary" href="#di-san">Khám phá di sản <ArrowRight size={18} /></a>
          </div>
          <div className="hero-note"><MapPin size={17} /> Quận 12 · Thành phố Hồ Chí Minh</div>
        </div>
        <div className="hero-caption">LƯU GIỮ KÝ ỨC · KẾT NỐI TƯƠNG LAI</div>
        <div className="hero-scroll-hint" aria-hidden="true"><span /> CUỘN ĐỂ KHÁM PHÁ</div>
        <div className="hero-orbit orbit-one" aria-hidden="true" />
        <div className="hero-orbit orbit-two" aria-hidden="true" />
      </section>

      <section className="intro section" id="gioi-thieu" data-reveal>
        <div className="intro-heading">
          <span className="section-label">VỀ HÀNH TRÌNH</span>
          <h2>Hiểu di sản để<br /><em>yêu hơn quê hương.</em></h2>
        </div>
        <div className="intro-text">
          <p>Hành trình khám phá Di sản là dự án giới thiệu các địa điểm lịch sử và văn hóa tại Quận 12, giúp cộng đồng tiếp cận thông tin, hình ảnh và những câu chuyện phía sau mỗi di tích.</p>
          <a href="#di-san" className="text-link">Bắt đầu hành trình <ArrowRight size={17} /></a>
        </div>
      </section>

      <section className="story-intro" aria-label="Mở đầu câu chuyện" data-reveal>
        <span className="story-kicker">NHỮNG TRANG SỬ CỦA QUẬN 12</span>
        <div className="story-rule"><span /></div>
        <h2>Mỗi nơi chốn<br /><em>đều giữ một ký ức.</em></h2>
        <p>Hãy chậm lại một chút, lật mở từng trang ký ức và gặp những di sản đang kể câu chuyện của quê hương.</p>
      </section>

      <section className="story-chapters" id="chuong-di-san" aria-label="Câu chuyện các di sản">
        {dangTai && <div className="story-loading">Đang mở những trang di sản...</div>}
        {!dangTai && !loi && diSan.slice(0, 4).map((item, index) => {
          const imageUrl = item.hinh_anh
            ? (item.hinh_anh.startsWith("http") ? item.hinh_anh : `${API_URL}${item.hinh_anh.startsWith("/") ? "" : "/"}${item.hinh_anh}`)
            : "/placeholder.jpg";
          const summary = item.gia_tri_van_hoa || item.lich_su_hinh_thanh || item.su_kien_lich_su || "Khám phá những dấu ấn lịch sử, kiến trúc và văn hóa được lưu giữ qua nhiều thế hệ.";
          return (
            <article className={`story-chapter ${index % 2 ? "story-reverse" : ""}`} key={item.id ?? item.ten_di_san} data-reveal>
              <div className="story-chapter-number"><span>CHƯƠNG</span><strong>{String(index + 1).padStart(2, "0")}</strong></div>
              <div className="story-image-wrap">
                <div className="story-image-frame">
                  <img src={imageUrl} alt={item.ten_di_san || "Di tích văn hóa"} loading="lazy" />
                  <span className="story-image-shade" />
                  <span className="story-image-caption">DI SẢN · QUẬN 12</span>
                </div>
                <span className="story-image-orbit" aria-hidden="true" />
              </div>
              <div className="story-copy">
                <span className="story-kicker">{item.xep_hang || "DẤU ẤN VĂN HÓA"}</span>
                <h2>{item.ten_di_san}</h2>
                <div className="story-gold-line" />
                <p className="story-address"><MapPin size={16} /> {item.dia_chi || "Quận 12, Thành phố Hồ Chí Minh"}</p>
                <p className="story-summary">{summary}</p>
                {item.kien_truc && <p className="story-detail"><strong>Nét kiến trúc</strong>{item.kien_truc}</p>}
                <a href={`/di-san/chi-tiet?id=${item.id}`} className="story-link">ĐỌC TIẾP CÂU CHUYỆN <ArrowRight size={17} /></a>
              </div>
              <span className="story-watermark" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </article>
          );
        })}
        {!dangTai && loi && <p className="story-loading">{loi}</p>}
        {!dangTai && !loi && diSan.length === 0 && <p className="story-loading">Những câu chuyện di sản sẽ sớm được mở ra.</p>}
      </section>

      <section className="heritage section" id="di-san" data-reveal>
        <div className="section-top">
          <div>
            <span className="section-label">DẤU ẤN ĐỊA PHƯƠNG</span>
            <h2>Khám phá di sản</h2>
            <p>Những địa điểm lưu giữ ký ức và bản sắc văn hóa.</p>
          </div>
          <a href="/ban-do" className="text-link">Khám phá bản đồ <ArrowRight size={17} /></a>
        </div>

        <div className="search-box">
          <Search size={19} />
          <input
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Tìm kiếm di sản theo tên..."
            aria-label="Tìm kiếm di sản"
          />
        </div>

        <div className="heritage-grid">
          {dangTai && <p>Đang tải danh sách di sản...</p>}
          {!dangTai && loi && <p className="empty-state">{loi}</p>}
          {!dangTai && !loi && danhSachLoc.map((item, index) => (
            <article className="heritage-card" key={item.id} data-reveal style={{ "--reveal-delay": `${(index % 3) * 100}ms` }}>
              <div className="card-image">
                <img
                  src={item.hinh_anh ? `${API_URL}${item.hinh_anh}` : "/placeholder.jpg"}
                  alt={item.ten_di_san}
                  loading="lazy"
                />
                <span className="card-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="card-content">
                <span className="card-category">{item.xep_hang || "Di sản văn hóa"}</span>
                <h3>{item.ten_di_san}</h3>
                <p>{item.dia_chi}</p>
                <a
                  href={`/di-san/chi-tiet?id=${item.id}`}
                  className="card-link"
                >
                  Tìm hiểu thêm <ArrowRight size={16} />
                </a>
              </div>
            </article>
          ))}
          {!dangTai && !loi && danhSachLoc.length === 0 && (
            <p className="empty-state">Không tìm thấy di sản phù hợp.</p>
          )}
        </div>
      </section>

      <section className="explore" id="ban-do" data-reveal>
        <div className="explore-content">
          <span className="section-label">MỞ RA NHỮNG HÀNH TRÌNH</span>
          <h2>Di sản ở quanh ta.<br /><em>Hãy cùng khám phá.</em></h2>
          <p>Tìm hiểu địa điểm, xem thông tin và lên hành trình khám phá những giá trị văn hóa địa phương.</p>
          <a href="/di-san" className="btn-primary">Bắt đầu khám phá <ArrowRight size={18} /></a>
        </div>
        <div className="explore-icon"><Compass size={110} strokeWidth={0.8} /></div>
      </section>

      <section className="features section" id="bai-viet" data-reveal>
        <div className="section-top">
          <div>
            <span className="section-label">KHÔNG CHỈ LÀ ĐỊA ĐIỂM</span>
            <h2>Mỗi góc nhìn, một câu chuyện</h2>
          </div>
        </div>
        <div className="feature-grid">
          <a href="/di-san" className="feature-item" data-reveal>
            <Landmark /><h3>Giá trị di sản</h3>
            <p>Tìm hiểu lịch sử, kiến trúc và văn hóa.</p>
            <ArrowRight className="feature-arrow" />
          </a>
          <a href="/ban-do" className="feature-item" data-reveal>
            <Compass /><h3>Bản đồ khám phá</h3>
            <p>Định vị các địa điểm trên hành trình.</p>
            <ArrowRight className="feature-arrow" />
          </a>
          <a href="/bai-viet" className="feature-item" data-reveal>
            <BookOpen /><h3>Câu chuyện di sản</h3>
            <p>Đọc bài viết và những câu chuyện địa phương.</p>
            <ArrowRight className="feature-arrow" />
          </a>
          <a href="/thu-vien" className="feature-item" data-reveal>
            <Camera /><h3>Thư viện hình ảnh</h3>
            <p>Lưu giữ những hình ảnh về di tích.</p>
            <ArrowRight className="feature-arrow" />
          </a>
        </div>
      </section>

      <section className="closing" id="thu-vien" data-reveal>
        <span className="section-label">DI SẢN LÀ TÀI SẢN CHUNG</span>
        <h2>Giữ gìn hôm nay,<br /><em>trao truyền mai sau.</em></h2>
        <p>Mỗi người đều có thể góp phần lan tỏa giá trị văn hóa quê hương.</p>
        <a href="/cong-dong" className="text-link">Chia sẻ câu chuyện di sản ↑</a>
      </section>
    </main>
  );
}

export default Home;
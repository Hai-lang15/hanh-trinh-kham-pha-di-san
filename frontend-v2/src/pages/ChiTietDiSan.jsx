import { useEffect, useState } from "react";
import { MapPin, Clock3, Share2, ArrowLeft, Navigation, Landmark, LoaderCircle } from "lucide-react";
import { api, API_URL } from "../services/api";

export default function ChiTietDiSan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  useEffect(() => {
    if (!id) { setError("Không có mã di sản."); setLoading(false); return; }
    let active = true;
    setLoading(true);
    api.getDiSanById(id)
      .then((res) => {
        if (!active) return;
        const item = Array.isArray(res) ? res[0] : res;
        setData(item || null);
        if (!item) setError("Không tìm thấy di sản.");
      })
      .catch(() => { if (active) setError("Không thể tải chi tiết di sản. Vui lòng kiểm tra Backend."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const mediaUrl = (v) => { if (!v) return ""; const s = String(v); return s.startsWith("http") || s.startsWith("data:") ? s : `${API_URL}/${s.replace(/^\/+/, "")}`; };

  if (loading) return (
    <main className="inner-page"><section className="detail-cover"><div className="detail-cover-shade"/><div className="detail-cover-text"><span className="section-label">ĐANG TẢI</span><h1>Đang tải chi tiết...</h1><LoaderCircle size={30} /></div></section></main>
  );
  if (!data) return (
    <main className="inner-page"><section className="detail-cover"><div className="detail-cover-shade"/><div className="detail-cover-text"><a href="/di-san" className="back-link"><ArrowLeft size={16} /> Trở lại danh sách</a><span className="section-label">DI TÍCH LỊCH SỬ</span><h1>{error || "Không tìm thấy di sản"}</h1></div></section></main>
  );

  return (
    <main className="inner-page">
      <section className="detail-cover">
        <img src={mediaUrl(data.hinh_anh) || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=90"} alt={data.ten_di_san} />
        <div className="detail-cover-shade" />
        <div className="detail-cover-text">
          <a href="/di-san" className="back-link"><ArrowLeft size={16} /> Trở lại danh sách</a>
          <span className="section-label">DI TÍCH LỊCH SỬ · QUẬN 12</span>
          <h1>{data.ten_di_san}</h1>
          <p><MapPin size={17} /> {data.dia_chi || "Khu vực không có thông tin"}, TP. Hồ Chí Minh</p>
        </div>
      </section>
      <section className="detail-layout content-wrap">
        <article className="detail-article">
          <span className="section-label">CÂU CHUYỆN DI SẢN</span>
          <h2>Nơi lưu giữ ký ức của cộng đồng</h2>
          <p>{data.lich_su_hinh_thanh || "Thông tin lịch sử hình thành đang được cập nhật."}</p>
          <p>{data.gia_tri_van_hoa || "Giá trị văn hóa của di sản này đang được bổ sung."}</p>
          <div className="detail-note"><Landmark size={22} /><div><strong>Giá trị di sản</strong><p>Gìn giữ ký ức địa phương, kết nối thế hệ hôm nay với lịch sử và văn hóa quê hương.</p></div></div>
          {data.nhan_vat_lien_quan && <p><strong>Nhân vật liên quan:</strong> {data.nhan_vat_lien_quan}</p>}
          {data.su_kien_lich_su && <p><strong>Sự kiện lịch sử:</strong> {data.su_kien_lich_su}</p>}
          {data.kien_truc && <p><strong>Kiến trúc:</strong> {data.kien_truc}</p>}
          {data.xep_hang && <p><strong>Xếp hạng:</strong> {data.xep_hang}</p>}
          {data.don_vi_quan_ly && <p><strong>Đơn vị quản lý:</strong> {data.don_vi_quan_ly}</p>}
          <div className="detail-actions">
            <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={16} /> Chia sẻ trang</button>
            <a className="btn-primary" href="/ban-do"><Navigation size={16} /> Xem bản đồ</a>
          </div>
        </article>
        <aside className="detail-sidebar">
          <div className="info-card">
            <span className="section-label">THÔNG TIN ĐỊA ĐIỂM</span>
            <h3>{data.ten_di_san}</h3>
            <div className="info-row"><MapPin size={16} /><div><small>Khu vực</small><strong>{data.dia_chi || "Chưa có thông tin"}</strong></div></div>
            <div className="info-row"><Clock3 size={16} /><div><small>Cập nhật</small><strong>Hệ thống HTKPDS</strong></div></div>
            {data.vi_do && data.kinh_do && (
              <div className="info-row"><span style={{ fontSize: 16 }}>📍</span><div><small>Tọa độ</small><strong>{data.vi_do}, {data.kinh_do}</strong></div></div>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}
import { useEffect, useState } from 'react';
import { MapPin, MessageCircle, Share2, Search, Plus, Send, Image as ImageIcon, X } from 'lucide-react';
import { api, API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './CongDongDiSan.css';

const imageUrl = (value) => !value ? '' : (/^https?:\/\//i.test(value) ? value : `${API_URL}/${String(value).replace(/^\/+/, '')}`);
const dateText = (value) => value ? new Date(value).toLocaleDateString('vi-VN') : '';

export default function CongDongDiSan() {
  const { isLoggedIn } = useAuth();
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ten_dia_diem: '', dia_chi: '', mo_ta: '', lien_ket_ban_do: '', hinh_anh: null });
  const [formLoading, setFormLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true); setError('');
    try { const data = await api.getCongDong(); setPosts(Array.isArray(data) ? data : []); }
    catch (e) { setError(e.message || 'Không thể tải cộng đồng.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadPosts(); }, []);

  useEffect(() => {
    const sharedId = new URLSearchParams(window.location.search).get('bai');
    if (!sharedId || !posts.length) return;
    const sharedPost = posts.find((post) => String(post.id) === sharedId);
    if (!sharedPost) return;
    setSelected(sharedPost);
    api.getBinhLuanCongDong(sharedPost.id).then((data) => setComments(Array.isArray(data) ? data : [])).catch(() => setComments([]));
  }, [posts]);

  const openPost = async (post) => {
    setSelected(post); setComments([]); setCommentText('');
    try { const data = await api.getBinhLuanCongDong(post.id); setComments(Array.isArray(data) ? data : []); }
    catch (e) { setNotice(e.message || 'Không thể tải bình luận.'); }
  };

  const submitPost = async (e) => {
    e.preventDefault(); setFormLoading(true); setNotice('');
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => { if (value !== null && value !== '') body.append(key, value); });
      const result = await api.createCongDong(body);
      setNotice(result.message || 'Đã gửi chia sẻ.'); setForm({ ten_dia_diem: '', dia_chi: '', mo_ta: '', lien_ket_ban_do: '', hinh_anh: null });
      setFormOpen(false);
    } catch (e2) { setNotice(e2.message || 'Không thể gửi chia sẻ.'); }
    finally { setFormLoading(false); }
  };

  const submitComment = async (e) => {
    e.preventDefault(); if (!selected || !commentText.trim()) return;
    setCommentLoading(true); setNotice('');
    try {
      const result = await api.themBinhLuanCongDong(selected.id, commentText.trim());
      setCommentText(''); setNotice(result.message || 'Đã gửi bình luận.');
      setComments(await api.getBinhLuanCongDong(selected.id));
    } catch (e2) { setNotice(e2.message || 'Không thể gửi bình luận.'); }
    finally { setCommentLoading(false); }
  };

  const sharePost = async (post) => {
    const url = `${window.location.origin}/cong-dong?bai=${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: post.ten_dia_diem, text: `Khám phá ${post.ten_dia_diem} cùng cộng đồng di sản`, url });
      else { await navigator.clipboard.writeText(url); setNotice('Đã sao chép liên kết chia sẻ.'); }
    } catch (e) { if (e.name !== 'AbortError') setNotice('Không thể chia sẻ liên kết trên thiết bị này.'); }
  };

  const filtered = posts.filter((p) => `${p.ten_dia_diem} ${p.dia_chi} ${p.mo_ta} ${p.ho_ten}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')));

  return <main className="community-page">
    <section className="community-hero"><span className="community-eyebrow">KẾT NỐI · KHÁM PHÁ · GÌN GIỮ</span><h1>Mỗi người một câu chuyện,<br /><em>chung một tình yêu di sản.</em></h1><p>Chia sẻ những địa điểm văn hóa, lịch sử bạn từng ghé thăm và cùng nhau lưu giữ ký ức địa phương.</p><button className="community-primary" onClick={() => isLoggedIn ? setFormOpen(true) : window.location.assign('/dang-nhap')}><Plus size={18} /> Chia sẻ địa điểm</button></section>
    <section className="community-content"><div className="community-heading"><div><span className="community-eyebrow">GÓC CỘNG ĐỒNG</span><h2>Những địa điểm được chia sẻ</h2><p>Thông tin do cộng đồng đóng góp và được kiểm duyệt trước khi công khai.</p></div><label className="community-search"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm địa điểm, địa chỉ..." /></label></div>
      {notice && <div className="community-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Đóng thông báo"><X size={16}/></button></div>}
      {error && <div className="community-state community-error">{error} <button onClick={loadPosts}>Thử lại</button></div>}
      {loading ? <div className="community-state">Đang tải bài chia sẻ...</div> : !error && filtered.length === 0 ? <div className="community-state">{query ? 'Không tìm thấy địa điểm phù hợp.' : 'Chưa có chia sẻ nào. Hãy là người đầu tiên đóng góp nhé!'}</div> : <div className="community-grid">{filtered.map((post) => <article className="community-card" key={post.id}>
        {post.hinh_anh ? <img className="community-card-image" src={imageUrl(post.hinh_anh)} alt={post.ten_dia_diem} /> : <div className="community-card-placeholder"><ImageIcon size={32}/><span>Chia sẻ di sản</span></div>}
        <div className="community-card-body"><span className="community-date">{dateText(post.ngay_tao)}</span><h3>{post.ten_dia_diem}</h3><p className="community-address"><MapPin size={15}/>{post.dia_chi}</p><p className="community-description">{post.mo_ta}</p><div className="community-author">Chia sẻ bởi <strong>{post.ho_ten || 'Thành viên cộng đồng'}</strong></div><div className="community-card-actions"><button onClick={() => openPost(post)}><MessageCircle size={16}/> Bình luận ({post.so_binh_luan || 0})</button><button onClick={() => sharePost(post)} aria-label="Chia sẻ liên kết"><Share2 size={16}/> Chia sẻ</button><button className="community-read" onClick={() => openPost(post)}>Xem chi tiết</button></div></div>
      </article>)}</div>}
    </section>

    {formOpen && <div className="community-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setFormOpen(false); }}><section className="community-modal" role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="community-modal-close" onClick={() => setFormOpen(false)} aria-label="Đóng"><X/></button><span className="community-eyebrow">ĐÓNG GÓP CHO CỘNG ĐỒNG</span><h2 id="share-title">Chia sẻ một địa điểm</h2><p>Bài chia sẻ sẽ được kiểm duyệt trước khi xuất hiện công khai.</p><form onSubmit={submitPost} className="community-form"><label>Tên địa điểm *<input required maxLength="180" value={form.ten_dia_diem} onChange={(e) => setForm({ ...form, ten_dia_diem: e.target.value })}/></label><label>Địa chỉ *<input required maxLength="255" value={form.dia_chi} onChange={(e) => setForm({ ...form, dia_chi: e.target.value })}/></label><label>Câu chuyện / mô tả *<textarea required rows="4" maxLength="4000" value={form.mo_ta} onChange={(e) => setForm({ ...form, mo_ta: e.target.value })}/></label><label>Liên kết bản đồ (không bắt buộc)<input type="url" placeholder="https://maps.google.com/..." value={form.lien_ket_ban_do} onChange={(e) => setForm({ ...form, lien_ket_ban_do: e.target.value })}/></label><label>Ảnh địa điểm (không bắt buộc)<input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, hinh_anh: e.target.files?.[0] || null })}/><small>JPG, PNG hoặc WEBP; tối đa 5 MB.</small></label><div className="community-form-actions"><button type="button" className="community-secondary" onClick={() => setFormOpen(false)}>Hủy</button><button className="community-primary" disabled={formLoading}>{formLoading ? 'Đang gửi...' : 'Gửi kiểm duyệt'}</button></div></form></section></div>}

    {selected && <div className="community-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><section className="community-modal community-detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="community-modal-close" onClick={() => setSelected(null)} aria-label="Đóng"><X/></button>{selected.hinh_anh && <img className="community-detail-image" src={imageUrl(selected.hinh_anh)} alt={selected.ten_dia_diem}/>}<span className="community-eyebrow">CHIA SẺ TỪ CỘNG ĐỒNG</span><h2 id="detail-title">{selected.ten_dia_diem}</h2><p className="community-address"><MapPin size={15}/>{selected.dia_chi}</p><p className="community-detail-description">{selected.mo_ta}</p>{selected.lien_ket_ban_do && <a className="community-map-link" href={selected.lien_ket_ban_do} target="_blank" rel="noreferrer">Mở bản đồ ↗</a>}<div className="community-comments"><h3>Bình luận ({comments.length})</h3>{comments.length ? comments.map((c) => <div className="community-comment" key={c.id}><strong>{c.ho_ten || 'Thành viên'}</strong><p>{c.noi_dung}</p><small>{dateText(c.ngay_tao)}</small></div>) : <p className="community-empty-comments">Chưa có bình luận. Hãy bắt đầu cuộc trò chuyện.</p>}{isLoggedIn ? <form className="community-comment-form" onSubmit={submitComment}><textarea rows="2" maxLength="1000" required value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Viết bình luận của bạn..."/><button disabled={commentLoading || !commentText.trim()} aria-label="Gửi bình luận"><Send size={17}/></button></form> : <p className="community-login-note"><a href="/dang-nhap">Đăng nhập</a> để viết bình luận.</p>}</div></section></div>}
  </main>;
}

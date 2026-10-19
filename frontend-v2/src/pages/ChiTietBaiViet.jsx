import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Share2, MessageCircle, Send, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, API_URL } from "../services/api";

function sanitizeArticleHtml(input) {
  if (typeof window === "undefined") return "";
  const parsed = new DOMParser().parseFromString(String(input || ""), "text/html");
  parsed.querySelectorAll("script,style,iframe,object,embed,form,svg,math,link,meta").forEach((node) => node.remove());
  const allowedTags = new Set(["P","BR","STRONG","B","EM","I","U","UL","OL","LI","H1","H2","H3","H4","BLOCKQUOTE","A","IMG","FIGURE","FIGCAPTION","HR","DIV","SPAN","SECTION"]);
  const allowedAttrs = new Set(["href","src","alt","title","target","rel","class","width","height"]);
  parsed.body.querySelectorAll("*").forEach((el) => {
    if (!allowedTags.has(el.tagName)) {
      el.replaceWith(document.createTextNode(el.textContent || ""));
      return;
    }
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (!allowedAttrs.has(name) || name.startsWith("on")) {
        el.removeAttribute(attr.name);
        return;
      }
      if (name === "href" || name === "src") {
        const value = attr.value.trim();
        if (!/^(https?:\/\/|\/uploads\/|uploads\/|#)/i.test(value)) el.removeAttribute(attr.name);
      }
    });
    if (el.tagName === "A") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener noreferrer"); }
  });
  return parsed.body.innerHTML;
}

export default function ChiTietBaiViet() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(id ? "" : "Không có mã bài viết.");
  const { nguoiDung, isLoggedIn } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentNotice, setCommentNotice] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

useEffect(() => {
  if (!id) return;

  let active = true;

  api.getBaiVietById(id)
    .then((res) => {
      console.log("Dữ liệu bài viết:", res);
      if (!active) return;

      const item = Array.isArray(res) ? res[0] : res;

      if (!item || !item.id) {
        setData(null);
        setError("Không tìm thấy bài viết.");
        return;
      }

      setData(item);
    })
    .catch((err) => {
      console.error("Lỗi tải chi tiết bài viết:", err);
      if (!active) return;

      setData(null);
      setError(err?.message || "Không thể tải chi tiết bài viết.");
    })
    .finally(() => {
      if (active) setLoading(false);
    });

  return () => {
    active = false;
  };
}, [id]);


  useEffect(() => {
    if (!id || !data?.id) return;
    let active = true;
    api.getBinhLuanBaiViet(id).then((rows) => {
      if (active) setComments(Array.isArray(rows) ? rows : []);
    }).catch((e) => {
      if (active) setCommentNotice(e.message || "Chưa thể tải bình luận. Nếu đây là lần đầu, hãy chạy sql/complete_website.sql.");
    });
    return () => { active = false; };
  }, [id, data?.id]);

  const sendComment = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { window.location.href = "/dang-nhap"; return; }
    if (!commentText.trim()) return;
    setCommentBusy(true); setCommentNotice("");
    try {
      const result = await api.themBinhLuanBaiViet(id, commentText.trim());
      setCommentText("");
      setCommentNotice(result.message || "Đã gửi bình luận.");
      setComments(await api.getBinhLuanBaiViet(id));
    } catch (e2) {
      setCommentNotice(e2.message || "Không thể gửi bình luận.");
    } finally { setCommentBusy(false); }
  };

  const deleteComment = async (comment) => {
    if (!window.confirm("Bạn muốn xóa bình luận này?")) return;
    setCommentBusy(true); setCommentNotice("");
    try {
      await api.xoaBinhLuanBaiViet(comment.id);
      setComments((items) => items.filter((item) => item.id !== comment.id));
      setCommentNotice("Đã xóa bình luận.");
    } catch (e) { setCommentNotice(e.message || "Không thể xóa bình luận."); }
    finally { setCommentBusy(false); }
  };

  const mediaUrl = (v) => { if (!v) return ""; const s = String(v); return s.startsWith("http") || s.startsWith("data:") ? s : `${API_URL}/${s.replace(/^\/+/, "")}`; };

  if (loading) return (
    <main className="inner-page"><section className="detail-cover"><div className="detail-cover-shade"/><div className="detail-cover-text"><span className="section-label">ĐANG TẢI</span><h1>Đang tải chi tiết...</h1></div></section></main>
  );
  if (!data) return (
    <main className="inner-page"><section className="detail-cover"><div className="detail-cover-shade"/><div className="detail-cover-text"><a href="/bai-viet" className="back-link"><ArrowLeft size={16} /> Trở lại bài viết</a><span className="section-label">CÂU CHUYỆN DI SẢN</span><h1>{error || "Không tìm thấy bài viết"}</h1></div></section></main>
  );

  return (
    <main className="inner-page">
      <section className="detail-cover">
        <img src={mediaUrl(data.hinh_anh) || "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=90"} alt={data.tieu_de} />
        <div className="detail-cover-shade" />
        <div className="detail-cover-text">
          <a href="/bai-viet" className="back-link"><ArrowLeft size={16} /> Trở lại bài viết</a>
          <span className="section-label">CÂU CHUYỆN DI SẢN</span>
          <h1>{data.tieu_de}</h1>
          <p><CalendarDays size={16} /> {data.ngay_tao ? new Date(data.ngay_tao).toLocaleDateString("vi-VN") : ""} <Clock3 size={16} /> Bài viết</p>
        </div>
      </section>
      <article className="content-wrap detail-article article-detail-content">
        <span className="section-label">DI SẢN · VĂN HÓA</span>
        <h2>{data.tieu_de}</h2>
        
       
<div className="article-body">
  {Array.isArray(data.noi_dung_block) && data.noi_dung_block.length > 0 ? (
    [...data.noi_dung_block]
      .sort((a, b) => Number(a.thu_tu) - Number(b.thu_tu))
      .map((block) => (
        <div key={block.id} className="article-content-block">
          {block.loai === "text" && (
            <div className="article-text">
              {String(block.noi_dung || "")
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}

          {block.loai === "image" && (
            <figure className="article-image">
              <img
                src={mediaUrl(block.noi_dung)}
                alt={data.tieu_de}
                loading="lazy"
                onError={(e) => {
                  console.error("Không tải được ảnh:", e.currentTarget.src);
                }}
              />
            </figure>
          )}
        </div>
      ))
  ) : data.noi_dung ? (
    <div className="article-html-content" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(data.noi_dung) }} />
  ) : (
    <p>Nội dung bài viết đang được cập nhật.</p>
  )}
</div>


        <div className="detail-actions">
          <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={16} /> Chia sẻ bài viết</button>
          <a href="/di-san" className="btn-primary">Khám phá di sản</a>
        </div>
        <section className="article-comments" aria-labelledby="comments-heading">
          <div className="comments-heading"><span className="section-label">GÓC TRAO ĐỔI</span><h2 id="comments-heading"><MessageCircle size={22}/> Bình luận ({comments.length})</h2><p>Cùng chia sẻ cảm nghĩ và trao đổi văn minh về câu chuyện di sản.</p></div>
          {commentNotice && <p className="comment-notice" role="status">{commentNotice}</p>}
          <form className="comment-form" onSubmit={sendComment}>
            <label htmlFor="article-comment">Ý kiến của bạn</label>
            <textarea id="article-comment" value={commentText} onChange={(e) => setCommentText(e.target.value)} maxLength={1000} rows={4} placeholder={isLoggedIn ? "Viết bình luận của bạn..." : "Đăng nhập để tham gia bình luận"} disabled={!isLoggedIn || commentBusy}/>
            <div className="comment-form-bottom"><small>{commentText.length}/1000 ký tự · {isLoggedIn ? `Đang bình luận với tài khoản ${nguoiDung?.ho_ten || ""}` : "Bạn cần đăng nhập để gửi bình luận."}</small><button className="btn-primary" type="submit" disabled={commentBusy || !commentText.trim()}><Send size={16}/>{commentBusy ? "Đang gửi..." : "Gửi bình luận"}</button></div>
            {!isLoggedIn && <a className="comment-login-link" href="/dang-nhap">Đăng nhập hoặc tạo tài khoản</a>}
          </form>
          <div className="comment-list">
            {comments.length === 0 ? <p className="comments-empty">Chưa có bình luận. Hãy bắt đầu cuộc trò chuyện nhé!</p> : comments.map((comment) => <article className="comment-item" key={comment.id}><div className="comment-avatar">{(comment.ho_ten || "N").trim().charAt(0).toUpperCase()}</div><div className="comment-main"><div className="comment-meta"><strong>{comment.ho_ten || "Thành viên"}</strong><time>{comment.ngay_tao ? new Date(comment.ngay_tao).toLocaleString("vi-VN") : ""}</time></div><p>{comment.noi_dung}</p></div>{(nguoiDung?.vai_tro === "quan_tri_vien" || Number(nguoiDung?.id) === Number(comment.nguoi_dung_id)) && <button className="comment-delete" type="button" disabled={commentBusy} onClick={() => deleteComment(comment)} title="Xóa bình luận"><Trash2 size={16}/></button>}</article>)}
          </div>
        </section>
      </article>
    </main>
  );
}
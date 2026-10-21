import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Landmark, LayoutDashboard, MapPinned, Newspaper, Images, Users, Settings, Search, Bell, Plus, ArrowUpRight, MoreHorizontal, Pencil, Trash2, Menu, X, CalendarDays, CheckCircle2, ImagePlus, Link as LinkIcon, Video, Heading1, Heading2, Heading3, List, Bold, Italic, LoaderCircle, RefreshCw } from "lucide-react";
import { api, API_URL, apiRequest } from "../services/api";

const nav=[["dashboard","Tổng quan",LayoutDashboard,"/admin"],["heritage","Quản lý di sản",MapPinned,"/admin/di-san"],["articles","Quản lý bài viết",Newspaper,"/admin/bai-viet"],["reviews","Duyệt bài viết",CheckCircle2,"/admin/duyet-bai-viet"],["media","Thư viện media",Images,"/admin/thu-vien"],["users","Người dùng",Users,"/admin/nguoi-dung"],["settings","Cài đặt",Settings,"/admin/cai-dat"]];
const diSanFields=[{key:"ten_di_san",label:"Tên di sản",required:true},{key:"dia_chi",label:"Địa chỉ"},{key:"lich_su_hinh_thanh",label:"Lịch sử hình thành",area:true},{key:"nhan_vat_lien_quan",label:"Nhân vật liên quan",area:true},{key:"su_kien_lich_su",label:"Sự kiện lịch sử",area:true},{key:"gia_tri_van_hoa",label:"Giá trị văn hóa",area:true},{key:"kien_truc",label:"Kiến trúc",area:true},{key:"xep_hang",label:"Xếp hạng"},{key:"don_vi_quan_ly",label:"Đơn vị quản lý"},{key:"vi_do",label:"Vĩ độ",type:"number"},{key:"kinh_do",label:"Kinh độ",type:"number"}];
const emptyArticle={tieu_de:"",ma_di_san:"",description:"",noi_dung:"",trang_thai:"cho_duyet",link_facebook:"",link_tiktok:""};
const emptyUser={ho_ten:"",email:"",vai_tro:"nguoi_dung",trang_thai:"hoat_dong",mat_khau:""};
function toList(result){if(Array.isArray(result))return result;if(Array.isArray(result?.data))return result.data;if(Array.isArray(result?.rows))return result.rows;return []}
function mediaUrl(value){if(!value)return "";const s=String(value);return s.startsWith("http")||s.startsWith("data:")?s:`${API_URL}/${s.replace(/^\/+/,"")}`}
function getError(e){return e?.message||"Đã xảy ra lỗi. Vui lòng thử lại."}

export default function Admin({page="dashboard"}){
 const [mobile,setMobile]=useState(false),[query,setQuery]=useState(""),[modal,setModal]=useState(false),[toast,setToast]=useState(""),[editing,setEditing]=useState(null),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(""),[rows,setRows]=useState([]),[selectedFiles,setSelectedFiles]=useState([]),[gallery,setGallery]=useState([]),[galleryLoading,setGalleryLoading]=useState(false),[form,setForm]=useState({}),[articleHtml,setArticleHtml]=useState("");
 const [dashboardStats,setDashboardStats]=useState({diSan:0,baiViet:0,choDuyet:0,nguoiDung:0}),[pendingArticles,setPendingArticles]=useState([]),[statusFilter,setStatusFilter]=useState("all"),[dashboardLoading,setDashboardLoading]=useState(true),[heritageOptions,setHeritageOptions]=useState([]);
 const editorRef=useRef(null),imageInputRef=useRef(null),coverInputRef=useRef(null);
 const articleMode=page==="articles"||page==="reviews";
 const data=page==="heritage"?{title:"Quản lý di sản",desc:"Quản lý hồ sơ, ảnh đại diện và bộ sưu tập hình ảnh di sản.",button:"Thêm di sản"}:page==="reviews"?{title:"Duyệt bài viết",desc:"Xem xét nội dung do cộng đồng gửi, sau đó duyệt xuất bản hoặc từ chối.",button:"Làm mới danh sách"}:articleMode?{title:"Quản lý bài viết",desc:"Soạn thảo bài viết, chèn ảnh/video và liên kết mạng xã hội.",button:"Viết bài mới"}:page==="media"?{title:"Thư viện media",desc:"Ảnh và video được tải lên qua hồ sơ di sản và bài viết.",button:"Làm mới thư viện"}:page==="users"?{title:"Quản lý người dùng",desc:"Theo dõi tài khoản và vai trò trong hệ thống.",button:"Làm mới danh sách"}:null;
 const current=nav.find(n=>n[0]===page)?.[1]||"Tổng quan";
 const notify=(msg)=>{setToast(msg);window.setTimeout(()=>setToast(""),3200)};
 
const loadRows = useCallback(async () => {
  if (!["heritage", "articles", "reviews", "users", "media"].includes(page)) return;

  setLoading(true);
  setError("");

  try {
    let result;

    if (page === "heritage") {
      result = await api.getDiSan();
    } else if (articleMode) {
      result = await api.getBaiViet();
    } else if (page === "users") {
      result = await api.getNguoiDung();
    } else {
      result = await api.getTatCaHinhAnhDiSan();
    }

    setRows(toList(result));
  } catch (e) {
    setRows([]);
    setError(`${getError(e)}. Kiểm tra Backend, API và quyền đăng nhập Admin.`);
  } finally {
    setLoading(false);
  }
}, [page, articleMode]);

 // eslint-disable-next-line react-hooks/set-state-in-effect
 useEffect(()=>{loadRows()},[loadRows]);
 useEffect(()=>{if(!articleMode)return;let active=true;api.getDiSan().then(result=>{if(active)setHeritageOptions(toList(result))}).catch(()=>{if(active)setHeritageOptions([])});return()=>{active=false}},[articleMode]);
 useEffect(()=>{
  if(page!=="dashboard")return;
  let active=true;
  Promise.all([api.getDiSan(),api.getBaiViet(),api.getNguoiDung()])
   .then(([heritage,articles,users])=>{
    if(!active)return;
    const ds=toList(heritage),bv=toList(articles),nd=toList(users);
    const pending=bv.filter(x=>["cho_duyet","cho duyet","pending"].includes(String(x.trang_thai||"").toLowerCase()));
    setDashboardStats({diSan:ds.length,baiViet:bv.length,choDuyet:pending.length,nguoiDung:nd.length});
    setPendingArticles(pending.slice(0,5));
   })
   .catch(e=>{if(active)notify(`Không tải được thống kê: ${getError(e)}`)})
   .finally(()=>{if(active)setDashboardLoading(false)});
  return()=>{active=false};
 },[page]);
 const filtered=useMemo(()=>rows.filter(r=>{
  const matchText=JSON.stringify(r).toLowerCase().includes(query.toLowerCase());
  const status=String(r.trang_thai||"").toLowerCase();
  const matchStatus=(page==="reviews"?["cho_duyet","cho duyet","pending"].includes(status):statusFilter==="all"||(statusFilter==="pending"?["cho_duyet","cho duyet","pending"].includes(status):statusFilter==="published"?["da_duyet","da_xuat_ban","published","đã duyệt","đã xuất bản"].includes(status):statusFilter==="rejected"?["tu_choi","tu choi","rejected"].includes(status):true));
  return matchText&&matchStatus;
 }),[rows,query,statusFilter,page]);
 const openCreate=()=>{setEditing(null);setError("");setSelectedFiles([]);setGallery([]);setArticleHtml("");setForm(page==="heritage"?Object.fromEntries(diSanFields.map(f=>[f.key,""])):articleMode?{...emptyArticle}:{...emptyUser});setModal(true)};
 const openEdit=async(row)=>{setEditing(row);setError("");setSelectedFiles([]);setGallery([]);setForm(page==="heritage"?Object.fromEntries(diSanFields.map(f=>[f.key,row[f.key]??""])):articleMode?{...emptyArticle,...row,ma_di_san:row.ma_di_san??""}:{...emptyUser,...row,mat_khau:""});setArticleHtml(row.noi_dung||"");setModal(true);if(page==="heritage"&&row.id){setGalleryLoading(true);try{const result=await apiRequest(`/api/hinh-anh-di-san/${row.id}`);setGallery(toList(result).map(x=>({...x,url:mediaUrl(x.hinh_anh||x.duong_dan||x.url)})))}catch{setGallery([])}finally{setGalleryLoading(false)}}};
 const removeRow=async(row)=>{const label=row.ten_di_san||row.tieu_de||row.ho_ten||`#${row.id}`;if(!window.confirm(`Bạn chắc chắn muốn xóa “${label}” khỏi cơ sở dữ liệu? Thao tác này có thể không hoàn tác được.`))return;setBusy(true);try{if(page==="heritage")await api.deleteDiSan(row.id);else if(articleMode)await api.deleteBaiViet(row.id);else if(page==="users")await apiRequest(`/api/nguoi-dung/${row.id}`,{method:"DELETE"});else throw new Error("API xóa chưa được cấu hình cho mục này.");notify("Đã xóa dữ liệu thành công.");await loadRows()}catch(e){notify(getError(e))}finally{setBusy(false)}};
 const setArticleStatus=async(row,status)=>{
  setBusy(true);
  try{await apiRequest(`/api/bai-viet/${row.id}/trang-thai`,{method:"PATCH",body:JSON.stringify({trang_thai:status})});notify(status==="da_duyet"?"Đã duyệt và xuất bản bài viết.":status==="tu_choi"?"Đã từ chối bài viết.":"Đã cập nhật trạng thái.");await loadRows();if(page==="dashboard"){const [a,b,c]=await Promise.all([api.getDiSan(),api.getBaiViet(),api.getNguoiDung()]);const arts=toList(b);const pending=arts.filter(x=>["cho_duyet","cho duyet","pending"].includes(String(x.trang_thai||"").toLowerCase()));setDashboardStats({diSan:toList(a).length,baiViet:arts.length,choDuyet:pending.length,nguoiDung:toList(c).length});setPendingArticles(pending.slice(0,5));}}
  catch(e){notify(getError(e))}finally{setBusy(false)}
 };
 const setField=(key,value)=>setForm(prev=>({...prev,[key]:value}));
 const insertHtml=(html)=>{const editor=editorRef.current;if(!editor)return;editor.focus();document.execCommand("insertHTML",false,html);setArticleHtml(editor.innerHTML)};
 const format=(cmd,value)=>{editorRef.current?.focus();document.execCommand(cmd,false,value);if(editorRef.current)setArticleHtml(editorRef.current.innerHTML)};
 const addInlineImages=async(files)=>{if(!files?.length)return;setBusy(true);setError("");try{const fd=new FormData();Array.from(files).forEach(f=>fd.append("hinh_anh",f));const result=editing?.id?await apiRequest(`/api/noi-dung-bai-viet/${editing.id}`,{method:"POST",body:fd}):null;if(result){const items=toList(result);const urls=items.map(x=>mediaUrl(x.hinh_anh||x.duong_dan||x.url)).filter(Boolean);urls.forEach(url=>insertHtml(`<p><img src="${url}" alt="Hình ảnh bài viết" /></p>`));notify("Đã tải ảnh lên bài viết.")}else{setError("Ảnh đã được chọn. Hãy lưu bài viết trước, sau đó mở Sửa bài viết để tải ảnh lên máy chủ.")}}catch(e){setError(`Tải ảnh trong bài viết chưa thành công: ${getError(e)}. Bạn có thể chèn ảnh bằng URL.`)}finally{setBusy(false)}};
 const save=async(e)=>{e.preventDefault();setBusy(true);setError("");try{
  if(page==="heritage"){
   const fd=new FormData();diSanFields.forEach(f=>fd.append(f.key,form[f.key]??""));if(selectedFiles[0])fd.append("hinh_anh",selectedFiles[0]);
   let result;if(editing?.id)result=await api.updateDiSan(editing.id,fd);else result=await api.createDiSan(fd);
   const id=editing?.id||result?.id||result?.data?.id||result?.insertId;
   if(selectedFiles.length>1&&id){const galleryFd=new FormData();selectedFiles.slice(1).forEach(file=>galleryFd.append("hinh_anh",file));await apiRequest(`/api/hinh-anh-di-san/${id}`,{method:"POST",body:galleryFd})}
   if(!id&&selectedFiles.length>1)notify("Đã lưu di sản. Backend chưa trả ID nên ảnh liên quan chưa được tải lên.");else notify(editing?"Đã cập nhật di sản.":"Đã thêm di sản.");
  }else if(articleMode){
   let html=editorRef.current?.innerHTML??articleHtml;const socialLinks=[form.link_facebook?`<p><strong>Facebook:</strong> <a href="${form.link_facebook}" target="_blank" rel="noopener noreferrer">${form.link_facebook}</a></p>`:"",form.link_tiktok?`<p><strong>TikTok:</strong> <a href="${form.link_tiktok}" target="_blank" rel="noopener noreferrer">${form.link_tiktok}</a></p>`:""].filter(Boolean).join("");if(socialLinks)html+=`<section class="social-links">${socialLinks}</section>`;const fd=new FormData();fd.append("tieu_de",form.tieu_de||"");fd.append("ma_di_san",form.ma_di_san||"");fd.append("description",form.description||"");fd.append("noi_dung",html);fd.append("trang_thai",form.trang_thai||"cho_duyet");fd.append("link_facebook",form.link_facebook||"");fd.append("link_tiktok",form.link_tiktok||"");if(selectedFiles[0])fd.append("hinh_anh",selectedFiles[0]);
   if(editing?.id)await apiRequest(`/api/bai-viet/${editing.id}`,{method:"PUT",body:fd});else await apiRequest("/api/bai-viet",{method:"POST",body:fd});notify(editing?"Đã cập nhật bài viết.":"Đã tạo bài viết.");
  }else if(page==="users"){
   const payload={ho_ten:form.ho_ten||"",email:form.email||"",vai_tro:form.vai_tro||"nguoi_dung",trang_thai:form.trang_thai||"hoat_dong"};
   if(!editing?.id&&!form.mat_khau)throw new Error("Vui lòng nhập mật khẩu cho tài khoản mới.");
   if(form.mat_khau)payload.mat_khau=form.mat_khau;
   if(editing?.id)await apiRequest(`/api/nguoi-dung/${editing.id}`,{method:"PUT",body:JSON.stringify(payload),headers:{"Content-Type":"application/json"}});
   else await apiRequest("/api/nguoi-dung",{method:"POST",body:JSON.stringify(payload),headers:{"Content-Type":"application/json"}});
   notify(editing?"Đã cập nhật người dùng.":"Đã tạo người dùng.");
  }else throw new Error("Chức năng này chưa hỗ trợ thêm/sửa qua API.");
  setModal(false);await loadRows();
 }catch(err){setError(getError(err));}finally{setBusy(false)}};
 const tableRows=filtered.map(r=>page==="heritage"?[r.ten_di_san,r.dia_chi,r.xep_hang,r.id]:articleMode?[r.tieu_de,r.ten_di_san||r.ma_di_san||"Chưa gắn di sản",r.ngay_tao?new Date(r.ngay_tao).toLocaleDateString("vi-VN"):"—",r.trang_thai,r.id]:[r.ho_ten,r.email,r.vai_tro,r.trang_thai,r.id]);
 return <div className="admin-shell"><aside className={`admin-sidebar ${mobile?"sidebar-open":""}`}><a href="/" className="admin-brand"><span className="admin-brand-icon"><Landmark size={23}/></span><span>HÀNH TRÌNH<strong> DI SẢN</strong><small>QUẢN TRỊ HỆ THỐNG</small></span><button className="admin-mobile-close" onClick={()=>setMobile(false)}><X/></button></a><div className="sidebar-label">MENU CHÍNH</div><nav className="admin-nav">{nav.map(([id,label,Icon,url])=><a href={url} key={id} className={page===id?"admin-nav-active":""}><Icon size={18}/><span>{label}</span></a>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><span className="help-icon">✦</span><strong>Lan tỏa giá trị Việt</strong><p>Gìn giữ hôm nay, trao truyền mai sau.</p><a href="/" target="_blank" rel="noreferrer">Xem website <ArrowUpRight size={14}/></a></div><div className="admin-profile"><span className="avatar">QT</span><span><strong>Quản trị viên</strong><small>Quản lý hệ thống</small></span><MoreHorizontal size={18}/></div></div></aside>{mobile&&<button className="sidebar-backdrop" onClick={()=>setMobile(false)} aria-label="Đóng menu"/>}<main className="admin-main"><header className="admin-topbar"><button className="admin-mobile-menu" onClick={()=>setMobile(true)}><Menu/></button><div className="admin-breadcrumb">Quản trị hệ thống <span>/</span> <strong>{current}</strong></div><div className="admin-top-actions"><span className="admin-date"><CalendarDays size={15}/> {new Date().toLocaleDateString("vi-VN")}</span><button className="icon-action" onClick={()=>notify("Không có thông báo mới.")} aria-label="Thông báo"><Bell size={18}/></button><a href="/" className="admin-view-site">Xem website <ArrowUpRight size={15}/></a><button className="admin-view-site" onClick={async()=>{try{await api.logout()}catch(e){console.warn("Không thể gọi API đăng xuất",e)}window.location.href="/dang-nhap"}}>Đăng xuất</button></div></header><div className="admin-content">{page==="dashboard"?<><div className="admin-page-heading"><div><span className="section-label">TỔNG QUAN HỆ THỐNG</span><h1>Quản trị nội dung di sản <span>✦</span></h1><p>Dữ liệu được quản lý qua API của hệ thống.</p></div><a className="admin-primary" href="/admin/di-san"><Plus size={17}/> Quản lý di sản</a></div><div className="stats-grid">{[[MapPinned,"Di sản","/admin/di-san",dashboardStats.diSan],[Newspaper,"Tổng bài viết","/admin/bai-viet",dashboardStats.baiViet],[CheckCircle2,"Bài chờ duyệt","/admin/bai-viet",dashboardStats.choDuyet],[Users,"Người dùng","/admin/nguoi-dung",dashboardStats.nguoiDung]].map(([Icon,label,url,count])=><a className="stat-card" href={url} key={label}><div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={19}/></span></div><div className="stat-number">{dashboardLoading?"…":count}</div><div className="stat-bottom"><span>Mở quản lý</span><small><ArrowUpRight size={13}/> Xem dữ liệu</small></div></a>)}</div><section className="admin-panel recent-panel"><div className="panel-heading"><div><h2>Bài viết cần duyệt</h2><p>{dashboardStats.choDuyet} bài đang chờ quản trị viên xem xét.</p></div><a className="text-button" href="/admin/bai-viet">Xem tất cả <ArrowUpRight size={14}/></a></div>{dashboardLoading?<div className="admin-loading"><LoaderCircle className="spin"/> Đang tải thống kê...</div>:pendingArticles.length===0?<div className="admin-empty">Không có bài viết chờ duyệt.</div>:<div className="review-list">{pendingArticles.map(item=><div className="review-row" key={item.id}><div className="review-copy"><strong>{item.tieu_de||"Bài viết chưa có tiêu đề"}</strong><small>{item.ho_ten||"Thành viên"} · {item.ngay_tao?new Date(item.ngay_tao).toLocaleDateString("vi-VN"):"Chưa rõ ngày"}</small></div><div className="review-actions"><button disabled={busy} onClick={()=>setArticleStatus(item,"da_duyet")}><CheckCircle2 size={15}/> Duyệt</button><a href={`/admin/bai-viet`} title="Mở quản lý bài viết"><Pencil size={15}/></a></div></div>)}</div>}<div className="admin-quick-links"><a href="/admin/di-san"><MapPinned/>Quản lý di sản <ArrowUpRight/></a><a href="/admin/bai-viet"><Newspaper/>Soạn và duyệt bài viết <ArrowUpRight/></a><a href="/admin/nguoi-dung"><Users/>Quản lý người dùng <ArrowUpRight/></a></div></section></>:data?<><div className="admin-page-heading"><div><span className="section-label">QUẢN TRỊ NỘI DUNG</span><h1>{data.title}</h1><p>{data.desc}</p></div><button className="admin-primary" onClick={page==="media"||page==="reviews"?loadRows:openCreate}>{page==="media"||page==="reviews"?<RefreshCw size={17}/>:<Plus size={17}/>}{data.button}</button></div>{error&&!modal&&<div className="admin-alert error-alert">{error}</div>}<section className="admin-panel data-panel"><div className="data-toolbar"><label className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm kiếm nội dung..."/></label>{page==="articles"&&<select className="period-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Lọc trạng thái bài viết"><option value="all">Tất cả trạng thái</option><option value="pending">Chờ duyệt</option><option value="published">Đã duyệt</option><option value="rejected">Đã từ chối</option></select>}<button className="period-select" onClick={loadRows}><RefreshCw size={14}/> Làm mới</button></div>{loading?<div className="admin-loading"><LoaderCircle className="spin"/> Đang tải dữ liệu từ API...</div>:error?<div className="admin-empty">Chưa thể tải dữ liệu. Kiểm tra đăng nhập Admin, Backend và quyền API.</div>:
page === "media" ? (
  <div className="admin-media-grid">
    {filtered.length === 0 ? (
      <div className="admin-empty">
        Chưa có ảnh phù hợp với từ khóa tìm kiếm.
      </div>
    ) : (
      filtered.map((img) => (
        <article className="admin-media-card" key={img.id}>
          <button
            type="button"
            className="admin-media-preview"
            onClick={() => window.open(mediaUrl(img.duong_dan), "_blank", "noopener,noreferrer")}
            title="Mở ảnh kích thước đầy đủ"
          >
            <img
              src={mediaUrl(img.duong_dan)}
              alt={img.mo_ta || img.ten_di_san || "Ảnh di sản"}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement.classList.add("image-load-error");
              }}
            />
            <span className="admin-media-error">
              Không tải được ảnh
            </span>
          </button>
          <div className="admin-media-info">
            <strong>{img.ten_di_san || "Chưa xác định di sản"}</strong>
            <span>Ảnh #{img.id}</span>
            {img.mo_ta && <p>{img.mo_ta}</p>}
          </div>
        </article>
      ))
    )}
  </div>
):<><div className="table-wrap"><table className="admin-table"><thead><tr>{(page==="heritage"?["Tên di sản","Địa chỉ","Xếp hạng","ID"]:articleMode?["Tiêu đề","Di sản liên quan","Ngày tạo","Trạng thái","ID"]:["Họ tên","Email","Vai trò","Trạng thái","ID"]).map(c=><th key={c}>{c}</th>)}<th>Thao tác</th></tr></thead><tbody>{tableRows.map((r,i)=><tr key={r[r.length-1]??i}>{r.map((cell,j)=><td key={j}>{j===0?<strong>{cell||"Chưa có tiêu đề"}</strong>:cell||"—"}</td>)}<td><div className="row-actions">{articleMode&&["cho_duyet","cho duyet","pending"].includes(String(filtered[i].trang_thai||"").toLowerCase())&&<><button title="Duyệt và xuất bản" disabled={busy} onClick={()=>setArticleStatus(filtered[i],"da_duyet")}><CheckCircle2 size={16}/></button><button title="Từ chối bài viết" disabled={busy} onClick={()=>setArticleStatus(filtered[i],"tu_choi")}><X size={16}/></button></>}<button title="Sửa" onClick={()=>openEdit(filtered[i])}><Pencil size={16}/></button><button title="Xóa" disabled={busy} onClick={()=>removeRow(filtered[i])}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>{filtered.length===0&&<div className="admin-empty">Chưa có dữ liệu phù hợp. {page!=="users"&&page!=="reviews"&&<button className="text-button" onClick={openCreate}>Thêm mục đầu tiên</button>}</div>}<div className="table-footer"><span>Hiển thị {filtered.length} mục từ API</span><button onClick={loadRows} disabled={loading}><RefreshCw size={14}/> Tải lại</button></div></>}</section></>:<section className="admin-panel settings-panel"><h2>Cài đặt hệ thống</h2><p>Thông tin cài đặt cần được kết nối với API cấu hình riêng.</p></section>}</div><footer className="admin-footer">© 2026 Hành trình khám phá Di sản <span>Gìn giữ hôm nay, trao truyền mai sau.</span></footer></main>
 {modal&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>e.target===e.currentTarget&&!busy&&setModal(false)}><form className={`admin-modal admin-editor-modal ${articleMode?"article-modal":""}`} onSubmit={save}><button type="button" className="modal-close" disabled={busy} onClick={()=>setModal(false)}><X size={19}/></button><span className="section-label">QUẢN TRỊ NỘI DUNG</span><h2>{editing?"Chỉnh sửa":"Thêm"} {page==="heritage"?"di sản":articleMode?"bài viết":"người dùng"}</h2><p>Dữ liệu được lưu qua API backend. Các trường có dấu * là bắt buộc.</p>{page==="heritage"?<><div className="admin-form-grid">{diSanFields.map(f=><label key={f.key} className={f.area?"field-wide":""}>{f.label}{f.required&&" *"}{f.area?<textarea rows="3" value={form[f.key]??""} onChange={e=>setField(f.key,e.target.value)}/>:<input type={f.type||"text"} step={f.type==="number"?"any":undefined} required={f.required} value={form[f.key]??""} onChange={e=>setField(f.key,e.target.value)}/>}</label>)}</div><label className="upload-label"><ImagePlus size={18}/> Ảnh đại diện và ảnh liên quan <small>Chọn ảnh đầu tiên làm ảnh đại diện; ảnh còn lại là ảnh liên quan.</small><input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={e=>setSelectedFiles(Array.from(e.target.files||[]))}/></label>{selectedFiles.length>0&&<div className="selected-files">{selectedFiles.map((f,i)=><span key={`${f.name}-${i}`}>{i===0?"Ảnh đại diện: ":"Ảnh liên quan: "}{f.name}</span>)}</div>}{galleryLoading?<p>Đang tải thư viện ảnh...</p>:gallery.length>0&&<div className="existing-gallery"><strong>Ảnh đã có</strong><div>{gallery.map((img,i)=><img key={img.id||i} src={img.url} alt="Ảnh di sản" onError={e=>e.currentTarget.style.display="none"}/>)}</div></div>}</>:articleMode?<><label>Tiêu đề bài viết *</label><input required value={form.tieu_de||""} onChange={e=>setField("tieu_de",e.target.value)} placeholder="Nhập tiêu đề bài viết"/><label>Di sản liên quan</label><select value={form.ma_di_san??""} onChange={e=>setField("ma_di_san",e.target.value)}><option value="">Không gắn di sản</option>{heritageOptions.map(ds=><option key={ds.id} value={ds.id}>{ds.ten_di_san} (ID: {ds.id})</option>)}</select><label>Mô tả ngắn (description)</label><textarea rows="3" value={form.description||""} onChange={e=>setField("description",e.target.value)} placeholder="Mô tả ngắn hiển thị trên thẻ bài viết trước khi người dùng mở chi tiết..."/><label>Ảnh đại diện bài viết</label><input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setSelectedFiles(Array.from(e.target.files||[]))}/>{selectedFiles[0]&&<small>{selectedFiles[0].name}</small>}<label>Nội dung bài viết</label><div className="rich-editor"><div className="rich-toolbar"><button type="button" title="Tiêu đề H1" onClick={()=>format("formatBlock","h1")}><Heading1/></button><button type="button" title="Tiêu đề H2" onClick={()=>format("formatBlock","h2")}><Heading2/></button><button type="button" title="Tiêu đề H3" onClick={()=>format("formatBlock","h3")}><Heading3/></button><button type="button" title="In đậm" onClick={()=>format("bold")}><Bold/></button><button type="button" title="In nghiêng" onClick={()=>format("italic")}><Italic/></button><button type="button" title="Danh sách" onClick={()=>format("insertUnorderedList")}><List/></button><button type="button" title="Chèn ảnh từ máy" onClick={()=>imageInputRef.current?.click()}><ImagePlus/></button><button type="button" title="Chèn video hoặc link video" onClick={()=>{const url=window.prompt("Dán URL video (YouTube/TikTok hoặc file video):");if(url&&/^https?:\/\//i.test(url))insertHtml(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">Xem video</a></p>`);}}><Video/></button><button type="button" title="Chèn liên kết" onClick={()=>{const url=window.prompt("Dán đường dẫn liên kết:");if(url&&/^https?:\/\//i.test(url))insertHtml(`<p><a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`);}}><LinkIcon/></button></div><div ref={editorRef} className="rich-content" contentEditable suppressContentEditableWarning onInput={e=>setArticleHtml(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{__html:articleHtml}} data-placeholder="Viết nội dung bài viết tại đây..."/><input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={e=>addInlineImages(e.target.files)}/></div><small>Chọn văn bản rồi bấm H1/H2/H3 để định dạng. Link video được chèn dưới dạng liên kết để tránh nhúng mã không an toàn.</small><div className="admin-form-grid social-fields"><label>Link Facebook<input type="url" value={form.link_facebook||""} onChange={e=>setField("link_facebook",e.target.value)} placeholder="https://facebook.com/..."/></label><label>Link TikTok<input type="url" value={form.link_tiktok||""} onChange={e=>setField("link_tiktok",e.target.value)} placeholder="https://tiktok.com/@..."/></label></div><label>Trạng thái<select value={form.trang_thai||"cho_duyet"} onChange={e=>setField("trang_thai",e.target.value)}><option value="cho_duyet">Chờ duyệt</option><option value="da_duyet">Đã duyệt / xuất bản</option><option value="ban_nhap">Bản nháp</option></select></label></>:<>
<div className="admin-form-grid">
<label>Họ và tên *<input required value={form.ho_ten||""} onChange={e=>setField("ho_ten",e.target.value)} placeholder="Nhập họ và tên"/></label>
<label>Email *<input required type="email" value={form.email||""} onChange={e=>setField("email",e.target.value)} placeholder="Nhập địa chỉ email"/></label>
<label>Vai trò<select value={form.vai_tro||"nguoi_dung"} onChange={e=>setField("vai_tro",e.target.value)}><option value="nguoi_dung">Người dùng</option><option value="quan_tri_vien">Quản trị viên</option></select></label>
<label>Trạng thái<select value={form.trang_thai||"hoat_dong"} onChange={e=>setField("trang_thai",e.target.value)}><option value="hoat_dong">Hoạt động</option><option value="khoa">Đã khóa</option></select></label>
{!editing&&<label>Mật khẩu *<input required type="password" autoComplete="new-password" value={form.mat_khau||""} onChange={e=>setField("mat_khau",e.target.value)} placeholder="Nhập mật khẩu cho tài khoản" minLength={8}/></label>}
{editing&&<label>Mật khẩu mới <input type="password" autoComplete="new-password" value={form.mat_khau||""} onChange={e=>setField("mat_khau",e.target.value)} placeholder="Để trống nếu không đổi" minLength={8}/></label>}
</div>
</>}{error&&<div className="admin-alert error-alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn-secondary" disabled={busy} onClick={()=>setModal(false)}>Hủy</button><button className="admin-primary" type="submit" disabled={busy}><CheckCircle2 size={16}/>{busy?"Đang lưu...":"Lưu thay đổi"}</button></div></form></div>}{toast&&<div className="admin-toast">{toast}</div>}</div>
}


import { useEffect, useState } from "react";
import { api } from "../services/api";
import { User, Trash2, Edit3, Save, X, Plus, Search, RefreshCw } from "lucide-react";

const emptyForm = {
  ho_ten: "",
  email: "",
  mat_khau: "",
  vai_tro: "nguoi_dung",
  trang_thai: "hoat_dong",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getNguoiDung();
      setUsers(Array.isArray(result) ? result : result?.data || []);
    } catch (e) {
      setError(e?.message || "Không tải được danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter(u =>
    `${u.ho_ten || ""} ${u.email || ""}`.toLowerCase().includes(query.toLowerCase())
  );

  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  const openEdit = user => {
    setEditingId(user.id);
    setForm({ ...emptyForm, ...user, mat_khau: "" });
    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (busy) return;
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  const save = async e => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const payload = {
        ho_ten: form.ho_ten.trim(),
        email: form.email.trim(),
        vai_tro: form.vai_tro,
        trang_thai: form.trang_thai,
      };

      if (!editingId && !form.mat_khau.trim()) {
        throw new Error("Vui lòng nhập mật khẩu cho tài khoản mới.");
      }

      if (form.mat_khau.trim()) payload.mat_khau = form.mat_khau;

      if (editingId) {
        await api.updateNguoiDung(editingId, payload);
      } else {
        await api.createNguoiDung(payload);
      }

      closeAfterSave();
      await load();
    } catch (e) {
      setError(e?.message || "Lưu người dùng thất bại.");
    } finally {
      setBusy(false);
    }
  };

  const closeAfterSave = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const remove = async user => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${user.ho_ten || user.email}"?`)) return;
    setBusy(true);
    setError("");
    try {
      await api.deleteNguoiDung(user.id);
      await load();
    } catch (e) {
      setError(e?.message || "Xóa người dùng thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="um-page">
      <style>{`
        .um-page{min-height:100vh;padding:32px;background:#f8f6ef;color:#263a30;font-family:Inter,Arial,sans-serif}
        .um-head{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px}
        .um-head h1{margin:0 0 8px;font-size:30px}.um-head p{margin:0;color:#737e73}
        .um-primary{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:0;border-radius:9px;background:#245b48;color:white;padding:12px 17px;font-weight:700;cursor:pointer}
        .um-primary:disabled{opacity:.6;cursor:not-allowed}
        .um-panel{background:white;border:1px solid #e5e8df;border-radius:14px;overflow:hidden}
        .um-toolbar{display:flex;justify-content:space-between;gap:12px;padding:18px;border-bottom:1px solid #edf0e9}
        .um-search{display:flex;align-items:center;gap:10px;width:min(100%,390px);border:1px solid #dfe5db;border-radius:9px;padding:0 12px}
        .um-search input{width:100%;border:0;outline:0;padding:11px 0;font:inherit}
        .um-refresh{display:flex;align-items:center;gap:7px;background:white;border:1px solid #dfe5db;border-radius:8px;padding:10px;cursor:pointer}
        .um-table-wrap{overflow-x:auto}.um-table{width:100%;border-collapse:collapse;min-width:650px}
        .um-table th{text-align:left;background:#f5f7f2;padding:14px 18px;color:#536454;font-size:12px}
        .um-table td{padding:16px 18px;border-bottom:1px solid #eef0ea;font-size:14px}
        .um-pill{display:inline-block;border-radius:20px;padding:5px 9px;font-size:12px;font-weight:700;background:#eaf1e9;color:#356448}
        .um-locked{background:#fde9e7;color:#b23d35}.um-admin{background:#f8eed7;color:#8a6420}
        .um-actions{display:flex;gap:7px}.um-icon{display:grid;place-items:center;width:34px;height:34px;border:0;border-radius:8px;cursor:pointer}
        .um-edit{background:#e7f1f8;color:#27618a}.um-delete{background:#fde9e8;color:#b33c35}
        .um-empty,.um-loading{text-align:center;padding:30px;color:#778276}
        .um-footer{padding:14px 18px;color:#778276;font-size:12px}
        .um-error{padding:12px 14px;margin-bottom:16px;border-radius:8px;background:#fff0ee;color:#b33c35}
        .um-backdrop{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;background:#16231c99;backdrop-filter:blur(3px);overflow:auto}
        .um-modal{position:relative;width:min(100%,650px);max-height:calc(100vh - 40px);overflow:auto;background:#fffdf8;border-radius:16px;padding:30px;box-shadow:0 24px 80px #101c1680}
        .um-close{position:absolute;right:16px;top:16px;width:36px;height:36px;border:0;border-radius:9px;background:#eef1e9;cursor:pointer}
        .um-modal h2{margin:0 40px 8px 0;font-size:25px}.um-intro{margin:0 0 24px;color:#737e73;font-size:14px}
        .um-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}
        .um-field{display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:700;color:#415247}
        .um-field input,.um-field select{width:100%;min-height:43px;border:1px solid #dce3d8;border-radius:8px;background:white;padding:10px 12px;font:inherit;font-weight:400}
        .um-field input:focus,.um-field select:focus{outline:2px solid #54866c55;border-color:#54866c}
        .um-hint{font-size:12px;color:#7c877b;font-weight:400}
        .um-actions-bottom{display:flex;justify-content:flex-end;gap:10px;margin-top:26px;padding-top:18px;border-top:1px solid #e9ede5}
        .um-secondary{border:1px solid #dce3d8;background:white;border-radius:9px;padding:11px 17px;cursor:pointer}
        @media(max-width:650px){.um-page{padding:18px 12px}.um-head{align-items:stretch;flex-direction:column}.um-grid{grid-template-columns:1fr}.um-modal{padding:24px 18px}.um-toolbar{flex-direction:column}.um-search{width:100%}}
      `}</style>

      <div className="um-head">
        <div>
          <h1><User size={27} style={{ verticalAlign: "middle", marginRight: 9 }} />Quản lý người dùng</h1>
          <p>Quản lý tài khoản, phân quyền và trạng thái hoạt động.</p>
        </div>
        <button className="um-primary" onClick={openCreate}><Plus size={17} /> Thêm người dùng</button>
      </div>

      {error && !modalOpen && <div className="um-error">{error}</div>}

      <section className="um-panel">
        <div className="um-toolbar">
          <label className="um-search"><Search size={17} />
            <input placeholder="Tìm kiếm tên hoặc email..." value={query} onChange={e => setQuery(e.target.value)} />
          </label>
          <button className="um-refresh" onClick={load} disabled={loading}><RefreshCw size={14} /> Làm mới</button>
        </div>

        {loading ? <div className="um-loading">Đang tải danh sách người dùng...</div> : (
          <>
            <div className="um-table-wrap">
              <table className="um-table">
                <thead><tr><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? <tr><td colSpan={5} className="um-empty">Không có người dùng nào phù hợp.</td></tr> :
                    filtered.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.ho_ten || "Không tên"}</strong></td>
                        <td>{user.email || "—"}</td>
                        <td><span className={`um-pill ${user.vai_tro === "quan_tri_vien" ? "um-admin" : ""}`}>{user.vai_tro === "quan_tri_vien" ? "Quản trị viên" : "Người dùng"}</span></td>
                        <td><span className={`um-pill ${["khoa","bi_khoa","da_khoa"].includes(user.trang_thai) ? "um-locked" : ""}`}>{["khoa","bi_khoa","da_khoa"].includes(user.trang_thai) ? "Đã khóa" : "Hoạt động"}</span></td>
                        <td><div className="um-actions">
                          <button className="um-icon um-edit" title="Sửa" onClick={() => openEdit(user)} disabled={busy}><Edit3 size={16} /></button>
                          <button className="um-icon um-delete" title="Xóa" onClick={() => remove(user)} disabled={busy}><Trash2 size={16} /></button>
                        </div></td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
            <div className="um-footer">Hiển thị {filtered.length} / {users.length} người dùng</div>
          </>
        )}
      </section>

      {modalOpen && (
        <div className="um-backdrop" onMouseDown={e => e.target === e.currentTarget && closeModal()}>
          <form className="um-modal" onSubmit={save} role="dialog" aria-modal="true">
            <button type="button" className="um-close" onClick={closeModal} disabled={busy} aria-label="Đóng"><X size={19} /></button>
            <h2>{editingId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</h2>
            <p className="um-intro">Nhập thông tin tài khoản. Các trường có dấu * là bắt buộc.</p>

            <div className="um-grid">
              <label className="um-field">Họ và tên *
                <input required value={form.ho_ten} onChange={e => setField("ho_ten", e.target.value)} placeholder="Nhập họ và tên" />
              </label>
              <label className="um-field">Email *
                <input required type="email" value={form.email} onChange={e => setField("email", e.target.value)} placeholder="name@example.com" />
              </label>
              <label className="um-field">Vai trò
                <select value={form.vai_tro} onChange={e => setField("vai_tro", e.target.value)}>
                  <option value="nguoi_dung">Người dùng</option><option value="quan_tri_vien">Quản trị viên</option>
                </select>
              </label>
              <label className="um-field">Trạng thái
                <select value={form.trang_thai} onChange={e => setField("trang_thai", e.target.value)}>
                  <option value="hoat_dong">Hoạt động</option><option value="bi_khoa">Đã khóa</option><option value="khoa">Khóa</option>
                </select>
              </label>
              <label className="um-field" style={{ gridColumn: "1 / -1" }}>Mật khẩu {editingId ? "(không bắt buộc)" : "*"}
                <input required={!editingId} type="password" minLength={8} autoComplete="new-password" value={form.mat_khau} onChange={e => setField("mat_khau", e.target.value)} placeholder={editingId ? "Để trống nếu không đổi" : "Nhập mật khẩu, ít nhất 8 ký tự"} />
                <span className="um-hint">{editingId ? "Chỉ đổi mật khẩu khi nhập mật khẩu mới." : "Mật khẩu cần được backend xử lý an toàn trước khi lưu."}</span>
              </label>
            </div>

            {error && <div className="um-error" style={{ marginTop: 18 }}>{error}</div>}

            <div className="um-actions-bottom">
              <button type="button" className="um-secondary" onClick={closeModal} disabled={busy}>Hủy</button>
              <button type="submit" className="um-primary" disabled={busy}>
                <Save size={16} /> {busy ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm người dùng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(data?.message || `API lỗi (${response.status})`);
  return data;
}

export const api = {
  getTatCaHinhAnhDiSan: () => apiRequest("/api/hinh-anh-di-san"),
  getHinhAnhTheoDiSan: (id) => apiRequest(`/api/hinh-anh-di-san/${id}`),
  getDiSan: () => apiRequest("/api/di-san"),
  getDiSanById: (id) => apiRequest(`/api/di-san/${id}`),
  createDiSan: (formData) => apiRequest("/api/di-san", { method: "POST", body: formData }),
  updateDiSan: (id, formData) => apiRequest(`/api/di-san/${id}`, { method: "PUT", body: formData }),
  deleteDiSan: (id) => apiRequest(`/api/di-san/${id}`, { method: "DELETE" }),
  getBaiViet: () => apiRequest("/api/bai-viet"),
  getBaiVietById: (id) => apiRequest(`/api/bai-viet/${id}`),
  getBinhLuanBaiViet: (id) => apiRequest(`/api/bai-viet/${id}/binh-luan`),
  themBinhLuanBaiViet: (id, noi_dung) => apiRequest(`/api/bai-viet/${id}/binh-luan`, { method: "POST", body: JSON.stringify({ noi_dung }) }),
  xoaBinhLuanBaiViet: (id) => apiRequest(`/api/bai-viet/binh-luan/${id}`, { method: "DELETE" }),
  createBaiViet: (data) => apiRequest("/api/bai-viet", { method: "POST", body: JSON.stringify(data) }),
  updateBaiViet: (id, data) => apiRequest(`/api/bai-viet/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBaiViet: (id) => apiRequest(`/api/bai-viet/${id}`, { method: "DELETE" }),
  getNguoiDung: () => apiRequest("/api/nguoi-dung"),
  createNguoiDung: (data) => apiRequest("/api/nguoi-dung", { method: "POST", body: JSON.stringify(data) }),
  updateNguoiDung: (id, data) => apiRequest(`/api/nguoi-dung/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteNguoiDung: (id) => apiRequest(`/api/nguoi-dung/${id}`, { method: "DELETE" }),
  getCongDong: () => apiRequest("/api/cong-dong"),
  getCongDongById: (id) => apiRequest(`/api/cong-dong/${id}`),
  createCongDong: (formData) => apiRequest("/api/cong-dong", { method: "POST", body: formData }),
  getBinhLuanCongDong: (id) => apiRequest(`/api/cong-dong/${id}/binh-luan`),
  themBinhLuanCongDong: (id, noi_dung) => apiRequest(`/api/cong-dong/${id}/binh-luan`, { method: "POST", body: JSON.stringify({ noi_dung }) }),
  xoaBinhLuanCongDong: (id) => apiRequest(`/api/cong-dong/binh-luan/${id}`, { method: "DELETE" }),
  getKhaoSat: () => apiRequest("/api/khao-sat"),
  submitKhaoSat: (data) => apiRequest("/api/khao-sat", { method: "POST", body: JSON.stringify(data) }),
  timKiemAi: (loai, cauHoi) =>
  apiRequest("/api/tim-kiem-ai", { method: "POST", body: JSON.stringify({ loai, cauHoi }),}),
  login: (email, mat_khau) => apiRequest("/api/auth/dang-nhap", { method: "POST", body: JSON.stringify({ email, mat_khau }) }),
  register: (data) => apiRequest("/api/auth/dang-ky", { method: "POST", body: JSON.stringify(data) }),
  logout: () => apiRequest("/api/auth/dang-xuat", { method: "POST" }),
  quenMatKhau: (email) => apiRequest("/api/auth/quen-mat-khau", { method: "POST", body: JSON.stringify({ email }) }),
  datLaiMatKhau: (email, ma_otp, mat_khau_moi) => apiRequest("/api/auth/dat-lai-mat-khau", { method: "POST", body: JSON.stringify({ email, ma_otp, mat_khau_moi }) }),

};
export { API_URL };



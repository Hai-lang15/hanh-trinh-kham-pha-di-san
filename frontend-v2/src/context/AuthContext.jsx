import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { api, apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [nguoiDung, setNguoiDung] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const kiemTraDangNhap = useCallback(async () => {
    try {
      const data = await apiRequest("/api/auth/toi", { method: "GET" });
      setNguoiDung(data || null);
    } catch (e) {
      setNguoiDung(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    kiemTraDangNhap();
  }, [kiemTraDangNhap]);

  const dangNhap = async (email, matKhau) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, matKhau);
      setNguoiDung(data.nguoiDung || data);
      return { ok: true, data };
    } catch (e) {
      const msg = e?.message || "Đăng nhập thất bại";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const dangKy = async (hoTen, email, matKhau) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register({ ho_ten: hoTen, email, mat_khau: matKhau });
      return { ok: true, data };
    } catch (e) {
      const msg = e?.message || "Đăng ký thất bại";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const xacThucOTP = async (email, maOTP) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest("/api/auth/xac-thuc-otp", {
        method: "POST",
        body: JSON.stringify({ email, ma_otp: maOTP }),
      });
      return { ok: true, data };
    } catch (e) {
      const msg = e?.message || "Xác thực OTP thất bại";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const dangXuat = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (e) {
      console.warn("Không thể gọi API đăng xuất", e);
    } finally {
      setNguoiDung(null);
      setLoading(false);
    }
  };

  const capNhatNguoiDung = (user) => setNguoiDung(user);

  const value = {
    nguoiDung,
    loading,
    error,
    dangNhap,
    dangKy,
    xacThucOTP,
    dangXuat,
    kiemTraDangNhap,
    capNhatNguoiDung,
    isAdmin: nguoiDung ? nguoiDung.vai_tro === "quan_tri_vien" : false,
    isLoggedIn: !!nguoiDung,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong AuthProvider");
  return ctx;
}

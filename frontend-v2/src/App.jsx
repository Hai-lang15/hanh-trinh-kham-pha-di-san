import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import DiSan from "./pages/Disan";
import ChiTietDiSan from "./pages/ChiTietDiSan";
import ChiTietBaiViet from "./pages/ChiTietBaiViet";
import BanDo from "./pages/BanDo";
import BaiViet from "./pages/BaiViet";
import ThuVien from "./pages/ThuVien";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import KhaoSat from "./pages/KhaoSat";
import CongDongDiSan from "./pages/CongDongDiSan";
import "./App.css";

function NotFound() {
  return (
    <main className="not-found">
      <span className="section-label">404 · KHÔNG TÌM THẤY</span>
      <h1>Trang này chưa có trong hành trình.</h1>
      <a className="btn-primary" href="/">Về trang chủ</a>
    </main>
  );
}

function AppInner() {
  const { nguoiDung, isLoggedIn, loading } = useAuth();
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isAdminRoute = path.startsWith("/admin");
  const anHeader = ["/dang-nhap", "/dang-ky"].includes(path);
  const anFooter = ["/dang-nhap", "/dang-ky", "/quen-mat-khau"].includes(path);

  const routes = {
    "/": <Home />,
    "/di-san": <DiSan />,
    "/di-san/chi-tiet": <ChiTietDiSan />,
    "/ban-do": <BanDo />,
    "/bai-viet": <BaiViet />,
    "/bai-viet/chi-tiet": <ChiTietBaiViet />,
    "/thu-vien": <ThuVien />,
    "/khao-sat": <KhaoSat />,
    "/cong-dong": <CongDongDiSan />,
    "/dang-nhap": <Auth mode="login" />,
    "/dang-ky": <Auth mode="register" />,
    "/quen-mat-khau": <Auth mode="forgot" />,
    "/admin": <Admin page="dashboard" />,
    "/admin/di-san": <Admin page="heritage" />,
    "/admin/bai-viet": <Admin page="articles" />,
    "/admin/duyet-bai-viet": <Admin page="reviews" />,
    "/admin/thu-vien": <Admin page="media" />,
    "/admin/nguoi-dung": <Admin page="users" />,
    "/admin/cai-dat": <Admin page="settings" />,
  };

  const currentPage = routes[path] || <NotFound />;

  
if (isAdminRoute) {
  if (loading) {
    return (
      <main className="admin-loading">
        <p>Đang kiểm tra quyền truy cập...</p>
      </main>
    );
  }

  if (!isLoggedIn) {
    return <Auth mode="login" />;
  }

  if (nguoiDung?.vai_tro !== "quan_tri_vien") {
    return (
      <main className="not-found">
        <span className="section-label">403 · KHÔNG CÓ QUYỀN</span>
        <h1>Bạn không có quyền truy cập trang quản trị.</h1>
        <a className="btn-primary" href="/">Về trang chủ</a>
      </main>
    );
  }

  return <>{currentPage}</>;
}


  return (
    <div className="website">
      {!anHeader && <Header />}
      <div className="page-transition">{currentPage}</div>
      {!anFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
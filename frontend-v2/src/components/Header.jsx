import { useState } from "react";
import { Menu, X, Landmark, UserRound, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header() {
  const [menuMo, setMenuMo] = useState(false);
  const dongMenu = () => setMenuMo(false);
  const { nguoiDung, dangXuat, isLoggedIn } = useAuth();

  const isAdmin = nguoiDung?.vai_tro === "quan_tri_vien";
  const userLabel = nguoiDung?.ho_ten || nguoiDung?.email || "Tài khoản";

  return (
    <header className="header">
      <a className="logo" href="/" onClick={dongMenu}><span className="logo-icon"><Landmark size={25} /></span><span className="logo-text"><span>HÀNH TRÌNH <strong>DI SẢN</strong></span><small>Khám phá văn hóa Việt Nam</small></span></a>
      <nav className={menuMo ? "nav nav-open" : "nav"}>
        <a href="/" onClick={dongMenu}>Trang chủ</a>
        <a href="/di-san" onClick={dongMenu}>Di sản</a>
        <a href="/ban-do" onClick={dongMenu}>Bản đồ</a>
        <a href="/bai-viet" onClick={dongMenu}>Bài viết</a>
        <a href="/cong-dong" onClick={dongMenu}>Cộng đồng</a>
        <a href="/thu-vien" onClick={dongMenu}>Thư viện</a>
        {/* <a href="/khao-sat" onClick={dongMenu}>Đánh giá Website</a> */}
        {isLoggedIn ? (
          <>
            <a href={isAdmin ? "/admin" : "/"} onClick={dongMenu} className="nav-button user-button" aria-label={userLabel} title={userLabel}><UserRound size={19} /></a>
            <button className="nav-button logout-btn" onClick={async () => { await dangXuat(); dongMenu(); window.location.href = "/dang-nhap"; }} aria-label="Đăng xuất"><LogOut size={19} /></button>
          </>
        ) : (
          <a className="nav-button user-button" href="/dang-nhap" onClick={dongMenu} aria-label="Đăng nhập" title="Đăng nhập"><UserRound size={19} /></a>
        )}
      </nav>
      <button className="menu-toggle" onClick={() => setMenuMo(!menuMo)} aria-label={menuMo ? "Đóng menu" : "Mở menu" } aria-expanded={menuMo}>{menuMo ? <X size={23} /> : <Menu size={23} />}</button>

      
      {/* <script async src="https://www.googletagmanager.com/gtag/js?id=G-SXQZEGVK1R"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments)}
        gtag('js', new Date());

        gtag('config', 'G-SXQZEGVK1R');
      </script> */}
          </header>
        );
}


import { useState, useEffect } from "react";
import {
  Menu, X, Landmark, UserRound, LogOut,
  House, MapPinned, Newspaper, Users, Images
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const menuItems = [
  { label: "Trang chủ", href: "/", icon: House },
  { label: "Di sản", href: "/di-san", icon: Landmark },
  { label: "Bản đồ", href: "/ban-do", icon: MapPinned },
  { label: "Bài viết", href: "/bai-viet", icon: Newspaper },
  { label: "Cộng đồng", href: "/cong-dong", icon: Users },
  { label: "Thư viện", href: "/thu-vien", icon: Images },
];

export default function Header() {
  const [menuMo, setMenuMo] = useState(false);
  const dongMenu = () => setMenuMo(false);
  const { nguoiDung, dangXuat, isLoggedIn } = useAuth();

  const isAdmin = nguoiDung?.vai_tro === "quan_tri_vien";
  const userLabel = nguoiDung?.ho_ten || nguoiDung?.email || "Tài khoản";

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-active", menuMo);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") dongMenu();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.classList.remove("mobile-menu-active");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuMo]);

  const xuLyDangXuat = async () => {
    await dangXuat();
    dongMenu();
    window.location.href = "/dang-nhap";
  };

  return (
    <header className="header">
      <a className="logo" href="/" onClick={dongMenu}>
        <span className="logo-icon"><Landmark size={25} /></span>
        <span className="logo-text">
          <span>HÀNH TRÌNH <strong>DI SẢN</strong></span>
          <small>Khám phá văn hóa Việt Nam</small>
        </span>
      </a>

      <nav className={menuMo ? "nav nav-open" : "nav"}>
        {menuItems.map(({ label, href, icon: Icon }) => (
          <a key={href} href={href} onClick={dongMenu}>
            <Icon className="mobile-nav-icon" size={19} />
            <span>{label}</span>
          </a>
        ))}

        {/* Đăng nhập/Đăng xuất trong danh sách menu điện thoại */}
        {isLoggedIn ? (
          <button
            type="button"
            className="mobile-menu-item"
            onClick={xuLyDangXuat}
          >
            <LogOut size={19} className="mobile-nav-icon" />
            <span>Đăng xuất</span>
          </button>
        ) : (
          <a
            className="mobile-menu-item"
            href="/dang-nhap"
            onClick={dongMenu}
          >
            <UserRound size={19} className="mobile-nav-icon" />
            <span>Đăng nhập</span>
          </a>
        )}

        {/* Nút tài khoản dành cho giao diện máy tính */}
        {isLoggedIn ? (
          <>
            <a
              href={isAdmin ? "/admin" : "/"}
              onClick={dongMenu}
              className="nav-button user-button desktop-account"
              aria-label={userLabel}
              title={userLabel}
            >
              <UserRound size={19} />
            </a>
            <button
              type="button"
              className="nav-button logout-btn desktop-account"
              onClick={xuLyDangXuat}
              aria-label="Đăng xuất"
            >
              <LogOut size={19} />
            </button>
          </>
        ) : (
          <a
            className="nav-button user-button desktop-account"
            href="/dang-nhap"
            onClick={dongMenu}
            aria-label="Đăng nhập"
            title="Đăng nhập"
          >
            <UserRound size={19} />
          </a>
        )}
      </nav>

      <button
        className="menu-toggle"
        onClick={() => setMenuMo(!menuMo)}
        aria-label={menuMo ? "Đóng menu" : "Mở menu"}
        aria-expanded={menuMo}
      >
        {menuMo ? <X size={25} /> : <Menu size={25} />}
      </button>

      {menuMo && (
        <button
          type="button"
          className="mobile-menu-overlay"
          aria-label="Đóng menu"
          onClick={dongMenu}
        />
      )}
    </header>
  );
}

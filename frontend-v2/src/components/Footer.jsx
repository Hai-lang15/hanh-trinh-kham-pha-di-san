
import { Landmark } from "lucide-react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <a className="logo footer-logo" href="/">
        <Landmark size={24} />
        <span>HÀNH TRÌNH <strong>DI SẢN</strong></span>
      </a>
      <p>Dự án khám phá và lan tỏa giá trị di sản văn hóa Quận 12.</p>
      <span>© 2026 Hành trình khám phá Di sản</span>
    </footer>
  );
}

export default Footer;

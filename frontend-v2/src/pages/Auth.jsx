
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { Landmark, Eye, EyeOff, Mail, LockKeyhole, UserRound, ShieldCheck, LoaderCircle, ArrowLeft, KeyRound } from "lucide-react";

export default function Auth({ mode = "login" }) {
  const { dangNhap, dangKy, xacThucOTP, isLoggedIn, nguoiDung } = useAuth();
  const [show, setShow] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("error");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("form");
  const [emailOtp, setEmailOtp] = useState("");

  const login = mode === "login";
  const register = mode === "register";
  const title = login ? "Chào mừng trở lại" : "Bắt đầu hành trình";

  const setMsg = (msg, type = "error") => {
    setNotice(msg);
    setNoticeType(type);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setNotice("");
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || emailOtp).trim().toLowerCase();
    const password = String(fd.get("password") || "");
    const confirm = String(fd.get("confirm") || "");
    const otp = String(fd.get("otp") || "").trim();

    if (step === "forgot") {
      if (!email) return setMsg("Vui lòng nhập địa chỉ email.");
      setBusy(true);
      try {
        const result = await api.quenMatKhau(email);
        setEmailOtp(email);
        setStep("reset");
        setMsg(result.message || "Nếu email hợp lệ, mã OTP sẽ được gửi đến hộp thư của bạn.", "success");
      } catch (error) {
        setMsg(error.message || "Không thể gửi OTP. Vui lòng thử lại.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (step === "reset") {
      if (!/^\d{6}$/.test(otp)) return setMsg("Mã OTP phải gồm 6 chữ số.");
      if (password.length < 6) return setMsg("Mật khẩu mới cần ít nhất 6 ký tự.");
      if (password !== confirm) return setMsg("Mật khẩu xác nhận chưa khớp.");

      setBusy(true);
      try {
        const result = await api.datLaiMatKhau(emailOtp, otp, password);
        setStep("resetSuccess");
        setMsg(result.message || "Đặt lại mật khẩu thành công.", "success");
      } catch (error) {
        setMsg(error.message || "Không thể đặt lại mật khẩu.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (register && step === "form") {
      if (password.length < 6) return setMsg("Mật khẩu cần ít nhất 6 ký tự.");
      if (password !== confirm) return setMsg("Mật khẩu xác nhận chưa khớp.");

      setBusy(true);
      const r = await dangKy(name, email, password);
      setBusy(false);

      if (r.ok) {
        setEmailOtp(email);
        setStep("otp");
        setMsg("Mã OTP đã được gửi đến email. Vui lòng kiểm tra hộp thư.", "success");
      } else {
        setMsg(r.message);
      }
      return;
    }

    if (register && step === "otp") {
      setBusy(true);
      const r = await xacThucOTP(emailOtp, password);
      setBusy(false);

      if (r.ok) {
        setStep("success");
        setMsg("Xác thực OTP thành công. Tài khoản đã được tạo!", "success");
        setTimeout(() => window.location.href = "/dang-nhap", 1500);
      } else {
        setMsg(r.message);
      }
      return;
    }

    setBusy(true);
    const r = await dangNhap(email, password);
    setBusy(false);

    if (r.ok) {
      const user = r.data?.nguoiDung || r.data;
      window.location.href = user?.vai_tro === "quan_tri_vien" ? "/admin" : "/";
    } else {
      setMsg(r.message);
    }
  };

  const quayLaiDangNhap = () => {
    setStep("form");
    setNotice("");
    setShow(false);
    window.history.replaceState(null, "", "/dang-nhap");
  };

  if (isLoggedIn) {
    window.location.href = nguoiDung?.vai_tro === "quan_tri_vien" ? "/admin" : "/";
    return null;
  }

  const dangQuenMatKhau = step === "forgot";
  const dangDatLaiMatKhau = step === "reset";
  const datLaiThanhCong = step === "resetSuccess";

  if (step === "otp" || step === "success" || datLaiThanhCong) {
    const laOTP = step === "otp";
    const thanhCong = step === "success" || datLaiThanhCong;

    return (
      <main className="auth-page">
        <section className="auth-visual">
          <div className="auth-visual-overlay" />
          <a className="auth-brand" href="/">
            <Landmark size={29} />
            <span>HÀNH TRÌNH <strong>DI SẢN</strong><small>Khám phá văn hóa Việt Nam</small></span>
          </a>
          <div className="auth-visual-copy">
            <span className="section-label">GÌN GIỮ GIÁ TRỊ VIỆT</span>
            <h1>Mỗi di sản<br /> là một câu chuyện.</h1>
            <p>Khám phá những dấu ấn lịch sử, văn hóa và kiến trúc làm nên bản sắc quê hương.</p>
            <div className="auth-quote">“Di sản là cầu nối giữa ký ức hôm qua và khát vọng ngày mai.”</div>
          </div>
          <span className="auth-image-credit">HÀNH TRÌNH KHÁM PHÁ DI SẢN · QUẬN 12</span>
        </section>

        <section className="auth-form-side">
          <a href="/" className="auth-back">← Về trang chủ</a>
          <div className="auth-form-wrap">
            <div className="auth-form-icon">{thanhCong ? <ShieldCheck size={24} /> : <Mail size={24} />}</div>
            <span className="section-label">{thanhCong ? "THÀNH CÔNG" : "XÁC THỰC OTP"}</span>
            <h2>{datLaiThanhCong ? "Đổi mật khẩu thành công" : thanhCong ? "Đăng ký hoàn tất" : "Hoàn tất đăng ký"}</h2>
            <p className="auth-subtitle">{laOTP ? <>Nhập mã 6 chữ số gửi đến <strong>{emailOtp}</strong></> : notice}</p>
            {notice && <p className={`auth-notice ${noticeType === "success" ? "auth-notice-success" : ""}`}>{notice}</p>}
            {laOTP ? (
              <form onSubmit={onSubmit} className="auth-form">
                <label>Mã OTP<span className="input-icon"><LockKeyhole size={17} /><input name="password" required maxLength={6} inputMode="numeric" placeholder="Nhập mã 6 chữ số" autoComplete="one-time-code" /></span></label>
                <button type="submit" className="btn-primary" disabled={busy}>{busy ? <LoaderCircle size={18} /> : "Xác thực OTP"}</button>
              </form>
            ) : (
              <>
                {datLaiThanhCong && <p className="auth-subtitle">Bạn có thể sử dụng mật khẩu mới để đăng nhập.</p>}
                <button type="button" className="btn-primary" onClick={quayLaiDangNhap}>Đến trang đăng nhập</button>
              </>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-overlay" />
        <a className="auth-brand" href="/">
          <Landmark size={29} />
          <span>HÀNH TRÌNH <strong>DI SẢN</strong><small>Khám phá văn hóa Việt Nam</small></span>
        </a>
        <div className="auth-visual-copy">
          <span className="section-label">GÌN GIỮ GIÁ TRỊ VIỆT</span>
          <h1>Mỗi di sản<br /> là một câu chuyện.</h1>
          <p>Khám phá những dấu ấn lịch sử, văn hóa và kiến trúc làm nên bản sắc quê hương.</p>
          <div className="auth-quote">“Di sản là cầu nối giữa ký ức hôm qua và khát vọng ngày mai.”</div>
        </div>
        <span className="auth-image-credit">HÀNH TRÌNH KHÁM PHÁ DI SẢN · QUẬN 12</span>
      </section>

      <section className="auth-form-side">
        <a href="/" className="auth-back">← Về trang chủ</a>
        <div className="auth-form-wrap">
          <div className="auth-form-icon">
            {dangQuenMatKhau ? <Mail size={24} /> : dangDatLaiMatKhau ? <KeyRound size={24} /> : <ShieldCheck size={24} />}
          </div>

          <span className="section-label">
            {dangQuenMatKhau ? "KHÔI PHỤC TÀI KHOẢN" : dangDatLaiMatKhau ? "TẠO MẬT KHẨU MỚI" : login ? "THẬT VUI KHI BẠN TRỞ LẠI" : "THAM GIA CÙNG CHÚNG TÔI"}
          </span>

          <h2>{dangQuenMatKhau ? "Quên mật khẩu?" : dangDatLaiMatKhau ? "Đặt lại mật khẩu" : title}</h2>

          <p className="auth-subtitle">
            {dangQuenMatKhau
              ? "Nhập email đã đăng ký để nhận mã xác thực."
              : dangDatLaiMatKhau
                ? <>Nhập OTP đã gửi đến <strong>{emailOtp}</strong> và tạo mật khẩu mới.</>
                : login
                  ? "Đăng nhập để tiếp tục hành trình khám phá."
                  : "Tạo tài khoản để lưu giữ những hành trình đáng nhớ."}
          </p>

          {notice && <p className={`auth-notice ${noticeType === "success" ? "auth-notice-success" : ""}`}>{notice}</p>}

          <form onSubmit={onSubmit} className="auth-form">
            {register && <label>Họ và tên<span className="input-icon"><UserRound size={17} /><input name="name" required placeholder="Nhập họ và tên" autoComplete="name" /></span></label>}

            {(!dangDatLaiMatKhau) && (
              <label>Địa chỉ email
                <span className="input-icon">
                  <Mail size={17} />
                  <input name="email" type="email" required placeholder="ban@example.com" autoComplete="email" defaultValue={dangQuenMatKhau ? emailOtp : ""} />
                </span>
              </label>
            )}

            {dangDatLaiMatKhau && (
              <label>Mã OTP
                <span className="input-icon"><LockKeyhole size={17} /><input name="otp" required maxLength={6} inputMode="numeric" placeholder="Nhập mã 6 chữ số" autoComplete="one-time-code" /></span>
              </label>
            )}

            {!dangQuenMatKhau && (
              <label>{dangDatLaiMatKhau ? "Mật khẩu mới" : "Mật khẩu"}
                <span className="input-icon">
                  <LockKeyhole size={17} />
                  <input name="password" type={show ? "text" : "password"} required minLength={6} placeholder={dangDatLaiMatKhau ? "Tối thiểu 6 ký tự" : register ? "Tối thiểu 6 ký tự" : "Nhập mật khẩu"} autoComplete={login ? "current-password" : "new-password"} />
                  <button type="button" className="show-password" onClick={() => setShow(!show)} aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </span>
              </label>
            )}

            {(register || dangDatLaiMatKhau) && (
              <label>{dangDatLaiMatKhau ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu"}
                <span className="input-icon">
                  <LockKeyhole size={17} />
                  <input name="confirm" type={show ? "text" : "password"} required minLength={6} placeholder="Nhập lại mật khẩu" autoComplete="new-password" />
                </span>
              </label>
            )}

            {login && (
              <div className="auth-forgot-row">
                <button type="button" className="auth-link-button" onClick={() => { setStep("forgot"); setNotice(""); }}>
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <LoaderCircle size={18} /> : dangQuenMatKhau ? "Gửi mã OTP" : dangDatLaiMatKhau ? "Đặt lại mật khẩu" : login ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          {dangQuenMatKhau && (
            <p className="auth-toggle">
              Nhớ mật khẩu rồi?{" "}
              <button type="button" className="auth-link-button" onClick={quayLaiDangNhap}>Quay lại đăng nhập</button>
            </p>
          )}

          {dangDatLaiMatKhau && (
            <p className="auth-toggle">
              <button type="button" className="auth-link-button" onClick={() => { setStep("forgot"); setNotice(""); }}>← Gửi lại OTP</button>
              {" · "}
              <button type="button" className="auth-link-button" onClick={quayLaiDangNhap}>Đăng nhập</button>
            </p>
          )}

          {!dangQuenMatKhau && !dangDatLaiMatKhau && (
            <p className="auth-toggle">
              {login ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <a href={login ? "/dang-ky" : "/dang-nhap"}>{login ? "Đăng ký ngay" : "Đăng nhập ngay"}</a>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

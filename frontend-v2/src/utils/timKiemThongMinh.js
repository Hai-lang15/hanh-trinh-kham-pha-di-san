
function chuanHoa(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

const NHOM_TU_DONG_NGHIA = [
  ["chua", "chùa", "phat giao", "phật giáo", "co so ton giao", "cơ sở tôn giáo", "noi tho tu", "nơi thờ tự"],
  ["dinh", "đình", "dinh lang", "đình làng"],
  ["mieu", "miếu", "tho mau", "thờ mẫu", "tin nguong", "tín ngưỡng"],
  ["lich su", "lịch sử", "truyen thong", "truyền thống", "qua khu", "quá khứ"],
  ["van hoa", "văn hóa", "phong tuc", "phong tục", "tap quan", "tập quán"],
  ["dia chi", "địa chỉ", "o dau", "ở đâu", "vi tri", "vị trí"],
  ["kien truc", "kiến trúc", "cong trinh", "công trình"],
  ["bai viet", "bài viết", "bai bao", "bài báo", "cau chuyen", "câu chuyện"]
].map(nhom => nhom.map(chuanHoa));

function moRongTuKhoa(query) {
  const q = chuanHoa(query);
  const tuKhoa = new Set(q.split(" ").filter(Boolean));

  for (const nhom of NHOM_TU_DONG_NGHIA) {
    if (nhom.some(tu => q.includes(tu))) {
      nhom.forEach(tu => {
        tu.split(" ").filter(Boolean).forEach(t => tuKhoa.add(t));
      });
    }
  }

  return [...tuKhoa];
}

export function timKiemThongMinh(data, query, fields = []) {
  const q = chuanHoa(query);

  if (!q) return data;

  const tuKhoa = moRongTuKhoa(query);

  return data
    .map(item => {
      const noiDung = fields
        .map(field => chuanHoa(item[field] ?? ""))
        .join(" ");

      const ten = chuanHoa(item[fields[0]] ?? "");
      let diem = 0;

      if (ten.includes(q)) diem += 12;
      if (noiDung.includes(q)) diem += 6;

      for (const tu of tuKhoa) {
        if (tu.length < 2) continue;

        if (ten.includes(tu)) diem += 4;
        else if (noiDung.includes(tu)) diem += 2;
      }

      const soTuKhoa = tuKhoa.filter(tu => tu.length >= 2);
      const soTuKhop = soTuKhoa.filter(tu => noiDung.includes(tu)).length;

      if (soTuKhoa.length && soTuKhop === soTuKhoa.length) {
        diem += 5;
      }

      return { ...item, _diemTimKiem: diem };
    })
    .filter(item => item._diemTimKiem > 0)
    .sort((a, b) => b._diemTimKiem - a._diemTimKiem);
}

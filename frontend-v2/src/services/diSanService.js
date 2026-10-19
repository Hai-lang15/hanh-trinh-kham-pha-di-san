
const API_URL = "http://localhost:3000/api/di-san";

export const layDanhSachDiSan = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Không thể lấy danh sách di sản");
  }

  return await response.json();
};

export const layChiTietDiSan = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Không thể lấy chi tiết di sản");
  }

  return await response.json();
};

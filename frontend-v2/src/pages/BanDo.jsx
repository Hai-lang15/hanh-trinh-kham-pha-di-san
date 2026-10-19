
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";
import { MapPin, Navigation, Search, LocateFixed, LoaderCircle } from "lucide-react";

const iconDiSan = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconNguoiDung = new L.DivIcon({
  className: "user-location-marker",
  html: '<div style="width:18px;height:18px;border:4px solid white;border-radius:50%;background:#2878e5;box-shadow:0 0 0 7px #2878e544"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

function DiChuyenBanDo({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1 });
  }, [position, map]);

  return null;
}

function RouteAutoFit({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [45, 45], maxZoom: 16 });
    }
  }, [map, positions]);

  return null;
}

export default function BanDo() {
  const [places, setPlaces] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    let active = true;

    api.getDiSan()
      .then((rows) => {
        if (!active) return;

        const list = Array.isArray(rows) ? rows : rows?.data || [];

        setPlaces(list.map((d) => ({
          id: d.id,
          name: d.ten_di_san || "Di sản",
          address: d.dia_chi || "Chưa cập nhật địa chỉ",
          lat: Number(d.vi_do),
          lng: Number(d.kinh_do)
        })).filter((p) =>
          Number.isFinite(p.lat) &&
          Number.isFinite(p.lng) &&
          p.lat !== 0 &&
          p.lng !== 0
        ));
      })
      .catch(() => {
        if (active) setError("Không tải được danh sách di sản. Hãy kiểm tra backend.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => places.filter((p) =>
      `${p.name} ${p.address}`.toLowerCase().includes(query.trim().toLowerCase())
    ),
    [places, query]
  );

  const focus = selected
    ? [selected.lat, selected.lng]
    : myPosition || [10.845, 106.618];

  useEffect(() => {
    if (!myPosition || !selected) {
      setRouteCoords([]);
      setRouteInfo(null);
      setRouteError("");
      setRouteLoading(false);
      return;
    }

    const [startLat, startLng] = myPosition;

    if (
      !Number.isFinite(startLat) ||
      !Number.isFinite(startLng) ||
      !Number.isFinite(selected.lat) ||
      !Number.isFinite(selected.lng)
    ) {
      setRouteCoords([]);
      setRouteInfo(null);
      setRouteError("Tọa độ vị trí hiện tại hoặc di sản không hợp lệ.");
      return;
    }

    const controller = new AbortController();

    const getRoute = async () => {
      setRouteLoading(true);
      setRouteError("");
      setRouteCoords([]);
      setRouteInfo(null);

      try {
        const coordinates = `${startLng},${startLat};${selected.lng},${selected.lat}`;
        const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`;

        const response = await fetch(url, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Không thể kết nối dịch vụ chỉ đường OSRM.");
        }

        const data = await response.json();

        if (data.code !== "Ok" || !data.routes?.length) {
          throw new Error("Không tìm thấy đường đi phù hợp đến di sản này.");
        }

        const route = data.routes[0];

        setRouteCoords(
          route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
        );

        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
          name: selected.name
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setRouteError(err.message || "Có lỗi khi tìm đường.");
        }
      } finally {
        if (!controller.signal.aborted) setRouteLoading(false);
      }
    };

    getRoute();

    return () => controller.abort();
  }, [myPosition, selected]);

  const getLocation = () => {
    setLocationMessage("");

    if (!navigator.geolocation) {
      setLocationMessage("Trình duyệt không hỗ trợ xác định vị trí.");
      return;
    }

    setLocationMessage("Đang xác định vị trí của bạn...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyPosition([pos.coords.latitude, pos.coords.longitude]);
        setLocationMessage("Đã xác định vị trí hiện tại của bạn.");
      },
      (err) => {
        setLocationMessage(
          err.code === 1
            ? "Bạn chưa cấp quyền vị trí. Hãy cho phép truy cập vị trí trong trình duyệt."
            : "Không xác định được vị trí. Hãy bật GPS hoặc thử lại ngoài trời."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  const openDirections = (place) => {
    const destination = `${place.lat},${place.lng}`;
    const origin = myPosition
      ? `&origin=${myPosition[0]},${myPosition[1]}`
      : "";

    const url = `https://www.google.com/maps/dir/?api=1${origin}&destination=${encodeURIComponent(destination)}&travelmode=driving`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="inner-page">
      <section className="page-hero">
        <div>
          <span className="section-label">BẢN ĐỒ KHÁM PHÁ</span>
          <h1>Định vị <em>di sản</em></h1>
          <p>Tìm địa điểm, xem vị trí và tìm đường đến những di sản văn hóa.</p>
          <div className="breadcrumb">
            <a href="/">Trang chủ</a><span>/</span>Bản đồ
          </div>
        </div>
        <div className="page-hero-mark">
          <MapPin size={60} strokeWidth={1} />
        </div>
      </section>

      <section className="content-wrap map-layout">
        <div className="map-panel">
          <div className="real-map">
            {loading ? (
              <div className="map-loading">
                <LoaderCircle className="spin" /> Đang tải bản đồ...
              </div>
            ) : (
              <MapContainer
                center={focus}
                zoom={13}
                scrollWheelZoom
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <DiChuyenBanDo position={focus} />
                <RouteAutoFit positions={routeCoords} />

                {routeCoords.length > 0 && (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{
                      color: "#b58a45",
                      weight: 6,
                      opacity: 0.9
                    }}
                  />
                )}

                {filtered.map((p) => (
                  <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    icon={iconDiSan}
                    eventHandlers={{
                      click: () => setSelected(p)
                    }}
                  >
                    <Popup>
                      <strong>{p.name}</strong>
                      <p>{p.address}</p>
                      <button type="button" onClick={() => setSelected(p)}>
                        Xem đường đi trên bản đồ
                      </button>
                      <br />
                      <button type="button" onClick={() => openDirections(p)}>
                        Mở Google Maps
                      </button>
                    </Popup>
                  </Marker>
                ))}

                {myPosition && (
                  <Marker position={myPosition} icon={iconNguoiDung}>
                    <Popup>Vị trí hiện tại của bạn</Popup>
                  </Marker>
                )}
              </MapContainer>
            )}
          </div>

          {routeLoading && (
            <p className="route-status">
              <LoaderCircle size={15} className="spin" />
              Đang tìm đường đến {selected?.name}...
            </p>
          )}

          {routeInfo && (
            <div className="route-info">
              <strong>Đường đi đến {routeInfo.name}</strong>
              <p>Khoảng cách: {(routeInfo.distance / 1000).toFixed(1)} km</p>
              <p>Thời gian dự kiến: {Math.round(routeInfo.duration / 60)} phút</p>
              <small>Thời gian do OSRM ước tính, không phản ánh tình trạng giao thông trực tiếp.</small>
            </div>
          )}

          {routeError && (
            <p className="route-status route-error">{routeError}</p>
          )}

          {!myPosition && selected && !routeLoading && !routeError && (
            <p className="route-status">
              Nhấn “Xác định vị trí của tôi” để xem đường đi từ vị trí hiện tại đến di sản.
            </p>
          )}

          {/* <p className="map-disclaimer">
            Vị trí người dùng chỉ được lấy khi bạn cho phép trình duyệt truy cập.
            Bản đồ © OpenStreetMap contributors.
          </p> */}

          {error && <p className="location-message">{error}</p>}
        </div>

        <aside className="map-list">
          <div className="map-list-head">
            <div>
              <span className="section-label">ĐIỂM ĐẾN</span>
              <h2>Danh sách di sản</h2>
            </div>
            <span className="count-pill">{filtered.length} điểm</span>
          </div>

          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên hoặc địa chỉ..."
            />
          </label>

          {filtered.map((p, i) => (
            <div
              className={`map-place ${selected?.id === p.id ? "selected" : ""}`}
              key={p.id}
            >
              <button
                type="button"
                className="map-place-main"
                onClick={() => setSelected(p)}
              >
                <span className="map-place-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="map-place-text">
                  <strong>{p.name}</strong>
                  <small><MapPin size={13} />{p.address}</small>
                </span>
              </button>

              <button
                type="button"
                className="map-directions"
                onClick={() => openDirections(p)}
                aria-label={`Chỉ đường đến ${p.name}`}
                title="Mở chỉ đường trên Google Maps"
              >
                <Navigation size={17} />
              </button>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="empty-panel">
              Không tìm thấy di sản có tọa độ hợp lệ.
            </div>
          )}

          <button type="button" className="btn-primary full-btn" onClick={getLocation}>
            <LocateFixed size={17} /> Xác định vị trí của tôi
          </button>

          {locationMessage && (
            <p className="location-message">{locationMessage}</p>
          )}

          <p className="map-disclaimer">
            Chọn một di sản để vẽ tuyến đường trên bản đồ. Biểu tượng chỉ đường
            vẫn mở lộ trình trên Google Maps.
          </p>
        </aside>
      </section>
    </main>
  );
}

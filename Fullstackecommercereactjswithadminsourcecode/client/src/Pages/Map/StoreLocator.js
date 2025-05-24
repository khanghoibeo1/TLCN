import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDistance } from "geolib";
import L, { Icon } from "leaflet";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import markerIconUser from "../../assets/images/marker-icon-red.png";
import markerIconStore from "leaflet/dist/images/marker-icon.png";

// Tính phí giao hàng
const calculateShippingFee = (distanceMeters) => {
  const distanceKm = distanceMeters / 1000;
  if (distanceKm <= 3) return 0;
  if (distanceKm <= 10) return 10000;
  if (distanceKm <= 20) return 20000;
  return 30000;
};

// Component điều khiển bản đồ
const FlyToLocation = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};

const StoreLocator = ({ userLocation, stores }) => {
  const [sortedStores, setSortedStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);
  const popupRefs = useRef([]);
  const mapRef = useRef(null);

  useEffect(() => {
    if (currentUserLocation && stores.length > 0) {
      const sorted = stores
        .map((store) => ({
          ...store,
          distance: getDistance(
            { latitude: currentUserLocation.lat, longitude: currentUserLocation.lng },
            { latitude: store.lat, longitude: store.lng }
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
      setSortedStores(sorted);
    }
  }, [currentUserLocation, stores]);

  const handleStoreClick = (store, index) => {
    setSelectedStore({ lat: store.lat, lng: store.lng });
    setTimeout(() => {
      if (popupRefs.current[index]) {
        popupRefs.current[index].openPopup();
      }
    }, 1600);
  };

  const goToMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCurrentUserLocation(newLocation);
          setSelectedStore(newLocation);

          if (mapRef.current) {
            mapRef.current.flyTo([latitude, longitude], 16, { duration: 1.5 });
            L.marker([latitude, longitude], {
              icon: new Icon({
                iconUrl: markerIconUser,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              }),
            })
              .addTo(mapRef.current)
              .bindPopup("You are here!")
              .openPopup();
          }
        },
        (error) => {
          alert("Không thể lấy vị trí của bạn. Vui lòng kiểm tra quyền truy cập GPS.");
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        padding: "20px",
        background: "#f9f9f9",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* Bản đồ */}
      <div style={{ flex: 1, minWidth: "300px", height: "400px" }}>
        <MapContainer
          center={userLocation}
          zoom={13}
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          style={{ height: "100%", width: "100%", borderRadius: "10px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {selectedStore && (
            <FlyToLocation lat={selectedStore.lat} lng={selectedStore.lng} />
          )}

          {/* Marker người dùng */}
          <Marker
            position={currentUserLocation}
            icon={
              new Icon({
                iconUrl: markerIconUser,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
              })
            }
          >
            <Popup>You</Popup>
          </Marker>

          {/* Marker các cửa hàng */}
          {sortedStores.map((store, index) => (
            <Marker
              key={index}
              position={[store.lat, store.lng]}
              icon={
                new Icon({
                  iconUrl: markerIconStore,
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              }
              ref={(ref) => (popupRefs.current[index] = ref)}
            >
              <Popup>{store.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Danh sách store */}
      <div
        style={{
          flex: 1,
          minWidth: "250px",
          maxHeight: "400px",
          overflowY: "auto",
          padding: "16px",
          background: "#fff",
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
        }}
      >
        <h4
          style={{
            marginBottom: "16px",
            fontWeight: "600",
            fontSize: "18px",
            color: "#333",
          }}
        >
          Nearest stores
        </h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li
            onClick={goToMyLocation}
            style={{
              fontWeight: "bold",
              cursor: "pointer",
              padding: "10px",
              background: "#e0f7ff",
              borderRadius: "8px",
              marginBottom: "12px",
              color: "#007bff",
            }}
          >
            <LocationOnIcon sx={{ color: 'red' }} /> My Location
          </li>
          {sortedStores.map((store, index) => (
            <li
              key={index}
              onClick={() => handleStoreClick(store, index)}
              style={{
                cursor: "pointer",
                padding: "12px",
                marginBottom: "8px",
                background: "#f7f9fc",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e6f0ff")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#f7f9fc")
              }
            >
              <span style={{ fontWeight: "500" }}>{store.name}</span>
              <span style={{ color: "#555", textAlign: "right" }}>
                {(store.distance / 1000).toFixed(2)} km<br />
                {calculateShippingFee(store.distance).toLocaleString()} 
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoreLocator;

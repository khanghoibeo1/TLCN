import React, { useEffect, useState } from "react";
import { fetchDataFromApi } from "../../utils/api";
import StoreLocator from "./StoreLocator";

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Lấy vị trí người dùng
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        alert("Không thể lấy vị trí người dùng");
      }
    );

    // Gọi API lấy store có lat/lng
    fetchDataFromApi("/api/storeLocations").then((res) => {
      const storeList = res.data.map(store => ({
        ...store,
        name: store.location, // hoặc store.name nếu bạn có field đó
        lat: store.lat,
        lng: store.lng,
      }));
      setStores(storeList);
    });
  }, []);

  return (
    <div>
      {userLocation && stores.length > 0 && (
        <StoreLocator userLocation={userLocation} stores={stores} />
      )}
    </div>
  );
};

export default StorePage;

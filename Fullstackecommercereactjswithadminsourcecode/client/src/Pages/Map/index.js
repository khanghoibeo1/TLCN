import React, { useEffect, useState, useContext } from "react";
import { fetchDataFromApi } from "../../utils/api";
import StoreLocator from "./StoreLocator";
import { MyContext } from "../../App";
import "./index.css";

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const { selectedAddress } = useContext(MyContext); // lấy từ context
  console.log(selectedAddress)

  useEffect(() => {
    // Nếu chưa có địa chỉ được chọn, không fetch store
    if (!selectedAddress?.lat || !selectedAddress?.lng) return;

    // Gọi API lấy store có lat/lng
    fetchDataFromApi("/api/storeLocations").then((res) => {
      const storeList = res.data.map((store) => ({
        ...store,
        name: store.location, // hoặc store.name nếu có
        lat: store.lat,
        lng: store.lng,
      }));
      setStores(storeList);
    });
  }, [selectedAddress]);

  return (
    <div className="storeLocationPage">
      <div>
        {selectedAddress && stores.length > 0 && (
          <StoreLocator userLocation={selectedAddress} stores={stores} />
        )}
      </div>
      <div className="shippingfee-guide">
        <h3>Shipping Fee Guide</h3>
        <ul>
          <li><b>0 – 3 km</b> → <b>Free shipping</b></li>
          <li><b>3 – 10 km</b> → <b>10,000đ</b></li>
          <li><b>10 – 20 km</b> → <b>20,000đ</b></li>
          <li><b>Over 20 km</b> → <b>30,000đ</b></li>
        </ul>
      </div>
    </div>
    
  );
};

export default StorePage;

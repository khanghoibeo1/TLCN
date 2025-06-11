import React, { useEffect, useState, useContext } from "react";
import { fetchDataFromApi } from "../../utils/api";
import StoreLocator from "./StoreLocator";
import { MyContext } from "../../App";
import "./index.css";

const StorePage = () => {
  const [stores, setStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const { selectedAddress } = useContext(MyContext);

  useEffect(() => {
    const determineUserLocation = () => {
      if (selectedAddress?.lat && selectedAddress?.lng) {
        setUserLocation({
          lat: selectedAddress?.lat,
          lng: selectedAddress?.lng,
        });
      } else {
        // Dùng vị trí hiện tại nếu không có địa chỉ được chọn
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Error while getting user location:", error);
            }
          );
        } else {
          console.error("Web browser do not support get location.");
        }
      }
    };

    determineUserLocation();
  }, [selectedAddress]);

  useEffect(() => {
    if (!userLocation) return;

    fetchDataFromApi("/api/storeLocations").then((res) => {
      const storeList = res.data.map((store) => ({
        ...store,
        name: store.location,
        lat: store.lat,
        lng: store.lng,
      }));
      setStores(storeList);
    });
  }, [userLocation, selectedAddress]);

  return (
    <div className="storeLocationPage">
      <div>
        {userLocation && stores.length > 0 && (
          <StoreLocator userLocation={selectedAddress?.lat ? selectedAddress : userLocation} stores={stores} />
        )}
      </div>
      <div className="shippingfee-guide">
        <h3>Shipping Fee Guide</h3>
        <ul>
          <li><b>0 – 3 km</b> → <b>Free shipping</b></li>
          <li><b>3 – 10 km</b> → <b>$1</b></li>
          <li><b>10 – 20 km</b> → <b>$2</b></li>
          <li><b>Over 20 km</b> → <b>$3</b></li>
        </ul>
        <p><i>*Express shipping adds 30% to the base delivery fee.</i></p>
      </div>
    </div>
  );
};

export default StorePage;

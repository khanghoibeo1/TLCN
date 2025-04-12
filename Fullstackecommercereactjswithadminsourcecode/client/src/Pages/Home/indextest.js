// Home.js

import React, { useContext, useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import CircularProgress from "@mui/material/CircularProgress";

import HomeBanner from "../../Components/HomeBanner";
import HomeSideBanner from "../../Components/HomeSideBanner";
import MyChatBot from "../../Components/chatbot";
import ProductItem from "../../Components/ProductItem";
import HomeCat from "../../Components/HomeCat";
import Banners from "../../Components/banners";
import { MyContext } from "../../App";
import { fetchDataFromApi } from "../../utils/api";
import homeBannerPlaceholder from "../../assets/images/homeBannerPlaceholder.jpg";
import "./index.css";

const Home = () => {
  const [value, setValue] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [selectedCat, setselectedCat] = useState();
  const [filterData, setFilterData] = useState([]);
  const [homeSlides, setHomeSlides] = useState([]);
  const [bannerList, setBannerList] = useState([]);
  const [randomCatProducts, setRandomCatProducts] = useState([]);
  const [homeSideBanners, setHomeSideBanners] = useState([]);
  const [homeBottomBanners, setHomeBottomBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(MyContext);

  const handleChange = (event, newValue) => setValue(newValue);
  const selectCat = (cat) => setselectedCat(cat);

  useEffect(() => {
    AOS.init({ duration: 800 });
    window.scrollTo(0, 0);
    context.setisHeaderFooterShow(true);
    context.setEnableFilterTab(false);
    context.setIsBottomShow(true);
    setselectedCat(context.categoryData[0]?.name);

    const location = localStorage.getItem("location");

    if (location) {
      fetchDataFromApi(`/api/products/featured?location=${location}`).then(setFeaturedProducts);
      fetchDataFromApi(`/api/products?page=1&perPage=8&location=${location}`).then(setProductsData);
    }

    fetchDataFromApi("/api/homeBanner").then(setHomeSlides);
    fetchDataFromApi("/api/banners").then(setBannerList);
    fetchDataFromApi("/api/homeSideBanners").then(setHomeSideBanners);
    fetchDataFromApi("/api/homeBottomBanners").then(setHomeBottomBanners);
  }, []);

  useEffect(() => {
    if (context.categoryData[0]) {
      setselectedCat(context.categoryData[0].name);
    }

    if (context.categoryData.length) {
      const randomIndex = Math.floor(Math.random() * context.categoryData.length);
      const location = localStorage.getItem("location");
      fetchDataFromApi(`/api/products/catId?catId=${context.categoryData[randomIndex]?.id}&location=${location}`)
        .then((res) => {
          setRandomCatProducts({
            catName: context.categoryData[randomIndex]?.name,
            catId: context.categoryData[randomIndex]?.id,
            products: res?.products,
          });
        });
    }
  }, [context.categoryData]);

  useEffect(() => {
    if (selectedCat) {
      setIsLoading(true);
      const location = localStorage.getItem("location");
      fetchDataFromApi(`/api/products/catName?catName=${selectedCat}&location=${location}`)
        .then((res) => {
          setFilterData(res.products);
          setIsLoading(false);
        });
    }
  }, [selectedCat]);

  return (
    <>
      <MyChatBot />
      {homeSlides.length ? (
        <HomeBanner data={homeSlides} />
      ) : (
        <div className="container mt-3">
          <div className="homeBannerSection">
            <img src={homeBannerPlaceholder} className="w-100" alt="banner" />
          </div>
        </div>
      )}

      {context.categoryData.length > 0 && (
        <section className="home-cat-section" data-aos="fade-up">
          <HomeCat catData={context.categoryData} />
        </section>
      )}

      <section className="home-main-products" data-aos="fade-up">
        <div className="container">
          <div className="header">
            <div className="title">
              <h3>Popular Products</h3>
              <p>Don’t miss the current offers until the end of March.</p>
            </div>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              className="filterTabs"
            >
              {context.categoryData.map((item, index) => (
                <Tab key={index} label={item.name} onClick={() => selectCat(item.name)} />
              ))}
            </Tabs>
          </div>

          <div className="product-list">
            {isLoading ? (
              <CircularProgress />
            ) : (
              <Swiper
                slidesPerView={4}
                spaceBetween={10}
                navigation={true}
                slidesPerGroup={3}
                modules={[Navigation]}
                className="mySwiper"
              >
                {filterData.map((item, index) => (
                  <SwiperSlide key={index}>
                    <ProductItem item={item} />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </section>

      <section className="home-bottom-section" data-aos="fade-up">
        <div className="container">
          {bannerList.length > 0 && <Banners data={bannerList} col={3} />}
        </div>
      </section>
    </>
  );
};

export default Home;

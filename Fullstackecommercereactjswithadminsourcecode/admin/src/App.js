import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./responsive.css";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import React, { createContext, useEffect, useState, useRef } from "react";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Products from "./pages/Products";
import Category from "./pages/Category/categoryList";
import ProductDetails from "./pages/ProductDetails";
import ProductUpload from "./pages/Products/addProduct";
import EditProduct from "./pages/Products/editProduct";
import CategoryAdd from "./pages/Category/addCategory";
import EditCategory from "./pages/Category/editCategory";
import SubCatAdd from "./pages/Category/addSubCat";
import SubCatList from "./pages/Category/subCategoryList";
import AddProductRAMS from "./pages/Products/addProductRAMS";
import ProductWeight from "./pages/Products/addProductWeight";
import ProductSize from "./pages/Products/addProductSize";
import Orders from "./pages/Orders";
import AddHomeBannerSlide from "./pages/HomeBanner/addHomeSlide";
import HomeBannerSlideList from "./pages/HomeBanner/homeSlideList";
import EditHomeBannerSlide from "./pages/HomeBanner/editSlide";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import Blogs from "./pages/Blogs";
import EditBlog from "./pages/Blogs/editBlogs";
import AddBlog from "./pages/Blogs/addBlogs";


import PostTypes from "./pages/PostType";
import EditPostTypes from "./pages/PostType/editPostType";
import AddPostTypes from "./pages/PostType/addPostType";

import StoreLocations from "./pages/StoreLocation";
import EditStoreLocations from "./pages/StoreLocation/editStoreLocation";
import AddStoreLocations from "./pages/StoreLocation/addStoreLocation";

import BatchCodes from "./pages/BatchCodes";
import EditBatchCode from "./pages/BatchCodes/editBatchCode";
import AddBatchCode from "./pages/BatchCodes/addBatchCode";
import RequestBatchCode from "./pages/BatchCodes/requestBatchCode";

import Notifications from "./pages/Notifications";
import EditNotification from "./pages/Notifications/editNotification";
import AddNotification from "./pages/Notifications/addNotification";
import NotificationDetails from "./pages/NotificationDetails";

import Users from "./pages/Users";
import EditUser from "./pages/Users/editUsers";

import UserAdmins from "./pages/UserAdmins";
import EditUserAdmins from "./pages/UserAdmins/editUserAdmin";
import AddUserAdmins from "./pages/UserAdmins/addUserAdmin";

import PromotionCode from "./pages/PromotionCode";
import EditPromotionCode from "./pages/PromotionCode/editPromotionCode";
import AddPromotionCode from "./pages/PromotionCode/addPromotionCode";

import LoadingBar from "react-top-loading-bar";
import { fetchDataFromApi } from "./utils/api";

import axios from "axios";
import BannersList from "./pages/Banners/bannerList";
import AddBanner from "./pages/Banners/addHomeBanner";
import EditBanner from "./pages/Banners/editHomeBanner";

import HomeSideBannersList from "./pages/HomeSideBanners/bannerList";
import AddHomeSideBanner from "./pages/HomeSideBanners/addHomeSideBanner";
import EditHomeSideBanner from "./pages/HomeSideBanners/editHomeSideBanner";

import HomeBottomBannersList from "./pages/HomeBottomBanners/bannerList";
import AddHomeBottomBanner from "./pages/HomeBottomBanners/addHomeBottomBanner";
import EditHomeBottomBanner from "./pages/HomeBottomBanners/editHomeBottomBanner";
import MyAccount from "./pages/MyAccount";
import BlogDetails from "./pages/BlogDetails";
import PromotionCodeDetails from "./pages/PromotionCodeDetails";
import StoreLocation from "./pages/StoreLocation";
import AdminChat from "./pages/Message";

const MyContext = createContext();

function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isHideSidebarAndHeader, setisHideSidebarAndHeader] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [catData, setCatData] = useState([]);
  const [postTypeData, setPostTypeData] = useState([]);
  const [user, setUser] = useState({
    name: "",
    email: "",
    userId: "",
    role: "",
    locationName: "",
    locationId: "",
  });

  const [isOpenNav, setIsOpenNav] = useState(false);
  const [baseUrl, setBaseUrl] = useState("http://localhost:4000");
  const [progress, setProgress] = useState(0);
  const [alertBox, setAlertBox] = useState({
    msg: "",
    error: false,
    open: false,
  });

  const [selectedLocation, setSelectedLocation] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState("");

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token !== "" && token !== undefined && token !== null) {
      setIsLogin(true);

      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
    } else {
      setIsLogin(false);
    }
  }, [isLogin, localStorage.getItem("user")]);

  useEffect(() => {
    // getCountry("https://countriesnow.space/api/v0.1/countries/");
    getCountry(process.env.REACT_APP_COUNTRY_DROPDOWN);
  }, []);

  const countryListArr = [];
  
  const getCountry = async (url) => {
    const responsive = await axios.get(url).then((res) => {
      
      if (res !== null) {
        res.data.data.map((item, index) => {
          countryListArr.push({
            value:item?.iso2,
            label:item?.location,
          });
        });
        setCountryList(countryListArr);
      }

    });
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertBox({
      open: false,
    });
  };

  useEffect(() => {
    setProgress(20);
    fetchCategory();
    fetchPostType();
  }, []);

  const fetchCategory = () => {
    fetchDataFromApi("/api/category").then((res) => {
      setCatData(res);
      console.log(res);
      setProgress(100);
    });
  };

  const fetchPostType = () => {
    fetchDataFromApi("/api/postTypes").then((res) => {
      setPostTypeData(res);
      console.log(res);
      setProgress(100);
    });
  };

  const openNav = () => {
    setIsOpenNav(true);
  };

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    isLogin,
    setIsLogin,
    isHideSidebarAndHeader,
    setisHideSidebarAndHeader,
    theme,
    setTheme,
    alertBox,
    setAlertBox,
    setProgress,
    baseUrl,
    catData,
    fetchCategory,
    postTypeData,
    fetchPostType,
    setUser,
    user,
    countryList,
    selectedCountry,
    setselectedCountry,
    windowWidth,
    openNav,
    setIsOpenNav
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <LoadingBar
          color="#f11946"
          progress={progress}
          onLoaderFinished={() => setProgress(0)}
          className="topLoadingBar"
        />

        <Snackbar
          open={alertBox.open}
          autoHideDuration={5000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            autoHideDuration={6000}
            severity={alertBox.error === false ? "success" : "error"}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {alertBox.msg}
          </Alert>
        </Snackbar>

        {isHideSidebarAndHeader !== true && <Header />}
        <div className="main d-flex">
          {isHideSidebarAndHeader !== true && (
            <>
              <div
                className={`sidebarOverlay d-none ${
                  isOpenNav === true && "show"
                }`}
                onClick={() => setIsOpenNav(false)}
              ></div>
              <div
                className={`sidebarWrapper ${
                  isToggleSidebar === true ? "toggle" : ""
                } ${isOpenNav === true ? "open" : ""}`}
              >
                <Sidebar />
              </div>
            </>
          )}

          <div
            className={`content ${isHideSidebarAndHeader === true && "full"} ${
              isToggleSidebar === true ? "toggle" : ""
            }`}
          >
            <Routes>
              <Route path="/" exact={true} element={<Dashboard />} />
              <Route path="/dashboard" exact={true} element={<Dashboard />} />
              <Route path="/login" exact={true} element={<Login />} />
              <Route path="/signUp" exact={true} element={<SignUp />} />

              <Route path="/products" exact={true} element={<Products />} />
              <Route path="/product/details/:id" exact={true} element={<ProductDetails />} />
              <Route path="/product/upload" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><ProductUpload /></ProtectedRoute>} />
              <Route  path="/product/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditProduct /></ProtectedRoute>} />

              <Route path="/category" exact={true} element={<Category />} />
              <Route path="/category/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><CategoryAdd /></ProtectedRoute>} />
              <Route path="/category/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditCategory /></ProtectedRoute>} />

              <Route path="/subCategory/" exact={true} element={<SubCatList />} />
              <Route path="/subCategory/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><SubCatAdd /></ProtectedRoute>} />

              <Route path="/productRAMS/add" exact={true} element={<AddProductRAMS />} />
              <Route path="/productWEIGHT/add" exact={true} element={<ProductWeight />}  />
              <Route path="/productSIZE/add" exact={true} element={<ProductSize />} />
              
              <Route path="/blogs" exact={true} element={<Blogs />} />
              <Route path="/blog/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditBlog /></ProtectedRoute>} />
              <Route path="/blog/details/:id" exact={true} element={<BlogDetails />} />
              <Route path="/blog/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><AddBlog /></ProtectedRoute>} />
              
              <Route path="/postTypes" exact={true} element={<PostTypes />} />
              <Route path="/postTypes/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditPostTypes /></ProtectedRoute>} />
              <Route path="/postTypes/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><AddPostTypes /></ProtectedRoute>} />

              <Route path="/storeLocations" exact={true} element={<StoreLocations />} />
              <Route path="/storeLocations/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditStoreLocations /></ProtectedRoute>} />
              <Route path="/storeLocations/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddStoreLocations /></ProtectedRoute>} />

              <Route path="/users" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><Users /></ProtectedRoute>} />
              <Route path="/user/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditUser /></ProtectedRoute>} />

              <Route path="/userAdmins" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><UserAdmins /></ProtectedRoute>} />
              <Route path="/userAdmin/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditUserAdmins /></ProtectedRoute>} />
              <Route path="/userAdmin/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><AddUserAdmins /></ProtectedRoute>} />
              
              <Route path="/messages" exact={true} element={<AdminChat />} />

              <Route path="/batchCodes" exact={true} element={<BatchCodes />} />
              <Route path="/batchCode/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditBatchCode /></ProtectedRoute>} />
              <Route path="/batchCode/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><AddBatchCode /></ProtectedRoute>} />
              <Route path="/batchCode/request" exact={true} element={<RequestBatchCode />} />
              
              <Route path="/notifications" exact={true} element={<Notifications />} />
              <Route path="/notification/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><EditNotification /></ProtectedRoute>} />
              <Route path="/notification/add" exact={true} element={<ProtectedRoute roles={["mainAdmin","storeAdmin"]}><AddNotification/></ProtectedRoute>} />
              <Route path="/notification/details/:id" exact={true} element={<NotificationDetails/>} />

              <Route path="/promotionCode" exact={true} element={<PromotionCode />} />
              <Route path="/promotionCode/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditPromotionCode /></ProtectedRoute>} />
              <Route path="/promotionCode/details/:id" exact={true} element={<PromotionCodeDetails />} />
              <Route path="/promotionCode/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddPromotionCode /></ProtectedRoute>} />
              <Route path="/orders/" exact={true} element={<Orders />} />

              <Route path="/homeBannerSlide/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddHomeBannerSlide /></ProtectedRoute>} />
              <Route path="/homeBannerSlide/list" exact={true} element={<HomeBannerSlideList />} />
              <Route path="/homeBannerSlide/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditHomeBannerSlide /></ProtectedRoute>} />

              <Route path="/banners" exact={true} element={<BannersList />} />
              <Route path="/banners/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddBanner /></ProtectedRoute>} />
              <Route path="/banners/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditBanner /></ProtectedRoute>} />

              <Route path="/homeSideBanners" exact={true} element={<HomeSideBannersList />} />
              <Route path="/homeSideBanners/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddHomeSideBanner /></ProtectedRoute>} />
              <Route path="/homeSideBanners/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditHomeSideBanner /></ProtectedRoute>} />

              <Route path="/homeBottomBanners" exact={true} element={<HomeBottomBannersList />} />
              <Route path="/homeBottomBanners/add" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><AddHomeBottomBanner /></ProtectedRoute>} />
              <Route path="/homeBottomBanners/edit/:id" exact={true} element={<ProtectedRoute roles={["mainAdmin"]}><EditHomeBottomBanner /></ProtectedRoute>} />

              <Route exact={true} path="/my-account" element={<MyAccount />} />
            </Routes>
          </div>
        </div>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };

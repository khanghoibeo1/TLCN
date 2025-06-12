import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./responsive.css";

// React and libs
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createContext, useEffect, useState } from "react";
import axios from "axios";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

// Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ProductModal from "./Components/ProductModal";

// Pages
import Home from "./Pages/Home";
import Listing from "./Pages/Listing";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import SignIn from "./Pages/SignIn";
import SignUp from "./Pages/SignUp";
import ResetPassword from "./Pages/ResetPassword";
import ForgotPassword from "./Pages/ForgotPassword";
import EmailVerification from "./Pages/EmailVerification";
import MyList from "./Pages/MyList";
import MemberRank from "./Pages/MemberRank";
import Checkout from "./Pages/Checkout";
import Orders from "./Pages/Orders";
import MyAccount from "./Pages/MyAccount";
import SearchPage from "./Pages/Search";
import Blog from "./Pages/Blog";
import Map from "./Pages/Map";
import DetailBlog from "./Pages/DetailBlog";
import PaymentSuccess from "./Pages/PaymentSuccess";
import CompareProducts from "./Pages/CompareProducts"

// Utils
import { fetchDataFromApi, postData } from "./utils/api";
import IntroduceAndLicense from "./Pages/License";
import ClientChat from "./Components/Message";

// Context
const MyContext = createContext();

function App() {
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setselectedCountry] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddress, setselectedAddress] = useState(null);

  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [subCategoryData, setsubCategoryData] = useState([]);
  const [postTypeData, setPostTypeData] = useState([]);
  const [cartData, setCartData] = useState();
  const [searchData, setSearchData] = useState([]);

  const [user, setUser] = useState({ name: "", email: "", userId: "" });

  const [isLogin, setIsLogin] = useState(false);
  const [isHeaderFooterShow, setisHeaderFooterShow] = useState(true);
  const [isOpenProductModal, setisOpenProductModal] = useState(false);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [enableFilterTab, setEnableFilterTab] = useState(false);
  const [isOpenFilters, setIsOpenFilters] = useState(false);
  const [isBottomShow, setIsBottomShow] = useState(true);
  const [addingInCart, setAddingInCart] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [alertBox, setAlertBox] = useState({
    msg: "",
    error: false,
    open: false,
  });

  // Fetch cart if user logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userId) {
      fetchDataFromApi(`/api/cart?userId=${user.userId}`).then(setCartData);
    }
  }, [isLogin]);

  // Initial fetch: country, category, post type, window resize
  useEffect(() => {
    getCountry(process.env.REACT_APP_COUNTRY_DROPDOWN);

    fetchDataFromApi("/api/category").then((res) => {
      const subCats = [];
      res.categoryList?.forEach(cat => {
        cat?.children?.forEach(sub => subCats.push(sub));
      });

      setCategoryData(res.categoryList);
      setsubCategoryData(subCats);
    });

    fetchDataFromApi("/api/postTypes").then(setPostTypeData);

    const location = localStorage.getItem("location");
    if (location) {
      try {
        setselectedCountry(JSON.parse(location));
      } catch (e) {
        console.error("Error parsing address from localStorage:", e);
      }
    } 

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check login from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLogin(true);
      setUser(JSON.parse(localStorage.getItem("user")));
    } else {
      setIsLogin(false);
    }
  }, [isLogin]);

  // Load user address list
  useEffect(() => {
    if (user.userId) {
      fetchDataFromApi(`/api/userAddress?userId=${user.userId}`).then((res) => {
        console.log(res)
        setAddressList(res[0].addresses);
      });
    }
  }, [user.userId]);

  // Load address from localStorage
  useEffect(() => {
    const address = localStorage.getItem("address");
    console.log(address)
    if (address) {
      try {
        setselectedAddress(JSON.parse(address));
      } catch (e) {
        console.error("Error parsing address from localStorage:", e);
      }
    }
  }, []);

  const getCountry = async (url) => {
    const res = await axios.get(url);
    const countries = res.data.data;
    setCountryList(countries);

    const location = localStorage.getItem("location");
    if (!location && countries.length > 0) {
      console.log(countries[0])
      setselectedCountry(countries[0]);
      localStorage.setItem("location", JSON.stringify(countries[0]));
    }
  };
useEffect(() => {
  getCartData()
}, [])

  const getCartData = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.userId) {
      fetchDataFromApi(`/api/cart?userId=${user.userId}`).then(setCartData);
    }
  };

  const openProductDetailsModal = (id, status) => {
    fetchDataFromApi(`/api/products/${id}`).then((res) => {
      setProductData(res);
      setisOpenProductModal(status);
    });
  };

  const handleClose = (_, reason) => {
    if (reason !== "clickaway") {
      setAlertBox({ open: false });
    }
  };

  const addToCart = (data) => {
    if (!isLogin) {
      return setAlertBox({ open: true, error: true, msg: "Please login first" });
    }

    if (user.status !== "active") {
      return setAlertBox({ open: true, error: true, msg: "You are banned!" });
    }

    setAddingInCart(true);
    postData("/api/cart/add", data).then((res) => {
      if (res.status !== 'FAIL') {
        setAlertBox({ open: true, error: false, msg: "Item is added in the cart" });
        setTimeout(() => setAddingInCart(false), 1000);
        getCartData();
      } else {
        setAlertBox({ open: true, error: true, msg: res.msg });
        setAddingInCart(false);
      }
    });
  };

  const values = {
    countryList, setselectedCountry, selectedCountry,
    addressList, setAddressList, selectedAddress, setselectedAddress,
    isOpenProductModal, setisOpenProductModal,
    isHeaderFooterShow, setisHeaderFooterShow,
    isLogin, setIsLogin, user, setUser,
    categoryData, setCategoryData, subCategoryData, setsubCategoryData,
    openProductDetailsModal, alertBox, setAlertBox,
    addToCart, addingInCart, setAddingInCart,
    cartData, setCartData, getCartData,
    postTypeData, searchData, setSearchData,
    windowWidth, isOpenNav, setIsOpenNav,
    setEnableFilterTab, enableFilterTab,
    setIsOpenFilters, isOpenFilters,
    setIsBottomShow, isBottomShow,
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <Snackbar open={alertBox.open} autoHideDuration={6000} onClose={handleClose} className="snackbar">
          <Alert onClose={handleClose} severity={alertBox.error ? "error" : "success"} variant="filled" sx={{ width: "100%" }}>
            {alertBox.msg}
          </Alert>
        </Snackbar>

        {isHeaderFooterShow && <Header />}

        <Routes>
          <Route path="/" exact={true} element={<Home />} />
          <Route
            path="/products/category/:id"
            exact={true}
            element={<Listing />}
          />
          <Route
            path="/products/subCat/:id"
            exact={true}
            element={<Listing />}
          />
          <Route
            exact={true}
            path="/product/:id"
            element={<ProductDetails />}
          />
          <Route exact={true} path="/cart" element={<Cart />} />
          <Route exact={true} path="/signIn" element={<SignIn />} />
          <Route exact={true} path="/forgot-password" element={<ForgotPassword />} />
          <Route exact={true} path="/reset-password/:token" element={<ResetPassword />} />
          <Route exact={true} path="/verify-email" element={<EmailVerification/>} />
          <Route exact={true} path="/signUp" element={<SignUp />} />
          <Route exact={true} path="/my-list" element={<MyList />} />
          <Route exact={true} path="/memberRank" element={<MemberRank />} />
          <Route exact={true} path="/checkout" element={<Checkout />} />
          <Route exact={true} path="/orders" element={<Orders />} />
          <Route exact={true} path="/my-account" element={<MyAccount />} />
          <Route exact={true} path="/search" element={<SearchPage />} />
          <Route exact={true} path="/blog" element={<Blog />} />
          <Route exact={true} path="/map" element={<Map />} />
          <Route exact={true} path="/detailblog/:id" element={<DetailBlog />} />
          <Route exact={true} path="/license" element={<IntroduceAndLicense />} />
          <Route exact={true} path="/paymentSuccess" element={<PaymentSuccess />} />
          <Route exact={true} path="/compareProducts" element={<CompareProducts />} />
        </Routes>
        {isHeaderFooterShow === true && <Footer />}
        {isOpenProductModal === true && <ProductModal data={productData} />}

        {isLogin && <ClientChat />}
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
export { MyContext };



// import "bootstrap/dist/css/bootstrap.min.css";
// import "./App.css";
// import "./responsive.css";
// import { BrowserRouter, Route, Router, Routes, json } from "react-router-dom";
// import Home from "./Pages/Home";
// import Listing from "./Pages/Listing";
// import ProductDetails from "./Pages/ProductDetails";
// import Header from "./Components/Header";
// import { createContext, useEffect, useState } from "react";
// import axios from "axios";
// import Footer from "./Components/Footer";
// import ProductModal from "./Components/ProductModal";
// import Cart from "./Pages/Cart";
// import SignIn from "./Pages/SignIn";
// import SignUp from "./Pages/SignUp";
// import ResetPassword from "./Pages/ResetPassword";
// import ForgotPassword from "./Pages/ForgotPassword";
// import EmailVerification from "./Pages/EmailVerification";
// import MyList from "./Pages/MyList";
// import MemberRank from "./Pages/MemberRank";
// import Checkout from "./Pages/Checkout";
// import Orders from "./Pages/Orders";
// import MyAccount from "./Pages/MyAccount";
// import SearchPage from "./Pages/Search";
// import Blog from "./Pages/Blog";
// import Map from "./Pages/Map";
// import DetailBlog from "./Pages/DetailBlog";

// import { fetchDataFromApi, postData } from "./utils/api";
// import Snackbar from "@mui/material/Snackbar";
// import Alert from "@mui/material/Alert";

// const MyContext = createContext();

// function App() {
//   const [countryList, setCountryList] = useState([]);
//   const [selectedCountry, setselectedCountry] = useState("");
//   const [addressList, setAddressList] = useState([]);
//   const [selectedAddress, setselectedAddress] = useState(null);
//   const [isOpenProductModal, setisOpenProductModal] = useState(false);
//   const [isHeaderFooterShow, setisHeaderFooterShow] = useState(true);
//   const [isLogin, setIsLogin] = useState(false);
//   const [productData, setProductData] = useState([]);

//   const [categoryData, setCategoryData] = useState([]);
//   const [subCategoryData, setsubCategoryData] = useState([]);
//   const [addingInCart, setAddingInCart] = useState(false);

//   const [cartData, setCartData] = useState();
//   const [searchData, setSearchData] = useState([]);
//   const [isOpenNav, setIsOpenNav] = useState(false);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);
//   const [enableFilterTab, setEnableFilterTab] = useState(false);
//   const [isOpenFilters, setIsOpenFilters] = useState(false);
//   const [isBottomShow, setIsBottomShow] = useState(true);
//   const [postTypeData, setPostTypeData] = useState([]);

//   const [alertBox, setAlertBox] = useState({
//     msg: "",
//     error: false,
//     open: false,
//   });

//   const [user, setUser] = useState({
//     name: "",
//     email: "",
//     userId: "",
//   });


//   useEffect(()=>{
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (
//       user?.userId !== "" &&
//       user?.userId !== undefined &&
//       user?.userId !== null
//     ) {
//       fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
//         setCartData(res);
//       });
//     }
//   },[isLogin]);

//   useEffect(() => {
//     //getCountry("https://countriesnow.space/api/v0.1/countries/");
//     getCountry(process.env.REACT_APP_COUNTRY_DROPDOWN);
//     fetchDataFromApi("/api/category").then((res) => {
//       setCategoryData(res.categoryList);

//       const subCatArr=[];

//       res.categoryList?.length !== 0 && res.categoryList?.map((cat, index) => {
//         if(cat?.children.length!==0){
//             cat?.children?.map((subCat)=>{
//                 subCatArr.push(subCat);
//             })
//         }
//       });

//       setsubCategoryData(subCatArr);
//     });

//     fetchDataFromApi("/api/postTypes").then((res) => {
//       setPostTypeData(res);
//     })

  

//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//     };

//     const location = localStorage.getItem("location");
//     if (location !== null && location !== "" && location !== undefined) {
//       setselectedCountry(location);
//     } else {
//       setselectedCountry("All");
//       localStorage.setItem("location", "All");
//     }

//     window.addEventListener("resize", handleResize);

//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, []);

//   const getCartData = () => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
//       setCartData(res);
//     });
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     if (token !== "" && token !== undefined && token !== null) {
//       setIsLogin(true);

//       const userData = JSON.parse(localStorage.getItem("user"));

//       setUser(userData);
//     } else {
//       setIsLogin(false);
//     }
//   }, [isLogin]);

//   const openProductDetailsModal = (id, status) => {
//     fetchDataFromApi(`/api/products/${id}`).then((res) => {
//       setProductData(res);
//       setisOpenProductModal(status);
//     });
//   };

//   const getCountry = async (url) => {
//     const responsive = await axios.get(url).then((res) => {
//       setCountryList(res.data.data);
//     });
//   };

//   useEffect(() => {
//     fetchDataFromApi(`/api/userAddress?userId=${user.userId}`).then((res) => {
//       setAddressList(res[0].addresses);
//     });
//   },[user.userId]);

//   useEffect(() => {
//     const address = localStorage.getItem("address");
//     if (address) {
//       try {
//         const parsedAddress = JSON.parse(address);
//         setselectedAddress(parsedAddress);
//       } catch (e) {
//         console.error("Lỗi parse address từ localStorage:", e);
//       }
//     }
//   }, []);



//   const handleClose = (event, reason) => {
//     if (reason === "clickaway") {
//       return;
//     }

//     setAlertBox({
//       open: false,
//     });
//   };

//   const addToCart = (data) => {
//     if (isLogin === true) {
//       if(user.status === 'active'){
//         setAddingInCart(true);
//         postData(`/api/cart/add`, data).then((res) => {
//           if (res.status !== false) {
//             setAlertBox({
//               open: true,
//               error: false,
//               msg: "Item is added in the cart",
//             });

//             setTimeout(() => {
//               setAddingInCart(false);
//             }, 1000);

//             getCartData();
//           } else {
//             setAlertBox({
//               open: true,
//               error: true,
//               msg: res.msg,
//             });
//             setAddingInCart(false);
//           }
//         });
//       } else {
//         setAlertBox({
//           open: true,
//           error: true,
//           msg: "You are banned!",
//         });
//       }
      
//     } else {
//       setAlertBox({
//         open: true,
//         error: true,
//         msg: "Please login first",
//       });
//     }
//   };

//   const values = {
//     countryList,
//     setselectedCountry,
//     selectedCountry,
//     addressList,
//     setAddressList,
//     selectedAddress,
//     setselectedAddress,
//     isOpenProductModal,
//     setisOpenProductModal,
//     isHeaderFooterShow,
//     setisHeaderFooterShow,
//     isLogin,
//     setIsLogin,
//     user,
//     setUser,
//     categoryData,
//     setCategoryData,
//     subCategoryData,
//     setsubCategoryData,
//     openProductDetailsModal,
//     alertBox,
//     setAlertBox,
//     addToCart,
//     addingInCart,
//     setAddingInCart,
//     cartData,
//     setCartData,
//     getCartData,
//     postTypeData,
//     searchData,
//     setSearchData,
//     windowWidth,
//     isOpenNav,
//     setIsOpenNav,
//     setEnableFilterTab,
//     enableFilterTab,
//     setIsOpenFilters,
//     isOpenFilters,
//     setIsBottomShow,
//     isBottomShow
//   };

//   return (
//     <BrowserRouter>
//       <MyContext.Provider value={values}>
//         <Snackbar
//           open={alertBox.open}
//           autoHideDuration={6000}
//           onClose={handleClose}
//           className="snackbar"
//         >
//           <Alert
//             onClose={handleClose}
//             autoHideDuration={6000}
//             severity={alertBox.error === false ? "success" : "error"}
//             variant="filled"
//             sx={{ width: "100%" }}
//           >
//             {alertBox.msg}
//           </Alert>
//         </Snackbar>

//         {isHeaderFooterShow === true && <Header />}

//         <Routes>
//           <Route path="/" exact={true} element={<Home />} />
//           <Route
//             path="/products/category/:id"
//             exact={true}
//             element={<Listing />}
//           />
//           <Route
//             path="/products/subCat/:id"
//             exact={true}
//             element={<Listing />}
//           />
//           <Route
//             exact={true}
//             path="/product/:id"
//             element={<ProductDetails />}
//           />
//           <Route exact={true} path="/cart" element={<Cart />} />
//           <Route exact={true} path="/signIn" element={<SignIn />} />
//           <Route exact={true} path="/forgot-password" element={<ForgotPassword />} />
//           <Route exact={true} path="/reset-password/:token" element={<ResetPassword />} />
//           <Route exact={true} path="/verify-email" element={<EmailVerification/>} />
//           <Route exact={true} path="/signUp" element={<SignUp />} />
//           <Route exact={true} path="/my-list" element={<MyList />} />
//           <Route exact={true} path="/memberRank" element={<MemberRank />} />
//           <Route exact={true} path="/checkout" element={<Checkout />} />
//           <Route exact={true} path="/orders" element={<Orders />} />
//           <Route exact={true} path="/my-account" element={<MyAccount />} />
//           <Route exact={true} path="/search" element={<SearchPage />} />
//           <Route exact={true} path="/blog" element={<Blog />} />
//           <Route exact={true} path="/map" element={<Map />} />
//           <Route exact={true} path="/detailblog/:id" element={<DetailBlog />} />
//         </Routes>
//         {isHeaderFooterShow === true && <Footer />}

//         {isOpenProductModal === true && <ProductModal data={productData} />}
//       </MyContext.Provider>
//     </BrowserRouter>
//   );
// }

// export default App;

// export { MyContext };

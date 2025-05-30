import Sidebar from "../../Components/Sidebar";
import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { CgMenuGridR } from "react-icons/cg";
import { HiViewGrid } from "react-icons/hi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { FaAngleDown } from "react-icons/fa6";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import ProductItem from "../../Components/ProductItem";


import { useNavigate, useParams } from "react-router-dom";
import { fetchDataFromApi } from "../../utils/api";
import CircularProgress from "@mui/material/CircularProgress";
import { FaFilter } from "react-icons/fa";

import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

import { MyContext } from "../../App";

const Listing = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [productView, setProductView] = useState("four");
  const [productData, setProductData] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [filterId, setFilterId] = useState("");

  
  const history = useNavigate();

  const openDropdown = Boolean(anchorEl);

  const context = useContext(MyContext);

  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
    setFilterId("");

    let url = window.location.href;
    let apiEndPoint = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/subCatId?subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/catId?catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }

    setisLoading(true);
    fetchDataFromApi(`${apiEndPoint}`).then((res) => {
      console.log("Fetched Data:", res);
      setProductData(res);
      setisLoading(false);
    });

    context.setEnableFilterTab(true);

  }, [id]);


  const handleChangePage = (event, value) => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    let url = window.location.href;
    let apiEndPoint = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/subCatId?subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=${value}&perPage=12`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/catId?catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=${value}&perPage=12`;
    }

    setisLoading(true);
    fetchDataFromApi(`${apiEndPoint}`).then((res) => {
      setProductData(res);
      setisLoading(false);
    });



  };

  const filterData = (subCatId) => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    history(`/products/subCat/${subCatId}`)

  };

  const filterByPrice = (price, subCatId) => {
    var window_url = window.location.href;
    var api_EndPoint = "";


    if (window_url.includes("subCat")) {
      api_EndPoint = `/api/products/filterByPrice?minPrice=${
        price[0]
      }&maxPrice=${price[1]}&subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }
    if (window_url.includes("category")) {
      api_EndPoint = `/api/products/filterByPrice?minPrice=${
        price[0]
      }&maxPrice=${price[1]}&catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }

    setisLoading(true);

    fetchDataFromApi(api_EndPoint).then((res) => {
      setProductData(res);
      setisLoading(false);
    });
  };

  const filterByRating = (rating, subCatId) => {
    setisLoading(true);
    let url = window.location.href;
    let apiEndPoint = "";

    if (url.includes("subCat")) {
      apiEndPoint = `/api/products/rating?rating=${rating}&subCatId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }
    if (url.includes("category")) {
      apiEndPoint = `/api/products/rating?rating=${rating}&catId=${id}&location=${localStorage.getItem(
        "location"
      )}&page=1&perPage=12`;
    }

    fetchDataFromApi(apiEndPoint).then((res) => {
      setProductData(res);
      setisLoading(false);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  };

  return (
    <>
      <section className="product_Listing_Page pt-5">
        <div className="container">
          <div className="productListing d-flex">
            <Sidebar
              filterData={filterData}
              filterByPrice={filterByPrice}
              filterByRating={filterByRating}
              isOpenFilter={context?.isOpenFilters}
            />

            <div className="content_right">
              <div className="showBy mt-0 mb-3 d-flex align-items-center">
                <div className="d-flex align-items-center btnWrapper">
                  <Button
                    className={productView === "one" && "act"}
                    onClick={() => setProductView("one")}
                  >
                    <IoIosMenu />
                  </Button>

                  <Button
                    className={productView === "three" && "act"}
                    onClick={() => setProductView("three")}
                  >
                    <CgMenuGridR />
                  </Button>
                  <Button
                    className={productView === "four" && "act"}
                    onClick={() => setProductView("four")}
                  >
                    <TfiLayoutGrid4Alt />
                  </Button>
                </div>
              </div>

              <div className="productListing">
                {isLoading === true ? (
                  <div className="loading d-flex align-items-center justify-content-center">
                    <CircularProgress color="inherit" />
                  </div>
                ) : (
                  <>
                    {productData?.products?.slice(0)
                      .reverse().map((item, index) => {
                      return (
                        <ProductItem
                          key={index}
                          itemView={productView}
                          item={item}
                        />
                      );
                    })}
                  </>
                )}
              </div>
              {!isLoading && productData?.totalPages > 1 && (
                <Box
                  className="paginationContainer"
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px',
                  }}
                >
                  <Pagination
                    count={productData.totalPages}
                    page={productData.page}
                    onChange={handleChangePage}
                    color="secondary"
                    shape="rounded" 
                    variant="outlined"
                  />
                </Box>
              )}
              
            </div>
          </div>
        </div>
      </section>

     
    </>
  );
};

export default Listing;


import Button from "@mui/material/Button";
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import {Typography, Box} from '@mui/material';
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { FaAngleRight } from "react-icons/fa6";
import { MyContext } from "../../../App";
import CountryDropdown from "../../CountryDropdown";
import AddressDropdown from "../../AddressDropdown";
import Logo from "../../../assets/images/logo.jpg";
import { RiLogoutCircleRFill } from "react-icons/ri";
import MenuIcon from '@mui/icons-material/Menu';
import { FaBlog } from "react-icons/fa";
import { Select, MenuItem } from '@mui/material';

import HomeImage from "../../../assets/images/homeimage.png";
import BlogImage from "../../../assets/images/blogimage.png";
import MapImage from "../../../assets/images/mapimage.jpg";
import LicenseImage from "../../../assets/images/licenseimage.jpg";
const Navigation = (props) => {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  const [isOpenNav, setIsOpenNav] = useState(false);
  const [isOpenSubMenuIndex, setIsOpenSubMenuIndex] = useState(null);
  const [isOpenSubMenu_, setIsOpenSubMenu_] = useState(false);

  const context = useContext(MyContext);
  const userContext = context.user;
  const history = useNavigate();

  useEffect(() => {
    setIsOpenNav(props.isOpenNav);
  }, [props.isOpenNav]);

  const IsOpenSubMenu = (index) => {
    setIsOpenSubMenuIndex(index);
    setIsOpenSubMenu_(!isOpenSubMenu_);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // localStorage.removeItem("location");
    context.setIsLogin(false);
    // window.location.href = "/signIn"
    history("/signIn");
  };

  return (
    <nav>
      <div className="container-header">
        <div className="row ">
          <div className="col-sm-2 navPart1 ">
            <div className="catWrapper ">
              {/* <Button
                className="allCatTab align-items-center res-hide"
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                <span className="icon1 mr-2">
                  <IoIosMenu />
                </span>
                <span className="text">ALL CATEGORIES</span>
                <span className="icon2  ml-2">
                  <FaAngleDown />
                </span>
              </Button> */}
              <Button
                startIcon={<MenuIcon />}
                variant="contained"
                sx={{ backgroundColor: '#6C3FC9', borderRadius: 10, px: 2 }}
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                All Categories
                <span className="icon2  ml-2"></span> 
                <FaAngleDown/>
              </Button>

              <div
                className={`sidebarNav ${
                  isopenSidebarVal === true ? "open" : ""
                }`}
              >
                <ul>
                
                  {props.navData?.map((item, index) => {
                    return (
                      <li>
                        <Link to={`/products/category/${item?._id}`}>
                          <Button>
                            <img
                              src={item?.images[0]}
                              width="20"
                              className="mr-2"
                            />{" "}
                            {item?.name} <FaAngleRight className="ml-auto" />
                          </Button>
                        </Link>
                        {item?.children?.length !== 0 && (
                          <div className="submenu">
                            {item?.children?.map((subCat, key) => {
                              return (
                                <Link
                                  to={`/products/subCat/${subCat?._id}`}
                                  key={key}
                                >
                                  <Button>{subCat?.name}</Button>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`col-sm-10 navPart2 d-flex align-items-left res-nav-wrapper  ${
              isOpenNav === true ? "open" : "close"
            }`}
          >
            <div className="res-nav-overlay" onClick={props.closeNav}></div>

            <div className="res-nav">
              {context.windowWidth < 992 && (
                <div className="pl-3">
                  <Link to="/" className="logo">
                    <img src={Logo} alt="logo" />
                  </Link>
                </div>
              )}

              <ul className="list list-inline ml-auto d-flex flex-column flex-md-row align-items-end align-items-md-center">
                  {context.windowWidth < 992 && (
                    <li className="list-inline-item">
                      <div className="p-5">
                        {context.countryList.length !== 0 && <CountryDropdown />}
                      </div>
                    </li>
                  )}

                  {/* Menu items */}
                  {[
                    { to: '/', label: 'Home', img: HomeImage },
                    { to: '/blog', label: 'Blogs', img: BlogImage },
                    { to: '/map', label: 'Map Location', img: MapImage },
                    { to: '/license', label: 'Introduce & License', img: LicenseImage },
                  ].map((item, index) => (
                    <Link
                      to={item.to}
                      onClick={props.closeNav}
                      key={index}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                          p: 1,
                          px: 2,
                          borderRadius: 2,
                          transition: 'background-color 0.3s',
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            '&:hover': { textDecoration: 'underline' },
                          }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                  
                  {userContext.userId && 
                    <div style={{marginLeft: '23rem'}}>
                      <AddressDropdown/>
                    </div>
                  }
                </ul>

              {context.windowWidth < 992 && (
                <>
                  {context?.isLogin === false ? (
                    <div className="pt-3 pl-3 pr-3">
                      <Link to="/signIn">
                        <Button className="btn-blue w-100 btn-big">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signUp" className="mt-2">
                        <Button className="btn-green w-100 btn-big">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-3 pl-3 pr-3"  onClick={logout}>
                       <Button className="btn-blue w-100 btn-big">
                         <RiLogoutCircleRFill/> Logout
                        </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

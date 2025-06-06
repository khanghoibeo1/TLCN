import Button from "@mui/material/Button";
import { MdDashboard } from "react-icons/md";
import { FaAngleRight } from "react-icons/fa6";
import { FaAddressCard } from "react-icons/fa6";
import { FaProductHunt } from "react-icons/fa";
import { FaBlog } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FaCartArrowDown } from "react-icons/fa6";
import { MdMessage } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { Link, NavLink } from "react-router-dom";
import { useContext, useState } from "react";
import { IoMdLogOut } from "react-icons/io";
import { MyContext } from "../../App";
import { FaClipboardCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { BiSolidCategory } from "react-icons/bi";
import { TbSlideshow } from "react-icons/tb";
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import ImportantDevicesIcon from '@mui/icons-material/ImportantDevices';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';


const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const context = useContext(MyContext);
  console.log(context.user)
  const isOpenSubmenu = (index) => {
    setActiveTab(index);
    if(activeTab===index){
      setIsToggleSubmenu(!isToggleSubmenu);
    }else{
      setIsToggleSubmenu(false);
      setIsToggleSubmenu(true);
    }
   
  };
  const history = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token !== "" && token !== undefined && token !== null) {
      setIsLogin(true);
    } else {
      history("/login");
    }
  }, []);

  const logout = () => {
    localStorage.clear();

    context.setAlertBox({
      open: true,
      error: false,
      msg: "Logout successfull",
    });

    setTimeout(() => {
      history("/login");
    }, 2000);
  };

  return (
    <>
      <div className="sidebar">
        <ul>
          <li>
            <NavLink exact activeClassName="is-active" to="/">
              <Button
                className={`w-100 ${activeTab === 0 ? "active" : ""}`}
                onClick={() => {
                  isOpenSubmenu(0);
                  context.setIsOpenNav(false);
                }}
              >
                <span className="icon">
                  <MdDashboard />
                </span>
                Dashboard
              </Button>
            </NavLink>
          </li>

          {
            // context.user.role === "mainAdmin" &&
            <li>
            <Button
              className={`w-100 ${
                activeTab === 1 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(1)}
            >
              <span className="icon">
                <TbSlideshow />
              </span>
               Banners
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 1 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/homeBannerSlide/list"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Home Slides List
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/banners"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Home Banners List
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/homeSideBanners"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Home Side Banners List
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/homeBottomBanners"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Home Bottom Banners List
                  </NavLink>
                </li>
              </ul>
            </div>
          </li>}

          <li>
            <Button
              className={`w-100 ${
                activeTab === 2 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(2)}
            >
              <span className="icon">
                <BiSolidCategory />
              </span>
              Category
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 2 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/category"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Category List
                  </NavLink>
                </li>
                
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/subCategory"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Sub Category List
                  </NavLink>
                </li>
                
              </ul>
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 3 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(3)}
            >
              <span className="icon">
                <FaProductHunt />
              </span>
              Products
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 3 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/products"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Product List
                  </NavLink>
                </li>
              </ul>
            </div>
          </li>


          <li>
            <NavLink exact activeClassName="is-active" to="/orders">
              <Button
                className={`w-100 ${
                  activeTab === 4 && isToggleSubmenu === true ? "active" : ""
                }`}
                onClick={() => {
                  isOpenSubmenu(4);
                  context.setIsOpenNav(false);
                }}
              >
                <span className="icon">
                  {" "}
                  <FaClipboardCheck fontSize="small" />
                </span>
                Orders
              </Button>
            </NavLink>
          </li>

          {
            (context.user.role === "mainAdmin" || context.user.role === "storeAdmin") &&
            <li>
            <Button
              className={`w-100 ${
                activeTab === 5 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(5)}
            >
              <span className="icon">
                <FaAddressCard />
              </span>
              Users
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 5 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              {context.user.role === "mainAdmin" &&
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/users"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Users List
                  </NavLink>
                </li>
              </ul>}

              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/userAdmins"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    User Admin List
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>}

          <li>
            <Button
              className={`w-100 ${
                activeTab === 6 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(6)}
            >
              <span className="icon">
                <FaBlog />
              </span>
              Blogs
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 6 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/blogs"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Blogs List
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/postTypes"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Blog Types
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>

          <li>
            <Button
              className={`w-100 ${
                activeTab === 7 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(7)}
            >
              <span className="icon">
                <FaMoneyBillTrendUp />
              </span>
              Promotion Code
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 7 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/promotionCode"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Promotion Code List
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>

          {/* store location */}
          {
            // (context.user.role === "mainAdmin" || context.user.role === "storeAdmin") &&
            <li>
            <Button
              className={`w-100 ${
                activeTab === 8 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(8)}
            >
              <span className="icon">
                <AddLocationAltIcon />
              </span>
              Store Location
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 8 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/storeLocations"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Store Location List
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>}

          {/*Batch Code*/}
          <li>
            <Button
              className={`w-100 ${
                activeTab === 9 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(9)}
            >
              <span className="icon">
                <ImportantDevicesIcon  />
              </span>
              Batch Code
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 9 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/batchCodes"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Batch Code List
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/batchCode/request"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Request Batch Code 
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>

          {/*notification*/}
          <li>
            <Button
              className={`w-100 ${
                activeTab === 10 && isToggleSubmenu === true ? "active" : ""
              }`}
              onClick={() => isOpenSubmenu(10)}
            >
              <span className="icon">
                <CircleNotificationsIcon  />
              </span>
              Notification for user
              <span className="arrow">
                <FaAngleRight />
              </span>
            </Button>
            <div
              className={`submenuWrapper ${
                activeTab === 10 && isToggleSubmenu === true
                  ? "colapse"
                  : "colapsed"
              }`}
            >
              <ul className="submenu">
                <li>
                  <NavLink
                    exact
                    activeClassName="is-active"
                    to="/notifications"
                    onClick={() => context.setIsOpenNav(false)}
                  >
                    Notification List
                  </NavLink>
                </li>
              </ul>
              
            </div>
          </li>
          {
          // context.user.role === "mainAdmin" && 
          (
          <li>
            <NavLink
              exact
              to="/messages"
              className={({ isActive }) => isActive ? "is-active" : ""}
            >
              <Button
                className={`w-100 ${
                  activeTab === 11 && isToggleSubmenu ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(11);
                  context.setIsOpenNav(false);
                }}
              >
                <span className="icon">
                  <MdMessage />
                </span>
                Admin Chat
              </Button>
            </NavLink>
          </li>
        )}
        </ul>

        <div className="logoutWrapper">
          <div className="logoutBox">
            <Button
              variant="contained"
              onClick={() => {
                logout();
                context.setIsOpenNav(false);
              }}
            >
              <IoMdLogOut /> Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

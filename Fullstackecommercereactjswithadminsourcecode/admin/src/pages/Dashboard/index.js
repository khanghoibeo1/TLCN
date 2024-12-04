import DashboardBox from "./components/dashboardBox";
import DateFilter from "../../components/DateFilter";
import { FaUserCircle } from "react-icons/fa";
import { IoMdCart } from "react-icons/io";
import { MdShoppingBag } from "react-icons/md";
import { GiStarsStack } from "react-icons/gi";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyContext } from "../../App";

import "react-lazy-load-image-component/src/effects/blur.css";

import { deleteData, fetchDataFromApi } from "../../utils/api";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Customizing the calendar date format
const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBy, setshowBy] = useState(10);
  const [showBysetCatBy, setCatBy] = useState("");
  const [productList, setProductList] = useState([]);
  const [categoryVal, setcategoryVal] = useState("all");

  const [totalUsers, setTotalUsers] = useState();
  const [totalOrders, setTotalOrders] = useState();
  const [totalProducts, setTotalProducts] = useState();
  const [totalProductsReviews, setTotalProductsReviews] = useState();
  const [totalSales, setTotalSales] = useState();
  const [perPage, setPerPage] = useState(10);

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [blogCountCatgoryData, setBlogCountCatgoryData] = useState([]);
  const [userSpentData, setUserSpentData] = useState([]);
  const [reviewStatsData, setreviewStatsData] = useState([]);
  const [mostSellingProductsData, setMostSellingProductsData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [filter, setFilter] = useState({
    fromDate: "2024-01-01",
    toDate: "2024-12-31",
    groupBy: "month", // hoặc "day", "quarter", "year"
  });

  const open = Boolean(anchorEl);

  const ITEM_HEIGHT = 48;

  const context = useContext(MyContext);
  
  const history = useNavigate();

  useEffect(() => {
    context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
    context.setProgress(40);

    fetchDataFromApi('/api/orders/get/data/status-summary').then((res) => {
      setOrderStatusData(res);
    });

    fetchDataFromApi('/api/posts/get/data/category-stats').then((res) => {
      setBlogCountCatgoryData(res);
    });

    fetchDataFromApi('/api/user/get/data/user-spent').then((res) => {
      setUserSpentData(res);
    });

    fetchDataFromApi('/api/productReviews/get/reviews/stats').then((res) => {
      setreviewStatsData(res);
    });

    fetchDataFromApi('/api/orders/get/data/most-sold-products').then((res) => {
      setMostSellingProductsData(res);
    });

    fetchDataFromApi(`/api/orders/get/data/stats/sales?fromDate=${filter.fromDate}&toDate=${filter.toDate}&groupBy=${filter.groupBy}`).then((res) => {
      setSalesData(res);
    })

    fetchDataFromApi(`/api/products?page=1&perPage=${perPage}`).then((res) => {
      setProductList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/user/get/count").then((res) => {
      setTotalUsers(res.userCount);
    });

    fetchDataFromApi("/api/orders/get/count").then((res) => {
      setTotalOrders(res.orderCount);
    });

    let sales = 0;
    fetchDataFromApi("/api/orders/").then((res) => {
      res?.length !== 0 &&
        res?.map((item) => {
          sales += parseInt(item.amount);
        });

      setTotalSales(sales);
    });

    fetchDataFromApi("/api/products/get/count").then((res) => {
      setTotalProducts(res.productsCount);
    });

    fetchDataFromApi("/api/productReviews/get/count").then((res) => {
      setTotalProductsReviews(res.productsReviews);
    });
  }, []);

  const handleFilter = async (filter) => {
    try {
      console.log(filter);
      fetchDataFromApi(`/api/orders/get/data/stats/sales?fromDate=${filter.fromDate}&toDate=${filter.toDate}&groupBy=${filter.groupBy}`).then((res) => {
        setSalesData(res);
      });
      
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="row dashboardBoxWrapperRow dashboard_Box dashboardBoxWrapperRowV2">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                icon={<FaUserCircle />}
                grow={true}
                title="Total Users"
                count={totalUsers}
                onClick={() => history('/users')}
              />
              <DashboardBox
                color={["#c012e2", "#eb64fe"]}
                icon={<IoMdCart />}
                title="Total Orders"
                count={totalOrders}
                onClick={() => history('/orders')}
              />
              <DashboardBox
                color={["#2c78e5", "#60aff5"]}
                icon={<MdShoppingBag />}
                title="Total Products"
                count={totalProducts}
                onClick={() => history('/products')}
              />
              <DashboardBox
                color={["#e1950e", "#f3cd29"]}
                icon={<GiStarsStack />}
                title="Total Reviews"
                count={totalProductsReviews}
                onClick={() => history('/')}
              />
            </div>
          </div>

          <div className="container-fluid text-white m-5">
            {/* Row 1 */}
            <div className="row mt-4 d-flex justify-content-between">
              <div className="col-md-8">
                <div className="box  p-3 bg-dark">
                  <h6 className="text-white mb-3">Total Sales</h6>
                    <DateFilter onFilter={(handleFilter)} />
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        width={500}
                        height={400}
                        data={salesData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#FAB12F" fill="#FCF596" />
                      </AreaChart>
                    </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-4">
                <div className="box p-3 bg-dark">
                  <h6 className="text-white mb-3">Top Selling Products</h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mostSellingProductsData.map((product, index) => (
                          <tr key={product._id}>
                            <td>{index + 1}</td>
                            <td>{product.productTitle}</td>
                            <td>{product.totalQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mt-4 d-flex justify-content-between">
              <div className="col-md-4">
                <div className=" bg-dark p-3">
                  <h6 className="text-white mb-3">Order Status</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        fill="#c012e2"
                        label
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#FFCFEF" : (index === 1 ? "#0A97B0" : "#0A5EB0")} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-5 ">
              <div className="box p-3 bg-dark">
                    <h6 className="text-white mb-3">Stats Blogs Of Category</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={blogCountCatgoryData}>
                        <YAxis />
                        <XAxis dataKey="name"/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="amount" fill="#8EA3A6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
            </div>
              <div className="col-md-3">
                <div className="box">
                  <Calendar
                    localizer={localizer}
                    events={[]}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                      height: "370px",
                      backgroundColor: "#8B5DFF", // White background for calendar
                      borderRadius: "10px",
                      padding: "10px",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "18px",
                    }}
                    views={["month"]}
                  />
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mt-4 d-flex justify-content-between">
              <div className="col-md-7 mt-4 ">
                <div className="box p-3 bg-dark">
                      <h6 className="text-white mb-3">Top 10 Users</h6>
                      <ResponsiveContainer width="95%" height={350}>
                        <BarChart data={userSpentData} layout="vertical">
                          <YAxis type="category" dataKey="name" />
                          <XAxis type="number"/>
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="totalSpent" fill="#1da256" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
              </div>
              <div className="col-md-5 mt-4 pl-0">
                <div className=" p-3 bg-dark">
                    <h6 className="text-white mb-3">Product Rating Stats</h6>
                    <ResponsiveContainer width="95%" height={350}>
                      <BarChart data={reviewStatsData} layout="vertical">
                        <YAxis type="category" dataKey="rating" />
                        <XAxis type="number"/>
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#563A9C" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
            </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

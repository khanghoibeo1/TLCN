// src/pages/admin/Dashboard.jsx

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
import { LineChart,Treemap, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Customizing the calendar date format
const localizer = momentLocalizer(moment);
const PIE_COLORS = ['#29B6F6', '#AB47BC', '#66BB6A', '#FFCA28', '#EF5350'];
const Dashboard = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showBy, setShowBy] = useState(10);
  const [catBy, setCatBy] = useState("");
  const [storeLocationList, setStoreLocationList] = useState([]);
  const [subCatData, setSubCatData] = useState([]);

  const [totalUsers, setTotalUsers] = useState();
  const [totalOrders, setTotalOrders] = useState();
  const [totalProducts, setTotalProducts] = useState();
  const [totalProductsReviews, setTotalProductsReviews] = useState();
  const [totalSales, setTotalSales] = useState();
  const [locationSelected, setLocationSelected] = useState('');

  const [orderStatusData, setOrderStatusData] = useState([]);
  const [blogCountCatgoryData, setBlogCountCatgoryData] = useState([]);
  const [userSpentData, setUserSpentData] = useState([]);
  const [userRankData, setUserRankData] = useState([]);
  const [productLittleData, setProductLittleData] = useState([]);
  const [reviewStatsData, setreviewStatsData] = useState([]);
  const [reviewStatsDataWithStars, setReviewStatsDataWithStars] = useState([]);
  const [mostSellingProductsData, setMostSellingProductsData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const userChartHeight = Math.max(userSpentData.length * 40, 300)

  const maxNameLen = Math.max(...userSpentData.map(u => u.name.length), 0);
  const yAxisLabelWidth = Math.min(Math.max(maxNameLen * 8, 80), 160); 
  const productChartHeight = Math.max(reviewStatsData.length * 40 + 60, 200);
  // nhân với 8px trên mỗi ký tự, giới hạn trong [80, 160]
  const ITEM_HEIGHT = 48;
  const yAxisMarginLeft = yAxisLabelWidth + 20;
  const [filter, setFilter] = useState({
    fromDate: "2024-01-01",
    toDate: "2025-12-31",
    groupBy: "day"
  });

  const context = useContext(MyContext);
  const user = context.user;
  const history = useNavigate();

  useEffect(() => {
    setLocationSelected(user.locationId ?? null);
  },[user])

  useEffect(() => {
    context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
    context.setProgress(40);

    console.log(locationSelected)

    fetchDataFromApi(`/api/orders/get/data/status-summary?locationId=${locationSelected}`).then((res) => {
      setOrderStatusData(res);
    });

    fetchDataFromApi('/api/posts/get/data/category-stats').then((res) => {
      setBlogCountCatgoryData(res);
    });
    fetchDataFromApi('/api/user/get/data/user-rank-summary').then((res) => {
      setUserRankData(res);
    });

    fetchDataFromApi(`/api/products/get/data/littleProduct?locationId=${locationSelected}`).then((res) => {
      setProductLittleData(res.data);
    });

    fetchDataFromApi('/api/category/get/data/categories-with-product-counts').then((res) => {
      setSubCatData(res);
    });
    fetchDataFromApi('/api/user/get/data/user-spent').then((res) => {
      setUserSpentData(res);
    });

    fetchDataFromApi('/api/productReviews/get/reviews/stats').then((res) => {
      setreviewStatsData(res);
    });

    fetchDataFromApi(`/api/orders/get/data/most-sold-products?locationId=${locationSelected}`).then((res) => {
      setMostSellingProductsData(res);
    });

    fetchDataFromApi(`/api/orders/get/data/stats/sales?fromDate=${filter.fromDate}&toDate=${filter.toDate}&groupBy=${filter.groupBy}&locationId=${locationSelected}`).then((res) => {
      setSalesData(res);
    })

    fetchDataFromApi(`/api/storeLocations`).then((res) => {
      setStoreLocationList(res.data);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/user/get/count").then((res) => {
      setTotalUsers(res.userCount);
    });

    fetchDataFromApi("/api/orders/get/count").then((res) => {
      setTotalOrders(res.orderCount);
    });

    let sales = 0;
    fetchDataFromApi("/api/orders/user").then((res) => {
      res?.length !== 0 &&
        res?.orders?.map((item) => {
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
  }, [locationSelected]);

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

   useEffect(() => {
    const transformedData = reviewStatsData.map(item => ({
      ...item,
      rating:  ` ${item.rating} ` + '⭐',
    }));
    setReviewStatsDataWithStars(transformedData);
  }, [reviewStatsData]);


  return (
    <>
      <div className="right-content w-100">
        <div className="row dashboardBoxWrapperRow dashboard_Box dashboardBoxWrapperRowV2">
          <div className="col-md-12 ml-4">
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

          <div className="container-fluid text-white m-1">
            {/* Row 1 */}
            <div className="row mt-4 d-flex justify-content-between">
              <div className="col-md-8">
                <div className="box  p-3 bg-dark">
                  <h6 className="text-white mb-3">Total Sales</h6>
                    <DateFilter onFilter={(handleFilter)} />
                    <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={salesData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <XAxis dataKey="label" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                      <Line type="monotone" dataKey="sales" stroke="#1da256" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-4">
                <div className="box p-3 bg-dark">
                  <h6 className="text-white mb-3">All Store Location</h6>
                  {user.locationId === null && <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => setLocationSelected(null)}
                    disabled={user.locationId !== null} 
                  >
                    Main Store
                  </button>}
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Store</th>
                          <th>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeLocationList.map((location, index) => (
                          <tr 
                            key={location.id}
                            onClick={() => user.locationId === null && setLocationSelected(location.id)} // ✅ sự kiện click
                            style={{ cursor: 'pointer' }}
                          >
                            <td>{index + 1}</td>
                            <td>{location.location}</td>
                            <td>{location.detailAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="row mt-2 mt-3 d-flex justify-content-between">
              <div className="col-md-4">
                <div className="box bg-dark p-3">
                  <h6 className="text-white mb-3">Order Status</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Tooltip />
                      <Legend />
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
                        {orderStatusData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#FFCFEF" : (index === 1 ? "#0A97B0" : "#0A5EB0")} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-4">
                <div className="box bg-dark p-3">
                  <h6 className="text-white mb-3">User Rank Stats</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={userRankData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#FF9F40"
                        label
                      >
                        {
                          userRankData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#FF9F40', '#FFCD56', '#36A2EB', '#4BC0C0', '#9966FF'][index % 5]}
                            />
                          ))
                        }
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-md-4">
                <div className="box bg-dark p-3">
                  <h6 className="text-white mb-3">Product Ratings Stats</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={reviewStatsDataWithStars}
                        dataKey="count"
                        nameKey="rating"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#FF9F40"
                        label
                      >
                        {
                          reviewStatsData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={['#FF9F40', '#FFCD56', '#36A2EB', '#4BC0C0', '#9966FF'][index % 5]}
                            />
                          ))
                        }
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="row mt-2 mt-3 d-flex justify-content-between">
              {/* <div className="col-md-4">
                <div className="box p-3 bg-dark" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <h6 className="text-white mb-3">Top 10 Users</h6>
                  {userSpentData.map((user, index) => (
                    <div key={user.name} className="d-flex align-items-center bg-secondary rounded p-2 mb-2">
                      <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px' }}>
                        {index + 1}
                      </div>
                      <div className="ms-3">
                        <div className="fw-semibold">{user.name}</div>
                        <div className="small">Spent: ${user.totalSpent.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}
              <div className="col-md-4">
                <div className="box p-3 bg-dark">
                  <h6 className="text-white mb-3">Top Spent Users</h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>User</th>
                          <th>Spent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userSpentData.map((user, index) => (
                          <tr>
                            <td>{index + 1}</td>
                              <td>{user.name}</td>
                            <td>{user.totalSpent.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="box p-3 bg-dark">
                  <h6 className="text-white mb-3">Little Product Amount</h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table table-dark table-striped">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Product</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productLittleData?.map((product, index) => (
                          <tr>
                            <td>{index + 1}</td>
                            <td>{product.name}</td>
                            <td>{product.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                          <th>Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mostSellingProductsData?.map((product, index) => (
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
              
              {/* <div className="col-md-5">
                <div className="box bg-dark p-3">
                  <h6 className="text-white mb-3">Product Ratings Stats</h6>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reviewStatsData}>
                      <YAxis />
                      <XAxis
                        dataKey="rating"
                        angle={0}
                        textAnchor="middle"
                        interval={0}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#FF9F40" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div> */}
            </div>

            {/* Row 4 */}
            <div className="row mt-3 d-flex justify-content-between">
              
              <div className="col-md-12 ">
                <div className="box p-3 bg-dark">
                    <h6 className="text-white mb-3">Stats Blogs Follow Category</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={blogCountCatgoryData}>
                        <YAxis />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={70}
                        />
                        <Tooltip/>
                        <Legend />
                        <Bar dataKey="amount" fill="#8EA3A6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
            </div>
            {/* Row 5 */}
            <div className="row mt-3 d-flex justify-content-between">
              
              <div className="col-md-12 ">
                <div className="box p-3 bg-dark">
                <h6 className="text-white mb-3">Stats Products Follow Category</h6>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subCatData}>
                        <YAxis />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          height={70}
                        />
                        <Tooltip/>
                        <Legend />
                        <Bar dataKey="value" fill="#8EA3A6" />
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
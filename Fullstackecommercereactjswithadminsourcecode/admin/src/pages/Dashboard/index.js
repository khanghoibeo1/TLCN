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

import { fetchDataFromApi } from "../../utils/api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ['#29B6F6', '#AB47BC', '#66BB6A', '#FFCA28', '#EF5350'];


const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [blogStats, setBlogStats] = useState([]);
  const [mostSelling, setMostSelling] = useState([]);
  const [userSpentData, setUserSpentData] = useState([]);
  const [reviewStats, setReviewStats] = useState([]);
  const userChartHeight = Math.max(userSpentData.length * 40, 300)

  const maxNameLen = Math.max(...userSpentData.map(u => u.name.length), 0);
  const yAxisLabelWidth = Math.min(Math.max(maxNameLen * 8, 80), 160); 
  const productChartHeight = Math.max(reviewStats.length * 40 + 60, 200);
  // nhân với 8px trên mỗi ký tự, giới hạn trong [80, 160]

  const yAxisMarginLeft = yAxisLabelWidth + 20;

  const [filter, setFilter] = useState({
    fromDate: "2024-01-01",
    toDate: "2025-12-31",
    groupBy: "month"
  });

  const context = useContext(MyContext);
  const navigate = useNavigate();

  useEffect(() => {
    context.setisHideSidebarAndHeader(false);
    // fetch counts
    fetchDataFromApi("/api/user/get/count").then(r => setTotalUsers(r.userCount));
    fetchDataFromApi("/api/orders/get/count").then(r => setTotalOrders(r.orderCount));
    fetchDataFromApi("/api/products/get/count").then(r => setTotalProducts(r.productsCount));
    fetchDataFromApi("/api/productReviews/get/count").then(r => setTotalReviews(r.productsReviews));

    // fetch charts data
    fetchDataFromApi(`/api/orders/get/data/stats/sales?fromDate=${filter.fromDate}&toDate=${filter.toDate}&groupBy=${filter.groupBy}`)
      .then(r => setSalesData(r));

    fetchDataFromApi("/api/orders/get/data/status-summary").then(r => setOrderStatusData(r));
    fetchDataFromApi("/api/posts/get/data/category-stats").then(r => setBlogStats(r));
    fetchDataFromApi("/api/orders/get/data/most-sold-products").then(r => setMostSelling(r));
    fetchDataFromApi("/api/user/get/data/user-spent").then(r => setUserSpentData(r));
    fetchDataFromApi("/api/productReviews/get/reviews/stats").then(r => setReviewStats(r));
  }, [filter]);

  const handleFilter = (f) => {
    setFilter(f);
  };

  return (
    <div className="right-content w-100">

      {/* === 1. TOP CARDS === */}
      <div className="dashboard-top-cards px-4 pt-4">
        <div className="d-flex flex-wrap justify-content-between">
          <DashboardBox
            color={["#1da256","#48d483"]}
            icon={<FaUserCircle />}
            title="Total Users"
            count={totalUsers}
            onClick={()=>navigate("/users")}
          />
          <DashboardBox
            color={["#c012e2","#eb64fe"]}
            icon={<IoMdCart />}
            title="Total Orders"
            count={totalOrders}
            onClick={()=>navigate("/orders")}
          />
          <DashboardBox
            color={["#2c78e5","#60aff5"]}
            icon={<MdShoppingBag />}
            title="Total Products"
            count={totalProducts}
            onClick={()=>navigate("/products")}
          />
          <DashboardBox
            color={["#e1950e","#f3cd29"]}
            icon={<GiStarsStack />}
            title="Total Reviews"
            count={totalReviews}
            onClick={()=>navigate("/")}
          />
        </div>
      </div>

      {/* === 2. CHARTS === */}
      <div className="container-fluid px-4 dashboard-charts">

        {/* Row 1 */}
        <div className="row mb-4">
          <div className="col-lg-8 mb-3">
            <div className="chart-card">
              <h6>Total Sales</h6>
              <DateFilter onFilter={handleFilter} />
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={salesData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
                  <XAxis dataKey="label" axisLine={{ stroke: "#ccc" }} tickLine={false} tick={{ fill: "#333" }}/>
                  <YAxis axisLine={{ stroke: "#ccc" }} tickLine={false} tick={{ fill: "#333" }}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor:"#fff", border:"1px solid #ccc" }} 
                    itemStyle={{ color:"#333" }} 
                    labelStyle={{ color:"#555" }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3f51b5" fill="rgba(63,81,181,0.3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-lg-4 mb-3">
            <div className="chart-card">
              <h6>Top Selling Products</h6>
              <div className="table-responsive" style={{ maxHeight: 250 }}>
                <table className="table table-sm">
                  <thead className="thead-light">
                    <tr><th>#</th><th>Product</th><th>Sales</th></tr>
                  </thead>
                  <tbody>
                    {mostSelling.map((p,i)=>(
                      <tr key={p._id}>
                        <td>{i+1}</td>
                        <td>{p.productTitle}</td>
                        <td>{p.totalQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="row mb-4">
          {/* Order Status */}
          <div className="col-md-6 mb-3">
            <div className="chart-card" style={{ height: 350 }}>
              <h6>Order Status</h6>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="45%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {orderStatusData.map((_, idx) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  {/* <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    formatter={(value, entry) => (
                      <span style={{ color: '#333', marginLeft: 4 }}>
                        {entry.payload.name}: {entry.payload.value}
                      </span>
                    )}
                  /> */}
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    itemStyle={{ color: '#333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stats Blogs Of Category */}
          <div className="col-md-6 mb-3">
            <div className="chart-card" style={{ height: 350 }}>
              <h6>Stats Blogs Of Category</h6>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={blogStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}  // ↑ chừa 80px
                >
                  <CartesianGrid stroke="#e0e0e0" />

                  <XAxis
                    dataKey="name"
                    axisLine={{ stroke: '#ccc' }}
                    tickLine={false}
                    tick={{
                      fill: '#333',
                      angle: -15,
                      textAnchor: 'end'
                    }}
                    interval={0}
                    height={60}    // ↑ đủ cao chứa tick xoay
                  />

                  <YAxis
                    axisLine={{ stroke: '#ccc' }}
                    tickLine={false}
                    tick={{ fill: '#333' }}
                  />

                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                    itemStyle={{ color: '#333' }}
                  />

                  <Legend
                    height={20}                    // cố định chiều cao cho legend
                    verticalAlign="bottom"
                    align="center"                 // canh giữa
                    iconType="square"
                    formatter={value => (
                      <span style={{ color: '#333' }}>{value}</span>
                    )}
                  />

                  <Bar dataKey="amount" name="Blog Count" fill="#8EA3A6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="row mb-4">
          {/* Top 10 Users */}
          <div className="col-md-6 mb-3">
            <div className="chart-card">
              <h6>Top 10 Users</h6>
              <ResponsiveContainer width="100%" height={userChartHeight}>
                <BarChart
                  data={userSpentData}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }} // ← left giảm về 0
                  barCategoryGap="20%"
                >
                  <CartesianGrid stroke="#e0e0e0" />
                  <XAxis
                    type="number"
                    axisLine={{ stroke: "#ccc" }}
                    tickLine={false}
                    tick={{ fill: "#333", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={yAxisLabelWidth}    // vẫn giữ đủ chỗ cho tên
                    axisLine={{ stroke: "#ccc" }}
                    tickLine={false}
                    tick={{ fill: "#333", fontSize: 13 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                    itemStyle={{ color: "#333" }}
                  />
                  {/* legend bỏ đi để rộng không gian */}
                  <Bar
                    dataKey="totalSpent"
                    name="Total Spent"
                    fill="#1da256"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Rating Stats */}
          <div className="col-md-6 mb-3">
            <div className="chart-card">
              <h6>Product Rating Stats</h6>
              <ResponsiveContainer width="100%" height={productChartHeight}>
                <BarChart
                  data={reviewStats}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid stroke="#e0e0e0" />
                  <XAxis
                    type="number"
                    axisLine={{ stroke: "#ccc" }}
                    tickLine={false}
                    tick={{ fill: "#333", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    width={60}
                    axisLine={{ stroke: "#ccc" }}
                    tickLine={false}
                    tick={{ fill: "#333", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
                    itemStyle={{ color: "#333" }}
                  />
                  <Bar dataKey="count" name="Count" fill="#563A9C" barSize={20} />
                </BarChart>
              </ResponsiveContainer>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App';
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { Button } from '@mui/material';
import SearchBox from '../../components/SearchBox';
import { FaPencilAlt, FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DashboardBox from '../Dashboard/components/dashboardBox'; // Import DashboardBox

const NotificationList = () => {
  const [notificationList, setNotificationList] = useState([]);
  const [totalPromotion, setTotalPromotion] = useState(0);
  const context = useContext(MyContext);
  const history = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    context.setProgress(40);
    fetchDataFromApi(`/api/notifications`).then((res) => {
      setNotificationList(res);
      context.setProgress(100);
    });

    fetchDataFromApi("/api/promotionCode/get/count").then((res) => {
      setTotalPromotion(res.promotionCodeCount);
    });
  }, []);

  const deleteNotification = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (!confirmDelete) return;
    const userInfo = JSON.parse(localStorage.getItem("user"));
    if (userInfo?.email === "admin@admin.com") {
      context.setProgress(40);
      deleteData(`/api/notifications/${id}`).then(() => {
        context.setProgress(100);
        context.setAlertBox({
          open: true,
          error: false,
          msg: "Promotion Code Deleted!",
        });

        // Fetch updated list
        fetchDataFromApi(`/api/notifications`).then((res) => {
          setNotificationList(res);
        });
      });
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Only Admin can delete Promotion Codes",
      });
    }
  };
  const onSearch = (keyword) => {
    if (keyword !== "") {
      fetchDataFromApi(`/api/search/notification?q=${keyword}`).then((res) => {
        setNotificationList(res.data);
      });
    } else {
      fetchDataFromApi(`/api/notifications`).then((res) => {
        setNotificationList(res);
      });
    }
  };
  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Notification List</h5>
          <div className="ml-auto">
            <Link to="/notification/add">
              <Button className="btn-blue ml-3 pl-3 pr-3">Add Notification Code</Button>
            </Link>
          </div>
        </div>

        <div className="row dashboardBoxWrapperRow pt-0">
          <div className="col-md-12">
            <div className="dashboardBoxWrapper d-flex">
              <DashboardBox
                color={["#1da256", "#48d483"]}
                title="Total Promotion Codes"
                count={totalPromotion}
                onClick={() => history('/promotionCode')}
              />
            </div>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
            <h3 className="hd">Notifications</h3>
            <div className="row cardFilters mt-3">
                <div className="col-md-6 d-flex justify-content-end">
                    <div className="searchWrap d-flex">
                        <SearchBox onSearch={onSearch} />
                    </div>
                </div>
            </div>

            <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>TITLE</th>
                    <th>MESSAGE</th>
                    <th>TYPE</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {notificationList?.length > 0 &&
                    notificationList.map((notification, index) => (
                      <tr key={index}>
                        <td>{notification?.title}</td>
                        <td>{notification?.message}</td>
                        <td>{notification?.type}</td>
                        <td>
                          <div className="actions d-flex align-items-center">
                            <Link to={`/notification/details/${notification?._id}`}>
                              <Button className="secondary">
                                <FaEye />
                              </Button>
                            </Link>
                            <Link to={`/notification/edit/${notification._id}`}>
                              <Button className="success">
                                <FaPencilAlt />
                              </Button>
                            </Link>

                            <Button className="error" onClick={() => deleteNotification(notification._id)}>
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};

export default NotificationList;
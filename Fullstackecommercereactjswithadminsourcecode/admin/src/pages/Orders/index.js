import React, { useContext } from "react";
import { editData, fetchDataFromApi } from "../../utils/api";
import { useState } from "react";
import { useEffect } from "react";

import { emphasize, styled } from "@mui/material/styles";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import { MdClose } from "react-icons/md";
import Button from "@mui/material/Button";
import { MdOutlineEmail } from "react-icons/md";
import { FaPhoneAlt } from "react-icons/fa";
import { MdOutlineCurrencyRupee } from "react-icons/md";
import { MdOutlineDateRange } from "react-icons/md";

import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { MyContext } from "../../App";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

//breadcrumb code
const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &:focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [products, setproducts] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [singleOrder, setSingleOrder] = useState();
  const [statusVal, setstatusVal] = useState(null);

  const context = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    fetchDataFromApi(`/api/orders`).then((res) => {
      setOrders(res);
    });
  }, []);

  const showProducts = (id) => {
    fetchDataFromApi(`/api/orders/${id}`).then((res) => {
      setIsOpenModal(true);
      setproducts(res.products);
    });
  };

  const handleChangeStatus = (e, orderId) => {
    setstatusVal(e.target.value);
    setIsLoading(true);
    context.setProgress(40);
    fetchDataFromApi(`/api/orders/${orderId}`).then((res) => {
      const order = {
        name: res.name,
        phoneNumber: res.phoneNumber,
        address: res.address,
        pincode: res.pincode,
        amount: parseInt(res.amount),
        paymentId: res.paymentId,
        email: res.email,
        userid: res.userId,
        products: res.products,
        status: e.target.value,
      };

      editData(`/api/orders/${orderId}`, order).then((res) => {
        fetchDataFromApi(`/api/orders`).then((res) => {
          setOrders(res);
          // window.scrollTo({
          //   top: 200,
          //   behavior: "smooth",
          // });
        });
        context.setProgress(100);
        setIsLoading(false);
      });

      setSingleOrder(res.products);
    });
  };

  //   const orderStatus = (orderStatus, id) => {
  //     fetchDataFromApi(`/api/orders/${id}`).then((res) => {
  //       const order = {
  //         name: res.name,
  //         phoneNumber: res.phoneNumber,
  //         address: res.address,
  //         pincode: res.pincode,
  //         amount: parseInt(res.amount),
  //         paymentId: res.paymentId,
  //         email: res.email,
  //         userid: res.userId,
  //         products: res.products,
  //         status: orderStatus,
  //       };

  //       editData(`/api/orders/${id}`, order).then((res) => {
  //         fetchDataFromApi(`/api/orders`).then((res) => {
  //           setOrders(res);
  //           window.scrollTo({
  //             top: 200,
  //             behavior: "smooth",
  //           });
  //         });
  //       });

  //       setSingleOrder(res.products);
  //     });
  //   };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 align-items-center">
          <h5 className="mb-0">Orders List</h5>

          <div className="ml-auto d-flex align-items-center">
            <Breadcrumbs
              aria-label="breadcrumb"
              className="ml-auto breadcrumbs_"
            >
              <StyledBreadcrumb
                component="a"
                href="#"
                label="Dashboard"
                icon={<HomeIcon fontSize="small" />}
              />

              <StyledBreadcrumb
                label="Orders"
                deleteIcon={<ExpandMoreIcon />}
              />
            </Breadcrumbs>
          </div>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <div className="table-responsive mt-3 orderTable">
            <table className="table table-bordered table-striped v-align">
              <thead className="thead-dark">
                <tr>
                  <th>Order Id</th> 
                  <th>Paymant Id</th>
                  <th>Products</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Address</th>
                  <th>Pincode</th>
                  <th>Total Amount</th>
                  <th>Email</th>
                  <th>User Id</th>
                  <th>Order Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders?.length !== 0 &&
                  orders?.map((order, index) => {
                    return (
                      <>
                        <tr key={index}>
                        <td>
                        <span className="text-blue fonmt-weight-bold">
                          {order?._id}
                        </span>
                      </td>
                          <td>
                            <span className="text-blue fonmt-weight-bold">
                              {order?.paymentId}
                            </span>
                          </td>
                          <td>
                            <span
                              className="text-blue fonmt-weight-bold cursor"
                              onClick={() => showProducts(order?._id)}
                            >
                              Click here to view
                            </span>
                          </td>
                          <td>{order?.name}</td>
                          <td>
                            <FaPhoneAlt /> {order?.phoneNumber}
                          </td>
                          <td>{order?.address}</td>
                          <td>{order?.pincode}</td>
                          <td>
                            <MdOutlineCurrencyRupee /> {order?.amount}
                          </td>
                          <td>
                            <MdOutlineEmail /> {order?.email}
                          </td>
                          <td>{order?.userid}</td>
                          <td>
                            <Select
                            disabled={isLoading===true ? true: false}
                              value={
                                order?.status !== null
                                  ? order?.status
                                  : statusVal
                              }
                              onChange={(e) =>
                                handleChangeStatus(e, order?._id)
                              }
                              displayEmpty
                              inputProps={{ "aria-label": "Without label" }}
                              size="small"
                              className="w-100"
                            >
                              <MenuItem value={null}>
                                <em value={null}>None</em>
                              </MenuItem>

                              <MenuItem value="pending">Pending</MenuItem>

                              <MenuItem value="confirm">Confirm</MenuItem>

                              <MenuItem value="delivered">Delivered</MenuItem>
                            </Select>
                          </td>
                          <td>
                            <MdOutlineDateRange /> {order?.date?.split("T")[0]}
                          </td>
                        </tr>
                      </>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={isOpenModal} className="productModal">
        <Button className="close_" onClick={() => setIsOpenModal(false)}>
          <MdClose />
        </Button>
        <h4 class="mb-1 font-weight-bold pr-5 mb-4">Products</h4>

        <div className="table-responsive orderTable">
          <table className="table table-striped table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>Product Id</th>
                <th>Product Title</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>SubTotal</th>
              </tr>
            </thead>

            <tbody>
              {products?.length !== 0 &&
                products?.map((item, index) => {
                  return (
                    <tr>
                      <td>{item?.productId}</td>
                      <td style={{ whiteSpace: "inherit" }}>
                        <span>{item?.productTitle?.substr(0, 30) + "..."}</span>
                      </td>
                      <td>
                        <div className="img">
                          <img src={item?.image} />
                        </div>
                      </td>
                      <td>{item?.quantity}</td>
                      <td>{item?.price}</td>
                      <td>{item?.subTotal}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Dialog>
    </>
  );
};

export default Orders;

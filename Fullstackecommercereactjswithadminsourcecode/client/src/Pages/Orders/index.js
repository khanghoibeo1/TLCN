import React, { useContext, useEffect, useState, useCallback } from 'react';
import { editData, editData2, fetchDataFromApi, postData3 } from '../../utils/api';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";

const Orders = () => {

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const context = useContext(MyContext);
    const navigate = useNavigate();

    const fetchOrders = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.userId;
        fetchDataFromApi(`/api/orders/user?startDate=${startDate}&endDate=${endDate}&userid=${userId}&page=${page}&limit=10`)
        .then((res) => {
            setOrders(res.orders);
            setTotalPages(res.totalPages);
            setPage(res.currentPage);
        })
        .catch((err) => console.error('Error fetching orders:', err));
    }, [page, startDate, endDate]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/signIn');
            return;
        }
        context.setEnableFilterTab(false);
        fetchOrders();
    }, [navigate, context, fetchOrders]);

    const handlePageChange = (_, value) => {
        setPage(value);
    };


    const showProducts = (id) => {
        setIsLoading(true)
        fetchDataFromApi(`/api/orders/${id}`)
        .then((res) => {
            setProducts(res.products);
            setIsOpenModal(true);
            setIsLoading(false)
        })
        .catch((err) => console.error('Error fetching order:', err));
    };
 // Hàm cập nhật trạng thái đơn hàng từ phía client
    const updateOrderStatus = (orderId, newStatus) => {
        const confirmChange = window.confirm("Are you sure you want to update status?");
        if (!confirmChange) return;
        editData2(`/api/orders/client-update/${orderId}`, { status: newStatus })
        .then(() => {
            // refresh lại current page
            fetchOrders();
        })
        .catch((err) => console.error('Error updating order status:', err));
    };

    const continueCheckout = async(orderId, totalAmount) => {
        const newTxnRef = `${orderId}-${Date.now()}`;
        const response = await postData3("/api/orders/vnpay/test/test/create_payment_url", {
            amount: totalAmount,
            orderId: newTxnRef,
            bankCode: "", // optional
            orderDescription: "Payment for Order " + orderId,
        });

        if (response.url) {
            window.location.href = response.url; // Redirect to VNPAY
        } else {
            alert("Could not initiate VNPAY payment.");
        }
    }

    return (
        <>
            <section className="section">
                <div className='container'>
                    <h2 className='hd'>Orders</h2>
                    <div className='row p-3'>
                        <div className="col-md-2">
                            <label className='fw-bold'>Start Date</label>
                            <input
                            type="date"
                            value={startDate}
                            className="form-control"
                            onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className='fw-bold'>End Date</label>
                            <input
                            type="date"
                            value={endDate}
                            className="form-control"
                            onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-8 d-flex align-items-end">
                            <p className="text-danger mb-0 fst-italic">
                            *Cannot be cancelled if the order has been verified!
                            </p>
                        </div>
                    </div>
                    <div className='table-responsive orderTable'>
                        <table className='table table-striped table-bordered'>
                            <thead className='thead-light'>
                                <tr>
                                    <th>Order Id</th>
                                    <th>Products</th>
                                    <th>Discount</th>
                                    <th>Total Amount</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Phone Number</th>
                                    <th>Payment Method</th>
                                    <th>Shipping Method</th>
                                    <th>Address</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    orders.length > 0 ? (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td>
                                                    <span className="text-blue font-weight-bold">
                                                    {order.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                    className="text-blue font-weight-bold cursor"
                                                    onClick={() => showProducts(order.id)}
                                                    >
                                                        Click here to view
                                                    </span>
                                                </td>
                                                <td>${order.orderDiscount}</td>
                                                <td>${order.amount}</td>
                                                <td>
                                                    {order.status === 'pending' && (
                                                        <span className="badge badge-danger">Pending</span>
                                                    )}
                                                    {order.status === 'verified' && (
                                                        <span className="badge badge-info">Verified</span>
                                                    )}
                                                    {order.status === 'cancelled' && (
                                                        <span className="badge badge-secondary">Cancelled</span>
                                                    )}
                                                    {order.status === 'delivered' && (
                                                        <span className="badge badge-success">Delivered</span>
                                                    )}
                                                </td>
                                                <td>{order.date.split('T')[0]}</td>
                                                <td>{order.name}</td>
                                                <td>{order.phoneNumber}</td>
                                                <td>
                                                    <span className="text-blue font-weight-bold">
                                                        {order.payment}
                                                    </span>
                                                </td>
                                                <td>{order.shippingMethod}</td>
                                                <td>{order.address}</td>
                                                <td>
                                                    {order.status === 'pending' &&
                                                     order.payment === 'VNPAY' && 
                                                    (
                                                        <button
                                                        className="btn btn-primary btn-sm mr-1"
                                                        onClick={() =>
                                                            continueCheckout(order.id, order.amount)
                                                        }
                                                        >
                                                        Continue
                                                        </button>
                                                    )}
                                                    {order.status === 'pending' &&
                                                    // order.payment === 'Cash on Delivery' && 
                                                    (
                                                        <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            updateOrderStatus(order.id, 'cancelled')
                                                        }
                                                        >
                                                        Cancel
                                                        </button>
                                                    )}
                                                    {/* {order.status === 'verified' && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() =>
                                                        updateOrderStatus(order.id, 'paid')
                                                        }
                                                    >
                                                       Pay
                                                    </button>
                                                    )} */}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                    <tr>
                                        <td colSpan="10" className="text-center">
                                        No orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex justify-content-center mt-4">
                        <Pagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        />
                    </div>
                </div>
            </section>


            <Dialog open={isOpenModal} onClose={() => setIsOpenModal(false)} className="productModal" >
                <Button className='close_' onClick={() => setIsOpenModal(false)}><MdClose /></Button>
                <h4 class="mb-1 font-weight-bold pr-5 mb-4">Products</h4>

                <div className='table-responsive orderTable'>
                    <table className='table table-striped table-bordered'>
                        <thead className='thead-light'>
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
                            {products.length > 0 ? (
                                products.map((item) => (
                                <tr key={item.productId}>
                                    <td>{item.productId}</td>
                                    <td style={{ whiteSpace: 'inherit' }}>
                                        {item.productTitle.length > 30
                                            ? `${item.productTitle.substr(0, 30)}…`
                                            : item.productTitle}
                                    </td>
                                    <td>
                                        <div className="img">
                                            <img
                                            src={item.image}
                                            alt={item.productTitle}
                                            />
                                        </div>
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td>${item.price}</td>
                                    <td>${item.subTotal}</td>
                                </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">
                                        No products to display.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Dialog>

        </>
    )
}

export default Orders;
import React, { useContext, useEffect, useState } from 'react';
import { editData, editData2, fetchDataFromApi } from '../../utils/api';
import Pagination from '@mui/material/Pagination';
import Dialog from '@mui/material/Dialog';
import { MdClose } from "react-icons/md";
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { MyContext } from "../../App";

const Orders = () => {

    const [orders, setOrders] = useState([]);
    const [products, setproducts] = useState([]);
    const [page, setPage] = useState(1);

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLogin,setIsLogin]  = useState(false);

    const context = useContext(MyContext);

    const history = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);

        const token = localStorage.getItem("token");
        if(token!=="" && token!==undefined  && token!==null){
          setIsLogin(true);
        }
        else{
          history("/signIn");
        }

        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/orders/user?userid=${user?.userId}`).then((res) => {
            setOrders(res);
        })

        
    context.setEnableFilterTab(false);

    }, []);




    const showProducts = (id) => {
        fetchDataFromApi(`/api/orders/${id}`).then((res) => {
            setIsOpenModal(true);
            setproducts(res.products);
        })
    }
 // Hàm cập nhật trạng thái đơn hàng từ phía client
    const updateOrderStatus = (orderId, newStatus) => {
        // gọi API PUT /api/orders/client-update/:id
        editData2(`/api/orders/client-update/${orderId}`, { status: newStatus }).then(res => {
            console.log(res)
            console.log('res id',res.order._id)
            if(res  && res.order._id){
                // Cập nhật lại danh sách orders sau khi cập nhật trạng thái
                const user = JSON.parse(localStorage.getItem("user"));
                fetchDataFromApi(`/api/orders/user?userid=${user?.userId}`).then((res) => {
                    console.log(res);
                    setOrders(res);
                });
            }
        }).catch(err => {
            console.error("Error updating order status:", err);
        });
    }

    return (
        <>
            <section className="section">
                <div className='container'>
                    <h2 className='hd'>Orders</h2>

                    <div className='table-responsive orderTable'>
                        <table className='table table-striped table-bordered'>
                            <thead className='thead-light'>
                                <tr>
                                    <th>Order Id</th>
                                    <th>Name</th>
                                    <th>Phone Number</th>
                                    <th>Products</th>
                                    <th>Payment Method</th>
                                    <th>Address</th>
                                    <th>Pincode</th>
                                    <th>Total Amount</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    orders?.length !== 0 && orders?.map((order, index) => {
                                        return (
                                            <>
                                                <tr key={index}>
                                                    <td><span className='text-blue fonmt-weight-bold'>{order?.id}</span></td>
                                                    <td>{order?.name}</td>
                                                    <td>{order?.phoneNumber}</td>
                                                    <td><span className='text-blue fonmt-weight-bold cursor' onClick={() => showProducts(order?._id)}>Click here to view</span></td>
                                                    <td><span className='text-blue fonmt-weight-bold'>{order?.payment}</span></td>
                                                    <td>{order?.address}</td>
                                                    <td>{order?.pincode}</td>
                                                    <td>{order?.amount}</td>
                                                    <td>
                                                        {order?.status === "pending" ?
                                                            <span className='badge badge-danger'>{order?.status}</span> 
                                                        : order?.status === "verify" ? 
                                                            <span className='badge badge-info'>{order?.status}</span> 
                                                        : order?.status === "cancel" ?
                                                            <span className='badge badge-secondary'>{order?.status}</span>
                                                        : order?.status === "paid" ?
                                                            <span className='badge badge-success'>{order?.status}</span>
                                                        : <span>{order?.status}</span>
                                                        }
                                                    </td>
                                                    <td>{order?.date?.split("T")[0]}</td>
                                                    <td>
                                                        {/* Logic hiển thị nút hành động */}
                                                        {order.status === "pending" && order.payment === "Cash on Delivery" && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'cancel')} className="btn btn-danger btn-sm">Cancel</button>
                                                        )}
                                                        {order.status === "verify" && (
                                                            <button onClick={() => updateOrderStatus(order.id, 'paid')} className="btn btn-success btn-sm">Paid</button>
                                                        )}
                                                        {/* Nếu đã cancel hoặc paid thì không có nút nào */}
                                                    </td>
                                                </tr>

                                            </>

                                        )
                                    })
                                }

                            </tbody>


                        </table>
                    </div>


                   

                </div>
            </section>


            <Dialog open={isOpenModal} className="productModal" >
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
                            {
                                products?.length !== 0 && products?.map((item, index) => {
                                    return (
                                        <tr>
                                            <td>{item?.productId}</td>
                                            <td  style={{whiteSpace:"inherit"}}><span>
                                                {item?.productTitle?.substr(0,30)+'...'}
                                            </span></td>
                                            <td>
                                                <div className='img'>
                                                    <img src={item?.image} />
                                                </div>
                                            </td>
                                            <td>{item?.quantity}</td>
                                            <td>{item?.price}</td>
                                            <td>{item?.subTotal}</td>
                                        </tr>
                                    )
                                })
                            }

                        </tbody>
                    </table>
                </div>
            </Dialog>

        </>
    )
}

export default Orders;
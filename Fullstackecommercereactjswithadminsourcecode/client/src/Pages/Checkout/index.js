import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoBagCheckOutline } from "react-icons/io5";

import { MyContext } from "../../App";
import { fetchDataFromApi, postData, deleteData, editData } from "../../utils/api";

import { useNavigate } from "react-router-dom";

import { PayPalButton } from "react-paypal-button-v2";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    fullName: "",
    country: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
    note: ""
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState();
  const [orderId, setOrderId] = useState(null);
  const [usedCode, setUsedCode] = useState(false);
  const [promotionCode, setPromotionCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [currentPromotion, setCurrentPromotion] = useState({
    _id: "",
    code: "",
    description: "",
    usedCount: 0,
    discountPercent: 0,
    maxUsage: 0,
    userIds: [],
    status: "",
    createdAt: "",
    updatedAt: "",
    __v: 0,
    users: [],
    id: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    
    context.setEnableFilterTab(false);
    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
      setCartData(res);

      setTotalAmount(
        res?.length !== 0 ? 
          res?.map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0) : 0
            -
            (discount > 0 ? ( 
              (res?.length !== 0 ? 
                res?.map((item) => parseInt(item.price) * item.quantity)
                        .reduce((total, value) => total + value, 0) 
                        : 0
                      ) 
                      * (discount / 100)
                )
              : 0
            )
      );
    });
  }, []);

  useEffect(() => {
    console.log(totalAmount);
  },[totalAmount])

  //Chỉnh lại để khi  nào nhấn checkout thì mới thêm vào promotioncode, đồng thời chỉnh sửa chỗ kiểm tra đã có user chưa, 
  const handlePromotionCode = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if(promotionCode !== ""){
      fetchDataFromApi(`/api/search/promotionCode?q=${promotionCode}`).then((res) => {
        if (res.data.length > 0 &&
            res.data[0].code === promotionCode &&
            res.data[0].status === "active" &&
            res.data[0].usedCount < res.data[0].maxUsage &&
            !res.data[0].users.some((existingUser) => existingUser.userId === user.userId)) {
          setCurrentPromotion(res.data[0]);
          
          setDiscount(res.data[0].discountPercent); // Áp dụng discount
          context.setAlertBox({
            open: true,
            error: false,
            msg: "Promotion code applied successfully!",
          });
          if (usedCode === false){
            setTotalAmount(totalAmount - (totalAmount * (res.data[0].discountPercent) / 100));
            setUsedCode(true);
          }
          console.log(totalAmount);
        } else {
          setDiscount(0);
          console.log(discount);
          setUsedCode(false);
          setTotalAmount(
            cartData?.length !== 0 ? 
            cartData?.map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0) : 0
          );
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Invalid or already used promotion code.",
          });
        }
      });
    }
    else{
      setDiscount(0);
      setUsedCode(false);
      setTotalAmount(
        cartData?.length !== 0 ? 
        cartData?.map((item) => parseInt(item.price) * item.quantity)
        .reduce((total, value) => total + value, 0) : 0
      );
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Invalid or already used promotion code.",
      });
    }
  };
  useEffect(()=>{
    console.log(discount);
  },[discount])
  

  const onChangeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));

    const { name, value } = e.target;
    if (name === "paymentMethod"){ 
      setPaymentMethod(value)
      // console.log(value);
    };
    if (name === "shippingMethod") setShippingMethod(value);
  };

  const context = useContext(MyContext);
  const userContext = context.user;
  const userAddress = context.selectedAddress;
  useEffect(() => {
    setFormFields(prev => ({
      ...prev,
      fullName: userContext.name || prev.fullName,
      phoneNumber: userAddress?.phoneNumber || prev.phoneNumber,
      email: userAddress?.email || prev.email,
      streetAddress: userAddress?.address,
    }));
  }, [userContext, userAddress]);

  const history = useNavigate();

  const checkout = async (e) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUsers = [...currentPromotion.users, { userId: user.userId, username: user.name }]; // Thêm user mới
    const updatedUsedCount = currentPromotion.usedCount + 1;
    // Cập nhật dữ liệu
    const updatedPromotion = {
      ...currentPromotion,
      users: updatedUsers,
      usedCount: updatedUsedCount,
    };
      if (user.status !== "active") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "You are banned!",
        });
        return;
      }
    // const user = JSON.parse(localStorage.getItem("user"));
    // if(user.status === 'active'){
      e.preventDefault();
      if (!cartData || cartData.length === 0) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Cart is empty!",
        });
        return;
      }
      console.log(cartData);

      console.log(formFields);
      if (formFields.fullName === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill full name ",
        });
        return false;
      }

      // if (formFields.country === "") {
      //   context.setAlertBox({
      //     open: true,
      //     error: true,
      //     msg: "Please fill country ",
      //   });
      //   return false;
      // }

      if (formFields.streetAddressLine1 === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill Street address",
        });
        return false;
      }

      // if (formFields.streetAddressLine2 === "") {
      //   context.setAlertBox({
      //     open: true,
      //     error: true,
      //     msg: "Please fill  Street address",
      //   });
      //   return false;
      // }

      // if (formFields.city === "") {
      //   context.setAlertBox({
      //     open: true,
      //     error: true,
      //     msg: "Please fill city ",
      //   });
      //   return false;
      // }

      // if (formFields.state === "") {
      //   context.setAlertBox({
      //     open: true,
      //     error: true,
      //     msg: "Please fill state ",
      //   });
      //   return false;
      // }

      // if (formFields.zipCode === "") {
      //   context.setAlertBox({
      //     open: true,
      //     error: true,
      //     msg: "Please fill zipCode ",
      //   });
      //   return false;
      // }

      if (formFields.phoneNumber === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill phone Number ",
        });
        return false;
      }

    if (formFields.email === "") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill email",
      });
      return false;
    }

    if (!paymentMethod) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Select payment method!",
      });
      return false;
    }
    if (!shippingMethod) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Select shipping method!",
      });
      return false;
    }

      const addressInfo = {
        name: formFields.fullName,
        phoneNumber: formFields.phoneNumber,
        address: formFields.streetAddress,
        pincode: formFields.zipCode,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };


    // const user = JSON.parse(localStorage.getItem("user"));

    const payLoad = {
      name: addressInfo.name,
      phoneNumber: formFields.phoneNumber,
      address: addressInfo.address,
      pincode: addressInfo.pincode,
      amount: parseInt(totalAmount),
      payment: paymentMethod,
      email: formFields.email,
      userid: user.userId,
      products: cartData,
      orderDiscount: discount,
      note: formFields.note,
      date:addressInfo?.date,
      // totalSpent: user.totalSpent + parseInt(totalAmount),
    };
    // localStorage.setItem("user", JSON.stringify(user));

    // user.totalSpent = user.totalSpent + parseInt(totalAmount);
    console.log(payLoad)
      
    try {
      const createdOrder = await postData('/api/orders/create', payLoad);
      editData(`/api/promotionCode/${currentPromotion.id}`, updatedPromotion).then((res) => { });
      console.log('Created Order:', createdOrder);
      
      setOrderId(createdOrder._id);

      // user.totalSpent = (user.totalSpent || 0) + parseInt(totalAmount);
      // localStorage.setItem("user", JSON.stringify(user));

      if (paymentMethod === "Paypal") {
          // Đơn hàng sẽ được xử lý qua PayPal, frontend sẽ tạo PayPal order sau khi nhận orderId
          context.setAlertBox({
              open: true,
              error: false,
              msg: "Order created. Please proceed with PayPal payment.",
          });
      } else {
          // Xử lý Cash on Delivery
          cartData.forEach(async (item) => {
              await deleteData(`/api/cart/${item.id}`);
          });
          context.getCartData();
          history("/orders");
      }
    } catch (error) {
        console.error('Error during checkout:', error);
        context.setAlertBox({
            open: true,
            error: true,
            msg: "Checkout failed. Please try again.",
        });
    }
};

  const createOrder = async (data, actions) => {
    const response = await postData('/api/orders/create-paypal-order', {orderId});

    if(response.id){
      return response.id;
    }else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Failed to create PayPal order. Please try again.",
      });
      throw new Error("Failed to create PayPal order");
    }
  }
  const handleCapturePayPalOrder = async (paypalOrderId) => {
    try {
        const response = await postData('/api/orders/capture-paypal-order', { paypalOrderId, orderId });
        if (response.success) {
            // Xóa giỏ hàng
            cartData.forEach(async (item) => {
                await deleteData(`/api/cart/${item.id}`);
            });
            context.getCartData();
            history("/orders");
        } else {
            context.setAlertBox({
                open: true,
                error: true,
                msg: "PayPal payment failed. Please try again.",
            });
        }
    } catch (error) {
        console.error('Error capturing PayPal order:', error);
        context.setAlertBox({
            open: true,
            error: true,
            msg: "PayPal payment failed. Please try again.",
        });
    }
  };

  return (
    <section className="section">
      <div className="container">
        <form className="checkoutForm" onSubmit={checkout}>
          <div className="row">
            <div className="col-md-8">
              <h2 className="hd">BILLING DETAILS</h2>

              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="form-group">
                    <TextField
                      label="Full Name *"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="fullName"
                      value={userContext?.name}
                      onChange={onChangeInput}
                    />
                  </div>
                </div>

                {/* <div className="col-md-6">
                  <div className="form-group">
                    <TextField
                      label="Country *"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="country"
                      onChange={onChangeInput}
                    />
                  </div>
                </div> */}
              </div>

              <h6>Street address *</h6>

              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <TextField
                      label="House number and street name"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="streetAddress"
                      value={userAddress?.address}
                      onChange={onChangeInput}
                    />
                  </div>

                  <div className="form-group">
                    <TextField
                      label="Another note. (optional)"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="note"
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div>

              {/* <h6>Town / City *</h6>

              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <TextField
                      label="City"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="city"
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div> */}

              {/* <h6>State / County *</h6>

              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <TextField
                      label="State"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="state"
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div> */}

              {/* <h6>Postcode / ZIP *</h6>

              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <TextField
                      label="ZIP Code"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="zipCode"
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div> */}

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="phoneNumber"
                      value={userAddress?.phoneNumber}
                      onChange={onChangeInput}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group">
                    <TextField
                      label="Email Address"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="email"
                      value={userAddress?.email}
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div>
              <div className="row d-flex mb-2">
                <div className="col-md-9">
                  <div className="form-group">
                    <TextField
                      label="Promotion Code (Optional)"
                      variant="outlined"
                      size="small"
                      name="promotionCode"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value)}
                      fullWidth
                    />
                  </div>
                </div>
                <Button onClick={handlePromotionCode} variant="contained" color="primary">
                  Apply Promotion
                </Button>
              </div>
            </div>
            
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="paymentMethod"
                    className="form-control"
                    onChange={onChangeInput}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="Paypal">PayPal</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                  </select>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Shipping Method *</label>
                  <select
                    name="shippingMethod"
                    className="form-control"
                    onChange={onChangeInput}
                  >
                    <option value="">Select Shipping Method</option>
                    <option value="standard">Standard Shipping</option>
                    <option value="express">Express Shipping</option>
                  </select>
                </div>
              </div>
            </div>
            

            <div className="col-md-4">
              <div className="card orderInfo">
                <h4 className="hd">YOUR ORDER</h4>
                <div className="table-responsive mt-3">
                  <table className="table table-borderless">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>

                    <tbody>
                      {cartData?.length !== 0 &&
                        cartData?.map((item, index) => {
                          return (
                            <tr>
                              <td>
                                {item?.productTitle?.substr(0, 20) + "..."}{" "}
                                <b>× {item?.quantity}</b>
                              </td>

                              <td>
                                {item?.subTotal?.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                              </td>
                            </tr>
                          );
                        })}

                      <tr>
                        <td>Subtotal </td>

                        <td>
                          {(cartData?.length !== 0
                            ? cartData
                                ?.map(
                                  (item) => parseInt(item.price) * item.quantity
                                )
                                .reduce((total, value) => total + value, 0)
                            : 0
                          )?.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Discount</td>
                        <td>
                          {discount}%
                        </td>
                      </tr>
                      <tr>
                        <td>Total</td>
                        <td>
                          {(
                            (cartData?.length !== 0
                              ? cartData
                                  ?.map(
                                    (item) => parseInt(item.price) * item.quantity
                                  )
                                  .reduce((total, value) => total + value, 0)
                              : 0) - 
                            // Trừ đi phần discount
                            (discount > 0
                              ? (
                                  (cartData?.length !== 0
                                    ? cartData
                                        ?.map(
                                          (item) => parseInt(item.price) * item.quantity
                                        )
                                        .reduce((total, value) => total + value, 0)
                                    : 0
                                  ) * (discount / 100)
                                )
                              : 0)
                          )?.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {paymentMethod === "Paypal" && orderId ? (
                  <PayPalScriptProvider options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID }}>
                      <PayPalButtons
                          style={{ layout: 'vertical' }}
                          createOrder={createOrder}
                          onApprove = { async (data, actions) => {
                              await  handleCapturePayPalOrder(data.orderID)
                          }}
                          onError={(err) => {
                              console.error('PayPal Checkout onError:', err);
                              context.setAlertBox({
                                  open: true,
                                  error: true,
                                  msg: "PayPal payment failed. Please try again.",
                              });
                          }}
                      />
                  </PayPalScriptProvider>
                ) : (
                  <Button
                    type="submit"
                    className="btn-blue bg-red btn-lg btn-big">
                      <IoBagCheckOutline /> &nbsp; Checkout
                  </Button>
                )}

              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};


export default Checkout;
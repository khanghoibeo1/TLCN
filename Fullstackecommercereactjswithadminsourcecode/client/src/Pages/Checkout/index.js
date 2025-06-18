import React, { useContext, useEffect, useState } from "react";
import { IoBagCheckOutline } from "react-icons/io5";
import { getDistance } from "geolib";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  IconButton,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Stack,
  Paper
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { MyContext } from "../../App";
import { fetchDataFromApi, postData3, postData, deleteData, editData, editData2 } from "../../utils/api";

import { useNavigate } from "react-router-dom";

import { PayPalButton } from "react-paypal-button-v2";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { create } from "@mui/material/styles/createTransitions";

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    fullName: "",
    streetAddress: "",
    phoneNumber: "",
    email: "",
    note: ""
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [shippingMethod, setShippingMethod] = useState('');
  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [orderId, setOrderId] = useState(null);
  // const [usedCode, setUsedCode] = useState(false);
  const [promotionCodeList, setPromotionCodeList] = useState([]);
  // const [promotionCode, setPromotionCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [shippingFeeDiscount, setShippingFeeDiscount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedPromotions, setSelectedPromotions] = useState([]);
  const [tempSelection, setTempSelection] = useState([]);
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
  
  const context = useContext(MyContext);
  const userContext = context.user;
  const userAddress = context.selectedAddress;
  const country = context.selectedCountry;

  useEffect(() => {
    if (
      !userAddress?.lat || !userAddress?.lng ||
      !country?.lat || !country?.lng
    ) {
      return; // nếu thiếu dữ liệu thì thoát không tính phí
    }
    const distanceMeters = getDistance(
      { latitude: userAddress?.lat, longitude: userAddress?.lng },
      { latitude: country?.lat, longitude: country?.lng }
    );
    const distanceKm = distanceMeters / 1000;
 
    let fee = 0;
    if (distanceKm <= 3) fee = 0;
    else if (distanceKm <= 10) fee = 1;
    else if (distanceKm <= 20) fee = 2;
    else fee = 3;

    if (shippingMethod === "express") {
      fee = parseFloat((fee * 1.3).toFixed(2)); // tăng 30%
    }
    setShippingFee(fee)
  },[shippingMethod, userAddress, country]);
console.log(formFields.streetAddress)
  useEffect(() => {
    setFormFields(prev => ({
      ...prev,
      fullName: userAddress?.name || prev.fullName,
      phoneNumber: userAddress?.phoneNumber || prev.phoneNumber,
      email: userContext.email || prev.email,
      streetAddress: userAddress?.address || prev.streetAddress,
    }));
  }, [userContext, userAddress]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setShippingMethod('standard')
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

  const toggleDialog = () => {
    setTempSelection(selectedPromotions);
    setOpen(!open);
  };

  const handleTogglePromo = (promo) => {
    const exists = tempSelection.some((p) => p.code === promo.code);
    let currentSelection = [...tempSelection];

    // Nếu đã có => bỏ chọn
    if (exists) {
      currentSelection = currentSelection.filter((p) => p.code !== promo.code);
      setTempSelection(currentSelection);
      return;
    }
    
    if (
      promo.status === "hide" ||
      promo.usedCount >= promo.maxUsage ||
      promo.users.some((existingUser) => existingUser.userId === useContext.userId) ||
      promo.minOrderValue >= totalAmount
    ) {
      return;
    }


    // Kiểm tra logic chọn trước khi thêm
    const hasShipping = currentSelection.some((p) => p.type === "shipping");
    const hasNonCombinable = currentSelection.some((p) => !p.canCombine && p.type !== "shipping");

    // Nếu đã có non-combinable (không phải shipping), không cho chọn thêm non-combinable khác
    if (hasNonCombinable && promo.type !== "shipping" && !promo.canCombine) return;

    // Nếu đã có shipping, không cho thêm shipping nữa
    if (promo.type === "shipping" && hasShipping) return;

    // Nếu hợp lệ => thêm vào
    setTempSelection([...currentSelection, promo]);
  };

  const handleApply = () => {
    console.log(tempSelection)
    setSelectedPromotions(tempSelection);
    setOpen(false);
  };

  useEffect(() => {
    if (!cartData || !selectedPromotions) return;

    const cartItems = Array.isArray(cartData) ? cartData : [cartData];
    let productTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let productDiscount = 0;
    let shippingFeeDiscount = 0;

    const sortedPromotions = [...selectedPromotions].sort((a, b) => {
      if (a.type === 'product' && b.type === 'shipping') return -1;
      if (a.type === 'shipping' && b.type === 'product') return 1;

      if (a.type === 'product' && b.type === 'product') {
        const aHasCat = Array.isArray(a.applicableCategoryIds) && a.applicableCategoryIds.length > 0;
        const bHasCat = Array.isArray(b.applicableCategoryIds) && b.applicableCategoryIds.length > 0;
        if (aHasCat && !bHasCat) return -1;
        if (!aHasCat && bHasCat) return 1;
      }

      return 0;
    });

    sortedPromotions.forEach(promo => {
      if (promo.status !== 'active') return;

      if (promo.type === 'product') {
        const applicableItems =
          promo.applicableCategoryIds.length > 0
            ? cartItems.filter(item => promo.applicableCategoryIds.includes(item.categoryId))
            : cartItems;

        const applicableTotal = applicableItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        if (applicableTotal >= (promo.minOrderValue || 0)) {
          let discount = 0;
          if (promo.discountType === 'percent') {
            discount = applicableTotal * (promo.discountValue / 100);
          } else {
            discount = Math.min(applicableTotal, promo.discountValue);
          }
          productTotal -= discount;
          productDiscount += discount;
        }
      }

      if (promo.type === 'shipping') {
        if (productTotal >= (promo.minOrderValue || 0)) {
          let discount = 0;
          if (promo.discountType === 'percent') {
            console.log(shippingFee)
            discount = shippingFee * (promo.discountValue / 100);
          } else {
            discount = Math.min(shippingFee, promo.discountValue);
          }
          shippingFeeDiscount += discount;
        }
      }
    });
            console.log(shippingFeeDiscount)

    setDiscount(productDiscount);              // chỉ discount của product
    setShippingFeeDiscount(shippingFeeDiscount); // discount của shipping riêng
  }, [selectedPromotions, cartData, promotionCodeList, shippingMethod, shippingFee]);




  const handleDelete = (code) => {
    setTempSelection((prev) => prev.filter((p) => p.code !== code));
    setSelectedPromotions((prev) => prev.filter((p) => p.code !== code));
  };

  useEffect(() => {
    console.log(totalAmount);
  },[totalAmount])

  useEffect(() => {
    if (!userContext?.userId || !cartData?.length) return;
    const query = `?userId=${userContext?.userId}&cart=${encodeURIComponent(JSON.stringify(cartData))}`;

    fetchDataFromApi(`/api/promotionCode/getPromotionCodeWithCondition${query}`)
    .then((res) => {
      console.log("Promotion response:", res);
      setPromotionCodeList(res.data)
    })
    .catch((err) => {
      console.error("Error fetching promotion:", err);
    });
  },[cartData])
  
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
    if (name === "shippingMethod"){
      setShippingMethod(value);
    }
  };


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
      e.preventDefault();
      if (!cartData || cartData.length === 0) {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Cart is empty!",
        });
        return;
      }
      if (formFields.fullName === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please choose User Address ",
        });
        return false;
      }

      if (formFields.streetAddress === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please choose User Address",
        });
        return false;
      }

      if (formFields.phoneNumber === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please choose User Address ",
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
        date: new Date().toLocaleString("sv-SE", {
          timeZone: "Asia/Ho_Chi_Minh",
          hour12: false,
        }),
      };


    const payLoad = {
      name: addressInfo.name,
      phoneNumber: addressInfo.phoneNumber,
      address: addressInfo.address,

      amount: parseInt(totalAmount - discount + shippingFee - shippingFeeDiscount),
      shippingMethod: shippingMethod,

      payment: paymentMethod,
      email: formFields.email,
      userid: user.userId,
      products: cartData,
      orderDiscount: discount,
      shippingFee: shippingFee-shippingFeeDiscount,
      note: formFields.note,
      date:addressInfo?.date,
      locationId:country?.id,
      locationName:country?.location,
      // totalSpent: user.totalSpent + parseInt(totalAmount),
    };
    // localStorage.setItem("user", JSON.stringify(user));

    // user.totalSpent = user.totalSpent + parseInt(totalAmount);
    console.log(payLoad)
      
    try {
      
      const createdOrder = await postData3('/api/orders/create', payLoad);
      // Nếu selectedPromotion là một mảng các promotion
      for (const promo of selectedPromotions) {
        const updatedPromo = {
          ...promo,
          users: [...(promo.users || []), { userId: user.userId, username: user.name }],
          usedCount: (promo.usedCount || 0) + 1,
        };
        await editData(`/api/promotionCode/${promo.id}`, updatedPromo);
      }
      console.log('Created Order:', createdOrder);
      
      setOrderId(createdOrder._id);

      // user.totalSpent = (user.totalSpent || 0) + parseInt(totalAmount);
      // localStorage.setItem("user", JSON.stringify(user));

      if (paymentMethod === "VNPAY") {
        const response = await postData3("/api/orders/vnpay/test/test/create_payment_url", {
          amount: (totalAmount - (discount > 0? discount : 0) +  (shippingFee > 0? shippingFee: 0) -  (shippingFeeDiscount > 0 ? shippingFeeDiscount: 0) ),
          orderId: createdOrder._id,
          bankCode: "", // optional
          orderDescription: "Payment for Order " + orderId,
        });

        if (response.url) {
          window.location.href = response.url; // Redirect to VNPAY
        } else {
          alert("Could not initiate VNPAY payment.");
        }
        return false;

      } 

      if (paymentMethod === "Paypal") {
          // Đơn hàng sẽ được xử lý qua PayPal, frontend sẽ tạo PayPal order sau khi nhận orderId
          context.setAlertBox({
              open: true,
              error: false,
              msg: "Order created. Please proceed with PayPal payment.",
          });
      } else {
          // Xử lý Cash on Delivery
          await Promise.all(cartData.map(item => deleteData(`/api/cart/${item.id}`)));

          context.getCartData();
          history("/orders");
      }
    } catch (error) {
        console.error('Error during checkout:', error);
        context.setAlertBox({
            open: true,
            error: true,
            msg: error?.response?.data?.message || "Checkout failed. Please try again.",
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
            await Promise.all(cartData.map(item => deleteData(`/api/cart/${item.id}`)));
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
                    <h6>Full Name *</h6>
                    <TextField
                      label=""
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="fullName"
                      value={userAddress?.name}
                      onChange={onChangeInput}
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </div>

              <h6>Street address *</h6>

              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <TextField
                      label=""
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="streetAddress"
                      value={userAddress?.address}
                      onChange={onChangeInput}
                      InputProps={{ readOnly: true }}
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

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>Phone Number*</h6>
                    <TextField
                      label=""
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="phoneNumber"
                      value={userAddress?.phoneNumber}
                      onChange={onChangeInput}
                      InputProps={{ readOnly: true }}
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
                      value={userContext?.email}
                      // InputProps={{ readOnly: true }}
                    />
                  </div>
                </div>
              </div>
              <div className="row d-flex mb-2">
                <Box className="mb-3">
                  <Typography variant="subtitle1" gutterBottom>
                    Applied Promotions
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedPromotions.map((promo) => (
                      <Chip
                        key={promo.code}
                        label={promo.code}
                        onDelete={() => handleDelete(promo.code)}
                        color="primary"
                      />
                    ))}
                    <Button variant="outlined" onClick={toggleDialog}>
                      Select Promotions
                    </Button>
                  </Box>

                  <Dialog open={open} onClose={toggleDialog} fullWidth maxWidth="sm">
                    <DialogTitle>
                      Choose Promotions
                      <IconButton
                        aria-label="close"
                        onClick={toggleDialog}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                      <Stack spacing={2}>
                        {promotionCodeList.map((promo) => {
                          const checked = tempSelection.some((p) => p.code === promo.code);
                          // const disabled =
                          //   (!checked &&
                          //     selectedPromotions.some((p) => !p.canCombine && p.type !== "shipping") &&
                          //     promo.type !== "shipping" &&
                          //     !promo.canCombine) ||
                          //   (!checked &&
                          //     promo.type === "shipping" &&
                          //     selectedPromotions.some((p) => p.type === "shipping"));

                          return (
                            <Paper
                              key={promo.code}
                              variant="outlined"
                              sx={{ padding: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}
                            >
                              <Checkbox
                                checked={checked}
                                onChange={() => handleTogglePromo(promo)}
                                // disabled={disabled}
                                sx={{ mt: 0.5 }}
                              />
                              <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {promo.code} ({promo.type === 'shipping' ? 'Shipping' : 'Product'})
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {promo.description || 'No description'}
                                </Typography>
                                {promo.canCombine && (
                                  <Chip
                                    label="Can Combine"
                                    size="small"
                                    color="success"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={toggleDialog}>Cancel</Button>
                      <Button onClick={handleApply} variant="contained">
                        Apply
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
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
                    <option value="VNPAY">VNPAY</option>
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
                      <tr style={{ borderTop: '2px solid #ccc' }}></tr>
                      <tr>
                        <td>Subtotal </td>
                        <td>
                          {totalAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Discount</td>
                        <td>
                          {discount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>Shipping Fee</td>
                        <td>
                          {(shippingFee - shippingFeeDiscount).toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "USD",
                                })}
                          {shippingFeeDiscount > 0 && (
                            <span style={{ color: "green", marginLeft: "8px" }}>
                              ( -{shippingFeeDiscount.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })})
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td style={{color: "red"}}>Total</td>
                        <td style={{color: "red"}}>
                          {(
                            totalAmount - 
                            // Trừ đi phần discount
                            (discount > 0
                              ? discount
                              : 0) + 
                              (shippingFee > 0
                              ? shippingFee
                              : 0) - 
                                (shippingFeeDiscount > 0
                                ? shippingFeeDiscount
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
import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { IoBagCheckOutline } from "react-icons/io5";

import { MyContext } from "../../App";
import { fetchDataFromApi, postData, deleteData, editData } from "../../utils/api";

import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    fullName: "",
    country: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
  });

  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState();

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
        res.length !== 0 &&
          res
            .map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0)
            -
            (discount > 0 ? ( 
              (cartData?.length !== 0 ? 
                cartData ?.map((item) => parseInt(item.price) * item.quantity)
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

  const onChangeInput = (e) => {
    setFormFields(() => ({
      ...formFields,
      [e.target.name]: e.target.value,
    }));
  };
  //Chỉnh lại để khi  nào nhấn checkout thì mới thêm vào promotioncode, đồng thời chỉnh sửa chỗ kiểm tra đã có user chưa, 
  const handlePromotionCode = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/search/promotionCode?q=${promotionCode}`).then((res) => {
      if (res.data[0].code === promotionCode &&
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
          
      } else {
        setDiscount(0);
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Invalid or already used promotion code.",
        });
      }
    });
  };

  useEffect(()=>{
    console.log(discount);
  },[discount])
  

  const context = useContext(MyContext);
  const history = useNavigate();

  const checkout = (e) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const updatedUsers = [...currentPromotion.users, { userId: user.userId, username: user.name }]; // Thêm user mới
    const updatedUsedCount = currentPromotion.usedCount + 1;
    // Cập nhật dữ liệu
    const updatedPromotion = {
      ...currentPromotion,
      users: updatedUsers,
      usedCount: updatedUsedCount,
    };

    if(user.status === 'active'){
      e.preventDefault();

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

      if (formFields.country === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill country ",
        });
        return false;
      }

      if (formFields.streetAddressLine1 === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill Street address",
        });
        return false;
      }

      if (formFields.streetAddressLine2 === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill  Street address",
        });
        return false;
      }

      if (formFields.city === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill city ",
        });
        return false;
      }

      if (formFields.state === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill state ",
        });
        return false;
      }

      if (formFields.zipCode === "") {
        context.setAlertBox({
          open: true,
          error: true,
          msg: "Please fill zipCode ",
        });
        return false;
      }

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

      const addressInfo = {
        name: formFields.fullName,
        phoneNumber: formFields.phoneNumber,
        address: formFields.streetAddressLine1 + formFields.streetAddressLine2,
        pincode: formFields.zipCode,
        date: new Date().toLocaleString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };
      //Sửa lại promotion code để thêm user này vào và tăng số lượng người app mã
      //đặt dòng này sau các thao tác và chuyển đến phần xử lý
      editData(`/api/promotionCode/${currentPromotion.id}`, updatedPromotion).then((res) => { });

      var options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        key_secret: process.env.REACT_APP_RAZORPAY_KEY_SECRET,
        amount: parseInt(totalAmount * 100),
        currency: "INR",
        order_receipt: "order_rcptid_" + formFields.fullName,
        name: "E-Bharat",
        description: "for testing purpose",
        handler: function (response) {
          console.log(response);

          const paymentId = response.razorpay_payment_id;

          const user = JSON.parse(localStorage.getItem("user"));

          const payLoad = {
            name: addressInfo.name,
            phoneNumber: formFields.phoneNumber,
            address: addressInfo.address,
            pincode: addressInfo.pincode,
            amount: parseInt(totalAmount),
            paymentId: paymentId,
            email: user.email,
            userid: user.userId,
            products: cartData,
            date:addressInfo?.date
          };

          console.log(payLoad)
          

          user.totalSpent = user.totalSpent + parseInt(totalAmount);
          postData(`/api/orders/create`, payLoad).then((res) => {
              fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
              res?.length!==0 && res?.map((item)=>{
                  deleteData(`/api/cart/${item?.id}`).then((res) => {
                  })    
              })
                  setTimeout(()=>{
                      context.getCartData();
                  },1000);
                  history("/orders");
            });
          
          });
        },

        theme: {
          color: "#3399cc",
        },
      };

      var pay = new window.Razorpay(options);
      pay.open();
    } else {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "You are banned! ",
      });
    }
    }
    

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
                      onChange={onChangeInput}
                    />
                  </div>
                </div>

                <div className="col-md-6">
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
                </div>
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
                      name="streetAddressLine1"
                      onChange={onChangeInput}
                    />
                  </div>

                  <div className="form-group">
                    <TextField
                      label="Apartment, suite, unit, etc. (optional)"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="streetAddressLine2"
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div>

              <h6>Town / City *</h6>

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
              </div>

              <h6>State / County *</h6>

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
              </div>

              <h6>Postcode / ZIP *</h6>

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
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <TextField
                      label="Phone Number"
                      variant="outlined"
                      className="w-100"
                      size="small"
                      name="phoneNumber"
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
                      onChange={onChangeInput}
                    />
                  </div>
                </div>
              </div>
              <div className="row d-flex">
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
                                  currency: "INR",
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
                            currency: "INR",
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
                            currency: "INR",
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button
                  type="submit"
                  className="btn-blue bg-red btn-lg btn-big"
                >
                  <IoBagCheckOutline /> &nbsp; Checkout
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkout;

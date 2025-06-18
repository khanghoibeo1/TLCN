import React, { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, CircularProgress, Button, Paper } from "@mui/material";
import { editData2, deleteData, fetchDataFromApi } from "../../utils/api"; 
import { MyContext } from "../../App";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [cartData, setCartData] = useState([]);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
        fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);
        })
    },[])

  useEffect(() => {
    const fullTxnRef = searchParams.get("vnp_TxnRef");
    const orderId = fullTxnRef?.split("-")[0];
    const responseCode = searchParams.get("vnp_ResponseCode");


    if (orderId && responseCode === "00") {
      editData2(`/api/orders/admin-update/${orderId}`, { status: "verified" })
        .then((res) => {
          setSuccess(true);
          setIsPaymentVerified(true);
        })
        .catch((err) => {
          console.error("Error verifying payment:", err);
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to verify payment.",
          });
        })
        .finally(() => setIsVerifying(false));
    } else if( orderId && responseCode === "24") {
      editData2(`/api/orders/admin-update/${orderId}`, { status: "cancelled" })
        .then((res) => {
          setSuccess(false);
        })
        .catch((err) => {
          console.error("Error cancel payment:", err);
          context.setAlertBox({
            open: true,
            error: true,
            msg: "Failed to cancel payment.",
          });
        })
        .finally(() => setIsVerifying(false));
    } else {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (isPaymentVerified && cartData.length > 0) {
      const deleteCart = async () => {
        await Promise.all(cartData.map(item => deleteData(`/api/cart/${item.id}`)));
        await context.getCartData();
      };
      deleteCart();
    }
  }, [isPaymentVerified, cartData]);

  return (
    <Box sx={{ minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center", maxWidth: 500, width: "100%" }}>
        {isVerifying ? (
          <>
            <CircularProgress />
            <Typography variant="h6" mt={2}>Verifying your payment...</Typography>
          </>
        ) : success ? (
          <>
            <Typography variant="h5" color="success.main" fontWeight="bold">
              Payment Successful!
            </Typography>
            <Typography mt={2}>Your order has been verified and is now being processed.</Typography>
            <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate("/orders")}>
              View My Orders
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h5" color="error" fontWeight="bold">
              Payment Failed!
            </Typography>
            <Typography mt={2}>Your transaction could not be verified.</Typography>
            <Button variant="contained" color="error" sx={{ mt: 3 }} onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default PaymentSuccess;

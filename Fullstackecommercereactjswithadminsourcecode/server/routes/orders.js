const { Orders } = require('../models/orders');
const { BatchCode } = require('../models/batchCode');
const { Product } = require('../models/products');

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const  client  = require('../helper/paypal/paypal.config');
const { User } = require('../models/user');
const { sendOrderConfirmationEmail } = require('../helper/mailtrap/emails');

// const moment = require("moment");
const crypto = require("crypto");
require("dotenv").config();

const vnp_TmnCode = process.env.VNP_TMNCODE;
const vnp_HashSecret = process.env.VNP_HASHSECRET;
const vnp_Url = process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const vnp_ReturnUrl = process.env.VNP_RETURNURL;


router.get('/user', async (req, res) => {
  try {
    const { userid, page = 1, limit = 10, startDate, endDate } = req.query;
    if (!userid) {
      return res.status(400).json({ success: false, message: 'Missing userid parameter.' });
    }

    const pageInt  = parseInt(page,  10);
    const limitInt = parseInt(limit, 10);

    // chỉ lọc những đơn của chính user đó
    const filter = { userid };
    
    // Lọc theo khoảng thời gian tạo đơn
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23,59,59,999);
        filter.date.$lte = e;
      }
    }

    // đếm tổng đơn để client dùng pagination
    const totalOrders = await Orders.countDocuments(filter);

    // lấy danh sách, sort theo date giảm dần (mới nhất trước)
    const ordersList = await Orders
      .find(filter)
      .sort({ date: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt);

    return res.status(200).json({
      orders: ordersList,
      currentPage: pageInt,
      totalPages:  Math.ceil(totalOrders / limitInt),
      totalOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, q, page = 1, limit = 10, startDate, endDate, locationId } = req.query;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    let filter = {};

    // Lọc theo từ khóa
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { phoneNumber: { $regex: q, $options: "i" } },
        { address: { $regex: q, $options: "i" } },
        { locationName: { $regex: q, $options: "i" } },
      ];
    }

    // Lọc theo trạng thái
    if (status && status !== "all") {
      filter.status = status;
    }

    // Lọc theo khoảng thời gian tạo đơn
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23,59,59,999);
        filter.date.$lte = e;
      }
    }

    // Lọc theo locationId
    if (locationId && locationId !== 'null') {
        filter.locationId = locationId;
    }

    

    const totalOrders = await Orders.countDocuments(filter);

    const ordersList = await Orders.find(filter)
      .sort({ date: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt);

    return res.status(200).json({
      orders: ordersList,
      currentPage: pageInt,
      totalPages: Math.ceil(totalOrders / limitInt),
      totalOrders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});


router.get('/:id', async (req, res) => {

    const order = await Orders.findById(req.params.id);

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found.' })
    }
    return res.status(200).send(order);
})

router.get(`/get/count`, async (req, res) => {
    let { fromDate, toDate } = req.query;

    // Nếu không có fromDate/toDate thì dùng mặc định
    if (!fromDate) {
        fromDate = "2024-01-01";
    }
    if (!toDate) {
        toDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }

    const filter = {
        date: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate + "T23:59:59.999Z") // đảm bảo lấy hết ngày toDate
        }
    };

    try {
        const orderCount = await Orders.countDocuments(filter);
        res.send({ orderCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});



router.post('/create', async (req, res) => {

  try{
    const { name, phoneNumber, address, shippingFee, shippingMethod, amount, payment, email, userid, products, date, orderDiscount, note, locationId, locationName } = req.body;

    if (!['Cash on Delivery', 'Paypal','VNPAY'].includes(payment)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method.'});
    }
    for (const item of products) {
      const batch = await BatchCode.findById(item.batchId);
      if (!batch) continue;

      // Trừ trong batchCode
      if (batch.amountRemain < item.quantity) {
          return res.status(400).json({ message: `Do not enough in batch ${batch.batchName}` });
      }

      // Trừ trong product.amountAvailable theo locationId từ batch
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const locationIndex = product.amountAvailable.findIndex(
          a => a.locationId?.toString() === batch.locationId?.toString()
      );
      console.log(locationIndex)

      if (locationIndex >= 0) {
          product.amountAvailable[locationIndex].quantity -= item.quantity;
          if (product.amountAvailable[locationIndex].quantity < 0) {
          return res.status(400).json({ message: `Do not enough in batch for product ${product.name}` });
          }
      }
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

        const newOrder = new Orders({
            name,
            phoneNumber,
            address,
            shippingMethod,
            shippingFee,
            amount,
            payment, 
            email,
            userid,
            products,
            date,
            orderDiscount,
            note,
            locationId,
            locationName,
            status: 'pending' 
        });

    const savedOrder = await newOrder.save();
    for (const item of products) {
      const batch = await BatchCode.findById(item.batchId);
      if (!batch) continue;

      // Trừ trong batchCode
      batch.amountRemain -= item.quantity;
      if (batch.amountRemain < 0) {
          return res.status(400).json({ message: `Do not enough in batch ${batch.batchName}` });
      }
      await batch.save();

      // Trừ trong product.amountAvailable theo locationId từ batch
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const locationIndex = product.amountAvailable.findIndex(
          a => a.locationId?.toString() === batch.locationId?.toString()
      );
      console.log(locationIndex)

      if (locationIndex >= 0) {
          product.amountAvailable[locationIndex].quantity -= item.quantity;
          if (product.amountAvailable[locationIndex].quantity < 0) {
          return res.status(400).json({ message: `Do not enough in batch for product ${product.name}` });
          }
      }

      await product.save();
    }
    const customerName = name;

    // Mã đơn hàng là ID vừa lưu (có thể savedOrder._id)
    const orderId = savedOrder._id.toString();

    // Tổng tiền (format ra currency string)
    const totalAmountFormatted = amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });

    // Lấy danh sách sản phẩm để làm chi tiết
    const orderItems = products.map((item) => ({
      productName: item.productTitle || "Unknown Product",
      quantity: item.quantity,
      subTotalFormatted: (item.price * item.quantity).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      }),
    }));

    // Gọi hàm gửi mail (không bắt buộc phải await, nhưng nên await để catch error)
    try {
      await sendOrderConfirmationEmail(
        email,
        customerName,
        orderId,
        amount,
        payment,
        shippingMethod,
        orderItems
      );
      console.log("Order confirmation email sent to:", email);
    } catch (mailError) {
      console.error("Lỗi khi gửi email xác nhận đơn hàng:", mailError);
      // Nếu muốn rollback order, bạn có thể xóa savedOrder ở đây (tùy yêu cầu)
      // Hoặc chỉ log và trả về response bình thường, không throw tiếp
    }
    return res.status(201).json(savedOrder);
  }catch(error){
    console.error('Error while creating order:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});


router.delete('/:id', async (req, res) => {

    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404).json({
            message: 'Order not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Order Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    try {
        const { name, phoneNumber, address, shippingMethod, shippingFee, amount, payment, email, userid, products, status, date, note, locationId, locationName } = req.body;

        // Nếu cập nhật phương thức thanh toán, kiểm tra giá trị
        if (payment && !['Cash on Delivery', 'Paypal','VNPAY'].includes(payment)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method.' });
        }

        // Tìm đơn hàng cần cập nhật
        const order = await Orders.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Cập nhật các trường thông tin
        order.name = name || order.name;
        order.phoneNumber = phoneNumber || order.phoneNumber;
        order.address = address || order.address;
        order.shippingMethod = shippingMethod || order.shippingMethod;
        order.amount = amount || order.amount;
        order.shippingFee = shippingFee || order.shippingFee;
        order.payment = payment || order.payment;
        order.email = email || order.email;
        order.userid = userid || order.userid;
        order.products = products || order.products;
        order.status = status || order.status;
        order.date = date || order.date;
        order.note = note || order.note;
        order.locationId = locationId || order.locationId;
        order.locationName = locationName || order.locationName;
        const updatedOrder = await order.save();
        return res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Order cannot be updated!', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }

})

router.post('/create-paypal-order', async(req, res) => {

    try{
        const { orderId } = req.body;

        const order = await Orders.findById(orderId);
        if(!order){
            return res.status(404).json({ success: false, message: 'Order not found.'})
        }

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: orderId, // Tham chiếu đến ID đơn hàng của bạn
                    amount: {
                        currency_code: 'USD', // Đổi thành 'INR' nếu cần
                        value: order.amount.toFixed(2), // Tổng tiền đơn hàng
                    },
                    description: `Order ID: ${orderId}`,
                },
            ],
        });

        const paypalOrder = await client.execute(request);
        return res.status(201).json({
            id: paypalOrder.result.id, // ID của giao dịch PayPal
            status: paypalOrder.result.status,
            links: paypalOrder.result.links
        });
    }catch(error){
        console.error('Error when creating PayPal application!', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
})

router.post('/capture-paypal-order', async (req, res) => {
    try {
        const { paypalOrderId, orderId } = req.body;

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Capture đơn PayPal
        const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
        request.requestBody({});

        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            // Cập nhật trạng thái đơn hàng
            order.paymentStatus = 'paid';
            order.status = 'verified';
            order.payment = 'Paypal';
            await order.save();

            return res.status(200).json({
                success: true,
                message: 'Payment successful!',
                order,
                paypalResponse: capture.result,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Payment has not been completed!',
                status: capture.result.status,
            });
        }
    } catch (error) {
        console.error('Error capture PayPal:', error);
        return res.status(500).json({ success: false, message: 'Sever error.' });
    }
});

router.post("/vnpay/test/test/create_payment_url", (req, res) => {
  const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const { amount, orderId, bankCode, orderDescription } = req.body;

  function getVnpCreateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${date}${hour}${minute}${second}`;
  }
  const createDate = getVnpCreateDate();
  const orderInfo = orderDescription || "Payment at eCommerce site";
  const orderType = "other";
  const locale = "vn";
  const currCode = "VND";
  const vnp_TxnRef = orderId;

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnp_TmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: vnp_TxnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: orderType,
    vnp_Amount: amount * 26500 * 100,
    vnp_ReturnUrl: vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  const signData = new URLSearchParams(vnp_Params).toString();
  const hmac = crypto.createHmac("sha512", vnp_HashSecret);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;

  const paymentUrl = vnp_Url + "?" + new URLSearchParams(vnp_Params).toString();
  return res.json({ url: paymentUrl });
});

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (let key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

router.get('/get/data/status-summary', async (req, res) => {
  try {
    const { locationId, fromDate, toDate } = req.query;
    console.log(locationId)

    const matchStage = {};
    if (locationId && locationId !== "null") {
      matchStage.locationId = new mongoose.Types.ObjectId(locationId);
    }

    // Thêm lọc theo khoảng thời gian nếu có
    if (fromDate && toDate) {
      matchStage.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const statusSummary = await Orders.aggregate([
      { $match: matchStage }, // Lọc theo locationId nếu có
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedData = statusSummary.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching order status summary:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});

  
  router.get('/get/data/most-sold-products', async (req, res) => {
    try {
        const { locationId, fromDate, toDate } = req.query;
        const matchStage = {};
        if (locationId && locationId !== "null") {
            matchStage.locationId = new mongoose.Types.ObjectId(locationId);
        }

        // Lọc theo ngày nếu có
        if (fromDate && toDate) {
          matchStage.date = {
            $gte: new Date(fromDate),
            $lte: new Date(toDate),
          };
        }

        const mostSoldProducts = await Orders.aggregate([
            { $match: matchStage },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.productId",  // Nhóm theo productId
                    totalQuantity: { $sum: "$products.quantity" },  // Tính tổng số lượng của mỗi sản phẩm
                    productTitle: { $first: "$products.productTitle" },  // Lấy tên sản phẩm đầu tiên (cùng productId)
                    image: { $first: "$products.image" },  // Lấy ảnh sản phẩm đầu tiên
                    price: { $first: "$products.price" },  // Lấy giá sản phẩm đầu tiên
                }
            },
            {
                $sort: { totalQuantity: -1 }  // Sắp xếp theo số lượng bán được, từ cao xuống thấp
            },
            {
                $limit: 10  // Giới hạn số lượng sản phẩm bán nhiều nhất (ví dụ: 10 sản phẩm bán chạy nhất)
            }
        ]);

        // Trả về kết quả danh sách sản phẩm bán chạy
        res.status(200).json(mostSoldProducts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching most sold products", error });
    }
});


router.get("/get/data/stats/sales", async (req, res) => {
    let { fromDate, toDate, groupBy, locationId } = req.query;
  
    // Nếu không có fromDate/toDate thì dùng mặc định
    if (!fromDate) {
        fromDate = "2024-01-01";
    }
    if (!toDate) {
        toDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    }
    if (!groupBy) {
        groupBy = "day"; // YYYY-MM-DD
    }
  
    try {
      const matchStage = {
        date: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };
      if (locationId && locationId !== "null") {
        matchStage.locationId = new mongoose.Types.ObjectId(locationId);
    }
  
      let groupStage = {};
      switch (groupBy) {
        case "day":
          groupStage = {
            _id: { day: { $dayOfMonth: "$date" }, month: { $month: "$date" }, year: { $year: "$date" } },
            totalSales: { $sum: { $toDouble: "$amount" } },
          };
          break;
        case "month":
          groupStage = {
            _id: { month: { $month: "$date" }, year: { $year: "$date" } },
            totalSales: { $sum: { $toDouble: "$amount" } },
          };
          break;
        case "quarter":
          groupStage = {
            _id: { quarter: { $ceil: { $divide: [{ $month: "$date" }, 3] } }, year: { $year: "$date" } },
            totalSales: { $sum: { $toDouble: "$amount" } },
          };
          break;
        case "year":
          groupStage = {
            _id: { year: { $year: "$date" } },
            totalSales: { $sum: { $toDouble: "$amount" } },
          };
          break;
        default:
          return res.status(400).json({ message: "Invalid groupBy value." });
      }
  
      const salesData = await Orders.aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);
  
      res.json(salesData.map(item => ({
        label: groupBy === "day" 
          ? `${item._id.year}-${item._id.month}-${item._id.day}`
          : groupBy === "month"
          ? `${item._id.year}-${item._id.month}`
          : groupBy === "quarter"
          ? `Q${item._id.quarter} ${item._id.year}`
          : `${item._id.year}`,
        sales: item.totalSales,
      })));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching sales data", error });
    }
  });

  router.put('/client-update/:id', async (req, res) => {
    try {
        const { status, paymentStatus } = req.body; // Client chỉ cập nhật status
        const order = await Orders.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Kiểm tra logic trạng thái từ phía client
        // pending -> cancel (nếu payment=COD)
        if (order.status === 'pending' && order.payment === 'Cash on Delivery' && status === 'cancelled') {
            for (const item of order.products) {
                const batch = await BatchCode.findById(item.batchId);
                if (batch) {
                    batch.amountRemain += item.quantity;
                    await batch.save();
                }

                const product = await Product.findById(item.productId);
                if (!product) continue;

                const locationIndex = product.amountAvailable.findIndex(
                    a => a.locationId?.toString() === batch?.locationId?.toString()
                );

                if (locationIndex >= 0) {
                    product.amountAvailable[locationIndex].quantity += item.quantity;
                }

                await product.save();
                }
            order.status = 'cancelled';
            await order.save();
            return res.status(200).json(order);
        }

        // verify -> paid
        if (order.status === 'delivered' && paymentStatus === 'paid') {
            order.paymentStatus = 'paid';
            await order.save();
            // Cập nhật totalSpent khi order chuyển sang paid
            const updatedUser = await User.findByIdAndUpdate(
                order.userid,
                { $inc: { totalSpent: order.amount } },
                { new: true }
            );
            console.log("order : ", order);
            return res.status(200).json({
                success: true,
                message: 'Order paid successfully!',
                order,
                updatedUser
            });
            // console.log('Order paid successfull', order);
            // return res.status(200).json(order);
        }

        // Nếu đã là cancel hoặc paid thì không cập nhật được nữa
        if (order.status === 'cancelled' || order.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Cannot update a cancelled or paid order.' });
        }
        
        // Nếu request cập nhật status không phù hợp logic
        return res.status(400).json({ success: false, message: 'Invalid status transition.' });

    } catch (error) {
        console.error('Order cannot be updated by client!', error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
});

router.put('/admin-update/:id', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Orders.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // pending -> verify
    if (order.status === 'pending' && status === 'verified') {
      order.status = 'verified';
      await order.save();
      return res.status(200).json(order);
    }

    // verify -> deliver
    if (order.status === 'verified' && status === 'delivered') {
      order.status = 'delivered';
      await order.save();
      const updatedUser = await User.findByIdAndUpdate(
          order.userid,
          { $inc: { totalSpent: order.amount } },
          { new: true }
      );
      return res.status(200).json(order);
    }

    // pending -> cancel (Admin huỷ đơn giống client)
    if ((order.status === 'pending' || order.status === 'verified') && status === 'cancelled') {
      for (const item of order.products) {
        const batch = await BatchCode.findById(item.batchId);
        if (batch) {
          batch.amountRemain += item.quantity;
          await batch.save();
        }

        const product = await Product.findById(item.productId);
        if (!product) continue;

        const locationIndex = product.amountAvailable.findIndex(
          a => a.locationId?.toString() === batch?.locationId?.toString()
        );

        if (locationIndex >= 0) {
          product.amountAvailable[locationIndex].quantity += item.quantity;
        }

        await product.save();
      }

      order.status = 'cancelled';
      await order.save();
      return res.status(200).json(order);
    }

    // Không cập nhật nếu đã chuyển trạng thái cao hơn
    if (['delivered', 'cancel'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Cannot update order after it has been delivered/cancelled.' });
    }

    return res.status(400).json({ success: false, message: 'Invalid status transition.' });
  } catch (error) {
    console.error('Order cannot be updated by admin!', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});




module.exports = router;


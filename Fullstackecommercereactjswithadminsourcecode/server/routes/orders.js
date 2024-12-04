const { Orders } = require('../models/orders');
const express = require('express');
const router = express.Router();



router.get(`/`, async (req, res) => {

    try {
    

        const ordersList = await Orders.find(req.query)


        if (!ordersList) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(ordersList);

    } catch (error) {
        res.status(500).json({ success: false })
    }


});


router.get('/:id', async (req, res) => {

    const order = await Orders.findById(req.params.id);

    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found.' })
    }
    return res.status(200).send(order);
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Orders.countDocuments()

    if(!orderCount) {
        res.status(500).json({success: false})
    } else{
        res.send({
            orderCount: orderCount
        });
    }
   
})



router.post('/create', async (req, res) => {

    let order = new Orders({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        email: req.body.email,
        userid: req.body.userid,
        products: req.body.products,
        date:req.body.date
    });

    let order1 = {
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
        pincode: req.body.pincode,
        amount: req.body.amount,
        paymentId: req.body.paymentId,
        email: req.body.email,
        userid: req.body.userid,
        products: req.body.products,
        date:req.body.date
    };

    console.log(order1)



    if (!order) {
        res.status(500).json({
            error: err,
            success: false
        })
    }


    order = await order.save();


    res.status(201).json(order);

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

    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            status:req.body.status
        },
        { new: true }
    )



    if (!order) {
        return res.status(500).json({
            message: 'Order cannot be updated!',
            success: false
        })
    }

    res.send(order);

})

// Đếm số lượng đơn hàng theo trạng thái
router.get('/get/data/status-summary', async (req, res) => {
    try {
      const statusSummary = await Orders.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }, // Đếm số lượng các trạng thái
          },
        },
      ]);
  
      console.log("Status Summary:", statusSummary);
  
      const formattedData = statusSummary.map((item) => ({
        name: item._id, // Tên trạng thái (Pending, Shipped, Delivered)
        value: item.count, // Tổng số lượng
      }));
  
      console.log("Formatted Data:", formattedData);
  
      res.status(200).json(formattedData);
    } catch (error) {
      console.error("Error fetching order status summary:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  });
  
  router.get('/get/data/most-sold-products', async (req, res) => {
    try {
        const mostSoldProducts = await Orders.aggregate([
            { 
                $unwind: "$products"  // Mở rộng mảng products để xử lý từng sản phẩm
            },
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

// API để lấy tổng doanh thu theo năm
// router.get('/get/data/stats/sales', async (req, res) => {
//     try {
//       // Tính toán tổng doanh thu theo từng năm
//       const salesData = await Orders.aggregate([
//         {
//           $project: {
//             year: { $year: "$date" }, // Lấy năm từ trường "date"
//             amount: { $toDouble: "$amount" } // Chuyển "amount" thành số để tính toán
//           }
//         },
//         {
//           $group: {
//             _id: "$year", // Nhóm theo năm
//             totalSales: { $sum: "$amount" } // Tính tổng doanh thu theo năm
//           }
//         },
//         {
//           $sort: { _id: 1 } // Sắp xếp theo năm
//         }
//       ]);
  
//       // Định dạng lại dữ liệu cho phù hợp với biểu đồ
//       const formattedSalesData = salesData.map(item => ({
//         year: item._id.toString(),
//         sales: item.totalSales
//       }));
  
//       res.status(200).json(formattedSalesData);
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching sales data", error });
//     }
//   });



router.get("/get/data/stats/sales", async (req, res) => {
    const { fromDate, toDate, groupBy } = req.query;
  
    if (!fromDate || !toDate || !groupBy) {
      return res.status(400).json({ message: "Missing required parameters." });
    }
  
    try {
      const match = {
        date: {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        },
      };
  
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
        { $match: match },
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
module.exports = router;


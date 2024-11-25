const { Orders } = require('../models/orders');

const express = require('express');
const router = express.Router();
const paypal = require('@paypal/checkout-server-sdk');
const  client  = require('../helper/paypal/paypal.config');

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

    try{
        const { name, phoneNumber, address, pincode, amount, payment, email, userid, products, date } = req.body;

        if (!['Cash on Delivery', 'Paypal'].includes(payment)) {
            return res.status(400).json({ success: false, message: 'Invalid payment method.'});
        }

        const newOrder = new Orders({
            name,
            phoneNumber,
            address,
            pincode,
            amount,
            payment, 
            email,
            userid,
            products,
            date,
            status: 'pending' 
        });

        const savedOrder = await newOrder.save();
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
        const { name, phoneNumber, address, pincode, amount, payment, email, userid, products, status, date } = req.body;

        // Nếu cập nhật phương thức thanh toán, kiểm tra giá trị
        if (payment && !['Cash on Delivery', 'Paypal'].includes(payment)) {
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
        order.pincode = pincode || order.pincode;
        order.amount = amount || order.amount;
        order.payment = payment || order.payment;
        order.email = email || order.email;
        order.userid = userid || order.userid;
        order.products = products || order.products;
        order.status = status || order.status;
        order.date = date || order.date;

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
            order.status = 'paid';
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


module.exports = router;


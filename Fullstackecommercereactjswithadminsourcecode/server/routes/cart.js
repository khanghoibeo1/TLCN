const { Cart } = require('../models/cart');
const { StoreLocation } = require("../models/storeLocation");
const { BatchCode } = require('../models/batchCode');
const { Product } = require('../models/products');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    try {

        const cartList = await Cart.find(req.query);

        if (!cartList) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(cartList);

    } catch (error) {
        res.status(500).json({ success: false })
    }
});




router.post('/add', async (req, res) => {
  try {
    const {image, productTitle, productId, quantity, userId, location } = req.body;
    const locationDoc = await StoreLocation.findOne({ iso2: location });
    const locationId = locationDoc?.id;

    // 1. Lấy thông tin product
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 2. Lấy các batch khả dụng theo FIFO
    const batches = await BatchCode.find({
      productId,
      status: 'delivered',
      amountRemain: {  $gt: 0 },
      locationId: locationId
    }).sort({ importDate: 1 });

    if (!batches || batches.length === 0) {
      return res.status(400).json({ message: 'No available batches for this product' });
    }

    let remainingQty = quantity;
    const cartItems = [];

    for (const batch of batches) {
      if (remainingQty === 0) break;

      const takeQty = Math.min(remainingQty, batch.amountRemain);
      const subTotal = takeQty * batch.price;

      const newCart = new Cart({
        productTitle: productTitle,
        image: image,
        rating: product.rating,
        price: batch.price,
        quantity: takeQty,
        subTotal: subTotal,
        productId: product.id,
        countInStock: batch.amountRemain,
        userId: userId,
        batchId: batch.id,
      });

      cartItems.push(newCart);
      remainingQty -= takeQty;
    }

    if (remainingQty > 0) {
      return res.status(400).json({ message: 'Not enough stock to fulfill request' });
    }

    // Lưu toàn bộ cartItems
    for (const item of cartItems) {
      await item.save();
    }

    return res.status(201).json({ message: 'Cart items added', items: cartItems });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});



router.delete('/:id', async (req, res) => {

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
        res.status(404).json({ msg: "The cart item given id is not found!" })
    }

    const deletedItem = await Cart.findByIdAndDelete(req.params.id);

    if (!deletedItem) {
        res.status(404).json({
            message: 'Cart item not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Cart Item Deleted!'
    })
});



router.get('/:id', async (req, res) => {

    const catrItem = await Cart.findById(req.params.id);

    if (!catrItem) {
        res.status(500).json({ message: 'The cart item with the given ID was not found.' })
    }
    return res.status(200).send(catrItem);
})


router.put('/:id', async (req, res) => {

    const updateData = {
        productTitle: req.body.productTitle,
        image: req.body.image,
        rating: req.body.rating,
        price: req.body.price,
        quantity: req.body.quantity,
        subTotal: req.body.subTotal,
        // countInStock: req.body.countInStock
    };

    const cartList = await Cart.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
    )

    if (!cartList) {
        return res.status(500).json({
            message: 'Cart item cannot be updated!',
            success: false
        })
    }

    res.send(cartList);

})


module.exports = router;


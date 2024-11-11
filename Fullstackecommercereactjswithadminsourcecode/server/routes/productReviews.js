const { ProductReviews } = require('../models/productReviews');
const { Product } = require('../models/products');
const express = require('express');
const router = express.Router();


router.get(`/`, async (req, res) => {

    let  reviews=[];

    try {

        if(req.query.productId!==undefined && req.query.productId!==null && req.query.productId!=="" ){
            reviews = await ProductReviews.find({ productId: req.query.productId });
        }else{
            reviews = await ProductReviews.find();
        }


        if (!reviews) {
            res.status(500).json({ success: false })
        }

        return res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ success: false })
    }


});

router.get(`/get/count`, async (req, res) =>{
    const productsReviews = await ProductReviews.countDocuments()

    if(!productsReviews) {
        res.status(500).json({success: false})
    } else{
        res.send({
            productsReviews: productsReviews
        });
    }
   
})



router.get('/:id', async (req, res) => {

    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
        res.status(500).json({ message: 'The review with the given ID was not found.' })
    }
    return res.status(200).send(review);
})




router.post('/add', async (req, res) => {
    
    // let review = new ProductReviews({
    //     customerId: req.body.customerId,
    //     customerName: req.body.customerName,
    //     review:req.body.review,
    //     customerRating: req.body.customerRating,
    //     productId: req.body.productId
    // });



    // if (!review) {
    //     res.status(500).json({
    //         error: err,
    //         success: false
    //     })
    // }


    // review = await review.save();
    

    // res.status(201).json(review);

    //AVERAGE RATING
    try {
        // Extract the review data from the request body
        const { customerId, customerName, review, customerRating, productId } = req.body;

        // Create a new review object
        let newReview = new ProductReviews({
            customerId,
            customerName,
            review,
            customerRating,
            productId
        });

        // Save the review
        newReview = await newReview.save();

        // Fetch all reviews for the product
        const allReviews = await ProductReviews.find({ productId });

        // Calculate the new average rating
        const totalRating = allReviews.reduce((acc, cur) => acc + cur.customerRating, 0);
        const averageRating = totalRating / allReviews.length;

        // Update the product's rating with the new average
        await Product.findByIdAndUpdate(productId, { rating: averageRating });

        // Send back the response with the review and updated rating
        res.status(201).json({
            success: true,
            review: newReview,
            updatedRating: averageRating
        });
    } catch (err) {
        // Handle errors and send a response
        res.status(500).json({
            error: err.message,
            success: false
        });
    }

});


module.exports = router;


const express = require('express');
const { PromotionCode } = require("../models/promotionCode.js");
const { User } = require("../models/user.js");
const router = express.Router();

// Create a new promotion code
router.post('/create', async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      startDate,
      endDate,
      maxUsage,
      type,
      applicableRoles,
      applicableCategoryIds,
      canCombine,
      users,
      status,
      note
    } = req.body;

    if (!code || !discountValue || !maxUsage) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const newPromotionCode = new PromotionCode({
      code,
      description,
      discountType: discountType || 'percent',
      discountValue,
      minOrderValue: minOrderValue || 0,
      startDate,
      endDate,
      maxUsage,
      type: type,
      applicableRoles: applicableRoles || [],
      applicableCategoryIds: applicableCategoryIds || [],
      canCombine: canCombine !== undefined ? canCombine : true,
      users: users || [],
      status: status || 'active',
      note
    });

    const savedPromotionCode = await newPromotionCode.save();
    res.status(201).json({ success: true, data: savedPromotionCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all promotion codes
router.get('/', async (req, res) => {
  try {
    const promotionCodes = await PromotionCode.find();
    res.status(200).json({ success: true, data: promotionCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/getPromotionCodeWithCondition', async (req, res) => {
  try {
    const { userId, cart } = req.query;

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    let categoryIdsFromCart = [];
    if (cart) {
      const cartItems = JSON.parse(cart); // parse từ chuỗi JSON
      categoryIdsFromCart = cartItems.map(item => item.categoryId).filter(Boolean);
    }
    console.log(categoryIdsFromCart)

    const allPromoCodes = await PromotionCode.find();

    const filteredPromoCodes = allPromoCodes.filter(promo => {
      // Kiểm tra applicableRoles
      if (promo.applicableRoles && promo.applicableRoles.length > 0 && user) {
        if (!promo.applicableRoles.includes(user.rank)) {
          return false;
        }
      }

      // Kiểm tra applicableCategoryIds
      if (promo.applicableCategoryIds && promo.applicableCategoryIds.length > 0 && categoryIdsFromCart.length > 0) {
        const hasMatchingCategory = promo.applicableCategoryIds.some(catId =>
          categoryIdsFromCart.includes(catId)
        );
        if (!hasMatchingCategory) {
          return false;
        }
      }

      return true;
    });

    res.status(200).json({ success: true, data: filteredPromoCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Get a promotion code by ID
router.get('/:id', async (req, res) => {
  try {
    const promotionCode = await PromotionCode.findById(req.params.id);
    if (!promotionCode) {
      return res.status(404).json({ success: false, message: 'Promotion code not found' });
    }
    res.status(200).json({ success: true, data: promotionCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update a promotion code
router.put('/:id', async (req, res) => {
  try {
    const updatedPromotionCode = await PromotionCode.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );
    if (!updatedPromotionCode) {
      return res.status(404).json({ success: false, message: 'Promotion code not found' });
    }
    res.status(200).json({ success: true, data: updatedPromotionCode });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get promotion code count
router.get('/get/count', async (req, res) => {
  try {
    const promotionCodeCount = await PromotionCode.countDocuments();
    return res.status(200).json({ success: true, promotionCodeCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a promotion code by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPromotionCode = await PromotionCode.findByIdAndDelete(req.params.id);
    if (!deletedPromotionCode) {
      return res.status(404).json({ success: false, message: 'Promotion code not found' });
    }
    res.status(200).json({ success: true, message: 'Promotion code deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

// const express = require('express');
// const {PromotionCode} = require('../models/promotionCode');
// const router = express.Router();

// // Create a new promotion code
// router.post('/create', async (req, res) => {
//   try {
//     const { code, description, discountPercent, maxUsage, status, users, note } = req.body;

//     if (!code || !discountPercent || !maxUsage) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const newPromotionCode = new PromotionCode({
//       code,
//       description,
//       discountPercent,
//       maxUsage,
//       status: status || 'active', // Set default status to 'active' if not provided
//       users: users || [], // Handle users if provided
//       note
//     });

//     const savedPromotionCode = await newPromotionCode.save();
//     res.status(201).json({ success: true, data: savedPromotionCode });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Get all promotion codes
// router.get('/', async (req, res) => {
//   try {
//     const promotionCodes = await PromotionCode.find();
//     res.status(200).json({ success: true, data: promotionCodes });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // Get a promotion code by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const promotionCode = await PromotionCode.findById(req.params.id);

//     if (!promotionCode) {
//       return res.status(404).json({ success: false, message: 'Promotion code not found' });
//     }

//     res.status(200).json({ success: true, data: promotionCode });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });
// router.put('/:id', async (req, res) => {
//   try {
//       const promotionCode = await PromotionCode.findById(req.params.id);

//       if (!promotionCode) {
//           return res.status(404).json({
//               success: false,
//               message: 'Promotion code not found!',
//           });
//       }
//       const updatedPromotionCode = await PromotionCode.findByIdAndUpdate(
//         req.params.id,
//         {
//             code: req.body.code || promotionCode.code,
//             description: req.body.description || promotionCode.description,
//             discountPercent: req.body.discountPercent ?? promotionCode.discountPercent,
//             maxUsage: req.body.maxUsage ?? promotionCode.maxUsage,
//             usedCount: req.body.usedCount ?? promotionCode.usedCount,
//             users: req.body.users || promotionCode.users,
//             status: req.body.status ?? promotionCode.status,
//             note: req.body.note ?? promotionCode.note,
//         },
//         { new: true }
//     );

//     if (!updatedPromotionCode) {
//         return res.status(500).json({
//             success: false,
//             message: 'Promotion code could not be updated!',
//         });
//     }

//     res.status(200).json({
//         success: true,
//         data: updatedPromotionCode,
//     });
// } catch (error) {
//     res.status(500).json({
//         success: false,
//         message: error.message,
//     });
// }
// });

// // Get promotion code count (excluding child posts if needed)
// router.get('/get/count', async (req, res) => {
//     try {
//       const promotionCodeCount = await PromotionCode.countDocuments();
//       return res.status(200).json({ success: true, promotionCodeCount });
//     } catch (error) {
//       return res.status(500).json({ success: false, error: error.message });
//     }
//   });
  
//   // Delete a promotion code by ID
//   router.delete('/:id', async (req, res) => {
//     try {
//       const deletedPromotionCode = await PromotionCode.findByIdAndDelete(req.params.id);
  
//       if (!deletedPromotionCode) {
//         return res.status(404).json({ success: false, message: 'Promotion code not found' });
//       }
  
//       res.status(200).json({ success: true, message: 'Promotion code deleted successfully' });
//     } catch (error) {
//       res.status(500).json({ success: false, message: error.message });
//     }
//   });

//   module.exports = router;

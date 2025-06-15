const { Category } = require("../models/category.js");
const { Product } = require("../models/products.js");
const { BatchCode } = require("../models/batchCode");
const { MyList } = require("../models/myList");
const { Cart } = require("../models/cart");
const { RecentlyViewd } = require("../models/recentlyViewd.js");
const { ImageUpload } = require("../models/imageUpload.js");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const { constrainedMemory } = require("process");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.cloudinary_Config_Cloud_Name,
  api_key: process.env.cloudinary_Config_api_key,
  api_secret: process.env.cloudinary_Config_api_secret,
  secure: true,
});

var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
    //imagesArr.push(`${Date.now()}_${file.originalname}`)
    //console.log(file.originalname)
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req.files?.length; i++) {
      const options = {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      };

      const img = await cloudinary.uploader.upload(
        req.files[i].path,
        options,
        function (error, result) {
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      );
    }

    let imagesUploaded = new ImageUpload({
      images: imagesArr,
    });

    imagesUploaded = await imagesUploaded.save();

    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
  }
});

router.get(`/`, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage)|| 12;
  const filter = {};
  
  const totalPosts = await Product.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  let productList = [];

  if (true) {
    if (req.query.location !== undefined) {
      console.log(req.query.location)
      const productListArr = await Product.find()
        .populate("name")
        .sort({ dateCreated: -1 }) 
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();

      for (let i = 0; i < productListArr.length; i++) {
        productList.push(productListArr[i]);
        for (let j = 0; j < productListArr[i].location.length; j++) {
          if (productListArr[i].location[j].value === req.query.location) {
          }
        }
      }
    } else {
      productList = await Product.find()
        .populate("name")
        .sort({ dateCreated: -1 }) 
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    }
  }

  return res.status(200).json({
    products: productList,
    totalPages: totalPages,
    page: page,
  });
});


// Get all post types
router.get(`/getAll/`, async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching post types", error });
    }
});

// lấy theo category
router.get(`/catName`, async (req, res) => {
  let productList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments();
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const productListArr = await Product.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      products: productListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    const productListArr = await Product.find({ catName: req.query.catName })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    for (let i = 0; i < productListArr.length; i++) {
      productList.push(productListArr[i]);
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === req.query.location) {
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        products: productList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        products: productListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

// lấy theo season
router.get(`/seasonName`, async (req, res) => {
  let productList = [];
  console.log(req.query.seasonName)
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const seasonName = req.query.seasonName;
  const location = req.query.location || "All";

  if (!seasonName) {
    return res.status(400).json({ message: "Missing seasonName parameter" });
  }

  const totalPosts = await Product.countDocuments({ season: seasonName });
  const totalPages = Math.ceil(totalPosts / perPage);

  if (page > totalPages && totalPages > 0) {
    return res.status(404).json({ message: "Page not found" });
  }

  const productListArr = await Product.find({ season: seasonName })
    .populate("category")
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec();

  // Nếu lọc theo location khác "All"
  if (location !== "All") {
    for (let i = 0; i < productListArr.length; i++) {
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === location) {
          ///productList.push(productListArr[i]);
          //break;
        }
      }
    }

    return res.status(200).json({
      products: productListArr,
      totalPages: totalPages,
      page: page,
    });
  }

  // Nếu location là "All"
  return res.status(200).json({
    products: productListArr,
    totalPages: totalPages,
    page: page,
  });
});


router.get(`/catId`, async (req, res) => {
  let productList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments({ catId: req.query.catId });
  const totalPages = Math.ceil(totalPosts / perPage);

  
  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const productListArr = await Product.find({ catId: req.query.catId })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      products: productListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    const productListArr = await Product.find({ catId: req.query.catId });

    for (let i = 0; i < productListArr.length; i++) {
      productList.push(productListArr[i]);
      //console.log(productList[i].location)
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === req.query.location) {
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        products: productList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        products: productListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/subCatId`, async (req, res) => {
  let productList = [];

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage);
  const totalPosts = await Product.countDocuments({ subCatId: req.query.subCatId });
  const totalPages = Math.ceil(totalPosts / perPage);
  
  if (page > totalPages) {
    return res.status(404).json({ message: "Page not found" });
  }

  if (req.query.page !== undefined && req.query.perPage !== undefined) {
    const productListArr = await Product.find({ subCatId: req.query.subCatId })
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      products: productListArr,
      totalPages: totalPages,
      page: page,
    });
  } else {
    const productListArr = await Product.find({ subCatId: req.query.subCatId });

    for (let i = 0; i < productListArr.length; i++) {
      //console.log(productList[i].location)
      for (let j = 0; j < productListArr[i].location.length; j++) {
        if (productListArr[i].location[j].value === req.query.location) {
          productList.push(productListArr[i]);
        }
      }
    }

    if (req.query.location !== "All") {
      return res.status(200).json({
        products: productList,
        totalPages: totalPages,
        page: page,
      });
    } else {
      return res.status(200).json({
        products: productListArr,
        totalPages: totalPages,
        page: page,
      });
    }
  }
});

router.get(`/filterByPrice`, async (req, res) => {
  try {
    const { minPrice, maxPrice, catId, subCatId, location, page = 1, perPage = 12 } = req.query;

    // Xây dựng điều kiện lọc
    let filter = {};
    if (catId) filter.catId = catId;
    if (subCatId) filter.subCatId = subCatId;
    if (location && location !== "All") {
      filter["location.value"] = location;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    // Đếm tổng số sản phẩm phù hợp
    const totalPosts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Lấy danh sách sản phẩm với phân trang
    const products = await Product.find(filter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .exec();

    res.status(200).json({
      products,
      totalPages,
      page: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// router.get(`/fiterByPrice`, async (req, res) => {
//   let productList = [];

//   if (req.query.catId !== "" && req.query.catId !== undefined) {
//     const productListArr = await Product.find({
//       catId: req.query.catId,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
//     const productListArr = await Product.find({
//       subCatId: req.query.subCatId,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   }

//   const filteredProducts = productList.filter((product) => {
//     if (req.query.minPrice && product.price < parseInt(+req.query.minPrice)) {
//       return false;
//     }
//     if (req.query.maxPrice && product.price > parseInt(+req.query.maxPrice)) {
//       return false;
//     }
//     return true;
//   });

//   return res.status(200).json({
//     products: filteredProducts,
//     totalPages: 0,
//     page: 0,
//   });
// });

router.get(`/rating`, async (req, res) => {
  try {
    const { rating, catId, subCatId, location, page = 1, perPage = 12 } = req.query;

    // Xây dựng điều kiện lọc
    let filter = { rating: rating };
    if (catId) filter.catId = catId;
    if (subCatId) filter.subCatId = subCatId;
    

    // Đếm tổng số sản phẩm phù hợp
    const totalPosts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages && totalPages !== 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    // Lấy danh sách sản phẩm với phân trang
    const products = await Product.find(filter)
      .populate("category")
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .exec();

    res.status(200).json({
      products,
      totalPages,
      page: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
});

// router.get(`/rating`, async (req, res) => {
//   let productList = [];

//   if (req.query.catId !== "" && req.query.catId !== undefined) {
//     const productListArr = await Product.find({
//       catId: req.query.catId,
//       rating: req.query.rating,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   } else if (req.query.subCatId !== "" && req.query.subCatId !== undefined) {
//     const productListArr = await Product.find({
//       subCatId: req.query.subCatId,
//       rating: req.query.rating,
//     }).populate("category");

//     if (req.query.location !== "All") {
//       for (let i = 0; i < productListArr.length; i++) {
//         //console.log(productList[i].location)
//         for (let j = 0; j < productListArr[i].location.length; j++) {
//           if (productListArr[i].location[j].value === req.query.location) {
//             productList.push(productListArr[i]);
//           }
//         }
//       }
//     } else {
//       productList = productListArr;
//     }
//   }

//   return res.status(200).json({
//     products: productList,
//     totalPages: 0,
//     page: 0,
//   });
// });

// router.get(`/get/count`, async (req, res) => {
//   const productsCount = await Product.countDocuments();

//   if (!productsCount) {
//     res.status(500).json({ success: false });
//   } else {
//     res.send({
//       productsCount: productsCount,
//     });
//   }
// });


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
        dateCreated: {
            $gte: new Date(fromDate),
            $lte: new Date(toDate + "T23:59:59.999Z") // đảm bảo lấy hết ngày toDate
        }
    };

    try {
        const productsCount = await Product.countDocuments(filter);
        res.send({ productsCount: productsCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get(`/featured`, async (req, res) => {
  let productList = [];
  if (req.query.location !== undefined && req.query.location !== null) {
    const productListArr = await Product.find({ isFeatured: true }).populate(
      "category"
    );

    for (let i = 0; i < productListArr.length; i++) {
      productList.push(productListArr[i]);
      for (let j = 0; j < productListArr[i].location.length; j++) {
        console.log(productListArr[i].location)
        if (productListArr[i].location[j].value === req.query.location) {
          
        }
      }
    }
  } else {
    productList = await Product.find({ isFeatured: true }).populate("category");
  }

  if (!productList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(productList);
});

router.get(`/recentlyViewd`, async (req, res) => {
  let productList = [];
  productList = await RecentlyViewd.find(req.query).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
  }

  return res.status(200).json(productList);
});

router.post(`/recentlyViewd`, async (req, res) => {
  let findProduct = await RecentlyViewd.find({ prodId: req.body.id });

  var product;

  if (findProduct.length === 0) {
    product = new RecentlyViewd({
      prodId: req.body.id,
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      oldPrice: req.body.oldPrice,
      subCatId: req.body.subCatId,
      catName: req.body.catName,
      subCat: req.body.subCat,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      discount: req.body.discount,
      productRam: req.body.productRam,
      size: req.body.size,
      productWeight: req.body.productWeight,
      season: req.body.season,
      note: req.body.note
    });

    product = await product.save();

    if (!product) {
      res.status(500).json({
        error: err,
        success: false,
      });
    }

    res.status(201).json(product);
  }
});

router.post(`/create`, async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(404).send("invalid Category!");
  }

  const imagesList = [];
  const uploads = await ImageUpload.find();
  uploads.forEach(doc => doc.images.forEach(img => imagesList.push(img)));

  const product = new Product({
    name: req.body.name,
    description: req.body.description,
    images: imagesList,
    brand: req.body.brand,
    catId: req.body.catId,
    catName: req.body.catName,
    subCat: req.body.subCat,
    subCatId: req.body.subCatId,
    subCatName: req.body.subCatName,
    rating: 5,
    category: req.body.category,
    isFeatured: req.body.isFeatured,
    season: req.body.season,
    note: req.body.note,
  });

  const saved = await product.save();
  return res.status(200).json(saved);
  } catch (error) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
  
});

router.get("/:id", async (req, res) => {
  productEditId = req.params.id;

  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res
      .status(500)
      .json({ message: "The product with the given ID was not found." });
  }
  return res.status(200).send(product);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  // console.log(imgUrl)

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {}
  );

  if (response) {
    res.status(200).send(response);
  }
});

router.delete("/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  const images = product.images;

  for (img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    if (imageName) {
      cloudinary.uploader.destroy(imageName, (error, result) => {
        // console.log(error, result);
      });
    }

    //  console.log(imageName)
  }

  const deletedProduct = await Product.findByIdAndDelete(req.params.id);

  const myListItems = await MyList.find({ productId: req.params.id });

  for (var i = 0; i < myListItems.length; i++) {
    await MyList.findByIdAndDelete(myListItems[i].id);
  }

  const cartItems = await Cart.find({ productId: req.params.id });

  for (var i = 0; i < cartItems.length; i++) {
    await Cart.findByIdAndDelete(cartItems[i].id);
  }

  if (!deletedProduct) {
    res.status(404).json({
      message: "Product not found!",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Product Deleted!",
  });
});

router.put("/:id", async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      description: req.body.description,
      images: req.body.images,
      brand: req.body.brand,
      catId: req.body.catId,
      catName: req.body.catName,
      subCat: req.body.subCat,
      subCatId: req.body.subCatId,
      subCatName: req.body.subCatName,
      category: req.body.category,
      isFeatured: req.body.isFeatured,
      season: req.body.season,
      note: req.body.note,
      location: req.body.location,
    };
    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
});

//Update count in stock
router.patch('/updateStock/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { countInStock } = req.body;

    if (countInStock === undefined) {
      return res.status(400).json({ message: "Missing countInStock in request body" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { countInStock: countInStock },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.patch('/updateAmount/:productId/amount/:locationId', async (req, res) => {
  try {
    const { productId, locationId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: "Missing quantity in request body" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const entry = product.amountAvailable.find(
      (item) => item.locationId.toString() === locationId
    );

    if (!entry) {
      return res.status(404).json({ message: "Location not found in product amountAvailable" });
    }

    entry.quantity = quantity;

    await product.save();

    res.status(200).json({
      message: "Quantity updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating quantity for location:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// get product amount remain low to high
router.get('/get/data/littleProduct', async (req, res) => {
  try {
    const { locationId } = req.query;
    const now = new Date();

    // Lấy toàn bộ sản phẩm
    const products = await Product.find({}, 'name amountAvailable');

    let result = [];

    if (locationId && locationId !== 'null') {
      // 🔹 Trường hợp chi nhánh con
      result = products.map((product) => {
        const found = product.amountAvailable.find(
          (item) => item.locationId?.toString() === locationId
        );
        const quantity = found ? found.quantity : 0;
        return {
          name: product.name,
          value: quantity,
        };
      });

    } else {
      // 🔹 Trường hợp kho tổng
      // Tính tổng tồn kho từ batchCode
      const batchTotals = await BatchCode.aggregate([
        {
          $match: {
            locationId: null,
            amountRemain: { $gt: 0 },
            expiredDate: { $gt: now },
          },
        },
        {
          $group: {
            _id: "$productId",
            totalRemain: { $sum: "$amountRemain" },
          },
        },
      ]);

      // Tạo map để tra nhanh
      const batchMap = {};
      batchTotals.forEach((b) => {
        batchMap[b._id.toString()] = b.totalRemain;
      });

      result = products.map((product) => {
        const productIdStr = product._id.toString();
        const quantity = batchMap[productIdStr] || 0;
        return {
          name: product.name,
          value: quantity,
        };
      });
    }

    // 🔽 Sắp xếp theo số lượng tăng dần
    result.sort((a, b) => a.value - b.value);

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error in /get/data/littleProduct:", err.message);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  }
});



// router.get('/get/data/category-products-stats', async (req, res) => {
//   try {
//     // Lấy tất cả posttype (category)
//     const categories = await PostType.find(); // posttype model

//     // Đếm số lượng bài viết theo category từ Post
//     const counts = await Post.aggregate([
//       {
//         $group: {
//           _id: "$category",
//           count: { $sum: 1 },
//         },
//       },
//     ]);
//     console.log(counts)

//     // Map lại dữ liệu: gắn số lượng vào từng category
//     const formattedData = categories
//     .filter((category) => category.name !== 'All')
//     .map((category) => {
//       const match = counts.find((c) => c._id === category.name);
//       return {
//         name: category.name,
//         amount: match ? match.count : 0,
//       };
//     });

//     res.status(200).json(formattedData);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching category stats", error });
//   }
// });


module.exports = router;

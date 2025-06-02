const { Category } = require("../models/category");
const { Product } = require("../models/products.js");
const { ImageUpload } = require("../models/imageUpload");
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const slugify = require("slugify");

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
  },
});

const upload = multer({ storage: storage });

router.post(`/upload`, upload.array("images"), async (req, res) => {
  imagesArr = [];

  try {
    for (let i = 0; i < req?.files?.length; i++) {
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

const createCategories = (categories, parentId=null) => {

  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  
  for (let cat of category) {
 
    categoryList.push({
      _id: cat._id,
      id: cat._id,
      name: cat.name,
      images:cat.images,
      color:cat.color,
      slug: cat.slug,
      parentId: cat.parentId,
      note: cat.note,
      children: createCategories(categories, cat._id)
    });
  }

  return categoryList;
};

router.get(`/`, async (req, res) => {
  try {
  
    const categoryList = await Category.find();

      if (!categoryList) {
        res.status(500).json({ success: false });
      }

    if (categoryList) {
      const categoryData = createCategories(categoryList);

      return res.status(200).json({
        categoryList: categoryData
      });
    }


  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get(`/get/count`, async (req, res) => {
  const categoryCount = await Category.countDocuments({parentId:undefined});

  if (!categoryCount) {
    res.status(500).json({ success: false });
  }
 else{
  res.send({
    categoryCount: categoryCount,
  });
 }
});

router.get(`/subCat/get/count`, async (req, res) => {
  const categoryCount = await Category.find();

  if (!categoryCount) {
    res.status(500).json({ success: false });
  }
 else{

  const subCatList = [];
  for (let cat of categoryCount) {
    if(cat.parentId!==undefined){
      subCatList.push(cat);
    }
  }

  res.send({
    categoryCount: subCatList.length,
    categoryList: subCatList
  });
 }
});


const createCat = (categories, parentId=null,cat) => {

  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);

  }
  categoryList.push({
    _id: cat._id,
    id: cat._id,
    name: cat.name,
    images:cat.images,
    color:cat.color,
    slug: cat.slug,
    parentId: cat.parentId,
    note: cat.note,
    children: category
  });

  return categoryList;

};

router.get("/:id", async (req, res) => {

  try {
    const categoryList = await Category.find();
    const category = await Category.findById(req.params.id);
  

    if (!category) {
      res
        .status(500)
        .json({ message: "The category with the given ID was not found." });
    }

    if (category) {
      const categoryData = createCat(categoryList, category._id, category);

      return res.status(200).json({
        categoryData
      });
    }


  } catch (error) {
    res.status(500).json({ success: false });
  }

});


router.get("/bySubCat/:id", async (req, res) => {

  try {
    const id = req.params.id;

    // Tìm con có id = id gửi lên
    const child = await Category.findById(id);
    if (!child) {
      return res.status(404).json({ message: "Không tìm thấy category con" });
    }

    // Kiểm tra đây có phải là con (có parentId)
    if (!child.parentId) {
      return res.status(400).json({ message: "ID này không phải category con" });
    }

    // Tìm cha của con này
    const parent = await Category.findById(child.parentId);
    if (!parent) {
      return res.status(404).json({ message: "Không tìm thấy category cha" });
    }

    // Trả về cha và con
    return res.status(200).json({
      parent,
      children: [child],
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

router.post("/create", async (req, res) => {
  let catObj = {};

  if (imagesArr.length > 0) {
    catObj = {
      name: req.body.name,
      images: imagesArr,
      color: req.body.color,
      note: req.body.note,
      slug: req.body.name,
    };
  } else {
    catObj = {
      name: req.body.name,
      slug: req.body.name,
    };
  }

  if (req.body.parentId) {
    catObj.parentId = req.body.parentId;
  }

  let category = new Category(catObj);

  if (!category) {
    res.status(500).json({
      error: err,
      success: false,
    });
  }

  category = await category.save();

  imagesArr = [];

  res.status(201).json(category);
});

router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  // console.log(imgUrl)

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];

  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {
      // console.log(error, res)
    }
  );

  if (response) {
    res.status(200).send(response);
  }
});

router.delete("/:id", async (req, res) => {
  const category = await Category.findById(req.params.id);
  const images = category.images;

  for (img of images) {
    const imgUrl = img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];

    const imageName = image.split(".")[0];

    cloudinary.uploader.destroy(imageName, (error, result) => {
      // console.log(error, result);
    });
    //  console.log(imageName)
  }

  const deletedUser = await Category.findByIdAndDelete(req.params.id);

  if (!deletedUser) {
    res.status(404).json({
      message: "Category not found!",
      success: false,
    });
  }

  res.status(200).json({
    success: true,
    message: "Category Deleted!",
  });
});

router.put("/:id", async (req, res) => {
  
    
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      images: req.body.images,
      color: req.body.color,
      note: req.body.note,
    },
    { new: true }
  );

  if (!category) {
    return res.status(500).json({
      message: "Category cannot be updated!",
      success: false,
    });
  }

  imagesArr = [];

  res.send(category);
});

// Route lấy dữ liệu cây categories + product counts
router.get('/get/data/categories-with-product-counts', async (req, res) => {
  try {
    const result = [];

    // 1. Lấy danh sách category cha (parentId = null hoặc undefined)
    const parentCategories = await Category.find({
      $or: [{ parentId: null }, { parentId: { $exists: false } }]
    }).lean();

    // 2. Duyệt từng category cha
    await Promise.all(parentCategories.map(async (cat, index) => {
      const parentId = `parent-${index}`;
      const directProductCount = await Product.countDocuments({ category: cat._id });

      // Đẩy category cha vào danh sách
      result.push({
        id: parentId,
        name: `${cat.name}-p-${index}`,
        value: directProductCount,
      });

      // 3. Tìm subcategories
      const subcategories = await Category.find({ parentId: cat._id.toString() }).lean();

      // 4. Duyệt từng subcategory con
      await Promise.all(subcategories.map(async (sub, subIndex) => {
        const subProductCount = await Product.countDocuments({ subCatId: sub._id });

        result.push({
          id: `sub-${index}-${subIndex}`,
          name: `${sub.name}-s-${index}`,
          parent: parentId,
          value: subProductCount,
        });
      }));
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching categories with product counts:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});




module.exports = router;

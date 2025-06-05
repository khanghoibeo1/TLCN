const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload');
const { Orders } = require('../models/orders');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const multer = require('multer');
const fs = require("fs");
const { sendVerficationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } = require('../helper/mailtrap/emails');
const { triggerAsyncId } = require('async_hooks');

const cloudinary = require('../helper/cloudinary.js'); 
const {authenticateToken} = require('../middleware/authenticateToken.js');


var imagesArr = [];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    // Ví dụ: "userId-timestamp.jpg"
    const ext = file.originalname.split('.').pop();
    const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    cb(null, `${req.user.id|| 'nouser'}-${Date.now()}-${nameWithoutExt}.${ext}`);
  },
});
const upload = multer({ storage });


// POST /api/user/upload
// - upload.array("images"): upload nhiều file, form field name = "images"
router.post(
  "/upload",
  authenticateToken,
  upload.array("images"),
  async (req, res) => {
    // Reset mảng URL mỗi khi có request mới
    try {
        console.log(req.user)
        console.log(req.files)
      
      if (req.user._id) {
        return res.status(401).json({ status: "ERROR", msg: "Chưa xác thực user" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ status: "ERROR", msg: "Chưa chọn file nào" });
      }

      const imageUrls = [];
      // 1) Upload lần lượt từng file lên Cloudinary (dùng promise, không dùng callback)
      for (const file of req.files) {
        try {
          // Khi dùng await, cloudinary trả promise resolve với object chứa .secure_url
          const result = await cloudinary.uploader.upload(file.path, {
            use_filename:      true,
            unique_filename:   false,
            overwrite:         false,
          });
          // Đẩy URL secure vào mảng
          imageUrls.push(result.secure_url);
        } catch (uploadErr) {
          // Nếu upload 1 file bị lỗi, xóa luôn các file tạm còn lại
          console.error("Upload lỗi file lên Cloudinary:", uploadErr);
          // Xóa hết file tạm
          req.files.forEach(f => {
            if (fs.existsSync(f.path)) {
              fs.unlinkSync(f.path);
            }
          });
          return res.status(500).json({ status: "ERROR", msg: "Upload ảnh lên Cloudinary thất bại" });
        }

        // 2) Xóa file tạm sau khi đã upload thành công
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      // 3) Lấy user từ DB, gán images = imageUrls và save
      const user = await User.findOne({email: req.user.email});
      console.log(user)
      if (!user) {
        return res.status(404).json({ status: "ERROR", msg: "User không tồn tại" });
      }

      // Nếu bạn muốn **thêm** ảnh mới vào mảng cũ, có thể làm:
      // user.images = [...(user.images || []), ...imageUrls];
      // Hoặc nếu chỉ giữ mỗi lần upload mới, làm:
      user.images = imageUrls;

      await user.save();

      // 4) Trả về JSON thành công, kèm mảng imageUrls để client set state ngay
      return res.status(200).json({
        status: "SUCCESS",
        images: imageUrls,
      });
    } catch (err) {
      console.error("Lỗi chung trong /api/user/upload:", err);
      return res.status(500).json({ status: "ERROR", msg: err.message });
    }
  }
);

// Sign up for user client
router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password, isAdmin, note } = req.body;

     // Validation rules
    const phoneRegex = /^[0-9]{10}$/;
    const nameRegex = /^[\p{L}\s]+$/u;

    if (!name.match(nameRegex)) {
        return res.json({ status: "FAILED", msg: "Name should only contain letters!" });
    }

    if (!phone.match(phoneRegex)) {
        return res.json({ status: "FAILED", msg: "Phone number must be 10 digits and contain only numbers!" });
    }

    if (password.length < 6) {
        return res.json({ status: "FAILED", msg: "Password must be at least 6 characters long!" });
    }

    try {

        const existingUser = await User.findOne({ email: email });
        const existingUserByPh = await User.findOne({ phone: phone });

        if (existingUser) {
            res.json({status:'FAILED', msg: "User already exist with this email!" })
            return;
        }

        if (existingUserByPh) {
            res.json({status:'FAILED', msg: "User already exist with this phone number!" })
            return;
        }

        const hashPassword = await bcrypt.hash(password,10);
        const verificationToken = Math.floor(100000 +  Math.random() * 900000).toString()

        const result = await User.create({
            name:name,
            phone:phone,
            email:email,
            password:hashPassword,
            isAdmin:isAdmin,
            verificationToken: verificationToken,
            note: note,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        await sendVerficationEmail(result.email, verificationToken)
        res.status(200).json({
            user:result,
            token:token,
            msg:"User Register Successfully"
        })

    } catch (error) {
        console.log(error);
        res.json({status:'FAILED', msg:"something went wrong"});
        return;
    }
})

//Login
router.post(`/signin`, async (req, res) => {
    const {email, password} = req.body;

    try{

        const existingUser = await User.findOne({ email: email });
        if(!existingUser){
            res.status(404).json({error:true, msg:"User not found!"})
            return;
        }
        if(!existingUser.isVerified) {
            res.status(400).json({error:true, msg:"Email is not verify!"})
            return;
        }
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        // const matchPassword = password === existingUser.password;
        if(!matchPassword){
            return res.status(400).json({error:true,msg:"Invailid credentials"})
        }

        const token = jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);
       return res.status(200).send({
            user:existingUser,
            token:token,
            msg:"user Authenticated"
        })
    }catch (error) {
        res.status(500).json({error:true,msg:"something went wrong"});
        return;
    }

})

// Verify email
router.post(`/verify-email`, async(req, res) => {
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired verification code"})
        }

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined

        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            user: {
                ...user._doc,
                password: undefined,
            }
        })
    }catch (error) {
        console.log("Error in verify-email", error);
        return res.status(500).json({status:'FAILED', msg:"something went wrong"});
    }
})

// Change password for user
router.put(`/changePassword/:id`, async (req, res) => {
   try{
    const { email, password, newPass} = req.body;

   console.log(req.body)
   console.log(req.params.id)

    const existingUser = await User.findOne({ email: email });
    if(!existingUser){
        return res.status(400).send({error:true, status: 'FAILED', msg:"User not found!"})
    }
    
    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if(!matchPassword){
        return res.status(400).json({error:true, status: 'FAILED', msg:"current password wrong"})
    }
    if (newPass.length < 6) {
        return res.status(400).json({ error:true, status: 'FAILED', msg: "Password must be at least 6 characters long!" });
    }
    const newPassword =  await bcrypt.hash(newPass,10);
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            password:newPassword,
        },
        { new: true}
    )
    console.log('hhhhh')

    if(!user){
        return res.status(400).json({error:true,  status: 'FAILED', msg:'The user cannot be Updated!'})
    }
    return res.status(200).json({ error: false, status: 'SUCCESS', msg: "Password updated successfully!" });
    }catch(error){
        console.error(error);
        return res.status(500).json({ error: true, status: 'FAILED', msg: "Internal server error" });
    }
})

// Get post count (excluding child posts if needed)
router.get('/get/count', async (req, res) => {
    try {
        const userCount = await User.countDocuments({ parentId: undefined });
        return res.status(200).json({ success: true, userCount });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});


// Get all users with pagination and optional location filter
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const locationFilter = req.query.location;

    try {
        const query = { isAdmin: false };
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / perPage);

        if (page > totalUsers) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        let users = [];

        if (locationFilter) {
            const allUsers = await User.find(query)
                .populate("name")
                .exec();

                users = allUsers.filter(user =>
                user.location && user.location.some(loc => loc.value === locationFilter)
            ).slice((page - 1) * perPage, page * perPage);
        } else {
            users = await User.find(query)
                .populate("name")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        return res.status(200).json({
            success: true,
            data: users,
            totalUsers,
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Get all user admin with pagination and optional location filter
router.get('/userAdmin', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const locationFilter = req.query.location;

    try {
        const query = { isAdmin: true };
        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / perPage);

        if (page > totalUsers) {
            return res.status(404).json({ success: false, message: "Page not found" });
        }

        let users = [];

        if (locationFilter) {
            const allUsers = await User.find(query)
                .populate("name")
                .exec();

                users = allUsers.filter(user =>
                user.location && user.location.some(loc => loc.value === locationFilter)
            ).slice((page - 1) * perPage, page * perPage);
        } else {
            users = await User.find(query)
                .populate("name")
                .skip((page - 1) * perPage)
                .limit(perPage)
                .exec();
        }

        return res.status(200).json({
            success: true,
            data: users,
            totalUsers,
            currentPage: page,
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});


// router.get('/user-rank-stats', async (req, res) => {
//     try {
//         const { userId } = req.query;

//         if (!userId) {
//             return res.status(400).json({ message: 'Missing userId' });
//         }

//         // Lấy thông tin user
//         const user = await User.findById(userId).select('rank');
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Lấy danh sách đơn hàng của user
//         const orders = await Orders.find({ userid: userId, status: { $in: ['paid'] } });

//         const totalOrders = orders.length;
//         const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

//         return res.status(200).json({
//             rank: user.rank || 'un',
//             totalOrders,
//             totalSpent
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/user-rank-stats', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'Missing userId' });
        }

        // Lấy thông tin user
        const user = await User.findById(userId).select('rank');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Xác định thời gian đầu và cuối của tháng trước
        const now = new Date();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // ngày cuối cùng của tháng trước

        // Lấy danh sách đơn hàng đã thanh toán trong tháng trước
        const orders = await Orders.find({
            userid: userId,
            status: 'paid',
            date: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth
            }
        });

        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);

        return res.status(200).json({
            rank: user.rank || 'un',
            totalOrders,
            totalSpent
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});


// get user id
router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } else{
        res.status(200).send(user);
    }
    
})


//delete user
router.delete('/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.post(`/userAdmin/create`, async (req, res) => {
    try {
        const hashPassword = await bcrypt.hash(req.body.password,10);
        let user = new User({
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            status: req.body.status || "active",
            images: req.body.images || [],
            isAdmin: true, // Luôn là admin
            locationManageName: req.body.locationManageName || null,
            locationManageId: req.body.locationManageId || null,
            role: req.body.role || "storeAdmin", // Mặc định là storeAdmin
            password: hashPassword,
            note: req.body.note,
        });

        user = await user.save();

        res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status,
                images: user.images,
                locationManageName: user.locationManageName,
                locationManageId: user.locationManageId,
                role: user.role,
                password: user.password,
                note: user.note,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating user", error });
    }
});

router.put(`/userAdmin/:id`, async (req, res) => {
    try {
        const existingUser = await User.findById(req.params.id);
        if (!existingUser) {
        return res.status(404).json({ error: true, msg: 'User not found' });
        }

        let hashPassword = existingUser.password; // default: giữ nguyên
        if (req.body.password !== "") {
        hashPassword = await bcrypt.hash(req.body.password, 10);
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                status: req.body.status,
                images: req.body.images,
                locationManageName: req.body.locationManageName,
                locationManageId: req.body.locationManageId,
                role: req.body.role,
                password: hashPassword,
                note: req.body.note,
            },
            { new: true }
        );

        if (!user || !user.isAdmin) {
            return res.status(404).json({ success: false, message: "Admin user not found" });
        }

        res.status(200).json({
            success: true,
            message: "Admin user updated successfully",
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status,
                images: user.images,
                locationManageName: user.locationManageName,
                locationManageId: user.locationManageId,
                role: user.role,
                password: user.password,
                note: user.note,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user", error });
    }
});


router.get('/userAdmin/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.isAdmin) {
            return res.status(404).json({ success: false, message: 'Admin user not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                status: user.status,
                images: user.images,
                locationManageName: user.locationManageName || "",
                locationManageId: user.locationManageId || "",
                role: user.role || "",
                password: user.password,
                note: user.note,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user", error });
    }
});


// Delete user by Id
router.delete('/userAdmin/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user || !user.isAdmin) {
            return res.status(404).json({ success: false, message: "Admin user not found" });
        }

        res.status(200).json({ success: true, message: "Admin user deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting user", error });
    }
});


// Get count user
router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments()

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})

// Verify google
router.post(`/authWithGoogle`, async (req, res) => {
    const {name, phone, email, password, images, isAdmin, note} = req.body;
    

    try{
        const existingUser = await User.findOne({ email: email });       

        if(!existingUser){
            const result = await User.create({
            name:name,
            phone:phone,
            email:email,
            password:password,
            images:images,
            isAdmin:isAdmin,
            isVerified: true,
            note: note,
            });

    
            const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            return res.status(200).send({
                 user:result,
                 token:token,
                 msg:"User Login Successfully!"
             })
    
        }

        else{
            const existingUser = await User.findOne({ email: email });
            const token = jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            return res.status(200).send({
                 user:existingUser,
                 token:token,
                 msg:"User Login Successfully!"
             })
        }
        
    }catch(error){
        console.log(error)
    }
})

// Update user
router.put('/:id',async (req, res)=> {

    const { name,  email,phone, images, isAdmin, note} = req.body;
    console.log(req.body)

    const userExist = await User.findById(req.params.id);
    const phoneRegex = /^[0-9]{10}$/;
    const nameRegex = /^[\p{L}\s]+$/u;

    if (!name.match(nameRegex)) {
        return res.json({ status: "FAILED", msg: "Name should only contain letters!" });
    }

    if (!phone.match(phoneRegex)) {
        return res.json({ status: "FAILED", msg: "Phone number must be 10 digits and contain only numbers!" });
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name:name,
            phone:phone,
            email:email,
            images: images,
            isAdmin: isAdmin,
            note: note,
        },
        { new: true}
    )

    if(!user)
        {return res.status(400).json({error: false, msg: 'the user cannot be Updated!'})}

    return res.status(200).json({ error: false, status: "SUCCESS" });;
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({success: false, message: "User not found"})
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpireAt = Date.now() + 1*60*60*1000
        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpireAt

        await user.save()

        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_BASE_URL}/reset-password/${resetToken}`)

        res.status(200).json({success: true, message: "Password reset link sent to your email"});
    } catch(error){
        console.log("Error in forgotPassword ", error)
        res.status(400).json({success: false, message: error.message})
    };
})

//Reset password
router.post('/reset-password/:token', async (req, res) => {
    try{
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()},
        });
        
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired reset token"})
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        
        await user.save();

        await sendResetSuccessEmail(user.email);
        res.status(200).json({success: true, message:"Password reset successful"})
    } catch(error){
        console.log("Error in resetPassword ", error);
        res.status(400).json({success: false, message: error.message});
    }
})

// Delete image
router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

   // console.log(imgUrl)

    const urlArr = imgUrl.split('/');
    const image =  urlArr[urlArr.length-1];
  
    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error,result)=>{
       // console.log(error, res)
    })

    if(response){
        res.status(200).send(response);
    }
      
});

// Đếm số lượng đơn hàng theo trạng thái
router.get('/get/data/user-spent', async (req, res) => {
    try {
        const result = await User.aggregate([
            {
                $match: {
                  isAdmin: false // Lọc bỏ các tài khoản có vai trò 'admin'
                }
            },
            {
              $project: {
                name: 1, // Chỉ lấy trường 'name'
                totalSpent: 1, // Chỉ lấy trường 'totalSpent'
              }
            },
            {
              $sort: { totalSpent: -1 } // Sắp xếp theo totalSpent giảm dần
            },
            {
              $limit: 10 // Giới hạn kết quả để chỉ lấy 4 người dùng có chi tiêu cao nhất
            }
          ]);
  
  
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching order status summary:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
    }
  });
  

router.post(`/admin`, async (req, res) => {
    const {email, password} = req.body;

    try{

        const existingUser = await User.findOne({ email: email });
        if(!existingUser){
            res.status(404).json({error:true, msg:"User not found!"})
            return;
        }
        // if(!existingUser.isVerified) {
        //     res.status(400).json({error:true, msg:"Email is not verify!"})
        //     return;
        // }
        const matchPassword = await bcrypt.compare(password, existingUser.password);
        if(!matchPassword){
            return res.status(400).json({error:true,msg:"Invailid credentials"})
        }

        const token = jwt.sign({email:existingUser.email, id: existingUser._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);


       return res.status(200).send({
            user:existingUser,
            token:token,
            msg:"user Authenticated"
        })

    }catch (error) {
        res.status(500).json({error:true,msg:"something went wrong"});
        return;
    }


})

//cập nhật rank
// Upgrade user rank
router.put('/upgrade-rank/:rank', async (req, res) => {
    const userId = req.user?._id || req.body.userId || req.query.userId; // tuỳ cách bạn xác thực
    const newRank = req.params.rank;
  
    if (!userId || !newRank) {
      return res.status(400).json({ status: 'FAILED', msg: 'Missing userId or rank' });
    }
  
    const allowedRanks = ['bronze', 'silver', 'gold', 'platinum'];
    if (!allowedRanks.includes(newRank)) {
      return res.status(400).json({ status: 'FAILED', msg: 'Invalid rank' });
    }
  
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { rank: newRank },
        { new: true }
      );
  
      if (!user) {
        return res.status(404).json({ status: 'FAILED', msg: 'User not found or update failed' });
      }
  
      return res.status(200).json({ status: 'SUCCESS', msg: 'User rank upgraded', user });
    } catch (error) {
      console.error('Upgrade rank error:', error);
      return res.status(500).json({ status: 'FAILED', msg: 'Server error' });
    }
  });
  


//xử lý cho tháng trước chứ ko phải toàn bộ:
// router.get('/user-rank-stats', async (req, res) => {
//     try {
//       const { userId } = req.query;
  
//       if (!userId) {
//         return res.status(400).json({ message: 'Missing userId' });
//       }
  
//       // Get current date
//       const now = new Date();
  
//       // Calculate first and last day of previous month
//       const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  
//       // Find user
//       const user = await User.findById(userId).select('rank');
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       // Find orders from previous month
//       const orders = await Orders.find({
//         userid: userId,
//         status: { $in: ['paid', 'verify'] },
//         createdAt: { $gte: firstDayPrevMonth, $lte: lastDayPrevMonth }
//       });
  
//       const totalOrders = orders.length;
//       const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
  
//       return res.status(200).json({
//         rank: user.rank || 'Bronze',
//         totalOrders,
//         totalSpent
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Server error' });
//     }
//   });
  
// get user amount follow rank
router.get('/get/data/user-rank-summary', async (req, res) => {
  try {
    const allRanks = ["bronze", "silver", "gold", "platinum"];

    const rankSummary = await User.aggregate([
      {
        $match: {
          isAdmin: false, // chỉ lấy người dùng thông thường
        },
      },
      {
        $group: {
          _id: "$rank",
          count: { $sum: 1 },
        },
      },
    ]);

    // Tạo một object từ kết quả MongoDB để tra nhanh
    const countMap = {};
    rankSummary.forEach((item) => {
      countMap[item._id] = item.count;
    });

    // Duyệt qua allRanks để đảm bảo đủ giá trị
    const formattedData = allRanks.map((rank) => ({
      name: rank,
      value: countMap[rank] || 0,
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching user rank summary:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
});


router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({ success: false, message: 'The user with the given ID was not found.' })
    } else{
        res.status(200).json({ success: true, data: user });
    }
    
})
module.exports = router;
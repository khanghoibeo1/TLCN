const express = require('express');
const router = express.Router();
const { Messages } = require("../models/messages.js");
const { User } = require("../models/user.js");
const cloudinary = require("../helper/cloudinary.js");
const { getReceiverSocketId, getIo } = require("../helper/socketIO/socket.js");
const multer = require('../helper/multer.js')
const streamifier = require('streamifier');

const openAI = require("../helper/openai/openAI.js")
const {authenticateToken } = require("../middleware/authenticateToken");  // Đảm bảo openAi.js được require đúng

const AI_USER_ID = process.env.AI_USER_ID; //AI_USER_ID=000000000000000000000000
const MAX_AI_QUESTIONS = Number(process.env.MAX_AI_QUESTIONS) || 5;



router.get('/users', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const me = await User.findById(adminId);
    if (!me.isAdmin) {
      return res.status(403).json({ error: "Chỉ admin mới truy cập được." });
    }

    // Lấy hết tin nhắn có liên quan đến admin
    const allMsgs = await Messages.find({
      $or: [
        { senderId: adminId },      // admin gửi
        { receiverId: adminId }     // admin nhận
      ]
    });

    // Tập hợp clientId (bên kia là client)
    const clientSet = new Set();
    allMsgs.forEach(m => {
      // nếu admin là receiver thì kia là sender (client)
      if (m.receiverId.toString() === adminId) {
        clientSet.add(m.senderId.toString());
      }
      // nếu admin là sender thì kia là receiver (client)
      else if (m.senderId.toString() === adminId) {
        clientSet.add(m.receiverId.toString());
      }
    });

    const clientIds = Array.from(clientSet);
    if (clientIds.length === 0) {
      return res.json([]);  // không có ai chat cả
    }

    // Lấy thông tin client từ User collection
    const clients = await User.find(
      { _id: { $in: clientIds } },
      "name email phone images"
    );
    res.json(clients);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.get('/admin-info', authenticateToken, async (req, res) => {
  try {
    // Tìm mainAdmin đầu tiên (nếu chỉ có 1)
    const admin = await User.findOne({ role: 'mainAdmin' });
    if (!admin) return res.status(404).json({ error: 'No admin found' });
    // Trả về id và tên (hoặc email) của admin
    res.status(200).json({ _id: admin._id, name: admin.name, email: admin.email});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/bot-history', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const msgs = await Messages.find({
    $or: [
      { senderId: userId,   receiverId: AI_USER_ID },
      { senderId: AI_USER_ID, receiverId: userId }
    ]
  }).sort('createdAt');
  res.json(msgs);
});

router.get('/:id', authenticateToken, async(req, res) => {
    try {
        const myId = req.user.id;
        console.log(req.user)
        console.log(req.params.id)// lấy userId từ token
        const partnerId = req.params.id;
          // Lấy ID đối tác từ params
        
        const partner = await User.findById(partnerId);

        // Kiểm tra xem đối tác có phải là client hoặc mainAdmin không
        if (!partner || !['client', 'mainAdmin'].includes(partner.role)) {
            return res.status(400).json({ error: "Invalid partner. You can only chat with client or mainAdmin." });
        }

        // Lọc các tin nhắn giữa người dùng hiện tại và đối tác
        const messages = await Messages.find({
            $or: [
                { senderId: myId, receiverId: partnerId },
                { senderId: partnerId, receiverId: myId }
            ]
        })
        .populate('senderId')  // Populate thông tin người gửi
        .populate('receiverId');  // Populate thông tin người nhận

        res.status(200).json(messages);  // Trả về tin nhắn
    } catch (error) {
        console.log("Error in getMessages: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})


router.post('/send/:id', authenticateToken, multer.single('image'), async(req, res) => {
    
    try {
        const  text  = req.body.text;
        const imageFile = req.file;
        
        const senderId = req.user.id;
        const receiverId = req.params.id;  
        const sender = await User.findById(senderId); 
        const receiver = await User.findById(receiverId);
        const senderRole = sender.role;
        if (!receiver || !['mainAdmin', 'client'].includes(receiver.role) || !['mainAdmin', 'client'].includes(senderRole)) {
            return res.status(400).json({ error: 'You can only chat between client and mainAdmin' });
        }

        

        // Kiểm tra nếu vai trò của người gửi và người nhận không đúng      
        if ((senderRole === 'client' && receiver.role !== 'mainAdmin') || 
            (senderRole === 'mainAdmin' && receiver.role !== 'client')) {
            return res.status(400).json({ error: 'You can only chat between client and mainAdmin' });
        }

        let imageUrl;
        if (imageFile) {
          const uploadFromBuffer = (buffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "chat_images" },
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
            streamifier.createReadStream(buffer).pipe(stream);
          });

          const uploadResult = await uploadFromBuffer(imageFile.buffer);
          imageUrl = uploadResult.secure_url;
        }
    
        // Lưu tin nhắn
        const newMessage = new Messages({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            senderRole: senderRole,  // Ghi nhận senderRole là admin hoặc client
        });
        await newMessage.save();
        const io = getIo();
    
        // Gửi tin nhắn cho người nhận nếu có socketId
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
})

router.post("/sendBot", authenticateToken,  multer.single("image"), async (req, res) => {
    try {
        const text = req.body.text;

        const imageFile = req.file;
        if (!text || !text.trim()) {
          return res.status(400).json({ error: "Bạn phải nhập nội dung cho AI." });
        }
        const senderId = req.user.id;

        // 1) Lấy thời gian hiện tại và xác định ngày hôm nay
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);  // Bắt đầu ngày hôm nay (00:00:00)
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);  // Kết thúc ngày hôm nay (23:59:59)

        // 2) Kiểm tra số câu hỏi đã gửi trong ngày
        const askedCount = await Messages.countDocuments({
            senderId,
            receiverId: AI_USER_ID,
            createdAt: { $gte: todayStart, $lt: todayEnd },  // Kiểm tra trong ngày hôm nay
        });

        if (askedCount >= 5) {  // Giới hạn 5 câu hỏi trong một ngày
            return res.status(403).json({
                error: "Bạn đã hết lượt hỏi AI trong ngày, vui lòng quay lại vào ngày mai. Bạn có thể liên hệ admin để được hỗ trợ.",
            });
        }

        // 3) Nếu có ảnh => upload lên Cloudinary
        let imageUrl;
        if (imageFile) {
            const uploadFromBuffer = buffer =>
              new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                  { folder: "chat_images" },
                  (err, result) => (err ? reject(err) : resolve(result))
                );
                streamifier.createReadStream(buffer).pipe(stream);
              });
            const uploadResult = await uploadFromBuffer(imageFile.buffer);
            imageUrl = uploadResult.secure_url;
        }

        // 4) Lưu tin nhắn của user => AI
        const userMsg = new Messages({
            senderId,
            receiverId: AI_USER_ID,  // ID của AI
            text,
            image: imageUrl,
            senderRole: "client",
        });
        await userMsg.save();
        const io = getIo();

        const userSocketId = getReceiverSocketId(senderId);
        if (userSocketId) io.to(userSocketId).emit("newMessage", userMsg);

        // 5) Gọi OpenAI để trả lời
        const completion = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",  // Hoặc có thể thay bằng phiên bản mới hơn nếu cần
            messages: [
              {
                role: "system",
                content: `Bạn là trợ lý ảo của FRUITOPIA, chuỗi cửa hàng nông sản tươi sạch. 
                  Bạn chỉ trả lời khi câu hỏi liên quan đến:

                  1. **Danh mục sản phẩm, website cung cấp gì?, website bán gì?    **
                    - Trái cây: táo, cam, chuối, dưa hấu, xoài…  
                    - Rau củ: cà chua, dưa leo, bí đỏ, khoai lang…  
                    - Hạt & gia vị: lạc, điều, hạt chia…  
                    - Thịt: Bò, gà, cá, sản phẩm đông lạnh,...
                  2. **Giá & khuyến mãi**  
                    - Giá hiện tại hiển thị trên website (ví dụ: 50.000₫/kg táo fuji)  
                    - Chương trình giảm 5% khi mua từ 5kg trở lên  
                  3. **Cách thức đặt hàng**  
                    - Q: "Tôi muốn mua thì bò thì làm sao? " 
                    - A: "Bạn có thể đặt hàng qua website hoặc gọi hotline 0912727714 để được hỗ trợ."
                    - Truy cập website của FRUITOPIA  
                    - Chọn sản phẩm, thêm sản phẩm vào giỏ hàng và chọn thanh toán, rồi điền địa chỉ nhận hàng, chọn hình thức thanh toán  
                  4. **Thanh toán**  
                    - COD (thanh toán khi nhận hàng)  
                    - Chuyển khoản ngân hàng (Vietcombank, Techcombank)  
                    - Ví điện tử 
                  5. **Vận chuyển**  
                    - Giao trong nội thành TP.HCM: 2–4 tiếng  
                    - Ngoại thành & tỉnh: 1–2 ngày làm việc  
                    - Miễn phí vận chuyển cho đơn ≥500.000₫  
                  6. **Bảo quản & đổi trả**  
                    - Bảo quản mát 0–4°C trong tủ lạnh  
                    - Đổi trả trong 24h nếu có hàng hư hỏng, mất nước  
                    - Liên hệ hotline 0912727714 để hỗ trợ  
                  7. **Ví dụ Q&A**  
                    - Q: “Mình muốn mua 3kg chuối, giá bao nhiêu?”  
                      A: “Chuối Cavendish giá 30.000₫/kg, 3kg sẽ là 90.000₫. Bạn có thể đặt ngay trên website hoặc qua số 0912727714.”  
                    - Q: “Shop có giao hàng Cần Thơ không?”  
                      A: “Có, bên mình giao hàng toàn quốc, Cần Thơ dự kiến nhận trong 1–2 ngày.
                    - Q: "Xin chào”
                      A: "Xin chào, mình là trợ lý ảo của FRUITOPIA. Bạn cần hỗ trợ gì về sản phẩm nông sản tươi sạch không?"
                    - Q: "Mình muốn mua 5kg táo, có giảm giá không?"
                      A: "Có, nếu bạn mua từ 5kg táo trở lên sẽ được giảm 5%. Giá hiện tại là 50.000₫/kg, vậy 5kg sẽ là 237.500₫ sau khi giảm giá."
                  - Q: "Mình muốn mua 2kg dưa hấu, giá bao nhiêu?"
                      A: "Dưa hấu hiện tại giá 20.000₫/kg, vậy 2kg sẽ là 40.000₫. Bạn có thể đặt hàng qua website hoặc gọi hotline 0912727714 để được hỗ trợ."  

                  **Luôn** trả lời ngắn gọn, rõ ràng, và chỉ đi vào chủ đề nông sản. Nếu người dùng hỏi ngoài phạm vi, hãy nói:  
                  “Xin lỗi, mình chỉ hỗ trợ về sản phẩm và dịch vụ của FRUITOPIA. Vui lòng liên hệ Admin để được giúp đỡ thêm.” `
              },
              { role: "user", content: text }
            ],
            max_tokens: 1500,  // Điều chỉnh max_tokens theo yêu cầu
        });
        
        const botText = completion.choices[0].message.content.trim();

        // 6) Kiểm tra nếu GPT không thể trả lời => gửi tín hiệu chuyển admin
        const cannot =
            !botText ||
            /i (do not|don't) know|i'm not sure|không.*biết/i.test(botText);

        if (cannot) {
            const io = getIo();
            io.to(senderId.toString()).emit("transfer_to_admin");
            return res.status(200).json({ transfer: true });
        }

        // 7) Lưu tin nhắn từ AI => user
        const botMsg = new Messages({
            senderId: AI_USER_ID,  // ID của AI
            receiverId: senderId,
            text: botText,
            senderRole: "bot",
        });
        await botMsg.save();

        io.to(senderId.toString()).emit("newMessage", botMsg);

        // 9) Phản hồi về client
        return res.status(200).json(botMsg);
    } catch (err) {
        console.error("Error in sendBotMessage:", err.message);
        return res.status(500).json({ error: "Lỗi xử lý ChatGPT." });
    }
});

router.get('/count/unread', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const count = await Messages.countDocuments({
    receiverId: userId,
    senderRole: 'mainAdmin',
    isRead: false
  });
  res.json({ unreadCount: count });
});

// 2) đánh dấu đã đọc
router.put('/count/mark-read', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  await Messages.updateMany(
    { receiverId: userId, senderRole: 'mainAdmin', isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});

router.get('/count/unread-admin/:clientId', authenticateToken, async (req, res) => {
  try {
    const adminId = req.user.id;
    const clientId = req.params.clientId;
    // chỉ đếm role client gửi đến admin
    const count = await Messages.countDocuments({
      senderId: clientId,
      receiverId: adminId,
      senderRole: 'client',
      isRead: false
    });
    res.json({ unreadCount: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put('/count/markread-admin/:clientId', authenticateToken, async (req, res) => {
  const adminId  = req.user.id;
  const clientId = req.params.clientId;
  // chỉ update những tin nhắn do client gửi tới admin chưa đọc
  await Messages.updateMany(
    { receiverId: adminId, senderRole: 'client', senderId: clientId, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ success: true });
});


module.exports = router;

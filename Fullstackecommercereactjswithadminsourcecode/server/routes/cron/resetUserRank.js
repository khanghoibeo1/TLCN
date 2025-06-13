const cron = require('node-cron');
const { Orders } = require('../../models/orders');
const { RecentView } = require('../../models/recentView');
const {User} = require('../../models/user'); 
const {Recommendation} = require('../../models/recommendation'); 
const {Product} = require('../../models/products.js'); // sửa đường dẫn nếu cần
const {BatchCode} = require('../../models/batchCode');     // sửa đường dẫn nếu cần
const openAI = require("../../helper/openai/openAI.js")
const {authenticateToken } = require("../../middleware/authenticateToken");  // Đảm bảo openAi.js được require đúng

const AI_USER_ID = process.env.AI_USER_ID; //AI_USER_ID=000000000000000000000000
const MAX_AI_QUESTIONS = Number(process.env.MAX_AI_QUESTIONS) || 5;

// Chạy vào 00:00 ngày 1 hàng tháng
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log("Resetting all user ranks...");

    await User.updateMany({}, { rank: 'bronze' }); // hoặc 'unranked' nếu cần

    console.log("All user ranks have been reset.");
  } catch (error) {
    console.error("Failed to reset user ranks:", error);
  }
});

// Cron chạy mỗi đêm lúc 00:00
cron.schedule('0 0 * * *', async () => {
  try {
    console.log("==> Start updating amountAvailable for all products");

    const today = new Date();
    const products = await Product.find({});

    for (const product of products) {
      let updated = false;

      for (const locationEntry of product.amountAvailable) {
        const locationId = locationEntry.locationId;

        const validBatches = await BatchCode.find({
          productId: product._id,
          locationId: locationId,
          status: 'delivered',
          expiredDate: { $gte: today },
        });

        const totalRemain = validBatches.reduce((sum, batch) => sum + batch.amountRemain, 0);

        if (locationEntry.quantity !== totalRemain) {
          locationEntry.quantity = totalRemain;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        console.log(`✅ Updated amountAvailable for product: ${product.name}`);
      }
    }

    console.log("==> All products have been updated successfully");
  } catch (err) {
    console.error("❌ Error updating amountAvailable:", err);
  }
});

async function autoCancelPendingVNPayOrders() {
  try {
    console.log("🔄 Checking for VNPAY pending orders older than 15 minutes...");

    const fifteenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const orders = await Orders.find({
      status: 'pending',
      payment: 'VNPAY',
      createdAt: { $lte: fifteenMinutesAgo }
    });

    for (const order of orders) {
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

      console.log(`❌ Auto-cancelled order ${order._id} due to timeout.`);
    }

    console.log("✅ Auto-cancel process completed.");
  } catch (err) {
    console.error("❌ Error auto-cancelling orders:", err);
  }
}

cron.schedule('*/10 * * * *', autoCancelPendingVNPayOrders);

// Hàm chứa logic cập nhật
async function updateProductAvailability() {
  try {
    console.log("==> Start updating amountAvailable for all products");

    const today = new Date();
    // Để đảm bảo today luôn là đầu ngày (00:00:00.000) của múi giờ bạn muốn,
    // bạn có thể điều chỉnh như sau nếu cần:
    // const today = new Date();
    // today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây, mili giây về 0
    // console.log(`Today for query: ${today}`); // Log để kiểm tra

    const products = await Product.find({});

    for (const product of products) {
      let updated = false;

      for (const locationEntry of product.amountAvailable) {
        const locationId = locationEntry.locationId;

        const validBatches = await BatchCode.find({
          productId: product._id,
          locationId: locationId,
          status: 'delivered',
          expiredDate: { $gte: today },
        });

        const totalRemain = validBatches.reduce((sum, batch) => sum + batch.amountRemain, 0);

        if (locationEntry.quantity !== totalRemain) {
          locationEntry.quantity = totalRemain;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
        console.log(`✅ Updated amountAvailable for product: ${product.name}`);
      }
    }

    console.log("==> All products have been updated successfully");
  } catch (err) {
    console.error("❌ Error updating amountAvailable:", err);
  }
}

// Gọi hàm này bất cứ lúc nào bạn muốn chạy
updateProductAvailability();


async function UpadateRecentView () {
  try {
    console.log("🔄 Đang tạo gợi ý sản phẩm từ AI...");

    // Bước 1: Lấy toàn bộ sản phẩm
    const allProducts = await Product.find({}, "id name category subCategory season rating brand");

    // Format cho prompt chưa có rating và brand và season
    const productList = allProducts.map(p => ({
      id: p.id.toString(),
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      season: p.season,
    }));

    const allViews = await RecentView.find({}).populate("viewedProducts.productId");

    for (const view of allViews) {
      const userId = view.userId;
      const viewed = view.viewedProducts
        .map(v => v.productId)
        .filter(Boolean)
        .slice(-30);

      const viewedList = viewed.map(p => ({
        id: p._id.toString(),
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        season: p.season,
      }));

      const prompt = `
Bạn là hệ thống gợi ý sản phẩm cho người dùng của FRUITOPIA.

Dưới đây là danh sách **toàn bộ sản phẩm** (gọi là "Tập sản phẩm"):
${JSON.stringify(productList)}

Và dưới đây là danh sách **30 sản phẩm người dùng đã xem gần đây**:
${JSON.stringify(viewedList)}

Hãy chọn ra khoảng **50 sản phẩm từ Tập sản phẩm** mà bạn cho rằng phù hợp nhất với người dùng này, sắp xếp theo mức độ liên quan từ cao đến thấp.

**Chỉ trả về mảng các ID sản phẩm (chuỗi _id Mongo) theo đúng thứ tự**, ví dụ:
["665f13e2abc123", "665f1355def456", "665f19zz789999", ...]

Không cần thêm lời giải thích.
      `.trim();

      const aiRes = await openAI.chat.completions.create({
        model: "gpt-3.5-turbo", // hoặc gpt-3.5-turbo nếu bạn dùng bản rẻ hơn
        messages: [
          {
            role: "system",
            content: `Bạn là AI gợi ý sản phẩm theo hành vi người dùng.`
          },
          { role: "user", content: `${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      if (
        aiRes &&
        aiRes.choices &&
        aiRes.choices.length > 0 &&
        aiRes.choices[0].message
      ) {
        rawText = aiRes.choices[0].message.content.trim();
      } else {
        console.error("❌ Không có phản hồi hợp lệ từ OpenAI");
        continue; // bỏ qua user này, sang người tiếp theo
      }

      let productIds;
      try {
        productIds = JSON.parse(rawText); // Nếu GPT trả về mảng JSON hợp lệ
        console.log(productIds)
      } catch (e) {
        // fallback: xử lý nếu trả về dạng ["id1", "id2"] nhưng lỗi cú pháp
        productIds = rawText
          .replace(/[\[\]"]/g, "")
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
      }

      // Lưu hoặc cập nhật vào Recommendation
      await Recommendation.findOneAndUpdate(
        { userId },
        {
          userId,
          recommendedProducts: productIds.slice(0, 50), // chỉ giữ 50
        },
        { upsert: true, new: true }
      );

      console.log(`✅ Đã cập nhật gợi ý cho user ${userId}`);
    }

    console.log("🎯 Hoàn tất cập nhật gợi ý sản phẩm.");
  } catch (err) {
    console.error("❌ Lỗi cập nhật gợi ý:", err.message);
  }
};

UpadateRecentView();

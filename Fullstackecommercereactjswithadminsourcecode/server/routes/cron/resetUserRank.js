const cron = require('node-cron');
const {User} = require('../../models/user'); 
const {Product} = require('../../models/products.js'); // sửa đường dẫn nếu cần
const {BatchCode} = require('../../models/batchCode');     // sửa đường dẫn nếu cần

// Chạy vào 00:00 ngày 1 hàng tháng
cron.schedule('0 0 1 * *', async () => {
  try {
    console.log("Resetting all user ranks...");

    await User.updateMany({}, { rank: 'Bronze' }); // hoặc 'unranked' nếu cần

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

// Bạn có thể bỏ đoạn cron.schedule đi nếu bạn chỉ muốn chạy thủ công
// hoặc vẫn giữ nó nếu muốn nó chạy tự động vào 0h đêm
// cron.schedule('0 0 * * *', updateProductAvailability); // Nếu muốn dùng lại hàm này cho cron
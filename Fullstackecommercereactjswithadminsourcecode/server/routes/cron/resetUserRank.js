const cron = require('node-cron');
const {User} = require('../../models/user'); 

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

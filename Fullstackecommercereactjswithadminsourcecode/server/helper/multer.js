const multer = require('multer');
const storage = multer.memoryStorage();  // hoặc diskStorage nếu muốn lưu tạm vào ổ đĩa
module.exports = multer({ storage });
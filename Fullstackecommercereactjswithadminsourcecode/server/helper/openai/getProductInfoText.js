const { Product } = require("../../models/products");
const { BatchCode } = require("../../models/batchCode");
const { PromotionCode } = require("../../models/promotionCode");

const getProductInfoText = async (text) => {
  const matched = text.match(/(xoài|chuối|táo|bí đỏ|gà|bò|cá|dưa hấu)/i);
  if (!matched) return "";

  const keyword = matched[1];

  // 1. Tìm sản phẩm
  const product = await Product.findOne({ name: new RegExp(keyword, "i") });
  if (!product) return "";

  let info = `Sản phẩm: ${product.name}.\nMô tả: ${product.description}`;

  // 2. Tìm lô hàng mới nhất (Batch) có sản phẩm đó
  const latestBatch = await BatchCode.findOne({ productId: product._id })
    .sort({ importDate: -1 });

  if (latestBatch) {
    const { price, oldPrice, discount, amountRemain } = latestBatch;
    info += `\nGiá hiện tại: ${price.toLocaleString()}₫/${product.catName || "kg"}`;
    if (discount > 0) {
      info += ` (đang giảm ${discount}% so với giá gốc ${oldPrice.toLocaleString()}₫)`;
    }
    if (amountRemain <= 10) {
      info += `\n⚠️ Còn lại khoảng ${amountRemain} sản phẩm – nên đặt sớm!`;
    }
  }

  // 3. Kiểm tra khuyến mãi áp dụng được
  const now = new Date();
  const promo = await PromotionCode.findOne({
    status: "active",
    startDate: { $lte: now },
    endDate: { $gte: now },
    "applicableCategoryIds.id": product.catId
  });

  if (promo) {
    const promoDesc = promo.discountType === "percent"
      ? `giảm ${promo.discountValue}%`
      : `giảm ${promo.discountValue.toLocaleString()}₫`;
    info += `\n🎁 Khuyến mãi: ${promoDesc} cho đơn từ ${promo.minOrderValue.toLocaleString()}₫ (mã: ${promo.code}).`;
  }

  return info;
};

module.exports = getProductInfoText;

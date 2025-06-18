const { mailtrapClient, sender } = require("./mailtrap.config");
const { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE,ORDER_CONFIRMATION_TEMPLATE, } = require("./emailTemplates");

const sendVerficationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const respone = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Email sent successfully", respone)
    }catch (error){
        console.log('Error sending verification', error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

const sendWelcomeEmail = async(email, name) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "fdb4eca6-fb6c-4e3a-b169-419439bef33a",
            template_variables: {
                "company_info_name": "Fruitopia",
                "name": name
            }
        });

        console.log("Welcome email sent successfully!", response)
    }catch(error){
        console.log('Error sending verification', error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: 'Password Reset',
        })
    } catch (error) {
        console.error('Error sending password reset email', error)

        throw new Error (`Error sending password reset email: ${error}`);
    }
}

const sendResetSuccessEmail = async(email) => {
    const recipient = [{email}]

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Password Reset successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: 'Password Reset'
        });
        console.log("Password reset email sent successfully", response)
    } catch(error){
        console.error('Error sending password reset email', error)

        throw new Error (`Error sending password reset email: ${error}`);
    }
}

const sendOrderConfirmationEmail = async (
  email,
  customerName,
  orderId,
  totalAmount,
  paymentMethod,
  shippingMethod,
  orderItems
) => {
  const recipient = [{ email: 'minhthien12149@gmail.com' }];

  // Tạo chuỗi HTML cho phần chi tiết sản phẩm
  const itemsHtml = orderItems
    .map(
      (item) => `
      <tr>
        <td>${item.productName}</td>
        <td align="center">${item.quantity}</td>
        <td align="right">${item.subTotalFormatted}</td>
      </tr>
    `
    )
    .join("");

  // Thay thế các placeholder
  let htmlBody = ORDER_CONFIRMATION_TEMPLATE
    .replace("{customerName}", customerName)
    .replace("{orderId}", orderId)
    .replace(
      "{totalAmount}",
      totalAmount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })
    )
    .replace("{paymentMethod}", paymentMethod)
    .replace(
      "{shippingMethod}",
      shippingMethod === "express" ? "Express Shipping" : "Standard Shipping"
    )
    .replace("{orderItems}", itemsHtml);

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: `Order #${orderId} Confirmation`,
      html: htmlBody,
      category: "Order Confirmation",
    });
    console.log("Order confirmation email sent:", response);
  } catch (error) {
    console.error("Error sending order confirmation email", error);
    // Nếu bạn không muốn rollback order khi mail lỗi, chỉ cần log và không throw
    throw new Error(`Error sending order confirmation email: ${error}`);
  }
};

module.exports = {sendVerficationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail, sendOrderConfirmationEmail,};
const { mailtrapClient, sender } = require("./mailtrap.config");
const { VERIFICATION_EMAIL_TEMPLATE } = require("./emailTemplates");

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
        console.log(`Error sending verification`, error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

module.exports = {sendVerficationEmail};
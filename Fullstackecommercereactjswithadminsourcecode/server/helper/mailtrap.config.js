const { MailtrapClient } = require("mailtrap");
require('dotenv').config();

// console.log( process.env.MAILTRAP_API_TOKEN)
const TOKEN = process.env.MAILTRAP_API_TOKEN;

const client = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "Trong Khang",
};
const recipients = [
  {
    email: "trongkhang1304@gmail.com",
  }
];

client
  .send({
    from: sender,
    to: recipients,
    subject: "You are awesome!",
    text: "Congrats for sending test email with Mailtrap!",
    category: "Integration Test",
  })
  .then(console.log, console.error);
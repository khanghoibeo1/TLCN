const {OpenAI} = require('openai');

const  openAI = new OpenAI({
    apiKey: process.env.SECRET_API_KEY_OPENAI,
})

module.exports = openAI
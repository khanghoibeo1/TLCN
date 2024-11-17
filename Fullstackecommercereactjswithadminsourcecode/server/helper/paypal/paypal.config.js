const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.SandboxEnvironment(
    process.env.REACT_APP_PAYPAL_CLIENT_ID,
    process.env.REACT_APP_PAYPAL_SECRET_KEY
);
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
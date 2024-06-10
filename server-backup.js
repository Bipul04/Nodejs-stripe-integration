// This is your test secret API key.
const stripe = require('stripe')('sk_test_51PP1XZEQ1vtBeWQLF5by5hPyHnR7aVWrPpAyYrqcXDaKPnbVjUGRWB5t4RZIEfySYzkQqYeHpydfwrB1x6dq48JU008LxRcAzm');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const YOUR_DOMAIN = 'https://apps.cartmade.com/boshhh-integration//frontend/test';

app.post('/create-checkout-session', async (req, res) => {
    const customer = await stripe.customers.create();
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        line_items: [
            {
                price_data: {
                  unit_amount: 0.00,
                  product_data: {
                    name: 'T-shirt',
                  },
                  currency: 'usd',
                },
                quantity: 1,
              },
        ],
     
        mode: 'payment',
        return_url: `${YOUR_DOMAIN}/return.php?session_id=cs_test_a11YYufWQzNY63zpQ6QSNRQhkUpVph4WRmzW0zWJO2znZKdVujZ0N0S22u`,
    });

    const paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        setup_future_usage: 'off_session',
        amount: 1099,
        currency: 'usd',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
       
        saved_payment_method_options: {
            payment_method_save: 'enabled',
        },
      });

    res.send({ clientSecret: paymentIntent.client_secret });
});

app.get('/session-status', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    res.send({
        status: session.status,
        customer_email: session.customer_details.email
    });
});

app.listen(4242, () => console.log('Running on port 4242'));
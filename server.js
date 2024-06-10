const stripe = require('stripe')('sk_test_51PP1XZEQ1vtBeWQLF5by5hPyHnR7aVWrPpAyYrqcXDaKPnbVjUGRWB5t4RZIEfySYzkQqYeHpydfwrB1x6dq48JU008LxRcAzm');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "usd",
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
});



app.post("/create-setup-intent", async (req, res) => {
    const model = req.body;
    const options = {
        automatic_payment_methods: {
            enabled: true,
        },
    };

    if (!!model.customer) {
        options.customer = model.customer;
    }

    try {
        const s = await stripe.setupIntents.create(options);

        res.send({
            success: true,
            clientSecret: s?.client_secret,
        });
    } catch (e) {
        res.status(500).send({
            success: false, error: (e)?.message
        });
    }
});

app.post("/create-customer", async (req, res) => {
    const model = req.body;

    try {
        const p = await stripe.customers.create({
            email: model.email,
            name: `${model.firstname} ${model.lastname}`,
            metadata: {
                firstname: model.firstname,
                lastname: model.lastname,
            },
        });

        res.send({
            success: true,
            customer: p.id,
        });
    } catch (e) {
        res.status(500).send({ success: false, error: (e)?.message });
    }
});


app.post("/finish-setup", async (req, res) => {
    const model = req.body;

    try {
        if (!model.setupintent) {
            throw new Error('Setup intent not found');
        }

        const si = await stripe.setupIntents.retrieve(model.setupintent);

        if (!si?.payment_method) {
            throw new Error('Payment method not found');
        }

        // attach
        if (!si.customer) {
            await stripe.paymentMethods.attach(si.payment_method, {
                customer: user.stripeid,
            })
        } else {
            await stripe.customers.update(si.customer, {
                invoice_settings: {
                    default_payment_method: si.payment_method,
                },
            });
        }

        res.send({
            success: true,
        });
    } catch (e) {
        res.status(500).send({ success: false, error: (e)?.message });
    }
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
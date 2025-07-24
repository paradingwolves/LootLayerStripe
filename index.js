const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


const allowedOrigins = [
  'https://lootlayer.ca',
  'https://www.lootlayer.ca',
  'https://ecommerce-website-hpl7.vercel.app', // if applicable
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


// Log incoming requests with method, path, origin, and body (for POST)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from origin: ${req.headers.origin || 'unknown'}`);
  if (req.method === 'POST') {
    console.log('Request body:', req.body);
  }
  next();
});

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // amount in cents

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('PaymentIntent creation error:', err);
    res.status(500).json({ error: 'PaymentIntent creation failed' });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

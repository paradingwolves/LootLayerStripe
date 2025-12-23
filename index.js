const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


const allowedOrigins = [
  'https://lootlayer.ca',
  'https://www.lootlayer.ca',
  'https://ecommerce-website-hpl7.vercel.app', 
  'http://localhost:3000'
];

app.use(express.json());

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



app.post('/create-payment-intent', async (req, res) => {
  const { amount } = req.body; // amount in cents

  console.log('--- /create-payment-intent called ---');
  console.log('Raw request body:', req.body);
  console.log('Amount received (cents):', amount);
  console.log('Amount received (dollars): $', (amount / 100).toFixed(2));

  if (!amount || typeof amount !== 'number') {
    console.error('Invalid amount:', amount);
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ PaymentIntent created successfully:', paymentIntent.id);
    console.log('Client secret will be returned to frontend');

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('❌ PaymentIntent creation error:', err);
    res.status(500).json({ error: 'PaymentIntent creation failed' });
  }
});



const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

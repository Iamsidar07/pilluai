import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_API_KEY;
if (!stripeSecretKey) {
  throw new Error("No STRIPE_API_KEY");
}

const stripe = new Stripe(stripeSecretKey);
export default stripe;

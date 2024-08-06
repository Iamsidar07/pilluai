"use server";

import { adminDb } from "@/firebaseAdmin";
import getBaseURL from "@/lib/getBaseURL";
import stripe from "@/lib/stripe";
import { UserDetails } from "../../typing";

const createCheckoutSession = async (
  userId: string,
  userDetails: UserDetails
) => {
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }
  try {
    let stripeCustomerId = null;
    const user = await adminDb.collection("users").doc(userId).get();
    stripeCustomerId = user.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userDetails.email,
        name: userDetails.name,
        metadata: {
          userId,
        },
      });
      // store in db
      await adminDb.collection("users").doc(userId).set({
        stripeCustomerId: customer.id,
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "amazon_pay"],
      line_items: [
        {
          price: process.env.PRODUCT_PRICE_ID,
          quantity: 1,
        },
      ],
      customer: stripeCustomerId,
      mode: "subscription",
      success_url: `${getBaseURL()}/boards?upgrade=true`,
      cancel_url: `${getBaseURL()}/pricing`,
    });
    return { success: true, sessionId: session.id };
  } catch (e) {
    console.log(e);
    return { success: false, message: "Failed to create Stripe customer." };
  }
};

export default createCheckoutSession;

"use server";

import { adminDb } from "@/firebaseAdmin";
import getBaseURL from "@/lib/getBaseURL";
import stripe from "@/lib/stripe";

const createStripePortal = async (userId: string) => {
  if (!userId) {
    return { success: false, message: "User not found" };
  }
  try {
    const user = await adminDb.collection("users").doc(userId).get();
    const stripeCustomerId = user.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      return { success: false, message: "stripe customer id not found." };
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getBaseURL()}/boards`,
    });
    return { success: true, sessionUrl: session.url };
  } catch (e) {
    console.log("Failed to create stripe portal", e);
    return { success: false, message: "Failed to create stripe portal" };
  }
};
export default createStripePortal;

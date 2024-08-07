"use server";

import { adminDb } from "@/firebaseAdmin";
import getBaseURL from "@/lib/getBaseURL";
import stripe from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";

const createStripePortal = async () => {
  auth().protect();
  try {
    const { userId } = auth();
    if (!userId) return { success: false, message: "user not found" };
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

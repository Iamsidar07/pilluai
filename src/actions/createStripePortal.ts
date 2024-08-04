"use server";

import { adminDb } from "@/firebaseAdmin";
import getBaseURL from "@/lib/getBaseURL";
import stripe from "@/lib/stripe";

const createStripePortal = async (userId: string) => {
  if (!userId) {
    throw new Error("User not found");
  }
  const user = await adminDb.collection("users").doc(userId).get();
  const stripeCustomerId = user.data()?.stripeCustomerId;
  if (!stripeCustomerId) {
    throw new Error("stripeCustomerId not found");
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${getBaseURL()}/boards`,
  });
  return session.url;
};
export default createStripePortal;

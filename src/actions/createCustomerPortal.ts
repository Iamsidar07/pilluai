"use server";

import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";
import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { configureLemonSqueezy } from "@/config/lemonsqueezy";

const createCustomerPortal = async () => {
  auth().protect();
  try {
    configureLemonSqueezy()
    const { userId } = auth();
    if (!userId) return { success: false, message: "user not found" };
    const user = (await adminDb.collection("users").doc(userId).get()).data();
    console.log('got the user',user, user?.subscriptionId)
    const { data, error } = await getSubscription(user?.subscriptionId?.toString());
    console.log("data: ", data, "error", error, data?.data.links, data?.links.self, data?.data.attributes.urls, data?.data.attributes.first_subscription_item);

    return { success: true, url: data?.data.attributes.urls };
  } catch (e) {
    console.log("Failed to create stripe portal", e);
    return { success: false, message: "Failed to create stripe portal" };
  }
};
export default createCustomerPortal;

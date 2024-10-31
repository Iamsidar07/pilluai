"use server";

import { adminDb } from "@/firebaseAdmin";
import getBaseURL from "@/lib/getBaseURL";
import { UserDetails } from "../../typing";
import { auth } from "@clerk/nextjs/server";
import {
  createCheckout,
  createCustomer,
  NewCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";
import { configureLemonSqueezy } from "@/config/lemonsqueezy";

const createCheckoutSession = async (userDetails: UserDetails) => {
  auth().protect();
  const { userId } = auth();
  if (!userId) {
    return { success: false, message: "User ID is required" };
  }
  try {
    configureLemonSqueezy();
    let customerId: null | string;
    const user = await adminDb.collection("users").doc(userId).get();
    customerId = user.data()?.customerId;
    const storeId = process.env.LEMONSQUEEZY_STORE_ID as string;
    const variantId = process.env.LEMONSQUEEZY_PRODUCT_VARIANT_ID as string;
    if (!customerId) {
      const customer = await createCustomer(storeId, {
        email: userDetails.email,
        name: userDetails.name,
      });
      console.log("Create the lemonsqueezy customer: ", customer.data);
      await adminDb
        .collection("users")
        .doc(userId)
        .set({
          customerId: customer.data?.data.id || "",
        });
      customerId = customer.data?.data.id || "";
    }

    const newCheckout: NewCheckout = {
      productOptions: {
        name: "Pillu AI Pro plan",
        description: "Get the primium access to app",
        redirectUrl: `${getBaseURL()}/boards?upgrade=true`,
      },
      checkoutOptions: {
        embed: true,
        media: true,
        logo: true,
        subscriptionPreview: true,
      },
      checkoutData: {
        email: userDetails.email,
        name: userDetails.name,
        custom: {
          userId: user.id,
        },
      },
      expiresAt: null,
      preview: true,
      testMode: process.env.NODE_ENV === "development",
    };
    const { statusCode, error, data } = await createCheckout(
      storeId,
      variantId,
      newCheckout
    );
    console.log("checkout session", data);
    return {
      success: true,
      sessionId: data?.data.id,
      url: data?.data.attributes.url,
    };
  } catch (e: any) {
    console.log(e);
    return { success: false, message: e.message};
  }
};

export default createCheckoutSession;

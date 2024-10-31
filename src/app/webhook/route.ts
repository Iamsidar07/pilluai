import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebaseAdmin";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  console.log("webhook:", secret);

  if (!secret) {
    return NextResponse.json("LEMONSQUEEZY_WEBHOOK_SECRET not set in .env", {
      status: 400,
    });
  }

  const rawBody = await request.text();
  const signature = Buffer.from(
    request.headers.get("X-Signature") ?? "",
    "hex"
  );

  if (signature.length === 0 || rawBody.length === 0) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  const hmac = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  );
  // @ts-ignore
  if (!crypto.timingSafeEqual(hmac, signature)) {
    return NextResponse.json("Invalid request", { status: 400 });
  }

  // The request is valid, parse the data here
  const data = JSON.parse(rawBody);

  const eventName = data["meta"]["event_name"];
  const attributes = data["data"]["attributes"];
  const getCustomerDetailsByUserId = async (userId: string) => {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    return userDoc;
  };
  async function getCustomerDetailsBySubscriptionId(subscriptionId: string) {
    try {
      // Query the 'users' collection where the subscriptionId matches and limit to 1 result
      const querySnapshot = await adminDb
        .collection("users")
        .where("subscriptionId", "==", subscriptionId)
        .limit(1)
        .get();

      // Check if any document matches the query
      if (querySnapshot.empty) {
        console.log("No matching user found.");
        return null;
      }

      // Return the first matching document
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      console.error("Error fetching user by subscription ID:", error);
      throw new Error("Failed to retrieve user");
    }
  }

  console.log("got webhook data", data);

  switch (eventName) {
    case "subscription_payment_success": {
      const userId = data["meta"]["custom_data"]["user_id"];
      const subscriptionId = attributes["subscription_id"];
      const user = await getCustomerDetailsByUserId(userId);
      if (!user?.id) {
        return new NextResponse("User not found", { status: 400 });
      }

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMembership: true,
        subscriptionId: subscriptionId.toString(),
        credits: 1000,
      });
      break;
    }
  //   customerId: '4063254',
  // credits: 1000,
  // subscriptionId: '690545',
  // hasActiveMembership: true

    case "subscription_cancelled":
    case "subscription_expired": {
      const subscriptionId =
        attributes["first_subscription_item"]["subscription_id"];
        console.log("subscriptionId", subscriptionId)
      const user = await getCustomerDetailsBySubscriptionId(subscriptionId.toString());
      if (!user?.id) {
        return new NextResponse("User not found", { status: 400 });
      }
      

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMembership: false,
        subscriptionId: null,
        credits: 0,
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json("OK", { status: 200 });
}

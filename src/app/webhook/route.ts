import { adminDb } from "@/firebaseAdmin";
import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const headerList = headers();
  const body = await req.text();
  const signature = headerList.get("stripe-signature");
  if (!signature) {
    return new Response("No signature header", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.log("No webhook secret set");
    return new Response("No webhook secret set", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("Webhook error", error);
    return new NextResponse(`Webhook error ${error}`, { status: 400 });
  }

  const getCustomerDetails = async (customerId: string) => {
    const userDoc = await adminDb
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();
    if (!userDoc.empty) {
      return userDoc.docs[0].data();
    }
  };

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      const user = await getCustomerDetails(customerId);
      if (!user?.id) {
        return new NextResponse("User not found", { status: 400 });
      }

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMembership: true,
      });
      break;
    }

    case "customer.subscription.deleted":
    case "subscription_schedule.canceled": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const user = await getCustomerDetails(customerId);
      if (!user?.id) {
        return new NextResponse("User not found", { status: 400 });
      }

      await adminDb.collection("users").doc(user.id).update({
        hasActiveMembership: false,
      });
      break;
    }
    default:
      console.log("Unhandled event type", event.type);
      break;
  }

  return NextResponse.json({ message: "webhooks received" });
}

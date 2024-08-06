"use client";
import createCheckoutSession from "@/actions/createCheckoutSession";
import createStripePortal from "@/actions/createStripePortal";
import { Button } from "@/components/ui/button";
import useCurrentUser from "@/context/currentUser";
import useSubscription from "@/hooks/useSubscription";
import getStripe from "@/lib/stripe-js";
import { CheckIcon, Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { UserDetails } from "../../typing";
import { toast } from "sonner";

const Pricing = () => {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const handleUpgrade = () => {
    if (!user) return;
    const userDetails: UserDetails = {
      email: user.email,
      name: user.name,
    };

    startTransition(async () => {
      const stripe = await getStripe();
      if (hasActiveMembership) {
        // manage
        const { success, message, sessionUrl } = await createStripePortal(
          user.uid
        );

        if (!success && message) {
          toast.error(message);
          return;
        }
        if (!sessionUrl) return;
        return router.push(sessionUrl);
      }
      const { success, message, sessionId } = await createCheckoutSession(
        user.uid,
        userDetails
      );
      if (!success && message) {
        toast.error(message);
        return;
      }
      if (!sessionId) return;
      await stripe?.redirectToCheckout({
        sessionId,
      });
    });
  };
  return (
    <div className="min-h-screen p-8 py-24 md:py-32">
      <div className="flex flex-col items-center space-y-4 max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-primary">Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          Supercharge your Whiteboard Companion
        </h1>
        <div className="text-gray-400 text-normal sm:text-lg leading-7 text-center max-w-xl mx-auto">
          Choose an affordable plan that packed with the best features for
          interacting with your PDFs, Youtube Videos, Images and chat with
          Website, enhancing productivity, streamlining your workflows.
        </div>
      </div>
      {/*plans*/}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-lg md:max-w-4xl mx-auto">
        {/* free plan */}
        <div className="bg-white/50 ring-1 ring-gray-200 shadow-sm p-8 rounded-3xl h-fit flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Starter plan</h3>
          <p className="text-gray-400">Explore core features at no cost.</p>
          <h2 className="text-4xl sm:text-5xl font-bold">Free</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Chat with 1 youtube video</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">
                Chat with 1 pdf document (up to size 4mb)
              </p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Chat with 1 image</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Chat with 1 website</p>
            </li>

            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Unlimited text nodes</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Up to 1 board</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Up to 3 messages per chat</p>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm max-w-[90%]">
                <span className="font-bold">Notion-Like Editor:</span> Enjoy a
                seamless and beautiful editing experience to write and organize
                notes.
              </p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Try out the AI Chat Functionality</p>
            </li>
          </ul>
        </div>
        {/*pro plan*/}
        <div className="bg-white ring-2 ring-primary shadow-lg p-8 rounded-3xl h-fit flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Pro plan</h3>
          <p className="text-gray-400">
            Maximize your productivity with PRO features.
          </p>
          <div className="flex gap-1 items-baseline">
            <span className="text-4xl sm:text-5xl font-bold">$5.99</span>
            <span className="text-sm font-semibold text-gray-400">/month</span>
          </div>
          {pathname === "/pricing" && (
            <Button
              onClick={handleUpgrade}
              disabled={loading || isPending}
              className="w-full mb-4 font-bold"
            >
              {loading || isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasActiveMembership ? (
                "Manage Plan"
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          )}
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Can add 10 youtube node in one board</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Can add 10 website node in one board</p>
            </li>

            <li className="flex items-start gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">
                Can add 10 pdf document (up to size 16mb) node in one board
              </p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Chat with unlimited image</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Unlimited text nodes</p>
            </li>

            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Create up to 20 boards</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Abiltiy to delete board</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Abiltiy to rename board</p>
            </li>
            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">Up to 100 messages per chat</p>
            </li>
            <li className="flex items-start gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm max-w-[90%]">
                <span className="font-bold">Notion-Like Editor:</span> Enjoy a
                seamless and beautiful editing experience to write and organize
                notes.
              </p>
            </li>

            <li className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <p className="text-sm ">
                Full power AI Chat Functionality with memory recall
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

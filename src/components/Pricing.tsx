"use client";
import createCheckoutSession from "@/actions/createCheckoutSession";
import createCustomerPortal from "@/actions/createCustomerPortal";
import { Button } from "@/components/ui/button";
import useSubscription from "@/hooks/useSubscription";
import { CheckIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { UserDetails } from "../../typing";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

const Pricing = () => {
  const { user } = useUser();
  const router = useRouter();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();

  const handleUpgrade = () => {
    if (!user) return;
    const userDetails: UserDetails = {
      email: user.emailAddresses[0].toString(),
      name: user.fullName!,
    };

    startTransition(async () => {
      if (hasActiveMembership) {
        // Manage existing subscription
        const { success, message, url } = await createCustomerPortal();

        if (!success && message) {
          toast.error(message);
          return;
        }
        if (!url?.customer_portal) return;
        return router.push(url.customer_portal);
      }
      // Initiate checkout for new subscription
      const { success, message, url } = await createCheckoutSession(userDetails);
      if (!success && message) {
        toast.error(message);
        return;
      }
      if (!url) return;
      return router.push(url)
    });
  };

  return (
    <div className="min-h-screen p-8 py-24 md:py-32 bg-white">
      <div className="flex flex-col items-center space-y-4 max-w-5xl mx-auto">
        <p className="text-sm font-semibold text-primary">Pricing</p>
        <h1 className="text-4xl sm:text-5xl font-bold text-center">
          Supercharge your Whiteboard Companion
        </h1>
        <p className="text-gray-400 text-normal sm:text-lg leading-7 text-center max-w-xl mx-auto">
          Choose an affordable plan packed with features for interacting with your PDFs, YouTube videos, images, and websites to enhance productivity and streamline workflows.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-lg md:max-w-4xl mx-auto">
        {/* Free plan */}
        <div className="bg-white/50 ring-1 ring-gray-200 shadow-sm p-8 rounded-3xl h-fit flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Starter Plan</h3>
          <p className="text-gray-400">Explore core features at no cost.</p>
          <h2 className="text-4xl sm:text-5xl font-bold">Free</h2>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Chat with 1 YouTube video</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Chat with 1 PDF document (up to 4MB)</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Chat with 1 image</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Chat with 1 website</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Unlimited text nodes</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Up to 1 board</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Up to 3 messages per chat</li>
            <li className="flex items-start gap-2"><CheckIcon className="h-4 w-4 text-primary" /><span className="text-sm max-w-[90%]"><span className="font-bold">Notion-Like Editor:</span> Seamlessly write and organize notes.</span></li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Try AI Chat functionality</li>
          </ul>
        </div>
        {/* Pro plan */}
        <div className="bg-white ring-2 ring-primary shadow-lg p-8 rounded-3xl h-fit flex flex-col gap-4">
          <h3 className="text-sm font-semibold">Pro Plan</h3>
          <p className="text-gray-400">Maximize productivity with PRO features.</p>
          <div className="flex gap-1 items-baseline">
            <span><span className="text-4xl sm:text-5xl font-bold">4.9$</span> / Month</span>
          </div>
          <Button onClick={handleUpgrade} disabled={loading || isPending} className="w-full mb-4 font-bold">
            {loading || isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : hasActiveMembership ? "Manage Plan" : "Upgrade to Pro"}
          </Button>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> 10 YouTube nodes per board</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> 10 website nodes per board</li>
            <li className="flex items-start gap-2"><CheckIcon className="h-4 w-4 text-primary" /> 10 PDF documents (up to 16MB each) per board</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Chat with unlimited images</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Unlimited text nodes</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Create up to 20 boards</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Ability to delete boards</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Ability to rename boards</li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Up to 100 messages per chat</li>
            <li className="flex items-start gap-2"><CheckIcon className="h-4 w-4 text-primary" /><span className="text-sm max-w-[90%]"><span className="font-bold">Notion-Like Editor:</span> Seamless note-writing and organization.</span></li>
            <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-primary" /> Full AI Chat functionality with memory recall</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

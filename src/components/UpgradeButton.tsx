"use client";

import useSubscription from "@/hooks/useSubscription";
import { Button } from "./ui/button";
import Link from "next/link";
import { Loader, Loader2, StarsIcon } from "lucide-react";
import { useTransition } from "react";
import createStripePortal from "@/actions/createStripePortal";
import useCurrentUser from "@/context/currentUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const UpgradeButton = () => {
  const { user } = useCurrentUser();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isPaymentEnabled = true;

  const handleAccount = () => {
    if (!user) return;
    if (isPaymentEnabled) {
      toast.info("Payment is not working right now.");
      return;
    }
    startTransition(async () => {
      const stripePortalUrl = await createStripePortal(user.uid);
      router.push(stripePortalUrl);
    });
  };

  if (!hasActiveMembership && !loading)
    return (
      <Button asChild className="font-bold">
        <Link href="/pricing" className="font-bold">
          Upgrade <StarsIcon className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );

  if (loading)
    return (
      <Button>
        <Loader className="animate-spin" />
      </Button>
    );

  return (
    <Button onClick={handleAccount} disabled={isPending}>
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <p>
          <span className="font-bold">PRO</span> Account
        </p>
      )}
      Upgrade <StarsIcon className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default UpgradeButton;

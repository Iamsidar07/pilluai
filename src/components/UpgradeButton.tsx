"use client";

import createStripePortal from "@/actions/createStripePortal";
import useCurrentUser from "@/context/currentUser";
import useSubscription from "@/hooks/useSubscription";
import { Loader2, StarsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const UpgradeButton = () => {
  const { user } = useCurrentUser();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isPaymentEnabled = true;

  const handleAccount = () => {
    if (!user) return;
    if (isPaymentEnabled) {
      toast.info("Payment is not disabled right now.");
      return;
    }
    startTransition(async () => {
      const { success, message, sessionUrl } = await createStripePortal(
        user.uid
      );
      if (!success && message) {
        toast.error(message);
        return;
      }
      if (!sessionUrl) return;
      router.push(sessionUrl);
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
        <Loader2 className="animate-spin" />
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

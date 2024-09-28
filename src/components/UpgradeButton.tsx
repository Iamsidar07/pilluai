"use client";

import createStripePortal from "@/actions/createStripePortal";
import useSubscription from "@/hooks/useSubscription";
import { Loader2, StarsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";

const UpgradeButton = () => {
  const { user } = useUser();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccount = () => {
    if (!user) return;
    startTransition(async () => {
      const { success, message, sessionUrl } = await createStripePortal();
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
      <Button size={"sm"} asChild className="font-bold">
        <Link href="/pricing" className="font-bold">
          Upgrade <StarsIcon className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    );

  if (loading)
    return (
      <Button size={"sm"}>
        <Loader2 className="animate-spin" />
      </Button>
    );

  return (
    <Button size={"sm"} onClick={handleAccount} disabled={isPending}>
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

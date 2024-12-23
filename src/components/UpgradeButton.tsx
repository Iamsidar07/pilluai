"use client";

// import createSubscriptionManagementURL from "@/actions/createSubscriptionManagementURL";
import useSubscription from "@/hooks/useSubscription";
import { Loader2, StarsIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import createCustomerPortal from "@/actions/createCustomerPortal";

const UpgradeButton = () => {
  const { user } = useUser();
  const { hasActiveMembership, loading } = useSubscription();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleAccount = () => {
    if (!user) return;
    startTransition(async () => {
      const { success, message, urls } = await createCustomerPortal();
      if (!success && message) {
        toast.error(message);
        return;
      }
      if (!urls) return;
      router.push(urls.customer_portal)
    });
  };

  if (!hasActiveMembership && !loading)
    return (
      <Link
        href="/pricing"
        className={buttonVariants({
          variant: "default",
          size: "sm",
          className: "font-bold main-font",
        })}
      >
        Upgrade <StarsIcon className="ml-2 h-4 w-4" />
      </Link>
    );

  if (loading)
    return (
      <Button size={"sm"}>
        <Loader2 className="animate-spin" />
      </Button>
    );

  return (
    <Button
      size={"sm"}
      onClick={handleAccount}
      disabled={isPending}
      className="font-bold font-[sora]"
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <p>
          <span className="font-semibold">PRO</span> Account
        </p>
      )}
      <StarsIcon className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default UpgradeButton;

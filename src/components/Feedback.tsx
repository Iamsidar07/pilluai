"use client";
import { cn } from "@/lib/utils";
import emailjs from "@emailjs/browser";
import { Loader2Icon, StarIcon } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const Feedback = () => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [currentRating, setCurrentRating] = useState(-1);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;
    if (!name) {
      toast.info("Please fill up your name.");
    }
    startTransition(async () => {
      const serviceId = process.env.NEXT_PUBLIC_EMAIL_SEVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY;
      if (!serviceId || !templateId || !publicKey) {
        toast.info("Currently facing some technical issue.");
        console.log(
          "Please set up your email service id and template id in .env file."
        );
        return;
      }
      try {
        await emailjs.send(
          serviceId,
          templateId,
          {
            from_name: name,
            to_name: "Manoj Kumar",
            message: `${message}\n Rating: ${currentRating}/5`,
          },
          {
            publicKey,
          }
        );
        toast.success("Successfully send your feedback.");
        setIsOpen(false);
      } catch (e: any) {
        console.log("failed to send feedback:", e);
        toast.error("Something went wrong");
      } finally {
        setName("");
        setMessage("");
        setCurrentRating(-1);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"ghost"}>Feedback </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback</DialogTitle>
          <DialogDescription>
            You are writing feedback and it can be share online.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mark Kaloni"
            className="w-full"
          />
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your feedback here..."
            rows={4}
          />
          <div className="mt-1 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((stars, i) => (
              <div
                onClick={() => setCurrentRating(stars)}
                key={stars}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-50 group cursor-pointer"
              >
                <StarIcon
                  className={cn(
                    "w-5 h-5 opacity-50 group-hover:scale-105 transition-transform",
                    {
                      "text-pink-500 opacity-100": currentRating >= stars,
                    }
                  )}
                />
              </div>
            ))}
          </div>
          <Button
            disabled={isPending || !name || !message || currentRating < 1}
            type="submit"
            className="mt-4 w-full"
          >
            Submit
            {isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin ml-1.5" />
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Feedback;

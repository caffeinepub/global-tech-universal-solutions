import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { createActorWithConfig } from "../config";

export default function UnsubscribeSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const actor = await createActorWithConfig();
      await actor.blockEmail(trimmed);
      setIsDone(true);
      setEmail("");
      toast.success(
        "Your email has been blocked from sending further messages.",
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="unsubscribe"
      className="bg-[oklch(0.09_0.018_255)] border-t border-[oklch(0.22_0.035_255/0.6)] py-16 px-4"
    >
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="block w-8 h-px bg-[oklch(0.84_0.18_200)]" />
            <span className="text-xs uppercase tracking-[0.2em] text-[oklch(0.84_0.18_200)] font-semibold">
              Opt Out
            </span>
            <span className="block w-8 h-px bg-[oklch(0.84_0.18_200)]" />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Stop Incoming Messages
          </h2>
          <p className="text-sm text-[oklch(0.55_0.025_230)] leading-relaxed">
            Enter your Gmail address below to opt out. No further applications
            or messages from that address will be accepted.
          </p>
        </div>

        {/* Form */}
        {isDone ? (
          <div
            data-ocid="unsubscribe.success_state"
            className="flex flex-col items-center gap-3 py-6 px-6 rounded-lg border border-[oklch(0.84_0.18_200/0.3)] bg-[oklch(0.84_0.18_200/0.06)] text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Success"
              className="w-10 h-10 text-[oklch(0.84_0.18_200)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <title>Success</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[oklch(0.84_0.18_200)] font-semibold text-base">
              Email successfully blocked.
            </p>
            <p className="text-[oklch(0.55_0.025_230)] text-sm">
              We won't accept any further messages from that address.
            </p>
            <button
              type="button"
              onClick={() => setIsDone(false)}
              className="mt-1 text-xs text-[oklch(0.55_0.025_230)] underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Block another address
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[oklch(0.22_0.035_255/0.7)] bg-[oklch(0.12_0.022_255)] p-6 md:p-8 flex flex-col gap-5"
            data-ocid="unsubscribe.panel"
          >
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="unsub-email"
                className="text-[oklch(0.85_0.01_230)] text-sm font-medium"
              >
                Gmail Address
              </Label>
              <Input
                id="unsub-email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="input-cyber bg-[oklch(0.16_0.025_255)] border-[oklch(0.28_0.04_255)] text-foreground placeholder:text-[oklch(0.40_0.02_230)] focus:border-[oklch(0.84_0.18_200/0.6)] h-11"
                data-ocid="unsubscribe.input"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[oklch(0.84_0.18_200)] text-[oklch(0.09_0.018_255)] font-semibold hover:bg-[oklch(0.78_0.18_200)] transition-colors btn-pulse"
              data-ocid="unsubscribe.submit_button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    role="img"
                    aria-label="Loading"
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <title>Loading</title>
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Blocking...
                </span>
              ) : (
                "Stop Incoming Messages"
              )}
            </Button>

            <p className="text-center text-[oklch(0.40_0.02_230)] text-xs">
              This action is permanent. The email address will be unable to
              submit further applications.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

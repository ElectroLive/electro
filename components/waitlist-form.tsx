"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setStatus("success");
      setMessage("You're on the list. We'll email you when Electro launches.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-2 rounded-lg border border-electro-teal/30 bg-electro-teal/10 px-4 py-3 text-sm font-medium text-electro-teal"
      >
        <Check className="size-4 shrink-0" aria-hidden />
        {message}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2 sm:flex-row">
        <div className="sm:flex-1">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") setStatus("idle");
            }}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "email-error" : undefined}
            disabled={status === "loading"}
            className="h-12 text-base"
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className="h-12 px-6 text-base hover:bg-primary/90"
        >
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Joining…
            </>
          ) : (
            "Get early access"
          )}
        </Button>
      </form>

      {status === "error" && (
        <p
          id="email-error"
          role="alert"
          className="mt-2 text-left text-sm text-destructive"
        >
          {message}
        </p>
      )}
    </div>
  );
}

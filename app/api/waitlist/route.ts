import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;

  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const endpoint = process.env.WAITLIST_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    // No destination configured: fail loudly in production so signups aren't
    // silently dropped; in dev, just log so local testing still works.
    if (process.env.NODE_ENV === "production") {
      console.error("[waitlist] WAITLIST_FORMSPREE_ENDPOINT is not set");
      return NextResponse.json(
        { error: "Signups are temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }
    console.warn(`[waitlist] no endpoint set (dev) — would store: ${email.toLowerCase()}`);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      console.error(`[waitlist] formspree responded ${res.status}`);
      return NextResponse.json(
        { error: "Could not save your signup. Please try again." },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[waitlist] failed to reach formspree", err);
    return NextResponse.json(
      { error: "Could not save your signup. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

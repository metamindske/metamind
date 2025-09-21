import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json();
  const headerPayload = headers();

  const svix_id = headerPayload.get("svix-id") ?? "";
  const svix_timestamp = headerPayload.get("svix-timestamp") ?? "";
  const svix_signature = headerPayload.get("svix-signature") ?? "";

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  try {
    wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (payload.type === "user.created") {
    const userId = payload.data.id;

    // 🚨 Set default role to admin for all new signups
    await fetch(`https://api.clerk.dev/v1/users/${userId}/metadata`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          role: "admin",
        },
      }),
    });
  }

  return NextResponse.json({ status: "ok" });
}

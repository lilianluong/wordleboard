import { NextResponse } from "next/server";
import { getPublicVapidKey } from "@/lib/push-notifications";

/**
 * Get the public VAPID key for Web Push subscriptions.
 * This endpoint is public and does not require authentication.
 */
export async function GET() {
  try {
    const publicKey = getPublicVapidKey();
    return NextResponse.json({ publicKey });
  } catch (error) {
    console.error("Error getting VAPID public key:", error);
    return NextResponse.json(
      { error: "VAPID key not configured" },
      { status: 500 }
    );
  }
}

import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // Verify signature
  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const payload = JSON.parse(body);
  const userId = payload.payload.payment.entity.notes.userId;

  if (payload.event === "payment.captured") {
    if (!userId) {
      return new NextResponse("Invalid payment", { status: 400 });
    }

    try {
      const findUserByUserID = await db.user.findUnique({
        where: {
          userId: userId,
        },
      });

      if (!findUserByUserID) {
        await db.user.create({
          data: {
            userId: userId,
            totalCredit: 10000 + 10000,
          },
        });
      } else {
        await db.user.update({
          where: {
            userId: userId,
          },
          data: {
            totalCredit: findUserByUserID.totalCredit + 10000,
          },
        });
      }
    } catch (error) {
      return new NextResponse("Invalid User not authorized", { status: 500 });
    }
  } else {
    return new NextResponse("Invalid event", { status: 200 });
  }

  return new NextResponse("Success", { status: 200 });
}

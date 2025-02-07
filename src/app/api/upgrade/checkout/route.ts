import Razorpay from "razorpay";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

export async function POST() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // First, create purchase record
    const purchase = await db.purchase.create({
      data: {
        userId: userId,
        credit: 100000,
      },
    });

    // Update user's totalCredit
    await db.user.update({
      where: {
        userId: userId,
      },
      data: {
        totalCredit: {
          increment: 100000,
        },
      },
    });

    revalidatePath("/");

    // Create Razorpay order
    const payment = await razorpay.orders.create({
      amount: 800 * 100, // ₹800 in paisa
      currency: "INR",
      receipt: purchase.id,
      notes: {
        userId: userId,
        purchaseId: purchase.id,
      },
    });

    return NextResponse.json({
      orderId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      key: process.env.RAZORPAY_KEY_ID,
      purchaseId: purchase.id,
      email: user?.emailAddresses[0].emailAddress,
      name: `${user?.firstName} ${user?.lastName}`,
    });
  } catch (error) {
    console.error("[RAZORPAY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

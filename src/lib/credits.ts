import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deductCredits(description: string) {
  const { userId } = auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { userId },
  });

  if (!user) throw new Error("User not found");

  // Prevent requests if no credits
  if (user.totalCredit <= 0) {
    throw new Error("No credits available");
  }

  const deductAmount = description.length;

  if (user.totalCredit < deductAmount) {
    const truncatedDescription = description.slice(0, user.totalCredit);

    await db.user.update({
      where: { userId },
      data: {
        totalCredit: 0,
      },
    });

    revalidatePath("/dashboard", "layout");
    return {
      description: truncatedDescription,
      deducted: user.totalCredit,
    };
  }

  await db.user.update({
    where: { userId },
    data: {
      totalCredit: { decrement: deductAmount },
    },
  });

  revalidatePath("/dashboard", "layout");
  return {
    description: description,
    deducted: deductAmount,
  };
}

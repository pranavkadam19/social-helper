import { db } from "@/lib/db";

interface DeductCreditsResult {
  success: boolean;
  description: string;
  deducted: number;
}

export async function deductCredits(
  description: string,
  deductAmount: number,
  userId: string
): Promise<DeductCreditsResult> {
  const user = await db.user.findUnique({
    where: { userId },
  });

  if (!user) throw new Error("User not found");

  if (user.totalCredit < deductAmount) {
    return { success: false, description: "", deducted: 0 };
  }

  await db.user.update({
    where: { userId },
    data: {
      totalCredit: { decrement: deductAmount },
    },
  });

  return {
    success: true,
    description: description,
    deducted: deductAmount,
  };
}

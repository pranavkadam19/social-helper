import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { deductCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description, templateUsed } = await req.json();

    // Get truncated description if needed
    const result = await deductCredits(description);

    const createNewDoc = await db.aIOutput.create({
      data: {
        userId,
        title,
        description: result.description,
        templateUsed,
      },
    });

    revalidatePath("/dashboard", "layout");
    return NextResponse.json(createNewDoc, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("[API_ERROR]", error);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

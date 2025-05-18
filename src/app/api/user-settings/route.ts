import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  try {
    const user = await currentUser(); // Get the currently authenticated user

    if (!user) {
      redirect("/sign-in"); // Redirect if not signed in
    }

    let userSetting;

    try {
      // Try to find existing user settings
      userSetting = await prisma.userSetting.findUnique({
        where: { userId: user.id },
      });

      // If not found, create a default setting
      if (!userSetting) {
        userSetting = await prisma.userSetting.create({
          data: {
            userId: user.id,
            currency: "USD", // default currency
          },
        });
      }
    } catch (dbError) {
      // Handle database error
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }

    // Revalidate cache for `/dashboard` to show updated data
    revalidatePath("/dashboard");

    // Return the user setting as JSON
    return Response.json(userSetting);
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

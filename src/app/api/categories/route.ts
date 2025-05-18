import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const user = await currentUser(); // Get the currently authenticated user

    if (!user) {
      redirect("/sign-in"); // Redirect if not signed in
    }

    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    const validator = z.enum(["income", "expense"]).nullable();
    const queryParams = validator.safeParse(paramType);
    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }
    const type = queryParams.data;

    let categories;
    try {
      // Try to find existing user settings
      categories = await prisma.category.findMany({
        where: {
          userId: user.id,
          ...(type && { type }), //include type in the filters if it is defined
        },
        orderBy: {
          name: "asc",
        },
      });
    } catch (dbError) {
      // Handle database error
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }

    // Return the user setting as JSON
    return Response.json(categories);
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

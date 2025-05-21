import prisma from "@/lib/prisma";
import { OverviewSchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { Stats } from "fs";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  try {
    const user = await currentUser(); // Get the currently authenticated user

    if (!user) {
      redirect("/sign-in"); // Redirect if not signed in
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = OverviewSchema.safeParse({ from, to });
    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }

    let stats;

    try {
      stats = await getCategoriesStats(
        user.id,
        queryParams.data.from,
        queryParams.data.to
      );
    } catch (dbError) {
      // Handle database error
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }

    // Return the user setting as JSON
    return Response.json(stats);
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export type GetCategoriesStatsResponseType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "currency", "category", "categoryIcon"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return stats;
}

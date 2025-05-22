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

    const period = await getHistoryPeriods(user.id);

    return Response.json(period);
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods(userId: string) {
  const result = await prisma.monthHistory.findMany({
    where: {
      userId,
    },
    select: {
      year: true,
      currency: true,
    },
    distinct: ["year", "currency"],
    orderBy: {
      year: "asc",
    },
  });

  const years = result.map((e) => ({ year: e.year, currency: e.currency }));

  if (years.length === 0) {
    return [{ year: new Date().getFullYear(), currency: "NPR" }];
  }

  return years;
}

import prisma from "@/lib/prisma";
import { Period, TimeFrame } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { z } from "zod";

const getHistoryDataSchema = z.object({
  timeframe: z.enum(["month", "year"]),
  month: z.coerce.number().min(0).max(11).default(0),
  year: z.coerce.number().min(2000).max(4000),
  currency: z.string(),
});

export async function GET(request: Request) {
  try {
    const user = await currentUser(); // Get the currently authenticated user

    if (!user) {
      redirect("/sign-in"); // Redirect if not signed in
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe");
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const currency = searchParams.get("currency");

    const queryParams = getHistoryDataSchema.safeParse({
      timeframe,
      month,
      year,
      currency,
    });

    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }

    let data;

    try {
      data = await getHistoryData(
        user.id,
        queryParams.data.timeframe,
        queryParams.data.currency,
        {
          month: queryParams.data.month,
          year: queryParams.data.year,
        }
      );

      return Response.json(data);
    } catch (dbError) {
      // Handle database error
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(
  userId: string,
  timeframe: TimeFrame,
  currency: string,
  period: Period
) {
  switch (timeframe) {
    case "year":
      return await getYearHistoryData(userId, period.year, currency);
    case "month":
      return await getMonthHistoryData(
        userId,
        period.year,
        period.month,
        currency
      );
  }
}

type HistoryData = {
  expense: number;
  income: number;
  year: number;
  month: number;
  day?: number;
  currency: string;
};

async function getYearHistoryData(
  userId: string,
  year: number,
  currency: string
) {
  try {
    const result = await prisma.yearHistory.groupBy({
      by: ["month"],
      where: {
        userId,
        year,
        currency,
      },
      _sum: {
        expense: true,
        income: true,
      },
      orderBy: [{ month: "asc" }],
    });

    if (!result || result.length === 0) return [];

    const history: HistoryData[] = [];

    for (let i = 0; i < 12; i++) {
      let expense = 0;
      let income = 0;

      const month = result.find((row) => row.month === i);
      if (month) {
        expense = month._sum.expense || 0;
        income = month._sum.income || 0;
      }

      history.push({
        expense,
        income,
        year,
        month: i,
        currency,
      });
    }
    return history;
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function getMonthHistoryData(
  userId: string,
  year: number,
  month: number,
  currency: string
) {
  try {
    const result = await prisma.monthHistory.groupBy({
      by: ["day"],
      where: {
        userId,
        year,
        month,
        currency,
      },
      _sum: {
        expense: true,
        income: true,
      },
      orderBy: [{ day: "asc" }],
    });

    if (!result || result.length === 0) return [];

    const history: HistoryData[] = [];

    const daysInMonth = getDaysInMonth(new Date(year, month));
    for (let i = 0; i <= daysInMonth; i++) {
      let expense = 0;
      let income = 0;

      const day = result.find((row) => row.day === i);
      if (day) {
        expense = day._sum.expense || 0;
        income = day._sum.income || 0;
      }

      history.push({
        expense,
        income,
        year,
        month,
        day: i,
        currency,
      });
    }
    return history;
  } catch (err) {
    console.error(err);
    return [];
  }
}

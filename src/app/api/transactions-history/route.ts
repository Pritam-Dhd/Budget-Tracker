import { GetFormatterForCurrency } from "@/lib/helper";
import prisma from "@/lib/prisma";
import { OverviewSchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  try {
    const user = await currentUser(); // Get the currently authenticated user

    if (!user) {
      redirect("/sign-in"); // Redirect if not signed in
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const queryParams = OverviewSchema.safeParse({
      from,
      to,
    });

    if (!queryParams.success) {
      return Response.json(queryParams.error, {
        status: 400,
      });
    }

    const transactions = await getTransactionsHistory(
      user.id,
      queryParams.data.from,
      queryParams.data.to
    );

    return Response.json(transactions);
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}

export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

export type getTransactionsHistoryResponseType = Awaited<
  ReturnType<typeof getTransactionsHistory>
>;

async function getTransactionsHistory(userId: string, from: Date, to: Date) {
  const userSetting = await prisma.userSetting.findUnique({
    where: {
      userId,
    },
  });

  if (!userSetting) {
    throw new Error("User setting not found");
  }

  const formatter = GetFormatterForCurrency(userSetting.currency);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,

      date: {
        gte: from,
        lte: to,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return transactions.map((transaction) => ({
    ...transaction,
    formattedAmount: formatter.format(transaction.amount),
  }));
}
